/* ============================================================
   INTERSACKS APPAREL — customizer.js
   Product Customization, Cart Management & Ordering
============================================================ */

/* ── Cart Management ───────────────────────────────────────– */

class Cart {
  constructor() {
    this.items = this.loadFromStorage();
  }
  
  loadFromStorage() {
    const stored = localStorage.getItem('intersacks-cart');
    return stored ? JSON.parse(stored) : [];
  }
  
  saveToStorage() {
    localStorage.setItem('intersacks-cart', JSON.stringify(this.items));
  }
  
  addItem(item) {
    // Check if similar item exists (same garment, colour, size, design, placement)
    const existingIndex = this.items.findIndex(i =>
      i.garmentId === item.garmentId &&
      i.colour === item.colour &&
      i.size === item.size &&
      i.designId === item.designId &&
      i.placement === item.placement
    );
    
    if (existingIndex >= 0) {
      this.items[existingIndex].quantity += item.quantity;
    } else {
      this.items.push({
        ...item,
        quantity: item.quantity || 1
      });
    }
    
    this.saveToStorage();
    return this.items;
  }
  
  removeItem(index) {
    this.items.splice(index, 1);
    this.saveToStorage();
    return this.items;
  }
  
  updateQuantity(index, quantity) {
    if (quantity <= 0) {
      return this.removeItem(index);
    }
    this.items[index].quantity = quantity;
    this.saveToStorage();
    return this.items;
  }
  
  clear() {
    this.items = [];
    this.saveToStorage();
    return this.items;
  }
  
  getSubtotal() {
    return this.items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);
  }
  
  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
}

const cart = new Cart();

/* ── Customizer State ──────────────────────────────────────– */

class Customizer {
  constructor() {
    this.selectedGarmentId = null;
    this.selectedColourValue = null;
    this.selectedColourName = null;
    this.selectedSize = null;
    this.selectedDesignId = null;
    this.selectedPlacement = null;
    this.viewMode = 'front'; // 'front' or 'back'
  }
  
  setGarment(garmentId) {
    const garment = getGarmentById(garmentId);
    if (garment && garment.available !== false && garment.colours.length && garment.sizes.length) {
      this.selectedGarmentId = garmentId;
      this.selectedColourValue = garment.colours[0].value;
      this.selectedColourName = garment.colours[0].name;
      this.selectedSize = garment.sizes[0];
      this.selectedDesignId = null;
      this.selectedPlacement = null;
    }
  }
  
  setColour(colourValue, colourName) {
    this.selectedColourValue = colourValue;
    this.selectedColourName = colourName;
  }
  
  setSize(size) {
    this.selectedSize = size;
  }
  
  setDesign(designId) {
    const design = getDesignById(designId);
    if (design && getCompatibleDesigns(this.selectedGarmentId).find(d => d.id === designId)) {
      this.selectedDesignId = designId;
      // Set first compatible placement
      if (design.placements.length > 0) {
        this.selectedPlacement = design.placements[0];
      }
    }
  }
  
  setPlacement(placementId) {
    this.selectedPlacement = placementId;
  }
  
  toggleViewMode() {
    this.viewMode = this.viewMode === 'front' ? 'back' : 'front';
  }
  
  getPrice() {
    return calculatePrice(this.selectedGarmentId, this.selectedDesignId);
  }
  
  getSummary() {
    const garment = getGarmentById(this.selectedGarmentId);
    const design = this.selectedDesignId ? getDesignById(this.selectedDesignId) : null;
    const placement = this.selectedPlacement ? getPlacementConfig(this.selectedPlacement) : null;
    
    return {
      garmentName: garment?.name || 'N/A',
      colour: this.selectedColourName,
      size: this.selectedSize,
      designName: design?.name || 'None',
      placement: placement?.name || 'N/A',
      price: this.getPrice()
    };
  }
  
  createCartItem() {
    const garment = getGarmentById(this.selectedGarmentId);
    const design = this.selectedDesignId ? getDesignById(this.selectedDesignId) : null;
    
    return {
      garmentId: this.selectedGarmentId,
      garmentName: garment.name,
      colour: this.selectedColourName,
      size: this.selectedSize,
      designId: this.selectedDesignId,
      designName: design?.name || 'None',
      placement: this.selectedPlacement || 'N/A',
      unitPrice: this.getPrice(),
      quantity: 1
    };
  }
}

const customizer = new Customizer();

/* ── Preview Rendering ────────────────────────────────────– */

