/* ============================================================
   INTERSACKS APPAREL — catalogue.js
   Dynamic Catalogue Rendering
   Renders garments and designs from data.js
============================================================ */

/* ── Garment Catalogue Rendering ──────────────────────────── */

function renderGarmentCard(garment) {
  const colourCount = garment.colours.length;
  const isAvailable = garment.available !== false;
  const imageMarkup = garment.image
    ? `<img src="${garment.image}" alt="${garment.name}" class="garment-img" onerror="handleImageError(this)">`
    : `<div class="img-error-fallback planned-product"><p>IMAGE COMING SOON</p></div>`;
  
  return `
    <div class="garment-card" data-garment-id="${garment.id}">
      <div class="garment-card-image">
        ${imageMarkup}
      </div>
      <div class="garment-card-info">
        <h3 class="garment-card-name">${garment.name}</h3>
        <p class="garment-card-price">${isAvailable ? `From ${formatPrice(garment.basePrice)}` : 'COMING SOON'}</p>
        <p class="garment-card-colours">${isAvailable ? `${colourCount} Colour${colourCount !== 1 ? 's' : ''}` : 'Options to be announced'}</p>
        <button class="btn btn-primary garment-customize-btn" data-garment-id="${garment.id}" ${isAvailable ? '' : 'disabled'}>
          ${isAvailable ? (garment.customizable ? 'CUSTOMIZE' : 'VIEW ITEM') : 'PLANNED PRODUCT'}
        </button>
      </div>
    </div>
  `;
}

function renderGarmentGrid(garments, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (garments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No garments available</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = garments
    .map(garment => renderGarmentCard(garment))
    .join('');
  
  // Attach event listeners
  container.querySelectorAll('.garment-customize-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const garmentId = e.target.dataset.garmentId;
      // Navigate to customizer with garment pre-selected
      window.location.href = `product.html?garment=${garmentId}`;
    });
  });
}

function renderGarmentsByCategory(category, containerId) {
  const garments = getGarmentsByCategory(category);
  renderGarmentGrid(garments, containerId);
}

function renderAllGarments(containerId) {
  const garments = getGarments().filter(g => g.active);
  renderGarmentGrid(garments, containerId);
}

/* ── Design Catalogue Rendering ────────────────────────────– */

function renderDesignCard(design) {
  const categoryBadge = design.category || 'Design';
  const priceLabel = design.additionalPrice > 0 
    ? `+${formatPrice(design.additionalPrice)}` 
    : 'No Extra Cost';
  
  // If design is inactive, show placeholder
  if (!design.active) {
    return `
      <div class="design-card design-card-placeholder" data-design-id="${design.id}">
        <div class="design-card-image placeholder">
          <img src="${design.image}" alt="${design.name}" class="design-img" onerror="handleImageError(this)">
          <div class="placeholder-overlay">
            <span class="placeholder-text">Coming Soon</span>
          </div>
        </div>
        <div class="design-card-info">
          <h3 class="design-card-name">${design.name}</h3>
          <p class="design-card-category">${categoryBadge}</p>
          <p class="design-card-status">Not Yet Available</p>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="design-card" data-design-id="${design.id}" data-category="${design.category}">
      <div class="design-card-image">
        <img src="${design.image}" alt="${design.name}" class="design-img" onerror="handleImageError(this)">
      </div>
      <div class="design-card-info">
        <h3 class="design-card-name">${design.name}</h3>
        <p class="design-card-category">${categoryBadge}</p>
        <p class="design-card-price">${priceLabel}</p>
        <button class="btn btn-secondary design-select-btn" data-design-id="${design.id}">
          USE THIS DESIGN
        </button>
      </div>
    </div>
  `;
}

function renderDesignGrid(designs, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (designs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No designs available</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = designs
    .map(design => renderDesignCard(design))
    .join('');
  
  // Attach event listeners to active designs
  container.querySelectorAll('.design-select-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const designId = e.target.dataset.designId;
      window.location.href = `product.html?design=${designId}`;
    });
  });
}

