/* Lookbook sheets made in Canva (front, back and detail views of each tee).
   Each links to the customiser with the matching archive design.
   Sheets whose artwork is on RIGHTS_HOLD are deliberately not included. */
export const lookbook = [
  { id: 'street-moves', name: 'Street Moves', tagline: 'Urban. Bold. Unstoppable.', designId: 'design-005', image: 'assets/lookbook/street-moves.jpg', alt: 'Street Moves oversized black tee with a graffiti breakdancer print, front and back views' },
  { id: 'urban-motion', name: 'Urban Motion', tagline: 'Wear the movement.', designId: 'design-008', image: 'assets/lookbook/urban-motion.jpg', alt: 'Urban Motion all-over print tee with a street dancer, shown in black, white, sand and navy' },
  { id: 'no-pain-no-gain', name: 'No Pain No Gain', tagline: 'Front, side and back.', designId: 'design-004', image: 'assets/lookbook/no-pain-no-gain.jpg', alt: 'No Pain No Gain black tee in red and silver type, worn from the front, side and back' },
  { id: 'let-god-handle-it', name: 'Let God Handle It', tagline: 'Faith in full colour.', designId: 'design-016', image: 'assets/lookbook/let-god-handle-it.jpg', alt: 'Let God Handle It black tee with gold lettering and colour streaks, with lifestyle, back and side views' },
  { id: 'urban-mask', name: 'Urban Mask', tagline: 'Mosaic all-over print.', designId: 'design-021', image: 'assets/lookbook/urban-mask.jpg', alt: 'Urban Mask black tee with a colourful mosaic portrait, front, back and worn views' },
  { id: 'crown-of-thorns', name: 'Crown of Thorns', tagline: 'Monochrome faith piece.', designId: 'design-013', image: 'assets/lookbook/crown-of-thorns.jpg', alt: 'Crown of Thorns black tee with a white drip-style portrait, front, back and side views' },
  { id: 'psalm-23', name: 'Psalm 23', tagline: 'The Lord is my shepherd.', designId: 'design-015', image: 'assets/lookbook/psalm-23.jpg', alt: 'Psalm 23 olive tee with camouflage lettering, back and side views and a size chart' },
  { id: 'watercolour-lips', name: 'Watercolour Lips', tagline: 'Five colourways.', designId: 'design-019', image: 'assets/lookbook/watercolour-lips.jpg', alt: 'Watercolour Lips white tee on a hanger with a rainbow lips print and other colourways' },
  { id: 'denim-pocket-pup', name: 'Denim Pocket Pup', tagline: 'A pup in your pocket.', designId: 'design-014', image: 'assets/lookbook/denim-pocket-pup.jpg', alt: 'Light blue tee with a printed denim pocket and a white puppy peeking out' },
  { id: 'cute-pup-peek', name: 'Cute Pup Peek', tagline: 'Peekaboo print.', designId: 'design-003', image: 'assets/lookbook/cute-pup-peek.jpg', alt: 'Black tee with a Yorkshire terrier peeking around the edge of the print' }
]

export const heroShowcase = ['street-moves', 'urban-motion', 'no-pain-no-gain', 'let-god-handle-it']
  .map((id) => lookbook.find((entry) => entry.id === id))

export function lookbookHref(entry) {
  return `product.html?garment=classic-tee&design=${encodeURIComponent(entry.designId)}`
}
