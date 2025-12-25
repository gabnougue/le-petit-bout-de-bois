// ====================================
// Script catalogue - Le petit bout de bois
// ====================================

let allProducts = [];
let allCategories = [];
let currentCategory = 'all';
let currentSearch = '';
let currentMaxPrice = 100;

// Charger les catégories
async function loadCategories() {
  try {
    const response = await fetch('/api/products/meta/categories');
    allCategories = await response.json();
    renderCategoryFilters();
  } catch (error) {
    console.error('Erreur chargement catégories:', error);
  }
}

// Générer les boutons de filtres de catégories
function renderCategoryFilters() {
  const container = document.getElementById('category-filters');
  if (!container) return;

  // Bouton "Tous"
  let html = `
    <button class="filter-btn active" data-category="all"
            style="padding: 0.5rem 1rem; border: 2px solid var(--wood-medium); border-radius: 8px;
                   background: var(--wood-medium); color: white; cursor: pointer; font-weight: 600;
                   transition: all 0.2s ease;">
      Tous
    </button>
  `;

  // Boutons pour chaque catégorie
  allCategories.forEach(category => {
    html += `
      <button class="filter-btn" data-category="${category}"
              style="padding: 0.5rem 1rem; border: 2px solid var(--wood-medium); border-radius: 8px;
                     background: white; color: var(--wood-medium); cursor: pointer; font-weight: 600;
                     transition: all 0.2s ease;">
        ${category}
      </button>
    `;
  });

  container.innerHTML = html;

  // Réactiver les event listeners
  setupFilters();

  // Mettre à jour l'état actif selon la catégorie courante
  updateFilterButtons();
}

// Charger les produits
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    allProducts = await response.json();

    // Initialiser le filtre de prix avec le maximum
    initializePriceFilter();

    // Vérifier les paramètres URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');

    if (categoryParam) {
      currentCategory = categoryParam;
      updateFilterButtons();
    }

    if (searchParam) {
      currentSearch = searchParam;
      document.getElementById('search-input').value = searchParam;
    }

    displayProducts();
  } catch (error) {
    console.error('Erreur chargement produits:', error);
    showError('Erreur lors du chargement des produits');
  }
}

// Initialiser le filtre de prix avec le prix maximum des produits
function initializePriceFilter() {
  if (allProducts.length === 0) return;

  const maxPrice = Math.max(...allProducts.map(p => p.price));
  const roundedMax = Math.ceil(maxPrice / 10) * 10; // Arrondir au multiple de 10 supérieur

  const priceFilter = document.getElementById('price-filter');
  const priceValue = document.getElementById('price-value');

  priceFilter.max = roundedMax;
  priceFilter.value = roundedMax;
  priceValue.textContent = roundedMax;
  currentMaxPrice = roundedMax;

  updateSliderBackground(priceFilter);
}

// Mettre à jour le background du slider (effet rempli/vide)
function updateSliderBackground(slider) {
  const min = parseFloat(slider.min) || 0;
  const max = parseFloat(slider.max);
  const value = parseFloat(slider.value);

  // Calculer le pourcentage en tenant compte de la taille du thumb
  // Pour que le gradient s'arrête exactement au centre du thumb
  const percentage = ((value - min) / (max - min)) * 100;

  // Gradient avec partie foncée (remplie) à gauche et claire (vide) à droite
  slider.style.background = `linear-gradient(to right, var(--wood-medium) ${percentage}%, #e0e0e0 ${percentage}%)`;
}

// Mettre à jour l'affichage du prix
function updatePriceDisplay() {
  const priceFilter = document.getElementById('price-filter');
  const priceValue = document.getElementById('price-value');
  priceValue.textContent = priceFilter.value;
  updateSliderBackground(priceFilter);
  displayProducts();
}

