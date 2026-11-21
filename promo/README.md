# InterSacks promo video (60 s, written in code)

Everything in the video is code:
- the animation in `video.html`
- the soundtrack in `beat.py`
- the screenshots, taken from the real site by `capture.cjs` and `spin.cjs`

## Files
- `video.html` is the whole video: a 1920×1080 stage where `renderAt(t)` positions every element for any moment `t`, in seconds. Open it in a browser and press **Space** to play, or add `#t=20` to the URL to jump to a moment.
- `beat.py` synthesises the 96 BPM boom-bap soundtrack (kick, snare, hats, sub bass, minor pad) with no samples.
- `capture.cjs` and `spin.cjs` screenshot the live site pages, the 8 colours and a full 3D turn into `shots/`.
- `render.cjs` steps through all 1800 frames (30 fps), pipes them into ffmpeg and adds the soundtrack.

## Scenes
| Time | Scene |
|---|---|
| 0–5 s | Logo, INTERSACKS letters, "Built Different." |
| 5–10 s | The homepage in a 3D browser window |
| 10–17 s | Colour sweep through all 8 tee colours |
| 17–25 s | Print spots with prices adding up from R349 to R519, then the fabric close-up |
| 25–31 s | Full 360° turn of the 3D tee |
| 31–38 s | Lookbook row, then a sheet opening fullscreen |
| 38–46 s | Shop grid, then a cursor picks size L and adds to bag, then the fullscreen zoom |
| 46–53 s | Three phones and the WhatsApp order typing out |
| 53–60 s | Outro with the web address and @intersacks.apparel |

## Rebuild
Run each step from the `promo` folder.

1. Build the site and start a preview server from the repository root. `npm run build` builds the site; `npx vite preview` serves it on port 4173.
2. Take fresh screenshots:

```bash
node capture.cjs
```

```bash
node spin.cjs
```

3. Make the soundtrack:

```bash
python3 beat.py beat.wav
```

4. Render the video:

```bash
node render.cjs intersacks-promo.mp4 beat.wav
```

5. Optionally, render single frames to check:

```bash
node render.cjs --stills 3,20,42
```

To change wording, timing or prices, edit the text in `video.html` and the matching times in `renderAt`.
