/**
 * Service de calcul des frais de livraison
 * Le petit bout de bois - Créations en bois (objets volumineux)
 */

/**
 * Règles de livraison pour les créations en bois
 * @param {number} subtotal - Montant total du panier (HT)
 * @returns {object} - { shippingCost, freeShippingThreshold, message }
 */
function calculateShipping(subtotal) {
  const SHIPPING_RULES = {
    FREE_THRESHOLD: 50,        // Livraison gratuite à partir de 50€
    STANDARD_COST: 6.90,       // Frais pour panier < 50€
    FREE_COST: 0               // Gratuit >= 50€
  };

  let shippingCost = SHIPPING_RULES.FREE_COST;
  let message = '🎉 Livraison offerte !';

  if (subtotal < SHIPPING_RULES.FREE_THRESHOLD) {
    // Panier < 50€
    shippingCost = SHIPPING_RULES.STANDARD_COST;
    const remaining = (SHIPPING_RULES.FREE_THRESHOLD - subtotal).toFixed(2);
    message = `Plus que ${remaining} € pour la livraison offerte !`;
  }

  return {
    shippingCost: parseFloat(shippingCost.toFixed(2)),
    freeShippingThreshold: SHIPPING_RULES.FREE_THRESHOLD,
    message,
    subtotal: parseFloat(subtotal.toFixed(2)),
    total: parseFloat((subtotal + shippingCost).toFixed(2))
  };
}

/**
 * Calculer les frais à partir d'un panier (array de produits)
 * @param {Array} cartItems - [{product: {...}, quantity: number}, ...]
 * @returns {object} - Détails de livraison
 */
function calculateShippingFromCart(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    return {
      shippingCost: 0,
      freeShippingThreshold: 50,
      message: 'Votre panier est vide',
      subtotal: 0,
      total: 0
    };
  }

  // Calculer le sous-total
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  return calculateShipping(subtotal);
}

module.exports = {
  calculateShipping,
  calculateShippingFromCart
};
