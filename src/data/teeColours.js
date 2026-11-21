/* Classic Tee colours. Each photo is the Canva AI plain tee, tinted by scripts/tint-tees.mjs
   so the folds and shadows match on every colour. `dark` picks how prints blend into the fabric. */
export const TEE_COLOURS = [
  { name: 'Black', value: '#141414', dark: true, frontImage: 'assets/garments/classic-tee/black-front.webp', backImage: 'assets/garments/classic-tee/black-back.webp' },
  { name: 'White', value: '#f5f5f5', dark: false, frontImage: 'assets/garments/classic-tee/white-front.webp', backImage: 'assets/garments/classic-tee/white-back.webp' },
  { name: 'Navy', value: '#1d2a44', dark: true, frontImage: 'assets/garments/classic-tee/navy-front.webp', backImage: 'assets/garments/classic-tee/navy-back.webp' },
  { name: 'Charcoal', value: '#3a3b3d', dark: true, frontImage: 'assets/garments/classic-tee/charcoal-front.webp', backImage: 'assets/garments/classic-tee/charcoal-back.webp' },
  { name: 'Sand', value: '#d8c7a6', dark: false, frontImage: 'assets/garments/classic-tee/sand-front.webp', backImage: 'assets/garments/classic-tee/sand-back.webp' },
  { name: 'Olive', value: '#4f5b3a', dark: true, frontImage: 'assets/garments/classic-tee/olive-front.webp', backImage: 'assets/garments/classic-tee/olive-back.webp' },
  { name: 'Pink', value: '#f2b8c8', dark: false, frontImage: 'assets/garments/classic-tee/pink-front.webp', backImage: 'assets/garments/classic-tee/pink-back.webp' },
  { name: 'Light blue', value: '#a9c8e8', dark: false, frontImage: 'assets/garments/classic-tee/light-blue-front.webp', backImage: 'assets/garments/classic-tee/light-blue-back.webp' }
]

/* Grey shading maps (128 = no change) laid over prints so they follow the folds. */
export const TEE_SHADE = {
  front: 'assets/garments/classic-tee/shade-front.webp',
  back: 'assets/garments/classic-tee/shade-back.webp'
}
