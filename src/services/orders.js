import { formatPrice, placementLabel, STORE_CONFIG } from '../data/catalogue.js'

export function createOrderReference(date = new Date(), random = Math.random) {
  const stamp = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const code = Math.floor(random() * 36 ** 4).toString(36).toUpperCase().padStart(4, '0')
  return `IS-${stamp}-${code}`
}

export function generateWhatsAppMessage(cart, { name = '', area = '', reference = '' } = {}) {
  if (!cart || cart.isEmpty()) return null

  let message = `Hi ${STORE_CONFIG.brandName} 👋\n\n`
  message += `I would like to place an order${reference ? ` (ref ${reference})` : ''}:\n\n`

  cart.items.forEach((item) => {
    const qty = item.quantity > 1 ? `${item.quantity} ×` : '1 ×'
    message += `${qty} ${item.garmentName}\n`
    message += `Colour: ${item.colour}\n`
    message += `Size: ${item.size}\n`

    if (item.designName !== 'None') {
      message += `Design: ${item.designName}\n`
      message += `Placement: ${placementLabel(item.placement)}\n`
    }

    message += `Price: ${formatPrice(item.unitPrice * item.quantity)}\n`
    message += `\n`
  })

  message += `TOTAL: ${formatPrice(cart.getSubtotal())}\n\n`
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