function updateProductPreview() {
  const garment = getGarmentById(customizer.selectedGarmentId);
  const design = customizer.selectedDesignId ? getDesignById(customizer.selectedDesignId) : null;
  
  if (!garment) return;
  
  // Get correct mockup based on view mode
  const selectedColour = garment.colours.find(c => c.value === customizer.selectedColourValue);
  const hasBackImage = Boolean(selectedColour?.backImage);
  if (customizer.viewMode === 'back' && !hasBackImage) customizer.viewMode = 'front';
  const mockupUrl = customizer.viewMode === 'back' ? selectedColour.backImage : selectedColour?.frontImage;
  
  const garmentLayer = document.querySelector('.product-preview .garment-layer');
  if (garmentLayer) {
    garmentLayer.style.display = '';
    garmentLayer.src = mockupUrl || '';
    garmentLayer.alt = `${garment.name} ${customizer.selectedColourName}`;
  }
  
  // Update design overlay
  const designLayer = document.querySelector('.product-preview .design-layer');
  if (designLayer && design && customizer.selectedPlacement && customizer.viewMode === 'front') {
    const designUrl = customizer.viewMode === 'front'
      ? design.transparentImage || design.image
      : design.transparentImage || design.image;
    
    designLayer.src = designUrl;
    designLayer.style.display = 'block';
    
    // Apply placement styles
    const placementConfig = getPlacementConfig(customizer.selectedPlacement);
    if (placementConfig) {
      const styles = placementConfig.styles;
      designLayer.style.width = styles.width;
      designLayer.style.top = styles.top;
      designLayer.style.left = styles.left;
      designLayer.style.transform = styles.transform;
    }
  } else if (designLayer) {
    designLayer.style.display = 'none';
  }

  document.querySelectorAll('.view-toggle-btn').forEach(button => {
    const isBack = button.dataset.view === 'back';
    button.disabled = isBack && !hasBackImage;
    button.classList.toggle('active', button.dataset.view === customizer.viewMode);
    if (isBack) button.title = hasBackImage ? 'Show back' : 'Back image not available';
  });
}

function updateSummary() {
  const summary = customizer.getSummary();
  const summaryContainer = document.querySelector('.customizer-summary');
  
  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <h3 class="summary-title">YOUR ITEM</h3>
      <div class="summary-details">
        <div class="summary-row">
          <span class="summary-label">Garment:</span>
          <span class="summary-value">${summary.garmentName}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Colour:</span>
          <span class="summary-value">${summary.colour}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Size:</span>
          <span class="summary-value">${summary.size}</span>
        </div>
        ${summary.designName !== 'None' ? `
          <div class="summary-row">
            <span class="summary-label">Design:</span>
            <span class="summary-value">${summary.designName}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Placement:</span>
            <span class="summary-value">${summary.placement}</span>
          </div>
        ` : ''}
      </div>
      <div class="summary-price">
        ${formatPrice(summary.price)}
      </div>
      <button class="btn btn-primary add-to-cart-btn" id="addToCartBtn">
        ADD TO BAG
      </button>
    `;
    
    document.getElementById('addToCartBtn')?.addEventListener('click', addToCart);
  }
}

function addToCart() {
  const item = customizer.createCartItem();
  cart.addItem(item);
  
  // Show feedback
  const btn = document.getElementById('addToCartBtn');
  const originalText = btn.textContent;
  btn.textContent = '✓ ADDED TO BAG';
  btn.disabled = true;
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
  }, 2000);
  
  // Update cart badge
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  const count = cart.getItemCount();
  
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
  }
}

/* ── Cart Display ──────────────────────────────────────────– */

function renderCartItems() {
  const container = document.querySelector('.cart-items-container');
  if (!container) return;
  
  if (cart.isEmpty()) {
    container.innerHTML = `
      <div class="empty-cart">
        <p>Your bag is empty</p>
        <a href="index.html" class="btn btn-secondary">Continue Shopping</a>
      </div>
    `;
    return;
  }
  
  const itemsHTML = cart.items.map((item, index) => `
    <div class="cart-item" data-cart-index="${index}">
      <div class="cart-item-info">
        <h4 class="cart-item-garment">${item.garmentName}</h4>
        <p class="cart-item-details">
          Colour: ${item.colour} | Size: ${item.size}
        </p>
        ${item.designName !== 'None' ? `
          <p class="cart-item-design">
            Design: ${item.designName} (${item.placement})
          </p>
        ` : ''}
      </div>
      <div class="cart-item-price">
        <p class="price-per-unit">${formatPrice(item.unitPrice)} each</p>
      </div>
      <div class="cart-item-quantity">
        <button class="qty-btn qty-decrease" data-cart-index="${index}">-</button>
        <input type="number" class="qty-input" value="${item.quantity}" data-cart-index="${index}" min="1">
        <button class="qty-btn qty-increase" data-cart-index="${index}">+</button>
      </div>
      <div class="cart-item-total">
        <p>${formatPrice(item.unitPrice * item.quantity)}</p>
      </div>
      <button class="cart-item-remove" data-cart-index="${index}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  `).join('');
  
  container.innerHTML = `
    <div class="cart-items-list">
      ${itemsHTML}
    </div>
    <div class="cart-summary">
      <div class="cart-summary-row">
        <span>Subtotal</span>
        <span>${formatPrice(cart.getSubtotal())}</span>
      </div>
      <div class="cart-summary-row">
        <span>Delivery</span>
        <span>To be confirmed</span>
      </div>
      <div class="cart-summary-total">
        <span>Total</span>
        <span>${formatPrice(cart.getSubtotal())}</span>
      </div>
      <button class="btn btn-primary btn-full" id="whatsappOrderBtn">
        ORDER VIA WHATSAPP
      </button>
      <button class="btn btn-secondary btn-full" id="continueShopping">
        CONTINUE SHOPPING
      </button>
      <button class="btn btn-outline btn-full" id="emptyCartBtn">
        EMPTY BAG
      </button>
    </div>
  `;
  
  // Attach event listeners
  container.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', handleQuantityChange);
  });
  
  container.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', handleQuantityInput);
  });
  
  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', handleRemoveItem);
  });
  
  document.getElementById('whatsappOrderBtn')?.addEventListener('click', sendWhatsAppOrder);
  document.getElementById('continueShopping')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  document.getElementById('emptyCartBtn')?.addEventListener('click', handleEmptyCart);
}

