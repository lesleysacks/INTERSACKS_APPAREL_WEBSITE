import { paymentSplit } from './payment.js'
import { formatPrice, getDesignById, getGarmentById, placementLabel, printsForItem, STORE_CONFIG } from '../data/catalogue.js'

export function createOrderReference(date = new Date(), random = Math.random) {
  const stamp = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const code = Math.floor(random() * 36 ** 4).toString(36).toUpperCase().padStart(4, '0')
  return `IS-${stamp}-${code}`
}

const SPOT_KEY = { front: 'front', back: 'back', 'left-sleeve': 'ls', 'right-sleeve': 'rs' }

/* A link that opens this exact build on the website: same piece, colour, size and prints.
   Used for the "View preview" link in the bag, the WhatsApp message and the owner's Sheet.
   Pass base = '' for a link relative to the current site. */
export function buildPreviewUrl(item, base = STORE_CONFIG.siteUrl) {
  const params = new URLSearchParams({ garment: item.garmentId })
  const garment = getGarmentById(item.garmentId)
  if (item.colour && garment?.colours.length > 1) params.set('colour', item.colour)
  if (item.size) params.set('size', item.size)
  for (const print of printsForItem(item)) {
    const design = getDesignById(print.designId)
    const zone = { 'front-center': 'front', 'front-small': 'front', 'back-center': 'back', 'left-sleeve': 'left-sleeve', 'right-sleeve': 'right-sleeve' }[print.placement]
    if (!design || !zone) continue
    const suffix = print.placement === 'front-small' ? 's' : print.placement === 'front-center' ? 'c' : ''
    params.set(SPOT_KEY[zone], `${design.code.replace('IS-', '')}${suffix}`)
  }
  return `${base}product.html?${params.toString()}`
}

export function generateWhatsAppMessage(cart, { name = '', area = '', reference = '', payment = null } = {}) {
  if (!cart || cart.isEmpty()) return null

  let message = `Hi ${STORE_CONFIG.brandName} 👋\n\n`
  message += `I would like to place an order${reference ? ` (ref ${reference})` : ''}:\n\n`

  cart.items.forEach((item) => {
    const qty = item.quantity > 1 ? `${item.quantity} ×` : '1 ×'
    const code = getGarmentById(item.garmentId)?.code
    message += `${qty} ${item.garmentName}${code ? ` (${code})` : ''}\n`
    message += `Colour: ${item.colour}\n`
    message += `Size: ${item.size}\n`

    const prints = printsForItem(item)
    if (prints.length) {
      message += prints.length > 1 ? `Prints (${prints.length}):\n` : 'Print:\n'
      for (const print of prints) {
        const saved = item.prints?.find((entry) => entry.placement === print.placement)
        const designCode = getDesignById(print.designId)?.code
        message += `• ${placementLabel(print.placement)}: ${saved?.designName || item.designName}${designCode ? ` (${designCode})` : ''}\n`
      }
    }
    message += `Preview: ${buildPreviewUrl(item)}\n`

    message += `Price: ${formatPrice(item.unitPrice * item.quantity)}\n`
    message += `\n`
  })

  const discounts = cart.getDiscounts?.() || []
  if (discounts.length) {
    message += `Subtotal: ${formatPrice(cart.getSubtotal())}\n`
    for (const group of discounts) {
      message += `Family Kit discount (${group.designName} ${group.code} × ${group.tees}, ${Math.round(group.rate * 100)}% off): -${formatPrice(group.amount)}\n`
    }
  }
  const grandTotal = cart.getTotal ? cart.getTotal() : cart.getSubtotal()
  message += `TOTAL: ${formatPrice(grandTotal)}\n\n`
  const split = payment ? paymentSplit(grandTotal, payment) : null
  if (split) {
    message += split.option === 'deposit'
      ? `Payment: 50% deposit (${formatPrice(split.dueNow)} now, ${formatPrice(split.balance)} before dispatch)\n`
      : `Payment: Pay in full (${formatPrice(split.dueNow)} now)\n`
    message += `Please send EFT details or a payment link.${reference ? ` I'll use ${reference} as the reference.` : ''}\n\n`
  }
  message += `Name: ${name.trim()}\nDelivery Area: ${area.trim()}\n`
  message += `\n${STORE_CONFIG.tagline}`

  return message
}

export function whatsAppOrderUrl(cart, details) {
  const message = generateWhatsAppMessage(cart, details)
  if (!message) return null
  return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`
}

export const CUSTOM_OCCASIONS = [
  { id: 'birthday', name: 'Birthday', blurb: 'Birthday King or Queen tees with a name, age and date. Matching family sets too.' },
  { id: 'team', name: 'Team or school kit', blurb: 'Jerseys, vests and long sleeves with names and numbers for clubs, schools and leagues.' },
  { id: 'matric', name: 'Matric & graduation', blurb: 'Class of tees, farewell hoodies and graduation shirts for the whole group.' },
  { id: 'event', name: 'Events & family', blurb: 'Reunions, weddings, memorials, church groups and road trips.' },
  { id: 'business', name: 'Business & brand', blurb: 'Staff shirts and merch with your own logo for shops, salons and start-ups.' }
]

export function generateCustomEnquiryMessage({ occasion = '', garment = '', quantity = '', date = '', printText = '', notes = '', name = '', reference = '' } = {}) {
  const label = CUSTOM_OCCASIONS.find((entry) => entry.id === occasion)?.name || occasion || 'Custom order'
  const lines = [
    `Hi ${STORE_CONFIG.brandName} 👋`,
    '',
    `I would like a quote for a custom order${reference ? ` (ref ${reference})` : ''}:`,
    '',
    `Occasion: ${label}`,
    `Garment: ${garment || 'Not sure yet'}`,
    `Quantity: ${quantity || 'Not sure yet'}`,
    `Needed by: ${date || 'Flexible'}`
  ]
  if (printText.trim()) lines.push(`Text / names to print: ${printText.trim()}`)
  if (notes.trim()) lines.push(`Notes: ${notes.trim()}`)
  lines.push('', `Name: ${name.trim()}`, '', STORE_CONFIG.tagline)
  return lines.join('\n')
}

export function customEnquiryUrl(details) {
  return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(generateCustomEnquiryMessage(details))}`
}

/* "Notify me" for pieces in the Festive Summer drop that are not out yet. */
export function seasonNotifyUrl(itemName, tabLabel) {
  const message = [
    `Hi ${STORE_CONFIG.brandName} 👋`,
    '',
    `Please let me know when the Festive Summer drop lands${itemName ? `, especially: ${itemName}` : ''}${tabLabel ? ` (${tabLabel})` : ''}.`,
    '',
    STORE_CONFIG.tagline
  ].join('\n')
  return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`
}
