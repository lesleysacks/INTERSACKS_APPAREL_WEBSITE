/* ============================================================
   INTERSACKS APPAREL — product.js
   Product Customization Page Logic
============================================================ */

/* ── Garment Selector Rendering ────────────────────────────– */

function renderGarmentSelector() {
  const container = document.getElementById('garmentSelector');
  if (!container) return;
  
  const garments = getGarments().filter(g => g.available !== false);
  
  const html = garments
    .filter(g => g.active)
    .map((garment, index) => `
      <button class="garment-option ${customizer.selectedGarmentId === garment.id || (!customizer.selectedGarmentId && index === 0) ? 'active' : ''}" 
              data-garment-id="${garment.id}"
              aria-label="Select ${garment.name}">
        <span class="option-name">${garment.name}</span>
        <span class="option-price">${formatPrice(garment.basePrice)}</span>
      </button>
    `)
    .join('');
  
  container.innerHTML = html;
  
  container.querySelectorAll('.garment-option').forEach(btn => {
    btn.addEventListener('click', handleGarmentSelection);
  });
  
  // Initialize first garment if none selected
  if (!customizer.selectedGarmentId) {
    const firstGarment = garments.find(g => g.active);
    if (firstGarment) {
      customizer.setGarment(firstGarment.id);
      container.querySelector(`[data-garment-id="${firstGarment.id}"]`)?.classList.add('active');
    }
  }
}

function handleGarmentSelection(e) {
  const btn = e.target.closest('.garment-option');
  const garmentId = btn.dataset.garmentId;
  
  // Update active state
  document.querySelectorAll('.garment-option').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Update customizer
  customizer.setGarment(garmentId);
  
  // Re-render dependent sections
  renderColourSelector();
  renderSizeSelector();
  renderDesignSelector();
  updateProductPreview();
  updateSummary();
}

/* ── Colour Selector Rendering ────────────────────────────– */

function renderColourSelector() {
  const container = document.getElementById('colourSelector');
  if (!container || !customizer.selectedGarmentId) return;
  
  const garment = getGarmentById(customizer.selectedGarmentId);
  if (!garment) return;
  
  const html = garment.colours
    .map(colour => `
      <button class="colour-swatch ${customizer.selectedColourValue === colour.value ? 'active' : ''}"
              data-colour-value="${colour.value}"
              data-colour-name="${colour.name}"
              style="background-color: ${colour.value};"
              title="${colour.name}"
              aria-label="Select ${colour.name} colour">
        <span class="colour-name">${colour.name}</span>
      </button>
    `)
    .join('');
  
  container.innerHTML = html;
  
  container.querySelectorAll('.colour-swatch').forEach(btn => {
    btn.addEventListener('click', handleColourSelection);
  });
}

function handleColourSelection(e) {
  const btn = e.target.closest('.colour-swatch');
  const colourValue = btn.dataset.colourValue;
  const colourName = btn.dataset.colourName;
  
  // Update active state
  document.querySelectorAll('.colour-swatch').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Update customizer
  customizer.setColour(colourValue, colourName);
  
  // Update preview
  updateProductPreview();
  updateSummary();
}

/* ── Size Selector Rendering ───────────────────────────────– */

function renderSizeSelector() {
  const container = document.getElementById('sizeSelector');
  if (!container || !customizer.selectedGarmentId) return;
  
  const garment = getGarmentById(customizer.selectedGarmentId);
  if (!garment) return;
  
  const html = garment.sizes
    .map(size => `
      <button class="size-option ${customizer.selectedSize === size ? 'active' : ''}"
              data-size="${size}"
              aria-label="Select size ${size}">
        ${size}
      </button>
    `)
    .join('');
  
  container.innerHTML = html;
  
  container.querySelectorAll('.size-option').forEach(btn => {
    btn.addEventListener('click', handleSizeSelection);
  });
}

function handleSizeSelection(e) {
  const btn = e.target.closest('.size-option');
  const size = btn.dataset.size;
  
  // Update active state
  document.querySelectorAll('.size-option').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Update customizer
  customizer.setSize(size);
  
  // Update summary
  updateSummary();
}

/* ── Design Selector Rendering ────────────────────────────– */

