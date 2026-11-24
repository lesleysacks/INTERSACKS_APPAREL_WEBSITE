/* Festive Summer: December in South Africa is Christmas and peak summer at once,
   so one drop holds both. Edit this file to change the drop.
   - dropDate: 'YYYY-MM-DD' once the owner sets it; null shows "Dropping this December".
   - available: design ids (Summer tab) shown on a Classic Tee in a summer colour.
   - comingSoon: teaser cards with a Notify me on WhatsApp button. */
export const SEASON_DROP = {
  title: 'Festive Summer',
  kicker: 'December drop',
  blurb: 'Matching summer sets for the heat and festive tees for the family. Christmas and summer in one drop, the Mzansi way.',
  dropDate: '2026-12-01',
  tabs: [
    {
      id: 'summer',
      label: 'Summer',
      intro: 'Braai days, beach days and long December evenings. Tees in summer colours now, matching tee + shorts sets on the way.',
      available: [
        { designId: 'design-069', colour: 'Sand' },
        { designId: 'design-070', colour: 'White' },
        { designId: 'design-059', colour: 'Sand' },
        { designId: 'design-057', colour: 'Light blue' },
        { designId: 'design-058', colour: 'White' },
        { designId: 'design-056', colour: 'Pink' }
      ],
      comingSoon: [
        { id: 'summer-set', name: 'Summer Set: Tee + Shorts', blurb: 'Mzansi Summer (IS-D069) on a matching tee and shorts. Save R49 on buying both.', garmentId: 'summer-set' },
        { id: 'shorts', name: 'Shorts', blurb: 'Casual shorts with a leg print to pair with any tee.', garmentId: 'shorts' }
      ]
    },
    {
      id: 'festive',
      label: 'Festive',
      intro: 'Original Christmas and Dezemba designs in red, green and gold. Order matching tees for the whole family.',
      available: [
        { designId: 'design-063', colour: 'Black' },
        { designId: 'design-065', colour: 'Sand' },
        { designId: 'design-066', colour: 'White' },
        { designId: 'design-068', colour: 'Black' },
        { designId: 'design-064', colour: 'White' },
        { designId: 'design-067', colour: 'White' }
      ],
      // Family Kit card: the design and colour it opens in the customiser.
      kit: { designId: 'design-067', colour: 'White' },
      comingSoon: []
    }
  ]
}

/* Before the drop date, ready designs are sold as pre-orders. */
export function isPreorder(today = new Date(), date = SEASON_DROP.dropDate) {
  if (!date) return false
  return today < new Date(`${date}T00:00:00`)
}

export function dropDateLabel(date = SEASON_DROP.dropDate) {
  if (!date) return 'Dropping this December'
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return 'Dropping this December'
  return `Drops ${parsed.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })}`
}
