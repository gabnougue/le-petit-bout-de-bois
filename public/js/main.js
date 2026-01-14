// ====================================
// Script principal - le p'tit bout de bois
// ====================================

// Gestion du panier
class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cart-bois')) || [];
    this.updateCartCount();
  }

  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.id === product.id);

    // Déterminer l'image à utiliser (priorité au tableau images)
    let imageUrl = product.image_url || '/images/placeholder.jpg';
    if (product.images && product.images.length > 0) {
      imageUrl = product.images[0].image_path;
    }

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        this.showNotification('Stock insuffisant !', 'error');
        return;
      }
      existingItem.quantity = newQuantity;
      existingItem.stock = product.stock; // Mettre à jour le stock
    } else {
      if (quantity > product.stock) {
        this.showNotification('Stock insuffisant !', 'error');
        return;
      }
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: imageUrl,
        wood_type: product.wood_type,
        quantity: quantity,
        stock: product.stock
      });
    }

    this.save();
    this.updateCartCount();
    this.showNotification(`${product.name} ajouté au panier !`);
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
    this.updateCartCount();
  }

  async updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      // Si le stock n'est pas disponible, le récupérer de l'API
      if (!item.stock) {
        try {
          const response = await fetch(`/api/products/${productId}`);
          const product = await response.json();
          item.stock = product.stock;
          this.save();
        } catch (error) {
          console.warn('Impossible de vérifier le stock pour ce produit');
        }
      }

      // Vérifier le stock si disponible
      if (item.stock && quantity > item.stock) {
        this.showNotification('Stock insuffisant !', 'error');
        return;
      }

      item.quantity = Math.max(1, quantity);
      this.save();
      this.updateCartCount();
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.save();
    this.updateCartCount();
  }

  save() {
    localStorage.setItem('cart-bois', JSON.stringify(this.items));
  }

  updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const count = this.getItemCount();

    cartCountElements.forEach(element => {
      element.textContent = `(${count})`;
      // Vérifier si le lien parent a la classe "active"
      const parentLink = element.closest('a');
      const isActive = parentLink && parentLink.classList.contains('active');

      if (count > 0) {
        // Si le lien est actif (fond orange), utiliser blanc, sinon orange
        element.style.color = isActive ? 'white' : 'var(--accent-orange)';
        element.style.fontWeight = '700';
      } else {
        element.style.color = '';
        element.style.fontWeight = '';
      }
    });
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Détecter si on est sur mobile
    const isMobile = window.innerWidth <= 768;

    // Couleurs selon le type
    const backgroundColor = type === 'error'
      ? 'linear-gradient(135deg, #DC2626, #991B1B)'
      : 'linear-gradient(135deg, var(--wood-medium), var(--wood-dark))';

    if (isMobile) {
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${backgroundColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: var(--shadow-strong);
        z-index: 10000;
        animation: slideInBottom 0.3s ease, slideOutBottom 0.3s ease 2.7s;
        font-weight: 600;
        width: calc(100% - 2rem);
        max-width: 400px;
        text-align: center;
      `;
    } else {
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: var(--shadow-strong);
        z-index: 10000;
        animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
        font-weight: 600;
      `;
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Créer une instance globale du panier
const cart = new Cart();

// Fonction d'ajout au panier
function addToCart(productId) {
  fetch(`/api/products/${productId}`)
    .then(response => response.json())
    .then(product => {
      cart.addItem(product);
    })
    .catch(async error => {
      console.error('Erreur ajout au panier:', error);
      await showAlert({
        title: 'Erreur',
        message: 'Impossible d\'ajouter l\'article au panier. Veuillez réessayer.',
        icon: '❌',
        buttonText: 'OK'
      });
    });
}

// Animations CSS pour les notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  .notification {
    border-left: 4px solid var(--accent-orange);
  }
`;
document.head.appendChild(style);

// Formater les prix
function formatPrice(price) {
  return price.toFixed(2) + ' €';
}

// Gestion des catégories
function filterByCategory(category) {
  window.location.href = `/catalogue?category=${encodeURIComponent(category)}`;
}

// Fonction de recherche
function searchProducts(query) {
  window.location.href = `/catalogue?search=${encodeURIComponent(query)}`;
}

// Transition vers La p'tite perlouze
function goToPerlouze() {
  // Effet de transition
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, #E8B4F8 0%, #B794F6 50%, #9333EA 100%);
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.5s ease;
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    window.location.href = 'http://localhost:3000';
  }, 500);
}

// Vérifier si l'utilisateur est admin
async function checkAdminSession() {
  try {
    const response = await fetch('/api/admin/check-session');
    const data = await response.json();
    return data.authenticated;
  } catch (error) {
    return false;
  }
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
    animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
  `;

  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

// Afficher les succès
function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'alert alert-success';
  successDiv.textContent = message;
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
  `;

  document.body.appendChild(successDiv);

  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  // Mettre à jour le compteur du panier
  cart.updateCartCount();

  // Mettre en évidence le menu actif selon l'URL
  highlightActiveMenu();

  // Gérer l'effet de parallaxe pour le portail
  const portal = document.querySelector('.wood-portal');
  if (portal) {
    document.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;

      portal.style.transform = `
        scale(1)
        translateX(${mouseX * 10}px)
        translateY(${mouseY * 10}px)
      `;
    });
  }
});

// Fonction pour mettre en évidence le menu actif
function highlightActiveMenu() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('nav a');

  // Retirer toutes les classes active existantes
  navLinks.forEach(link => {
    link.classList.remove('active');
  });

  // Déterminer quel menu doit être actif
  let activeHref = null;

  if (currentPath === '/' || currentPath === '/index.html') {
    activeHref = '/';
  } else if (currentPath.startsWith('/catalogue')) {
    activeHref = '/catalogue';
  } else if (currentPath.startsWith('/produit')) {
    // Pour les pages produits, mettre en évidence "Catalogue"
    activeHref = '/catalogue';
  } else if (currentPath.startsWith('/panier')) {
    activeHref = '/panier';
  } else if (currentPath.startsWith('/contact')) {
    activeHref = '/contact';
  } else if (currentPath.startsWith('/boutique')) {
    activeHref = '/boutique';
  }

  // Appliquer la classe active au lien correspondant
  if (activeHref) {
    navLinks.forEach(link => {
      if (link.getAttribute('href') === activeHref) {
        // Le bouton "La Boutique" a un style inline spécial, on le gère différemment
        if (activeHref === '/boutique') {
          // Modifier le style inline pour qu'il soit plus lumineux quand actif
          link.style.background = 'var(--accent-orange)';
          link.style.boxShadow = '0 4px 15px rgba(234, 88, 12, 0.5)';
          link.style.border = '2px solid var(--accent-orange)';
        } else {
          link.classList.add('active');
        }
        // Mettre à jour la couleur du compteur du panier si nécessaire
        cart.updateCartCount();
      }
    });
  }
}

// Fonction utilitaire pour les requêtes API
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cart,
    addToCart,
    formatPrice,
    filterByCategory,
    searchProducts,
    goToPerlouze,
    apiRequest
  };
}
