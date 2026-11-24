/* Sends a copy of each order and quote request to the owner's Google Sheet (apps-script/Code.gs)
   at the moment the customer is sent to WhatsApp. Payment is still arranged on WhatsApp.
   Fire-and-forget: if logging is switched off or fails, the WhatsApp order goes ahead unchanged. */
import { buildPreviewUrl, CUSTOM_OCCASIONS } from './orders.js'
import { paymentSplit } from './payment.js'
import { getDesignById, getGarmentById, placementLabel, printsForItem, STORE_CONFIG } from '../data/catalogue.js'

export function buildOrderPayload(cart, { ref, name = '', area = '', payment = null }) {
  const lines = cart.items.map((item) => {
    const saved = item.prints || []
    const prints = printsForItem(item)
      .map((print) => `${placementLabel(print.placement)}: ${saved.find((entry) => entry.placement === print.placement)?.designName || print.designId}`)
      .join('; ')
    const garment = getGarmentById(item.garmentId)
    const designs = printsForItem(item).map((print) => getDesignById(print.designId)).filter(Boolean)
    const colour = garment?.colours.find((entry) => entry.name === item.colour)
    // Owner thumbnail in the Sheet: the main artwork, or the product photo for ready-made pieces.
    const image = designs[0]?.image || colour?.frontImage || garment?.image
    return {
      garment: item.garmentName,
      code: garment?.code || '',
      colour: item.colour,
      size: item.size,
      prints,
      designCodes: designs.map((design) => design.code).join(', '),
      qty: item.quantity,
      unitPrice: item.unitPrice,
      previewUrl: buildPreviewUrl(item),
      imageUrl: image ? siteAssetUrl(image) : ''
    }
  })
  const total = cart.getTotal()
  const split = paymentSplit(total, payment)
  return {
    type: 'order', ref, name: name.trim(), area: area.trim(), lines,
    subtotal: cart.getSubtotal(), discount: cart.getDiscount(), total,
    payment: split?.option || '', dueNow: split?.dueNow ?? total, balance: split?.balance ?? 0
  }
}

/* Public address of a site asset, e.g. for =IMAGE() in the owner's Sheet. */
export function siteAssetUrl(path, base = STORE_CONFIG.siteUrl) {
  return `${base}${encodeURI(path)}`
}

export function buildEnquiryPayload({ occasion = '', garment = '', quantity = '', date = '', printText = '', notes = '', name = '', reference = '' }) {
  const label = CUSTOM_OCCASIONS.find((entry) => entry.id === occasion)?.name || occasion
  return { type: 'enquiry', ref: reference, name: name.trim(), occasion: label, garment, quantity: String(quantity), date, printText: printText.trim(), notes: notes.trim() }
}

/* text/plain keeps this a "simple" request: no CORS preflight, which Apps Script cannot answer. */
export function sendOrderLog(payload, url = STORE_CONFIG.orderLogUrl) {
  if (!url || typeof window === 'undefined') return false
  const body = JSON.stringify(payload)
  try {
    if (navigator.sendBeacon?.(url, new Blob([body], { type: 'text/plain;charset=utf-8' }))) return true
  } catch {
    /* Fall through to fetch. */
  }
  try {
    fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body }).catch(() => {})
    return true
  } catch {
    return false
  }
}
