import { spawnSync } from 'node:child_process'

function run(args) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const mode = process.argv[2]
run(['scripts/vendor-fonts.mjs'])
run(['scripts/generate-display-images.mjs'])
const viteArgs = ['node_modules/vite/bin/vite.js']
if (mode === 'build') viteArgs.push('build')
run(viteArgs)