// Afficher les produits
function displayProducts() {
  const container = document.getElementById('products-container');
  const noProductsDiv = document.getElementById('no-products');
  const countDiv = document.getElementById('product-count');

  // Récupérer le filtre de prix
  const priceFilter = document.getElementById('price-filter');
  const maxPrice = priceFilter ? parseFloat(priceFilter.value) : currentMaxPrice;

  // Filtrer les produits
  let filteredProducts = allProducts;

  // Filtre par catégorie
  if (currentCategory !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
  }

  // Filtre par recherche
  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.wood_type.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower)
    );
  }

  // Filtre par prix
  filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);

  // Mettre à jour le compteur avec une police adaptée
  countDiv.textContent = `${filteredProducts.length} produit${filteredProducts.length > 1 ? 's' : ''} trouvé${filteredProducts.length > 1 ? 's' : ''}`;
  countDiv.style.fontWeight = '600';
  countDiv.style.fontSize = '1.2rem';

  // Afficher ou masquer le message "aucun produit"
  if (filteredProducts.length === 0) {
    container.style.display = 'none';
    noProductsDiv.style.display = 'block';
    return;
  } else {
    container.style.display = 'grid';
    noProductsDiv.style.display = 'none';
  }

  // Générer les cartes produits
  container.innerHTML = filteredProducts.map(product => {
    // Utiliser la première image du tableau images, ou image_url en fallback
    const imageUrl = (product.images && product.images.length > 0)
      ? product.images[0].image_path
      : (product.image_url || '/images/placeholder.jpg');

    return `
    <div class="product-card">
      <img src="${imageUrl}"
           alt="${product.name}"
           class="product-image"
           onclick="window.location.href='/produit/${product.id}'"
           style="cursor: pointer;">

      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-wood">🪵 ${product.wood_type}</p>
        <p class="product-description">${truncateText(product.description, 80)}</p>
        <p class="product-price">${product.price.toFixed(2)} €</p>

        ${product.perlouze_link ? `
          <a href="${product.perlouze_link}" class="perlouze-link" onclick="event.stopPropagation();">
            ✨ Voir les bijoux assortis
          </a>
        ` : ''}

        <div style="display: flex; gap: 0.5rem; margin-top: auto; padding-top: 1rem;">
          <button onclick="window.location.href='/produit/${product.id}'" class="btn btn-secondary" style="flex: 1; font-weight: 600; font-size: 1rem;">
            Détails
          </button>
          <button onclick="addToCart(${product.id})" class="btn btn-primary btn-add-cart" style="flex: 1; font-weight: 600; font-size: 1rem;">
            <span class="cart-icon">🛒</span><span class="cart-text"> Ajouter</span>
          </button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

// Tronquer le texte
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Gestion des filtres
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Mettre à jour l'état actif
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'white';
        b.style.color = 'var(--wood-medium)';
      });

      btn.classList.add('active');
      btn.style.background = 'var(--wood-medium)';
      btn.style.color = 'white';

      // Mettre à jour la catégorie
      currentCategory = btn.dataset.category;

      // Mettre à jour l'URL
      const url = new URL(window.location);
      if (currentCategory === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', currentCategory);
      }
      window.history.pushState({}, '', url);

      // Réafficher les produits
      displayProducts();
    });
  });
}

// Gestion de la recherche
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    // Debounce pour éviter trop de requêtes
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value.trim();

      // Mettre à jour l'URL
      const url = new URL(window.location);
      if (currentSearch) {
        url.searchParams.set('search', currentSearch);
      } else {
        url.searchParams.delete('search');
      }
      window.history.pushState({}, '', url);

      // Réafficher les produits
      displayProducts();
    }, 300);
  });
}

// Mettre à jour les boutons de filtre selon l'URL
function updateFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(btn => {
    if (btn.dataset.category === currentCategory) {
      btn.classList.add('active');
      btn.style.background = 'var(--wood-medium)';
      btn.style.color = 'white';
    } else {
      btn.classList.remove('active');
      btn.style.background = 'white';
      btn.style.color = 'var(--wood-medium)';
    }
  });
}

// Afficher les erreurs
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 1rem 2rem;
    background: #FEE2E2;
    color: #991B1B;
    border: 2px solid #FCA5A5;
    border-radius: 8px;
    box-shadow: var(--shadow-medium);
    animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
  `;

  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

// Réinitialiser les filtres
function resetFilters() {
  // Réinitialiser la catégorie
  currentCategory = 'all';
  updateFilterButtons();

  // Réinitialiser la recherche
  currentSearch = '';
  document.getElementById('search-input').value = '';

  // Réinitialiser le prix
  const priceFilter = document.getElementById('price-filter');
  const priceValue = document.getElementById('price-value');
  if (priceFilter) {
    priceFilter.value = priceFilter.max;
    priceValue.textContent = priceFilter.max;
    updateSliderBackground(priceFilter);
  }

  // Réafficher les produits
  displayProducts();
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadProducts();
  setupSearch();

  // Écouter les changements du curseur de prix
  const priceFilter = document.getElementById('price-filter');
  if (priceFilter) {
    priceFilter.addEventListener('input', updatePriceDisplay);
  }
});