function renderDesignSelector() {
  const container = document.getElementById('designSelector');
  if (!container || !customizer.selectedGarmentId) return;
  
  const compatibleDesigns = getCompatibleDesigns(customizer.selectedGarmentId);
  
  if (compatibleDesigns.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No designs available for this garment yet</p>
      </div>
    `;
    document.getElementById('placementStep').style.display = 'none';
    return;
  }
  
  const html = `
    <div class="design-option design-option-none ${!customizer.selectedDesignId ? 'active' : ''}">
      <div class="design-option-label">No Design</div>
      <button class="design-option-btn design-option-none-btn" data-design-id="">
        Plain Garment
      </button>
    </div>
    ${compatibleDesigns.map(design => `
      <div class="design-option ${customizer.selectedDesignId === design.id ? 'active' : ''}">
        <img src="${design.image}" alt="${design.name}" class="design-option-img" onerror="handleImageError(this)">
        <div class="design-option-info">
          <h4 class="design-option-name">${design.name}</h4>
          <p class="design-option-category">${design.category}</p>
          ${design.additionalPrice > 0 ? `
            <p class="design-option-price">+${formatPrice(design.additionalPrice)}</p>
          ` : ''}
        </div>
        <button class="design-option-btn" data-design-id="${design.id}">
          SELECT
        </button>
      </div>
    `).join('')}
  `;
  
  container.innerHTML = html;
  
  container.querySelectorAll('.design-option-btn').forEach(btn => {
    btn.addEventListener('click', handleDesignSelection);
  });
}

function handleDesignSelection(e) {
  const btn = e.target.closest('.design-option-btn');
  const designId = btn.dataset.designId;
  
  // Update active state
  document.querySelectorAll('.design-option').forEach(o => o.classList.remove('active'));
  btn.closest('.design-option').classList.add('active');
  
  // Update customizer
  if (designId) {
    customizer.setDesign(designId);
    document.getElementById('placementStep').style.display = 'block';
    renderPlacementSelector();
  } else {
    customizer.selectedDesignId = null;
    customizer.selectedPlacement = null;
    document.getElementById('placementStep').style.display = 'none';
  }
  
  // Update preview and summary
  updateProductPreview();
  updateSummary();
}

/* ── Placement Selector Rendering ──────────────────────────– */

function renderPlacementSelector() {
  const container = document.getElementById('placementSelector');
  if (!container || !customizer.selectedDesignId) return;
  
  const placements = getPlacementsForDesign(customizer.selectedDesignId);
  
  if (placements.length === 0) {
    container.innerHTML = '<p>No placements available</p>';
    return;
  }
  
  const html = placements
    .map(placement => `
      <button class="placement-option ${customizer.selectedPlacement === placement.id ? 'active' : ''}"
              data-placement-id="${placement.id}"
              aria-label="Select ${placement.name} placement">
        <span class="placement-name">${placement.name}</span>
      </button>
    `)
    .join('');
  
  container.innerHTML = html;
  
  container.querySelectorAll('.placement-option').forEach(btn => {
    btn.addEventListener('click', handlePlacementSelection);
  });
}

function handlePlacementSelection(e) {
  const btn = e.target.closest('.placement-option');
  const placementId = btn.dataset.placementId;
  
  // Update active state
  document.querySelectorAll('.placement-option').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Update customizer
  customizer.setPlacement(placementId);
  
  // Update preview and summary
  updateProductPreview();
  updateSummary();
}

/* ── View Toggle (Front/Back) ──────────────────────────────– */

function setupViewToggle() {
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.currentTarget.disabled) return;
      const requestedView = e.currentTarget.dataset.view;
      if (requestedView === customizer.viewMode) return;
      // Update active state
      document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      // Update view mode
      customizer.viewMode = requestedView;
      
      // Update preview
      updateProductPreview();
    });
  });
}

/* ── Initialization ────────────────────────────────────────– */

document.addEventListener('DOMContentLoaded', () => {
  // Check if URL has parameters to pre-select garment/design
  initCustomizerFromUrl();
  
  // Render all selectors
  renderGarmentSelector();
  renderColourSelector();
  renderSizeSelector();
  renderDesignSelector();
  
  // Setup view toggle
  setupViewToggle();
  
  // Initial preview and summary
  if (customizer.selectedGarmentId) {
    updateProductPreview();
    updateSummary();
  }
  
  console.log('Product customizer page loaded');
});
