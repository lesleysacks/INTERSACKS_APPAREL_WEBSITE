import {
  calculatePrice,
  getCompatibleDesigns,
  getDesignById,
  getGarmentById,
  getPlacementConfig,
  getPurchasableGarments,
  isPurchasable
} from '../data/catalogue.js'
import { normalizeQuantity } from './cart.js'

export class Customizer {
  constructor() {
    this.selectedGarmentId = null
    this.selectedColourValue = null
    this.selectedColourName = null
    this.selectedSize = null
    this.selectedDesignId = null
    this.selectedPlacement = null
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
      this.selectedDesignId = null
      this.selectedPlacement = null
      this.quantity = 1
      if (this.viewMode === 'back' && !garment.colours[0].backImage) this.viewMode = 'front'
    }
  }

  setColour(colourValue, colourName) {
    this.selectedColourValue = colourValue
    this.selectedColourName = colourName
    const garment = getGarmentById(this.selectedGarmentId)
    const colour = garment?.colours.find((entry) => entry.value === colourValue)
    if (this.viewMode === 'back' && !colour?.backImage) this.viewMode = 'front'
  }

  setSize(size) {
    this.selectedSize = size
  }

  setDesign(designId) {
    const design = getDesignById(designId)
    if (design && getCompatibleDesigns(this.selectedGarmentId).find((entry) => entry.id === designId)) {
      this.selectedDesignId = designId
      this.selectedPlacement = design.placements[0] || null
    }
  }

  clearDesign() {
    this.selectedDesignId = null
    this.selectedPlacement = null
  }

  setPlacement(placementId) {
    this.selectedPlacement = placementId
  }

  setQuantity(quantity) {
    this.quantity = normalizeQuantity(quantity)
  }

  setViewMode(viewMode) {
    const garment = getGarmentById(this.selectedGarmentId)
    const colour = garment?.colours.find((entry) => entry.value === this.selectedColourValue)
    if (viewMode === 'back' && !colour?.backImage) return
    this.viewMode = viewMode
  }

  getPrice() {
    return calculatePrice(this.selectedGarmentId, this.selectedDesignId)
  }

  getSummary() {
    const garment = getGarmentById(this.selectedGarmentId)
    const design = this.selectedDesignId ? getDesignById(this.selectedDesignId) : null
    const placement = this.selectedPlacement ? getPlacementConfig(this.selectedPlacement) : null

    return {
      garmentName: garment?.name || 'N/A',
      colour: this.selectedColourName,
      size: this.selectedSize,
      designName: design?.name || 'None',
      placement: placement?.name || 'N/A',
      price: this.getPrice()
    }
  }

  createCartItem() {
    const garment = getGarmentById(this.selectedGarmentId)
    if (!isPurchasable(garment)) {
      throw new Error('This garment is not available to order.')
    }
    const design = this.selectedDesignId ? getDesignById(this.selectedDesignId) : null

    return {
      garmentId: this.selectedGarmentId,
      garmentName: garment.name,
      colour: this.selectedColourName,
      size: this.selectedSize,
      designId: this.selectedDesignId,
      designName: design?.name || 'None',
      placement: this.selectedPlacement || 'N/A',
      unitPrice: this.getPrice(),
      quantity: normalizeQuantity(this.quantity)
    }
  }
}

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
    customizer.setDesign(params.design)
  }
}
