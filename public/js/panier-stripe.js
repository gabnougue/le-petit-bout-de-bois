// ═══════════════════════════════════════════════════
// 🪵 Le petit bout de bois - Script panier avec Stripe 🪵
// ═══════════════════════════════════════════════════

let stripe;
let elements;
let clientSecret;

// Initialiser Stripe (sera fait lors du checkout)
async function initializeStripe(amount) {
  // Récupérer la clé publique Stripe depuis le serveur
  if (!stripe) {
    try {
      const configResponse = await fetch('/api/config/stripe-public-key');
      const configData = await configResponse.json();

      if (!configData.publicKey) {
        throw new Error('Clé Stripe non configurée');
      }

      stripe = Stripe(configData.publicKey);
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration Stripe:', error);
      showMessage('Paiement temporairement indisponible');
      return false;
    }
  }

  try {
    const response = await fetch('/api/orders/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });

    const data = await response.json();
    clientSecret = data.clientSecret;

    const appearance = {
      theme: 'stripe',
      variables: {
        colorPrimary: '#8B4513',
        colorBackground: '#ffffff',
        colorText: '#4A4A4A',
        colorDanger: '#dc3545',
        colorIcon: '#8B4513',
        colorIconTab: '#8B4513',
        colorIconTabHover: '#A0522D',
        colorIconTabSelected: '#8B4513',
        fontFamily: 'Raleway, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
        focusBoxShadow: '0 0 0 3px rgba(139, 69, 19, 0.2)',
        focusOutline: '2px solid #8B4513'
      }
    };

    elements = stripe.elements({ appearance, clientSecret });
    const paymentElement = elements.create('payment', {
      wallets: {
        applePay: 'auto',
        googlePay: 'auto',
        link: 'never'
      },
      fields: {
        billingDetails: {
          email: 'never'
        }
      },
      terms: {
        card: 'never'
      }
    });
    paymentElement.mount('#payment-element');

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du paiement:', error);
    showMessage('Erreur lors de l\'initialisation du paiement');
    return false;
  }
}

// Afficher les articles du panier
function displayCartItems() {
  const cartItems = JSON.parse(localStorage.getItem('cart-bois') || '[]');
  const container = document.getElementById('cart-items');

  if (!container) return;

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--slate-gray);">
        <div style="font-size: 5rem; margin-bottom: 1rem;">🛒</div>
        <h3>Votre panier est vide</h3>
        <p style="margin: 1rem 0;">Découvrez nos créations artisanales !</p>
        <a href="/catalogue" class="btn btn-primary" style="display: inline-block; margin-top: 1rem;">
          Voir le catalogue
        </a>
      </div>
    `;
    const summaryEl = document.getElementById('cart-summary');
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }

  container.innerHTML = cartItems.map((item, index) => `
    <div style="display: flex; gap: 1.5rem; padding: 1.5rem; background: white; border-radius: 8px; margin-bottom: 1rem; border: 2px solid var(--wood-light);">
      <img src="${item.image_url || '/images/placeholder-wood.jpg'}"
           alt="${item.name}"
           style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
      <div style="flex: 1;">
        <h3 style="margin-bottom: 0.5rem; color: var(--wood-dark);">${item.name}</h3>
        <p style="color: var(--slate-gray); margin-bottom: 1rem;">${item.price.toFixed(2)} €</p>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <button onclick="changeQuantity(${index}, -1)" style="background: var(--wood-light); border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">-</button>
          <span style="font-weight: bold;">${item.quantity}</span>
          <button onclick="changeQuantity(${index}, 1)" style="background: var(--wood-light); border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">+</button>
        </div>
      </div>
      <div style="text-align: right;">
        <p style="font-size: 1.3rem; font-weight: bold; color: var(--accent-orange); margin-bottom: 1rem;">
          ${(item.price * item.quantity).toFixed(2)} €
        </p>
        <button onclick="removeFromCart(${index})" class="btn btn-secondary" style="padding: 0.5rem 1rem;">
          Retirer
        </button>
      </div>
    </div>
  `).join('');

  displayCartSummary();
}

// Afficher le résumé du panier
function displayCartSummary() {
  const cartItems = JSON.parse(localStorage.getItem('cart-bois') || '[]');
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const container = document.getElementById('cart-summary');

  if (!container) return;

  if (cartItems.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  container.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: var(--shadow-medium); border: 3px solid var(--wood-light);">
      <h3 style="margin-bottom: 1.5rem; color: var(--wood-dark);">📋 Récapitulatif</h3>
      <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid var(--wood-light);">
        <span style="color: var(--slate-gray);">Sous-total</span>
        <span style="font-weight: 600;">${subtotal.toFixed(2)} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
        <span style="color: var(--slate-gray);">Livraison</span>
        <span style="font-weight: 600; color: var(--accent-green);">Gratuite</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: 700; padding-top: 1rem; border-top: 3px solid var(--wood-dark);">
        <span style="color: var(--wood-dark);">Total</span>
        <span style="color: var(--accent-orange);">${subtotal.toFixed(2)} €</span>
      </div>
      <button onclick="proceedToCheckout()" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; padding: 1rem; font-size: 1.1rem;">
        Commander 🛒
      </button>
    </div>
  `;
}

// Changer la quantité
function changeQuantity(index, change) {
  const cartItems = JSON.parse(localStorage.getItem('cart-bois') || '[]');
  if (cartItems[index]) {
    cartItems[index].quantity = Math.max(1, cartItems[index].quantity + change);
    localStorage.setItem('cart-bois', JSON.stringify(cartItems));
    displayCartItems();
    updateCartCount();
  }
}