function handleQuantityChange(e) {
  const btn = e.target.closest('.qty-btn');
  const index = parseInt(btn.dataset.cartIndex);
  const isIncrease = btn.classList.contains('qty-increase');
  const newQuantity = cart.items[index].quantity + (isIncrease ? 1 : -1);
  
  cart.updateQuantity(index, newQuantity);
  renderCartItems();
}

function handleQuantityInput(e) {
  const input = e.target;
  const index = parseInt(input.dataset.cartIndex);
  const quantity = parseInt(input.value) || 0;
  
  cart.updateQuantity(index, quantity);
  renderCartItems();
}

function handleRemoveItem(e) {
  const btn = e.target.closest('.cart-item-remove');
  const index = parseInt(btn.dataset.cartIndex);
  cart.removeItem(index);
  renderCartItems();
  updateCartBadge();
}

function handleEmptyCart() {
  if (confirm('Empty your entire bag?')) {
    cart.clear();
    renderCartItems();
    updateCartBadge();
  }
}

/* ── WhatsApp Integration ──────────────────────────────────– */

function generateWhatsAppMessage() {
  if (cart.isEmpty()) {
    alert('Your bag is empty!');
    return null;
  }
  
  let message = `Hi ${STORE_CONFIG.brandName} 👋\n\n`;
  message += `I would like to place an order:\n\n`;
  
  cart.items.forEach((item, index) => {
    const qty = item.quantity > 1 ? `${item.quantity} ×` : '1 ×';
    message += `${qty} ${item.garmentName}\n`;
    message += `Colour: ${item.colour}\n`;
    message += `Size: ${item.size}\n`;
    
    if (item.designName !== 'None') {
      message += `Design: ${item.designName}\n`;
      message += `Placement: ${item.placement}\n`;
    }
    
    message += `Price: ${formatPrice(item.unitPrice * item.quantity)}\n`;
    message += `\n`;
  });
  
  message += `TOTAL: ${formatPrice(cart.getSubtotal())}\n\n`;
  message += `Name:\nDelivery Area:\n`;
  message += `\n${STORE_CONFIG.tagline}`;
  
  return message;
}

function sendWhatsAppOrder() {
  const message = generateWhatsAppMessage();
  if (!message) return;
  
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

/* ── URL Parameter Handling ────────────────────────────────– */

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    garment: params.get('garment'),
    design: params.get('design')
  };
}

function initCustomizerFromUrl() {
  const params = getUrlParams();
  const requestedDesign = params.design ? getDesignById(params.design) : null;
  
  if (params.garment) {
    customizer.setGarment(params.garment);
  } else if (requestedDesign?.compatibleGarments.length) {
    customizer.setGarment(requestedDesign.compatibleGarments[0]);
  }
  
  if (params.design && customizer.selectedGarmentId) {
    customizer.setDesign(params.design);
  }
}

/* ── Initialization ────────────────────────────────────────– */

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  console.log('Customizer module loaded');
});
