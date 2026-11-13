import { formatPrice, STORE_CONFIG } from '../data/catalogue.js'

export function generateWhatsAppMessage(cart) {
  if (!cart || cart.isEmpty()) return null

  let message = `Hi ${STORE_CONFIG.brandName} 👋\n\n`
  message += `I would like to place an order:\n\n`

  cart.items.forEach((item) => {
    const qty = item.quantity > 1 ? `${item.quantity} ×` : '1 ×'
    message += `${qty} ${item.garmentName}\n`
    message += `Colour: ${item.colour}\n`
    message += `Size: ${item.size}\n`

    if (item.designName !== 'None') {
      message += `Design: ${item.designName}\n`
      message += `Placement: ${item.placement}\n`
    }

    message += `Price: ${formatPrice(item.unitPrice * item.quantity)}\n`
    message += `\n`
  })

  message += `TOTAL: ${formatPrice(cart.getSubtotal())}\n\n`
  message += `Name:\nDelivery Area:\n`
  message += `\n${STORE_CONFIG.tagline}`

  return message
}

export function whatsAppOrderUrl(cart) {
  const message = generateWhatsAppMessage(cart)
  if (!message) return null
  return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`
}
