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
