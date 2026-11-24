/* Builds the finished reel: screen recording + timed captions + end card + the code-made beat.
   Usage: node compose.cjs <out-dir>   (expects raw.mp4, scenes.json, captions/ and beat.wav from beat.py in <out-dir>)
   Output: intersacks-reel.mp4, beat-reel.wav and captions.srt */
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const OUT = path.resolve(process.argv[2] || 'out')
const scenes = JSON.parse(fs.readFileSync(path.join(OUT, 'scenes.json'), 'utf8'))
const captions = JSON.parse(fs.readFileSync(path.join(OUT, 'captions', 'captions.json'), 'utf8'))
const clipEnd = scenes.find((s) => s.name === 'end').t
const END_CARD = 3.5
const total = clipEnd + END_CARD
const FADE = 0.3

const timed = captions.map((c, i) => {
  const start = scenes.find((s) => s.name === c.scene).t
  const next = scenes[scenes.findIndex((s) => s.name === c.scene) + 1]
  return { ...c, file: path.join(OUT, 'captions', `${i + 1}-${c.scene}.png`), from: start + 0.25, to: Math.min(next.t, clipEnd) - 0.15 }
})

const inputs = ['-i', path.join(OUT, 'raw.mp4')]
for (const c of timed) inputs.push('-loop', '1', '-t', total.toFixed(2), '-i', c.file)
inputs.push('-loop', '1', '-t', END_CARD.toFixed(2), '-i', path.join(OUT, 'captions', 'endcard.png'))
inputs.push('-i', path.join(OUT, 'beat.wav'))
const endIdx = timed.length + 1
const audioIdx = timed.length + 2

let filter = `[0:v]fps=30,format=yuv420p,tpad=stop_mode=clone:stop_duration=${END_CARD}[base];`
let last = 'base'
timed.forEach((c, i) => {
  const idx = i + 1
  filter += `[${idx}:v]format=rgba,fade=t=in:st=${c.from.toFixed(2)}:d=${FADE}:alpha=1,fade=t=out:st=${(c.to - FADE).toFixed(2)}:d=${FADE}:alpha=1[c${idx}];`
  filter += `[${last}][c${idx}]overlay=0:0:enable='between(t,${c.from.toFixed(2)},${c.to.toFixed(2)})'[v${idx}];`
  last = `v${idx}`
})
filter += `[${endIdx}:v]format=rgba,fade=t=in:st=0:d=0.4:alpha=1,setpts=PTS+${clipEnd.toFixed(3)}/TB[end];`
filter += `[${last}][end]overlay=0:0:eof_action=pass,format=yuv420p[vout];`
filter += `[${audioIdx}:a]atrim=0:${total.toFixed(2)},afade=t=in:d=0.3,afade=t=out:st=${(total - 1.5).toFixed(2)}:d=1.5[aout]`

const run = (args) => {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' })
  if (r.status !== 0) process.exit(1)
}
run([...inputs, '-filter_complex', filter, '-map', '[vout]', '-map', '[aout]', '-t', total.toFixed(2),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', '30',
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', path.join(OUT, 'intersacks-reel.mp4')])
// The beat on its own, cut to the reel length, for editing.
run(['-i', path.join(OUT, 'beat.wav'), '-af', `atrim=0:${total.toFixed(2)},afade=t=out:st=${(total - 1.5).toFixed(2)}:d=1.5`, path.join(OUT, 'beat-reel.wav')])

const stamp = (s) => {
  const ms = Math.round(s * 1000)
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0')
  const m = String(Math.floor(ms / 60000) % 60).padStart(2, '0')
  const sec = String(Math.floor(ms / 1000) % 60).padStart(2, '0')
  return `${h}:${m}:${sec},${String(ms % 1000).padStart(3, '0')}`
}
const srt = [...timed.map((c) => ({ from: c.from, to: c.to, text: `${c.title}\n${c.sub}` })),
  { from: clipEnd, to: total, text: 'BUILT DIFFERENT.\nOrder on WhatsApp · @intersacks.apparel' }]
  .map((c, i) => `${i + 1}\n${stamp(c.from)} --> ${stamp(c.to)}\n${c.text}\n`).join('\n')
fs.writeFileSync(path.join(OUT, 'captions.srt'), srt)
console.log('reel →', path.join(OUT, 'intersacks-reel.mp4'), `(${total.toFixed(1)} s)`)
