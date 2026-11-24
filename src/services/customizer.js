import {
  calculatePrintsPrice,
  describePrints,
  getCompatibleDesigns,
  getDesignByCode,
  getDesignById,
  getGarmentById,
  getPlacementConfig,
  getPurchasableGarments,
  isPurchasable,
  normalizePrints,
  PRINT_ZONES
} from '../data/catalogue.js'
import { normalizeQuantity } from './cart.js'

const zoneById = (id) => PRINT_ZONES.find((zone) => zone.id === id)

/* One tee build: garment, colour, size and up to one design on each print spot
   (front, back, left sleeve, right sleeve). */
export class Customizer {
  constructor() {
    this.selectedGarmentId = null
    this.selectedColourValue = null
    this.selectedColourName = null
    this.selectedSize = null
    this.prints = {}
    this.activeZone = 'front'
    this.viewMode = 'front'
    this.quantity = 1
  }

  setGarment(garmentId) {
    const garment = getGarmentById(garmentId)
    if (garment && isPurchasable(garment) && garment.colours.length && garment.sizes.length) {
      this.selectedGarmentId = garmentId
      this.selectedColourValue = garment.colours[0].value
      this.selectedColourName = garment.colours[0].name
      this.selectedSize = garment.sizes[0]
      this.prints = {}
      this.activeZone = 'front'
      this.quantity = 1
      this.viewMode = 'front'
    }
  }

  getColour() {
    const garment = getGarmentById(this.selectedGarmentId)
    return garment?.colours.find((entry) => entry.value === this.selectedColourValue) || null
  }

  setColour(colourValue, colourName) {
    this.selectedColourValue = colourValue
    this.selectedColourName = colourName
    if (this.viewMode === 'back' && !this.getColour()?.backImage) this.viewMode = 'front'
  }

  setSize(size) {
    this.selectedSize = size
  }

  canPrint(designId) {
    return Boolean(getDesignById(designId) && getCompatibleDesigns(this.selectedGarmentId).some((entry) => entry.id === designId))
  }

  /* Pick which print spot the artwork grid fills, and turn the tee to show it. */
  setActiveZone(zoneId) {
    const zone = zoneById(zoneId)
    if (!zone) return
    this.activeZone = zoneId
    this.setViewMode(zone.view)
  }

  setZoneDesign(zoneId, designId) {
    const zone = zoneById(zoneId)
    if (!zone || !this.canPrint(designId)) return
    const current = this.prints[zoneId]
    const placement = current && zone.placements.includes(current.placement) ? current.placement : zone.placements[0]
    this.prints = { ...this.prints, [zoneId]: { designId, placement } }
  }

  clearZone(zoneId) {
    const next = { ...this.prints }
    delete next[zoneId]
    this.prints = next
  }

  /* Front prints come in two sizes; other spots have one. */
  setZonePlacement(zoneId, placementId) {
    const zone = zoneById(zoneId)
    const current = this.prints[zoneId]
    if (!zone || !current || !zone.placements.includes(placementId)) return
    this.prints = { ...this.prints, [zoneId]: { ...current, placement: placementId } }
  }

  /* Shortcuts that act on the active spot. */
  get selectedDesignId() {
    return this.prints[this.activeZone]?.designId || null
  }

  get selectedPlacement() {
    return this.prints[this.activeZone]?.placement || null
  }

  setDesign(designId) {
    this.setZoneDesign(this.activeZone, designId)
  }

  clearDesign() {
    this.clearZone(this.activeZone)
  }

  setPlacement(placementId) {
    this.setZonePlacement(this.activeZone, placementId)
  }

  clearAll() {
    this.prints = {}
  }

  setQuantity(quantity) {
    this.quantity = normalizeQuantity(quantity)
  }

  setViewMode(viewMode) {
    if (viewMode === 'back' && !this.getColour()?.backImage) return
    this.viewMode = viewMode
  }

  /* [{ placement, designId }] in zone order. */
  getPrints() {
    return normalizePrints(Object.values(this.prints))
  }

  /* Prints with labels, design names and prices, for the breakdown and summaries. */
  getPrintDetails() {
    return describePrints(this.getPrints()).map((print) => ({
      ...print,
      zone: getPlacementConfig(print.placement).zone,
      view: getPlacementConfig(print.placement).view,
      price: getPlacementConfig(print.placement).price
    }))
  }

  getPrice() {
    return calculatePrintsPrice(this.selectedGarmentId, this.getPrints())
  }

  getSummary() {
    const garment = getGarmentById(this.selectedGarmentId)
    const prints = this.getPrintDetails()
    return {
      garmentName: garment?.name || 'N/A',
      colour: this.selectedColourName,
      size: this.selectedSize,
      prints,
      designName: prints.length ? prints.map((print) => print.designName).join(', ') : 'None',
      price: this.getPrice()
    }
  }

  createCartItem() {
    const garment = getGarmentById(this.selectedGarmentId)
    if (!isPurchasable(garment)) {
      throw new Error('This garment is not available to order.')
    }
    const prints = this.getPrintDetails().map(({ placement, designId, designName }) => ({ placement, designId, designName }))
    return {
      garmentId: this.selectedGarmentId,
      garmentName: garment.name,
      colour: this.selectedColourName,
      size: this.selectedSize,
      prints,
      designName: prints.length ? prints.map((print) => print.designName).join(', ') : 'None',
      unitPrice: this.getPrice(),
      quantity: normalizeQuantity(this.quantity)
    }
  }
}

/* Preview-link spot parameters: front=D051c (c = centre, s = small), back=D054, ls=D055, rs=D055. */
export const SPOT_PARAMS = { front: 'front', back: 'back', ls: 'left-sleeve', rs: 'right-sleeve' }

export function initCustomizerFromUrl(customizer, params = {}) {
  const requestedDesign = params.design ? getDesignById(params.design) : null

  if (params.garment) {
    customizer.setGarment(params.garment)
  } else if (requestedDesign?.compatibleGarments.length) {
    customizer.setGarment(requestedDesign.compatibleGarments[0])
  }

  if (!customizer.selectedGarmentId) {
    const first = getPurchasableGarments()[0]
    if (first) customizer.setGarment(first.id)
  }

  if (params.design && customizer.selectedGarmentId) {
    customizer.setZoneDesign('front', params.design)
  }

  // A shared build: colour, size and every print spot.
  const garment = getGarmentById(customizer.selectedGarmentId)
  const colour = garment?.colours.find((entry) => entry.name.toLowerCase() === String(params.colour || '').toLowerCase())
  if (colour) customizer.setColour(colour.value, colour.name)
  if (garment?.sizes.includes(params.size)) customizer.setSize(params.size)
  for (const [key, zone] of Object.entries(SPOT_PARAMS)) {
    const raw = String(params[key] || '').trim()
    if (!raw) continue
    const match = raw.match(/^(.*?)([cs])?$/i)
    const design = getDesignByCode(match[1])
    if (!design) continue
    customizer.setZoneDesign(zone, design.id)
    if (zone === 'front' && match[2]) customizer.setZonePlacement('front', match[2].toLowerCase() === 's' ? 'front-small' : 'front-center')
  }
}
