/* Family Kit: tees that share the same front design, adult and kids sizes mixed,
   get a discount once there are enough of them in the bag.
   4–5 matching tees: 10% off those tees. 6 or more: 15% off. */
import { getDesignById, printsForItem } from '../data/catalogue.js'

export const FAMILY_GARMENTS = ['classic-tee', 'kids-classic-tee']
export const FAMILY_TIERS = [
  { min: 6, rate: 0.15 },
  { min: 4, rate: 0.1 }
]

function frontDesignId(item) {
  if (!FAMILY_GARMENTS.includes(item?.garmentId)) return null
  const front = printsForItem(item).find((print) => print.placement === 'front-center' || print.placement === 'front-small')
  return front?.designId || null
}

export function familyRate(tees) {
  return FAMILY_TIERS.find((tier) => tees >= tier.min)?.rate || 0
}

/* Groups of matching tees in the bag, with the discount each earns (rounded to whole rand). */
export function familyGroups(items = []) {
  const groups = new Map()
  for (const item of items) {
    const designId = frontDesignId(item)
    if (!designId) continue
    const group = groups.get(designId) || { designId, tees: 0, value: 0 }
    group.tees += item.quantity
    group.value += item.unitPrice * item.quantity
    groups.set(designId, group)
  }
  return [...groups.values()].map((group) => {
    const design = getDesignById(group.designId)
    const rate = familyRate(group.tees)
    const next = FAMILY_TIERS.slice().reverse().find((tier) => tier.min > group.tees)
    return {
      ...group,
      designName: design?.name || group.designId,
      code: design?.code || '',
      rate,
      amount: Math.round(group.value * rate),
      // Nudge: how many more matching tees reach the next level.
      toNext: next ? { more: next.min - group.tees, rate: next.rate } : null
    }
  })
}

export function familyDiscounts(items = []) {
  return familyGroups(items).filter((group) => group.amount > 0)
}

export function familyDiscountTotal(items = []) {
  return familyDiscounts(items).reduce((sum, group) => sum + group.amount, 0)
}

export const percent = (rate) => `${Math.round(rate * 100)}%`
