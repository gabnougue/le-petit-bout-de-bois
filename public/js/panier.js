// ====================================
// Script panier - le p'tit bout de bois
// ====================================

// Afficher les articles du panier
function displayCartItems() {
  const container = document.getElementById('cart-items');

  if (cart.items.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <p style="font-size: 1.5rem; color: var(--wood-medium); margin-bottom: 1rem;">
          🛒 Votre panier est vide
        </p>
        <p style="color: var(--slate-gray); margin-bottom: 2rem;">
          Découvrez nos créations artisanales en bois
        </p>
        <a href="/catalogue" class="btn btn-primary">Voir le catalogue</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <h2 style="color: var(--wood-dark); margin-bottom: 1.5rem;">Articles (${cart.getItemCount()})</h2>
    ${cart.items.map(item => `
      <div class="cart-item" style="display: flex; gap: 1.5rem; padding: 1.5rem 0; border-bottom: 2px solid var(--cream);
                                     align-items: center; flex-wrap: wrap;">
        <img src="${item.image_url || '/images/placeholder.jpg'}" alt="${item.name}"
             style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;
                    border: 2px solid var(--wood-light); cursor: pointer;"
             onclick="window.location.href='/produit/${item.id}'">

        <div style="flex: 1; min-width: 200px;">
          <h3 style="color: var(--wood-dark); margin-bottom: 0.5rem; cursor: pointer;"
              onclick="window.location.href='/produit/${item.id}'">
            ${item.name}
          </h3>
          <p style="color: var(--moss-green); font-size: 0.9rem; margin: 0;">
            🪵 ${item.wood_type}
          </p>
          <p style="color: var(--accent-orange); font-size: 1.2rem; font-weight: 700; margin-top: 0.5rem;">
            ${item.price.toFixed(2)} €
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--cream);
                      padding: 0.5rem; border-radius: 8px; border: 2px solid var(--wood-light);">
            <button onclick="updateItemQuantity(${item.id}, ${item.quantity - 1})"
                    style="width: 35px; height: 35px; border: none; background: var(--wood-medium);
                           color: white; border-radius: 6px; font-size: 1.2rem; cursor: pointer;">
              −
            </button>
            <span style="width: 40px; text-align: center; font-weight: 600; font-size: 1.1rem;">
              ${item.quantity}
            </span>
            <button onclick="updateItemQuantity(${item.id}, ${item.quantity + 1})"
                    style="width: 35px; height: 35px; border: none; background: var(--wood-medium);
                           color: white; border-radius: 6px; font-size: 1.2rem; cursor: pointer;">
              +
            </button>
          </div>

          <button onclick="removeFromCart(${item.id})" class="btn-delete"
                  style="padding: 1rem; background: var(--cream); color: var(--slate-gray);
                         border: 2px solid var(--slate-gray); border-radius: 6px; cursor: pointer;
                         font-weight: 500; transition: all 0.2s ease;">
            🗑️ Supprimer
          </button>
        </div>
      </div>
    `).join('')}
  `;
}

// Variable globale pour stocker les détails de livraison
let shippingDetails = null;

// Afficher le récapitulatif
async function displayCartSummary() {
  const container = document.getElementById('cart-summary');
  const subtotal = cart.getTotal();
  const itemCount = cart.getItemCount();

  if (cart.items.length === 0) {
    container.style.display = 'none';
    return;
  }

  // Calculer les frais de livraison via l'API
  try {
    const response = await fetch('/api/shipping/calculate?subtotal=' + subtotal);
    shippingDetails = await response.json();
  } catch (error) {
    console.error('Erreur calcul frais de livraison:', error);
    shippingDetails = {
      shippingCost: 0,
      total: subtotal,
      message: ''
    };
  }

  const shippingCost = shippingDetails.shippingCost || 0;
  const total = shippingDetails.total || subtotal;
  const shippingText = shippingCost === 0
    ? '<span style="color: var(--moss-green); font-weight: 600;">Gratuite</span>'
    : `<span style="color: var(--wood-dark); font-weight: 600;">${shippingCost.toFixed(2)} €</span>`;

  container.style.display = 'block';

  container.innerHTML = `
    <h2 style="color: var(--wood-dark); margin-bottom: 1.5rem;">Récapitulatif</h2>

    <div style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="color: var(--slate-gray);">Sous-total</span>
        <span style="color: var(--wood-dark); font-weight: 600;">${subtotal.toFixed(2)} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="color: var(--slate-gray);">Livraison</span>
        ${shippingText}
      </div>
      ${shippingDetails.message ? `
        <div style="font-size: 0.85rem; color: var(--accent-orange); text-align: right; margin-top: 0.25rem; font-weight: 500;">
          ${shippingDetails.message}
        </div>
      ` : ''}
      <div style="height: 2px; background: var(--cream); margin: 1rem 0;"></div>
      <div style="display: flex; justify-content: space-between; font-size: 1.3rem;">
        <span style="color: var(--wood-dark); font-weight: 700;">Total</span>
        <span style="color: var(--accent-orange); font-weight: 700;">${total.toFixed(2)} €</span>
      </div>
    </div>

    <button onclick="proceedToCheckout()" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem;">
      💳 Passer la commande
    </button>

    <button onclick="clearCart()" class="btn btn-secondary" style="width: 100%; margin-top: 1rem; padding: 0.75rem;">
      Vider le panier
    </button>

    <div style="margin-top: 2rem; padding: 1rem; background: var(--cream); border-radius: 8px;
                border-left: 4px solid var(--accent-green);">
      <p style="font-size: 0.9rem; color: var(--wood-medium); margin: 0;">
        ✓ Paiement sécurisé<br>
        ✓ Livraison ${shippingCost === 0 ? 'offerte dès 50€' : 'offerte dès 50€'}<br>
        ✓ Création artisanale
      </p>
    </div>
  `;
}

// Mettre à jour la quantité d'un article
async function updateItemQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
  } else {
    await cart.updateQuantity(productId, newQuantity);
    displayCartItems();
    await displayCartSummary();
  }
}

// Supprimer un article
async function removeFromCart(productId) {
  const confirmed = await showConfirm({
    title: 'Supprimer l\'article',
    message: 'Voulez-vous vraiment supprimer cet article de votre panier ?',
    icon: '🗑️',
    confirmText: '🗑️ Supprimer',
    cancelText: 'Annuler'
  });

  if (confirmed) {
    cart.removeItem(productId);
    displayCartItems();
    await displayCartSummary();
    cart.showNotification('Article supprimé du panier');
  }
}

// Vider le panier
async function clearCart() {
  const confirmed = await showConfirm({
    title: 'Vider le panier',
    message: 'Voulez-vous vraiment vider tout le panier ? Cette action est irréversible.',
    icon: '🧹',
    confirmText: '🧹 Vider',
    cancelText: 'Annuler'
  });

  if (confirmed) {
    cart.clear();
    displayCartItems();
    await displayCartSummary();
    cart.showNotification('Panier vidé');
  }
}

// Procéder au paiement
async function proceedToCheckout() {
  if (cart.items.length === 0) {
    await showAlert({
      title: 'Panier vide',
      message: 'Votre panier est vide. Ajoutez des articles avant de continuer.',
      icon: '🛒',
      buttonText: 'OK'
    });
    return;
  }

  // Masquer la section panier et afficher le formulaire de commande
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('checkout-section').style.display = 'block';

  // Afficher le récapitulatif dans le formulaire
  displayCheckoutSummary();

  // Scroll vers le haut
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Annuler la commande et revenir au panier
function cancelCheckout() {
  document.getElementById('checkout-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'grid';

  // Scroll vers le haut
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Afficher le récapitulatif dans le formulaire de checkout
function displayCheckoutSummary() {
  const container = document.getElementById('checkout-summary');
  const subtotal = cart.getTotal();
  const shippingCost = shippingDetails?.shippingCost || 0;
  const total = shippingDetails?.total || subtotal;

  container.innerHTML = `
    ${cart.items.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
        <span style="color: var(--slate-gray);">${item.name} x ${item.quantity}</span>
        <span style="font-weight: 600; color: var(--wood-dark);">${(item.price * item.quantity).toFixed(2)} €</span>
      </div>
    `).join('')}
    <div style="height: 1px; background: var(--wood-light); margin: 0.75rem 0;"></div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
      <span style="color: var(--slate-gray);">Sous-total</span>
      <span style="font-weight: 600; color: var(--wood-dark);">${subtotal.toFixed(2)} €</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
      <span style="color: var(--slate-gray);">Livraison</span>
      <span style="font-weight: 600; color: ${shippingCost === 0 ? 'var(--moss-green)' : 'var(--wood-dark)'};">
        ${shippingCost === 0 ? 'Gratuite' : shippingCost.toFixed(2) + ' €'}
      </span>
    </div>
    <div style="height: 2px; background: var(--wood-light); margin: 1rem 0;"></div>
    <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700;">
      <span style="color: var(--wood-dark);">Total</span>
      <span style="color: var(--accent-orange);">${total.toFixed(2)} €</span>
    </div>
  `;
}


// Soumettre la commande
async function submitOrder(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Récupérer le panier depuis localStorage (clé spécifique au ptit bout de bois)
  const cartItems = JSON.parse(localStorage.getItem('cart-bois') || '[]');
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingDetails?.shippingCost || 0;
  const totalAmount = shippingDetails?.total || subtotal;

  const orderData = {
    customerName: formData.get('customerName'),
    customerEmail: formData.get('customerEmail'),
    customerPhone: formData.get('customerPhone'),
    customerAddress: formData.get('customerAddress'),
    items: cartItems,
    subtotal: subtotal,
    shippingCost: shippingCost,
    totalAmount: totalAmount,
    paymentMethod: 'card'
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la commande');
    }

    const result = await response.json();

    // Vider le panier
    localStorage.removeItem('cart-bois');

    // Afficher le succès
    await showSuccessModal(result.orderId);

  } catch (error) {
    console.error('Erreur commande:', error);
    alert('Une erreur est survenue lors de la commande. Veuillez réessayer.');
  }
}

// Afficher le modal de succès
async function showSuccessModal(orderId) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px; text-align: center;">
      <div style="font-size: 5rem; margin-bottom: 1rem;">✅</div>
      <h2 style="color: var(--accent-green); margin-bottom: 1rem;">Commande validée !</h2>
      <p style="color: var(--wood-medium); font-size: 1.1rem; margin-bottom: 1rem;">
        Votre commande n°${orderId} a bien été enregistrée.
      </p>
      <p style="color: var(--slate-gray); margin-bottom: 2rem;">
        Vous recevrez un email de confirmation à l'adresse indiquée.
        Jean-Michel prépare votre commande avec soin !
      </p>
      <button onclick="window.location.href='/'" class="btn btn-primary">
        Retour à l'accueil
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // Actualiser l'affichage
  displayCartItems();
  await displayCartSummary();
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  displayCartItems();
  await displayCartSummary();

  // Initialiser le formulaire de commande
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', submitOrder);
  }
});