// Retirer du panier
async function removeFromCart(index) {
  const confirmed = await showConfirm({
    title: 'Supprimer l\'article',
    message: 'Voulez-vous vraiment supprimer cet article de votre panier ?',
    icon: '🗑️',
    confirmText: '🗑️ Supprimer',
    cancelText: 'Annuler'
  });

  if (confirmed) {
    const cartItems = JSON.parse(localStorage.getItem('cart-bois') || '[]');
    cartItems.splice(index, 1);
    localStorage.setItem('cart-bois', JSON.stringify(cartItems));
    displayCartItems();
    updateCartCount();
  }
}

// Mettre à jour le compteur du panier dans la navigation
function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem('cart-bois') || '[]');
  const count = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartCountElements = document.querySelectorAll('#cart-count');
  cartCountElements.forEach(element => {
    element.textContent = `(${count})`;
    const parentLink = element.closest('a');
    const isActive = parentLink && parentLink.classList.contains('active');

    if (count > 0) {
      element.style.color = isActive ? 'white' : 'var(--accent-orange)';
      element.style.fontWeight = '700';
    } else {
      element.style.color = '';
      element.style.fontWeight = '';
    }
  });
}

// Passer à la commande
async function proceedToCheckout() {
  const cartItems = JSON.parse(localStorage.getItem('cart-bois') || '[]');
  if (cartItems.length === 0) {
    alert('Votre panier est vide');
    return;
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Masquer le panier et afficher le formulaire
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('checkout-section').style.display = 'block';

  // Afficher le récapitulatif dans le checkout
  displayCheckoutSummary();

  // Initialiser Stripe
  await initializeStripe(total);
}

// Annuler le checkout
function cancelCheckout() {
  document.getElementById('cart-section').style.display = 'grid';
  document.getElementById('checkout-section').style.display = 'none';
}

// Afficher le récapitulatif dans le formulaire de checkout
function displayCheckoutSummary() {
  const cartItems = JSON.parse(localStorage.getItem('cart-bois') || '[]');
  const container = document.getElementById('checkout-summary');

  if (!container) return;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  container.innerHTML = `
    ${cartItems.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span>${item.name} x ${item.quantity}</span>
        <span style="font-weight: 600;">${(item.price * item.quantity).toFixed(2)} €</span>
      </div>
    `).join('')}
    <div style="display: flex; justify-content: space-between; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--wood-light); font-size: 1.2rem; font-weight: 700;">
      <span style="color: var(--wood-dark);">Total</span>
      <span style="color: var(--accent-orange);">${subtotal.toFixed(2)} €</span>
    </div>
  `;
}

// Gérer la soumission du formulaire
async function handlePayment(event) {
  event.preventDefault();

  if (!stripe || !elements) {
    alert('Le système de paiement n\'est pas initialisé');
    return;
  }

  setLoading(true);

  // Récupérer les informations client
  const customerName = document.getElementById('customer-name').value;
  const customerEmail = document.getElementById('customer-email').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const customerAddress = document.getElementById('customer-address').value;

  try {
    // Confirmer le paiement avec Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/panier',
      },
      redirect: 'if_required'
    });

    if (stripeError) {
      showPaymentMessage(stripeError.message);
      setLoading(false);
      return;
    }

    // Si le paiement est réussi, créer la commande
    if (paymentIntent.status === 'succeeded') {
      const cartItems = JSON.parse(localStorage.getItem('cart-bois') || '[]');
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const orderData = {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: cartItems,
        totalAmount: total,
        paymentMethod: 'card',
        paymentId: paymentIntent.id
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la commande');
      }

      const result = await response.json();

      // Vider le panier
      localStorage.removeItem('cart-bois');

      // Afficher le succès
      showSuccessModal(result.orderId);
    }
  } catch (error) {
    console.error('Erreur:', error);
    showPaymentMessage('Une erreur est survenue. Veuillez réessayer.');
    setLoading(false);
  }
}

// Afficher le modal de succès
function showSuccessModal(orderId) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
  modal.innerHTML = `
    <div style="background: white; border-radius: 12px; padding: 3rem; max-width: 500px; text-align: center; border: 3px solid var(--wood-dark);">
      <div style="font-size: 5rem; margin-bottom: 1rem;">✅</div>
      <h2 style="color: var(--accent-green); margin-bottom: 1rem;">Commande validée !</h2>
      <p style="color: var(--slate-gray); font-size: 1.1rem; margin-bottom: 1rem;">
        Votre commande n°${orderId} a bien été enregistrée.
      </p>
      <p style="color: var(--slate-gray); margin-bottom: 2rem;">
        Vous recevrez un email de confirmation.<br>
        Jean-Michel prépare votre commande avec soin ! 🪵
      </p>
      <button onclick="window.location.href='/'" class="btn btn-primary">
        Retour à l'accueil
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Afficher un message de paiement
function showPaymentMessage(message) {
  const messageElement = document.getElementById('payment-message');
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.classList.remove('hidden');
  }
}

// Afficher un message général
function showMessage(message) {
  alert(message);
}

// Activer/désactiver le chargement
function setLoading(isLoading) {
  const submitButton = document.getElementById('submit-button');
  const buttonText = document.getElementById('button-text');
  const spinner = document.getElementById('spinner');

  if (isLoading) {
    submitButton.disabled = true;
    buttonText.classList.add('hidden');
    spinner?.classList.remove('hidden');
  } else {
    submitButton.disabled = false;
    buttonText.classList.remove('hidden');
    spinner?.classList.add('hidden');
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  displayCartItems();
  updateCartCount();

  // Initialiser le formulaire de commande
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handlePayment);
  }
});