function renderDesignsByCategory(category, containerId) {
  let designs;
  
  if (category === 'All') {
    designs = getDesigns();
  } else {
    designs = getDesignsByCategory(category);
  }
  
  renderDesignGrid(designs, containerId);
}

function renderAllDesigns(containerId) {
  const designs = getDesigns();
  renderDesignGrid(designs, containerId);
}

/* ── Featured Sections ───────────────────────────────────── */

function renderFeaturedGarments(containerId) {
  const garments = getFeaturedGarments().slice(0, 4);
  renderGarmentGrid(garments, containerId);
}

function renderFeaturedDesigns(containerId) {
  const designs = getFeaturedDesigns().slice(0, 6);
  renderDesignGrid(designs, containerId);
}

/* ── Design Filter Control ────────────────────────────────– */

function initDesignFilter(containerId, gridContainerId) {
  const filterContainer = document.getElementById(containerId);
  if (!filterContainer) return;
  
  const categories = getDesignCategories();
  categories.unshift('All');
  
  const filterHTML = `
    <label class="design-search" for="designSearchInput">
      <span class="sr-only">Search designs</span>
      <input id="designSearchInput" type="search" placeholder="Search designs or categories" autocomplete="off">
    </label>
    <div class="design-filters">
      ${categories.map((cat, idx) => `
        <button class="filter-btn ${idx === 0 ? 'active' : ''}" data-filter="${cat}">
          ${cat}
        </button>
      `).join('')}
    </div>
  `;
  
  filterContainer.innerHTML = filterHTML;
  
  // Attach filter listeners
  filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update active state
      filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const category = e.target.dataset.filter;
      renderDesignsByCategory(category, gridContainerId);
    });
  });
  
  // Initial render
  renderDesignsByCategory('All', gridContainerId);
}

/* ── Search Functionality ──────────────────────────────────– */

function searchDesigns(query, containerId) {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) {
    renderAllDesigns(containerId);
    return;
  }
  
  const allDesigns = getDesigns();
  const results = allDesigns.filter(design =>
    design.name.toLowerCase().includes(lowerQuery) ||
    design.category.toLowerCase().includes(lowerQuery)
  );
  
  renderDesignGrid(results, containerId);
}

function searchGarments(query, containerId) {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) {
    renderAllGarments(containerId);
    return;
  }
  
  const allGarments = getGarments().filter(g => g.active);
  const results = allGarments.filter(garment =>
    garment.name.toLowerCase().includes(lowerQuery) ||
    garment.category.toLowerCase().includes(lowerQuery) ||
    garment.description.toLowerCase().includes(lowerQuery)
  );
  
  renderGarmentGrid(results, containerId);
}

function initSearch(searchInputSelector, designGridId, searchType = 'designs') {
  const searchInput = document.querySelector(searchInputSelector);
  if (!searchInput) return;
  
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = e.target.value;
      
      if (searchType === 'designs') {
        searchDesigns(query, designGridId);
      } else if (searchType === 'garments') {
        searchGarments(query, designGridId);
      }
    }, 300);
  });
}

/* ── Image Error Handling ──────────────────────────────────– */

function handleImageError(img) {
  if (!img || !img.parentElement) return;

  const isEmptySource = !img.getAttribute('src') || img.getAttribute('src') === '' || img.src === window.location.href;
  if (isEmptySource) {
    img.style.display = 'none';
    return;
  }

  img.style.display = 'none';
  const wrapper = img.parentElement;
  
  if (!wrapper.querySelector('.img-error-fallback')) {
    const fallback = document.createElement('div');
    fallback.className = 'img-error-fallback';
    fallback.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <p>IMAGE COMING SOON</p>
    `;
    wrapper.appendChild(fallback);
  }
}

/* ── Initialize on DOM Ready ───────────────────────────────– */

document.addEventListener('DOMContentLoaded', () => {
  // This will be called by index.html when needed
  console.log('Catalogue module loaded');
});
