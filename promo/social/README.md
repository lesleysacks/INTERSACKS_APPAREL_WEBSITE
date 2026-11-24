# InterSacks social reel (vertical 9:16)

A screen recording of the website as a phone shows it, for Instagram Reels, TikTok, YouTube Shorts, Facebook Reels and WhatsApp Status.

The reel only shows original or owned artwork and no 3D view, following the rules in `CLAUDE.md`. The checkout uses a sample name; no real WhatsApp chat or personal details appear.

## Files you get
| File | What it is |
|---|---|
| `intersacks-reel.mp4` | Ready to post: 1080×1920, 30 fps, about 37 s, with captions, end card and beat |
| `raw.mp4` | The clean screen recording: no text, no music. Edit this one into your own advert |
| `beat-reel.wav` | The beat on its own, cut to the reel length. It's made in code, so there are no copyright claims |
| `captions/1-hero.png` … `5-bag.png` | Transparent 1080×1920 caption overlays: drop them on top of `raw.mp4` |
| `captions/endcard.png` | The closing card (logo, Order on WhatsApp, website, @intersacks.apparel) |
| `captions.srt` | The same captions as subtitles, with timings |

## Timings in the reel
| Time | Scene | Caption |
|---|---|---|
| 0:00–0:03.7 | Homepage | BUILT DIFFERENT. · Original South African streetwear |
| 0:03.7–0:11 | Festive Summer drop | FESTIVE SUMMER DROP · Drops 1 December |
| 0:11–0:18.5 | Customiser: colours, back print | DESIGN YOUR OWN TEE · 8 colours · front, back & sleeves |
| 0:18.5–0:26 | Family Kit | FAMILY KIT · 4+ matching tees 10% off |
| 0:26–0:33 | Bag and deposit | PAY 50% TO LOCK IT IN · Or pay in full · order on WhatsApp |
| 0:33–0:36.5 | End card | BUILT DIFFERENT. · Order on WhatsApp |

## Editing tips (CapCut or Instagram's editor)
- Use `raw.mp4` as the base. Speed up the scrolling parts (1.3–1.5×) to get a 15–20 s cut.
- Keep text between about 220 px from the top and 380 px from the bottom. App buttons and the caption cover the rest.
- Add a hook in the first second, e.g. "Design your own tee in 30 seconds 👇".
- Use the beat, or pick a trending sound inside the app. Trending sounds often reach more people.

## Suggested post text
> Design your own tee in minutes 🔥 Pick your colour, add art to the front, back and sleeves, and order on WhatsApp. Family Kits get 10% off. Festive Summer drop lands 1 December 🎄☀️
> 🔗 Link in bio · @intersacks.apparel

#InterSacksApparel #BuiltDifferent #SouthAfricanStreetwear #MzansiFashion #CustomTees #LocalIsLekker #Dezemba #FestiveSeason #FamilyMatching #StreetwearSA

## Rebuild
Steps 3 to 6 run from `promo/social`, and `<out>` is any folder you choose.

1. Build the site from a branch that only contains original artwork:

```bash
npm run build
```

2. Copy `dist/` somewhere, for example `../site`.
3. Record the screen:

```bash
node record.cjs ../site <out>
```

4. Render the captions:

```bash
node captions.cjs <out>
```

5. Make the beat:

```bash
python3 ../beat.py <out>/beat.wav
```

6. Put the reel together:

```bash
node compose.cjs <out>
```
