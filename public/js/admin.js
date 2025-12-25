// ====================================
// Script admin - Le petit bout de bois
// ====================================

let allProducts = [];
let allOrders = [];
let currentEditingProduct = null;
let existingImages = []; // Images déjà enregistrées
let newImageFiles = []; // Nouveaux fichiers sélectionnés

// Vérifier l'authentification
async function checkAuth() {
  try {
    const response = await fetch('/api/admin/check-session');
    const data = await response.json();

    if (!data.authenticated) {
      window.location.href = '/admin';
      return false;
    }

    document.getElementById('admin-username').textContent = data.username;
    return true;
  } catch (error) {
    console.error('Erreur auth:', error);
    window.location.href = '/admin';
    return false;
  }
}

// Déconnexion
async function logout() {
  try {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin';
  } catch (error) {
    console.error('Erreur logout:', error);
  }
}

// Charger les statistiques
async function loadStats() {
  try {
    const response = await fetch('/api/admin/stats');
    const stats = await response.json();

    document.getElementById('stat-products').textContent = stats.totalProducts;
    document.getElementById('stat-orders').textContent = stats.totalOrders;
    document.getElementById('stat-revenue').textContent = stats.totalRevenue.toFixed(2) + ' €';
    document.getElementById('stat-outofstock').textContent = stats.outOfStock;
  } catch (error) {
    console.error('Erreur stats:', error);
  }
}

// Charger les produits
async function loadProducts() {
  try {
    const response = await fetch('/api/admin/products');
    allProducts = await response.json();
    displayProducts();
  } catch (error) {
    console.error('Erreur chargement produits:', error);
  }
}

// Afficher les produits
function displayProducts() {
  const tbody = document.getElementById('products-table-body');

  if (allProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Aucun produit</td></tr>';
    return;
  }

  tbody.innerHTML = allProducts.map(product => {
    // Utiliser la première image du tableau images, ou image_url en fallback
    const imageUrl = (product.images && product.images.length > 0)
      ? product.images[0].image_path
      : (product.image_url || '/images/placeholder.jpg');

    return `
    <tr>
      <td data-label="Image"><img src="${imageUrl}" alt="${product.name}"></td>
      <td data-label="Nom">${product.name}</td>
      <td data-label="Catégorie"><span class="product-category">${product.category}</span></td>
      <td data-label="Bois">${product.wood_type}</td>
      <td data-label="Prix">${product.price.toFixed(2)} €</td>
      <td data-label="Stock">${product.stock > 0 ? product.stock : '<span style="color: #DC2626;">Rupture</span>'}</td>
      <td data-label="Actions">
        <button onclick="editProduct(${product.id})" class="btn-icon btn-edit" title="Modifier">✏️</button>
        <button onclick="deleteProduct(${product.id})" class="btn-icon btn-delete" title="Supprimer">🗑️</button>
      </td>
    </tr>
  `;
  }).join('');
}

// Afficher le modal d'ajout de produit
function showAddProductModal() {
  currentEditingProduct = null;
  existingImages = [];
  newImageFiles = [];
  document.getElementById('modal-title').textContent = 'Ajouter un produit';
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';

  // Réinitialiser l'input file
  const imageInput = document.getElementById('product-images');
  if (imageInput) {
    imageInput.value = '';
  }

  document.getElementById('existing-images-container').style.display = 'none';
  document.getElementById('new-images-preview').style.display = 'none';
  document.getElementById('product-modal').classList.add('active');
}

// Modifier un produit
async function editProduct(productId) {
  currentEditingProduct = allProducts.find(p => p.id === productId);

  if (!currentEditingProduct) return;

  // Charger les images du produit
  try {
    const response = await fetch(`/api/products/${productId}`);
    const product = await response.json();
    existingImages = (product.images || []).sort((a, b) => a.display_order - b.display_order);
  } catch (error) {
    console.error('Erreur chargement images:', error);
    existingImages = [];
  }

  newImageFiles = [];

  document.getElementById('modal-title').textContent = 'Modifier le produit';
  document.getElementById('product-id').value = currentEditingProduct.id;
  document.getElementById('product-name').value = currentEditingProduct.name;
  document.getElementById('product-category').value = currentEditingProduct.category;
  document.getElementById('product-wood').value = currentEditingProduct.wood_type;
  document.getElementById('product-price').value = currentEditingProduct.price;
  document.getElementById('product-stock').value = currentEditingProduct.stock;
  document.getElementById('product-description').value = currentEditingProduct.description || '';
  document.getElementById('product-perlouze-link').value = currentEditingProduct.perlouze_link || '';

  // Réinitialiser l'input file
  const imageInput = document.getElementById('product-images');
  if (imageInput) {
    imageInput.value = '';
  }

  // Afficher les images existantes
  displayExistingImages();

  // Cacher l'aperçu des nouvelles images
  document.getElementById('new-images-preview').style.display = 'none';

  document.getElementById('product-modal').classList.add('active');
}

// Fermer le modal
function closeProductModal() {
  document.getElementById('product-modal').classList.remove('active');
  currentEditingProduct = null;
  existingImages = [];
  newImageFiles = [];

  // Réinitialiser l'input file
  const imageInput = document.getElementById('product-images');
  if (imageInput) {
    imageInput.value = '';
  }

  // Cacher les conteneurs d'images
  document.getElementById('existing-images-container').style.display = 'none';
  document.getElementById('new-images-preview').style.display = 'none';
}

// Afficher les images existantes
function displayExistingImages() {
  const container = document.getElementById('existing-images');
  const containerDiv = document.getElementById('existing-images-container');

  if (existingImages.length === 0) {
    containerDiv.style.display = 'none';
    return;
  }

  containerDiv.style.display = 'block';
  container.innerHTML = existingImages.map((img, index) => `
    <div class="image-item ${img.is_primary ? 'primary' : ''}" data-image-id="${img.id}">
      <img src="${img.image_path}" alt="Image ${index + 1}">
      <div class="image-order">${index + 1}</div>
      <div class="image-controls">
        <div>
          ${index > 0 ? `<button type="button" onclick="moveExistingImage(${index}, -1)" title="Déplacer à gauche">←</button>` : ''}
          ${index < existingImages.length - 1 ? `<button type="button" onclick="moveExistingImage(${index}, 1)" title="Déplacer à droite">→</button>` : ''}
        </div>
        <button type="button" onclick="deleteExistingImage(${img.id})" title="Supprimer">🗑️</button>
      </div>
      ${img.is_primary ? '<div class="image-primary-badge">Image principale</div>' : ''}
    </div>
  `).join('');
}

// Déplacer une image existante
function moveExistingImage(fromIndex, direction) {
  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= existingImages.length) return;

  // Ajouter classe d'animation
  const container = document.getElementById('existing-images');
  container.classList.add('reordering');

  // Échanger les positions dans le tableau
  const temp = existingImages[fromIndex];
  existingImages[fromIndex] = existingImages[toIndex];
  existingImages[toIndex] = temp;

  // Mettre à jour display_order pour refléter les nouvelles positions
  existingImages.forEach((img, idx) => {
    img.display_order = idx + 1; // Commence à 1, pas à 0
    img.is_primary = idx === 0 ? 1 : 0;
  });

  // Réafficher pour montrer le nouvel ordre visuel
  displayExistingImages();

  // Retirer classe d'animation après l'animation
  setTimeout(() => {
    container.classList.remove('reordering');
  }, 300);
}

// Supprimer une image existante
async function deleteExistingImage(imageId) {
  const confirmed = await showConfirm({
    title: 'Supprimer l\'image',
    message: 'Voulez-vous vraiment supprimer cette image ?',
    icon: '🗑️',
    confirmText: '🗑️ Supprimer',
    cancelText: 'Annuler'
  });

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/admin/product-images/${imageId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }

    // Retirer de la liste locale
    existingImages = existingImages.filter(img => img.id !== imageId);

    // Réorganiser
    existingImages.forEach((img, idx) => {
      img.display_order = idx;
      img.is_primary = idx === 0 ? 1 : 0;
    });

    displayExistingImages();
    showSuccess('Image supprimée avec succès');

  } catch (error) {
    console.error('Erreur:', error);
    showError('Erreur lors de la suppression de l\'image');
  }
}

// Afficher l'aperçu des nouvelles images
function displayNewImages() {
  const container = document.getElementById('new-images-container');
  const containerDiv = document.getElementById('new-images-preview');

  if (newImageFiles.length === 0) {
    containerDiv.style.display = 'none';
    return;
  }

  containerDiv.style.display = 'block';
  container.innerHTML = '';

  // Créer les divs dans le bon ordre avec des placeholders
  newImageFiles.forEach((file, index) => {
    const div = document.createElement('div');
    div.className = `image-item ${index === 0 && existingImages.length === 0 ? 'primary' : ''}`;
    div.id = `new-image-${index}`;
    div.innerHTML = `
      <img src="" alt="${file.name}" style="opacity: 0.5;">
      <div class="image-order">${existingImages.length + index + 1}</div>
      <div class="image-controls">
        <div>
          ${index > 0 ? `<button type="button" onclick="moveNewImage(${index}, -1)" title="Déplacer à gauche">←</button>` : ''}
          ${index < newImageFiles.length - 1 ? `<button type="button" onclick="moveNewImage(${index}, 1)" title="Déplacer à droite">→</button>` : ''}
        </div>
        <button type="button" onclick="removeNewImage(${index})" title="Supprimer">🗑️</button>
      </div>
      ${index === 0 && existingImages.length === 0 ? '<div class="image-primary-badge">Image principale</div>' : ''}
    `;
    container.appendChild(div);

    // Charger l'image de manière asynchrone et l'insérer dans le bon div
    const reader = new FileReader();
    reader.onload = (e) => {
      const targetDiv = document.getElementById(`new-image-${index}`);
      if (targetDiv) {
        const img = targetDiv.querySelector('img');
        img.src = e.target.result;
        img.style.opacity = '1';
      }
    };
    reader.readAsDataURL(file);
  });
}

// Déplacer une nouvelle image
function moveNewImage(fromIndex, direction) {
  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= newImageFiles.length) return;

  // Ajouter classe d'animation
  const container = document.getElementById('new-images-container');
  container.classList.add('reordering');

  [newImageFiles[fromIndex], newImageFiles[toIndex]] = [newImageFiles[toIndex], newImageFiles[fromIndex]];
  displayNewImages();

  // Retirer classe d'animation après l'animation
  setTimeout(() => {
    container.classList.remove('reordering');
  }, 300);
}

// Retirer une nouvelle image
function removeNewImage(index) {
  newImageFiles.splice(index, 1);
  displayNewImages();
}

// Enregistrer un produit
async function saveProduct(event) {
  event.preventDefault();

  const productId = document.getElementById('product-id').value;
  const formData = new FormData();

  formData.append('name', document.getElementById('product-name').value);
  formData.append('category', document.getElementById('product-category').value);
  formData.append('wood_type', document.getElementById('product-wood').value);
  formData.append('price', document.getElementById('product-price').value);
  formData.append('stock', document.getElementById('product-stock').value);
  formData.append('description', document.getElementById('product-description').value);
  formData.append('perlouze_link', document.getElementById('product-perlouze-link').value);

  // Ajouter les nouvelles images
  newImageFiles.forEach((file) => {
    formData.append('images', file);
  });

  try {
    const url = productId ? `/api/admin/products/${productId}` : '/api/admin/products';
    const method = productId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      body: formData
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'enregistrement');
    }

    const result = await response.json();

    // Si c'est une modification et qu'il y a des images existantes réorganisées, les enregistrer
    if (productId && existingImages.length > 0) {
      await saveImageOrder(productId);
    }

    showSuccess('Produit enregistré avec succès');
    closeProductModal();
    loadProducts();
    loadStats();

  } catch (error) {
    console.error('Erreur:', error);
    showError('Erreur lors de l\'enregistrement du produit');
  }
}

// Enregistrer l'ordre des images
async function saveImageOrder(productId) {
  try {
    const response = await fetch(`/api/admin/products/${productId}/reorder-images`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        images: existingImages.map(img => ({
          id: img.id,
          display_order: img.display_order,
          is_primary: img.is_primary
        }))
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la réorganisation');
    }

  } catch (error) {
    console.error('Erreur réorganisation images:', error);
  }
}

// Supprimer un produit
async function deleteProduct(productId) {
  const confirmed = await showConfirm({
    title: 'Supprimer le produit',
    message: 'Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.',
    icon: '🗑️',
    confirmText: '🗑️ Supprimer',
    cancelText: 'Annuler'
  });

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }

    showSuccess('Produit supprimé avec succès');
    loadProducts();
    loadStats();

  } catch (error) {
    console.error('Erreur:', error);
    showError('Erreur lors de la suppression du produit');
  }
}

// Charger les commandes
async function loadOrders() {
  try {
    const response = await fetch('/api/orders');
    allOrders = await response.json();
    displayOrders();
    updateOrdersBadge();
  } catch (error) {
    console.error('Erreur chargement commandes:', error);
  }
}

// Mettre à jour la bulle de notification des commandes
function updateOrdersBadge() {
  const pendingCount = allOrders.filter(o => o.status === 'pending').length;
  const badge = document.getElementById('orders-badge');

  if (badge) {
    if (pendingCount > 0) {
      badge.textContent = pendingCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Afficher les commandes
function displayOrders() {
  const tbody = document.getElementById('orders-table-body');
  const hideDelivered = document.getElementById('hide-delivered')?.checked || false;

  const statusLabels = {
    'pending': 'En attente',
    'confirmed': 'Confirmée',
    'shipped': 'Expédiée',
    'delivered': 'Livrée'
  };

  // Filtrer les commandes selon le checkbox
  const filteredOrders = hideDelivered
    ? allOrders.filter(order => order.status !== 'delivered')
    : allOrders;

  if (filteredOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Aucune commande</td></tr>';
    return;
  }

  tbody.innerHTML = filteredOrders.map(order => `
    <tr>
      <td data-label="N°">#${order.id}</td>
      <td data-label="Client">${order.customer_name}</td>
      <td data-label="Email">${order.customer_email}</td>
      <td data-label="Total">${order.total_amount.toFixed(2)} €</td>
      <td data-label="Statut"><span class="status-badge status-${order.status}">${statusLabels[order.status] || order.status}</span></td>
      <td data-label="Date">${new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
      <td data-label="Actions">
        <button onclick="viewOrder(${order.id})" class="btn-icon btn-edit" title="Voir">👁️</button>
      </td>
    </tr>
  `).join('');
}

// Voir une commande
function viewOrder(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;

  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Commande #${order.id}</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
        <div>
          <h4 style="color: var(--wood-dark); margin-bottom: 0.5rem;">Client</h4>
          <p style="margin: 0.25rem 0;"><strong>Nom:</strong> ${order.customer_name}</p>
          <p style="margin: 0.25rem 0;"><strong>Email:</strong> ${order.customer_email}</p>
          <p style="margin: 0.25rem 0;"><strong>Téléphone:</strong> ${order.customer_phone || 'Non renseigné'}</p>
        </div>

        <div>
          <h4 style="color: var(--wood-dark); margin-bottom: 0.5rem;">Livraison</h4>
          <p style="margin: 0;">${order.customer_address || 'Non renseignée'}</p>
        </div>
      </div>

      <div style="margin-top: 1.5rem;">
        <h4 style="color: var(--wood-dark); margin-bottom: 0.5rem;">Articles commandés</h4>
        ${order.items.map(item => `
          <div style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid var(--cream);">
            <span>${item.name} x ${item.quantity}</span>
            <span style="font-weight: 600;">${(item.price * item.quantity).toFixed(2)} €</span>
          </div>
        `).join('')}
        <div style="display: flex; justify-content: space-between; padding: 1rem 0.5rem; font-weight: 700; font-size: 1.2rem;">
          <span>Total</span>
          <span style="color: var(--accent-orange);">${order.total_amount.toFixed(2)} €</span>
        </div>
      </div>

      <div style="margin-top: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Statut de la commande</label>
        <select id="order-status-${order.id}" onchange="updateOrderStatus(${order.id}, this.value, '${order.status}')" class="form-control"
                style="width: 100%; padding: 0.75rem; border: 2px solid var(--wood-light);
                       border-radius: 8px; background: var(--cream);">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ En attente</option>
          <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>✅ Confirmée</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>📦 Expédiée</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>✔️ Livrée</option>
        </select>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Mettre à jour le statut d'une commande
async function updateOrderStatus(orderId, newStatus, oldStatus) {
  // Restaurer l'ancien statut dans le select temporairement
  const selectElement = document.getElementById(`order-status-${orderId}`);
  if (selectElement) {
    selectElement.value = oldStatus;
  }

  // Messages selon le statut
  const statusMessages = {
    'pending': {
      emoji: '⏳',
      title: 'Mettre en attente ?',
      message: 'La commande sera marquée comme en attente. Le client recevra un email l\'informant que la commande sera bientôt prise en charge.'
    },
    'confirmed': {
      emoji: '✅',
      title: 'Confirmer la commande ?',
      message: 'La commande sera confirmée. Le client recevra un email l\'informant que vous préparez sa commande avec soin.'
    },
    'shipped': {
      emoji: '📦',
      title: 'Marquer comme expédiée ?',
      message: 'La commande sera marquée comme expédiée. Le client recevra un email l\'informant que sa commande est en route.'
    },
    'delivered': {
      emoji: '✔️',
      title: 'Marquer comme livrée ?',
      message: 'La commande sera marquée comme livrée.'
    }
  };

  const statusInfo = statusMessages[newStatus] || { emoji: '❓', title: 'Modifier le statut ?', message: 'Le statut de la commande va être modifié.' };

  // Demander confirmation
  const confirmed = await showConfirm({
    title: statusInfo.title,
    message: statusInfo.message,
    icon: statusInfo.emoji,
    confirmText: 'Confirmer',
    cancelText: 'Annuler'
  });

  if (!confirmed) {
    // L'utilisateur a annulé, le select est déjà restauré
    return;
  }

  // L'utilisateur a confirmé, mettre à jour le statut
  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour');
    }

    // Mettre à jour le select avec le nouveau statut
    if (selectElement) {
      selectElement.value = newStatus;
    }

    showSuccess('Statut mis à jour avec succès ! Un email a été envoyé au client.');
    loadOrders();

  } catch (error) {
    console.error('Erreur:', error);
    showError('Erreur lors de la mise à jour du statut');
    // Restaurer l'ancien statut en cas d'erreur
    if (selectElement) {
      selectElement.value = oldStatus;
    }
  }
}

// Enregistrer les paramètres
async function saveSettings() {
  // À implémenter selon les besoins
  showSuccess('Paramètres enregistrés');
}

// Afficher succès
function showSuccess(message) {
  cart.showNotification(message);
}

// Afficher erreur
function showError(message) {
  const errorDiv = document.createElement('div');

  // Détecter si on est sur mobile
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    errorDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #FEE2E2;
      color: #991B1B;
      padding: 1rem 2rem;
      border-radius: 8px;
      box-shadow: var(--shadow-strong);
      z-index: 10000;
      animation: slideInBottom 0.3s ease;
      width: calc(100% - 2rem);
      max-width: 400px;
      text-align: center;
    `;
  } else {
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #FEE2E2;
      color: #991B1B;
      padding: 1rem 2rem;
      border-radius: 8px;
      box-shadow: var(--shadow-strong);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;
  }

  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

// ====================================
// STATISTIQUES DÉTAILLÉES
// ====================================

// Charger les statistiques détaillées
async function loadDetailedStats() {
  try {
    const response = await fetch('/api/admin/stats');
    const stats = await response.json();

    document.getElementById('stat-detail-products').textContent = stats.totalProducts;
    document.getElementById('stat-detail-orders').textContent = stats.totalOrders;
    document.getElementById('stat-detail-revenue').textContent = stats.totalRevenue.toFixed(2) + ' €';
    document.getElementById('stat-detail-outofstock').textContent = stats.outOfStock;
  } catch (error) {
    console.error('Erreur chargement statistiques détaillées:', error);
  }
}

// ====================================
// GESTION DES MESSAGES/CONTACTS
// ====================================

let allContacts = [];

// Charger les contacts
async function loadContacts() {
  try {
    const response = await fetch('/api/contact/admin');
    allContacts = await response.json();
    displayContacts();
    updateMessagesBadge();
  } catch (error) {
    console.error('Erreur chargement contacts:', error);
  }
}

// Mettre à jour la bulle de notification des messages
function updateMessagesBadge() {
  const unreadCount = allContacts.filter(c => c.status === 'nouveau').length;
  const badge = document.getElementById('messages-badge');

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Afficher les contacts
function displayContacts() {
  const tbody = document.getElementById('contacts-table-body');

  if (allContacts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Aucun message</td></tr>';
    return;
  }

  tbody.innerHTML = allContacts.map(contact => {
    const statusColors = {
      'nouveau': '#F59E0B',
      'lu': '#3B82F6',
      'traite': '#10B981'
    };

    const statusLabels = {
      'nouveau': 'Nouveau',
      'lu': 'Lu',
      'traite': 'Traité'
    };

    return `
      <tr style="${contact.status === 'nouveau' ? 'background: rgba(245, 158, 11, 0.1);' : ''}">
        <td data-label="Date">${new Date(contact.created_at).toLocaleDateString('fr-FR')}</td>
        <td data-label="Nom">${contact.name}</td>
        <td data-label="Email">${contact.email}</td>
        <td data-label="Message" style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${contact.message}</td>
        <td data-label="Statut">
          <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600; background: ${statusColors[contact.status]}; color: white;">
            ${statusLabels[contact.status]}
          </span>
        </td>
        <td data-label="Actions">
          ${contact.status === 'nouveau' ? `<button onclick="markContactAsRead(${contact.id})" class="btn-icon" title="Marquer comme lu">✓</button>` : ''}
          <button onclick="viewContact(${contact.id})" class="btn-icon btn-edit" title="Voir">👁️</button>
          <button onclick="deleteContact(${contact.id})" class="btn-icon btn-delete" title="Supprimer">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Marquer un contact comme lu
async function markContactAsRead(contactId) {
  try {
    const response = await fetch(`/api/contact/admin/${contactId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'lu' })
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Message marqué comme lu');
      loadContacts();
    } else {
      showError('Erreur: ' + data.error);
    }
  } catch (error) {
    console.error('Erreur:', error);
    showError('Erreur lors de la mise à jour');
  }
}

// Voir un contact
function viewContact(contactId) {
  const contact = allContacts.find(c => c.id === contactId);
  if (!contact) return;

  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Message de ${contact.name}</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <p style="margin: 0.5rem 0;"><strong>Email:</strong> ${contact.email}</p>
        <p style="margin: 0.5rem 0;"><strong>Date:</strong> ${new Date(contact.created_at).toLocaleString('fr-FR')}</p>
        <p style="margin: 0.5rem 0;"><strong>Statut:</strong> ${contact.status}</p>
      </div>

      <div style="background: var(--cream); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 1rem 0; color: var(--wood-dark);">Message:</h4>
        <p style="white-space: pre-wrap; margin: 0; line-height: 1.6;">${contact.message}</p>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: flex-end;">
        ${contact.status === 'nouveau' ? `
          <button onclick="markContactAsRead(${contact.id}); this.closest('.modal').remove();" class="btn btn-primary">
            Marquer comme lu
          </button>
        ` : ''}
        <button onclick="this.closest('.modal').remove();" class="btn btn-secondary">Fermer</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Supprimer un contact
async function deleteContact(contactId) {
  const confirmed = await showConfirm({
    title: 'Supprimer ce message ?',
    message: 'Cette action est irréversible.',
    icon: '🗑️',
    confirmText: '🗑️ Supprimer',
    cancelText: 'Annuler'
  });

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/contact/admin/${contactId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Message supprimé');
      loadContacts();
    } else {
      showError('Erreur: ' + data.error);
    }
  } catch (error) {
    console.error('Erreur:', error);
    showError('Erreur lors de la suppression');
  }
}

// ====================================
// GESTION DES CATÉGORIES
// ====================================

let allCategories = [];

// Charger les catégories
async function loadCategories() {
  try {
    const response = await fetch('/api/settings/categories');
    allCategories = await response.json();
    displayCategories();
    updateCategorySelect();
  } catch (error) {
    console.error('Erreur chargement catégories:', error);
  }
}

// Afficher les catégories
function displayCategories() {
  const container = document.getElementById('categories-list');

  if (allCategories.length === 0) {
    container.innerHTML = '<span style="color: var(--slate-gray);">Aucune catégorie</span>';
    return;
  }

  container.innerHTML = allCategories.map(cat => `
    <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
                background: white; border: 2px solid var(--wood-light); border-radius: 20px;
                font-weight: 500; color: var(--wood-dark);">
      <span>${cat.name}</span>
      <button onclick="deleteCategory(${cat.id})"
              style="background: none; border: none; color: #DC2626; cursor: pointer; font-size: 1.2rem;
                     padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;"
              title="Supprimer">×</button>
    </div>
  `).join('');
}

// Mettre à jour le select de catégories dans le formulaire produit
function updateCategorySelect() {
  const select = document.getElementById('product-category');
  if (!select) return;

  select.innerHTML = allCategories.map(cat =>
    `<option value="${cat.name}">${cat.name}</option>`
  ).join('');
}

// Ajouter une catégorie
async function addCategory() {
  const input = document.getElementById('new-category-input');
  const name = input.value.trim();

  if (!name) {
    showError('Veuillez entrer un nom de catégorie');
    return;
  }

  try {
    const response = await fetch('/api/settings/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Catégorie ajoutée');
      input.value = '';
      loadCategories();
    } else {
      showError('Erreur: ' + data.error);
    }
  } catch (error) {
    console.error('Erreur:', error);
    showError('Erreur lors de l\'ajout');
  }
}

// Supprimer une catégorie
async function deleteCategory(categoryId) {
  const confirmed = await showConfirm({
    title: 'Supprimer cette catégorie ?',
    message: 'Les produits utilisant cette catégorie ne pourront pas être supprimés.',
    icon: '🗑️',
    confirmText: '🗑️ Supprimer',
    cancelText: 'Annuler'
  });

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/settings/categories/${categoryId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Catégorie supprimée');
      loadCategories();
    } else {
      showError('Erreur: ' + data.error);
    }
  } catch (error) {
    console.error('Erreur:', error);
    showError('Erreur lors de la suppression');
  }
}

// Gestion des onglets
document.addEventListener('DOMContentLoaded', async () => {
  // Vérifier l'authentification
  const isAuth = await checkAuth();
  if (!isAuth) return;

  // Charger les données
  loadStats();
  loadProducts();
  loadOrders();
  loadContacts();
  loadCategories();

  // Gérer la sélection de nouvelles images
  const imageInput = document.getElementById('product-images');
  if (imageInput) {
    imageInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        newImageFiles = files;
        displayNewImages();
      }
    });
  }

  // Gestion des onglets
  const tabs = document.querySelectorAll('.admin-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Désactiver tous les onglets
      tabs.forEach(t => {
        t.classList.remove('active');
      });
      contents.forEach(c => {
        c.classList.remove('active');
        c.classList.remove('fade-in');
      });

      // Activer l'onglet cliqué
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      const activeContent = document.getElementById(`tab-${tabName}`);
      activeContent.classList.add('active');
      activeContent.classList.add('fade-in');

      // Charger les données si nécessaire
      if (tabName === 'stats') {
        loadStats();
      } else if (tabName === 'orders') {
        loadOrders();
      } else if (tabName === 'messages') {
        loadContacts();
      } else if (tabName === 'boutique') {
        loadBoutiqueImages();
      } else if (tabName === 'settings') {
        loadCategories();
      }
    });
  });
});

// ═══════════════════════════════════════════════════
// Gestion de la boutique (images)
// ═══════════════════════════════════════════════════

let boutiqueImages = [];

// Charger les images de la boutique
async function loadBoutiqueImages() {
  try {
    const response = await fetch('/api/boutique/images');
    boutiqueImages = await response.json();
    displayBoutiqueImages();
  } catch (error) {
    console.error('Erreur chargement images boutique:', error);
    showNotification('Erreur lors du chargement des images', 'error');
  }
}

// Afficher les images de la boutique
function displayBoutiqueImages() {
  const grid = document.getElementById('boutique-images-grid');
  const noImagesMsg = document.getElementById('no-boutique-images');
  const hint = document.getElementById('boutique-images-hint');

  if (boutiqueImages.length === 0) {
    grid.style.display = 'none';
    noImagesMsg.style.display = 'block';
    if (hint) hint.style.display = 'none';
    return;
  }

  grid.style.display = 'grid';
  noImagesMsg.style.display = 'none';
  if (hint) hint.style.display = 'block';

  grid.innerHTML = boutiqueImages.map((img, index) => `
    <div class="boutique-image-item" data-id="${img.id}" data-order="${img.display_order}"
         style="position: relative; background: white; border-radius: 12px; padding: 0.5rem;
                box-shadow: var(--shadow-light); border: 3px solid var(--wood-light);">

      <!-- Bouton supprimer en haut à droite -->
      <button onclick="deleteBoutiqueImage(${img.id})"
              style="position: absolute; top: 0.75rem; right: 0.75rem; z-index: 10;
                     background: var(--wood-medium); color: white; border: none;
                     width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
                     display: flex; align-items: center; justify-content: center;
                     font-size: 1rem; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"
              onmouseover="this.style.background='var(--wood-dark)'; this.style.transform='scale(1.1)'"
              onmouseout="this.style.background='var(--wood-medium)'; this.style.transform='scale(1)'">
        🗑️
      </button>

      <img src="${img.image_path}" alt="Boutique"
           style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;">

      <div style="display: flex; gap: 0.5rem; justify-content: center; align-items: center;">
        <button onclick="moveBoutiqueImage(${img.id}, -1)"
                class="btn btn-secondary"
                ${index === 0 ? 'disabled' : ''}
                style="padding: 0.5rem 0.75rem; font-size: 1rem; border-radius: 12px; min-width: 40px; height: 40px;
                       display: flex; align-items: center; justify-content: center;">
          ◀
        </button>
        <span style="color: var(--slate-gray); font-size: 0.85rem; min-width: 80px; text-align: center;">
          Position ${index + 1}
        </span>
        <button onclick="moveBoutiqueImage(${img.id}, 1)"
                class="btn btn-secondary"
                ${index === boutiqueImages.length - 1 ? 'disabled' : ''}
                style="padding: 0.5rem 0.75rem; font-size: 1rem; border-radius: 12px; min-width: 40px; height: 40px;
                       display: flex; align-items: center; justify-content: center;">
          ▶
        </button>
      </div>
    </div>
  `).join('');
}

// Ajouter une image de la boutique
async function uploadBoutiqueImage() {
  const input = document.getElementById('boutique-image-input');
  const file = input.files[0];

  if (!file) {
    showNotification('Veuillez sélectionner une image', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/boutique/images', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'upload');
    }

    const newImage = await response.json();
    boutiqueImages.push(newImage);
    displayBoutiqueImages();
    input.value = '';
    showNotification('Image ajoutée avec succès !', 'success');
  } catch (error) {
    console.error('Erreur upload image:', error);
    showNotification('Erreur lors de l\'ajout de l\'image', 'error');
  }
}

// Supprimer une image de la boutique
async function deleteBoutiqueImage(id) {
  if (!confirm('Voulez-vous vraiment supprimer cette image ?')) {
    return;
  }

  try {
    const response = await fetch(`/api/boutique/images/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }

    boutiqueImages = boutiqueImages.filter(img => img.id !== id);
    displayBoutiqueImages();
    showNotification('Image supprimée avec succès !', 'success');
  } catch (error) {
    console.error('Erreur suppression image:', error);
    showNotification('Erreur lors de la suppression', 'error');
  }
}

// Déplacer une image de la boutique
async function moveBoutiqueImage(id, direction) {
  const index = boutiqueImages.findIndex(img => img.id === id);

  if (index === -1) return;

  const newIndex = index + direction;

  if (newIndex < 0 || newIndex >= boutiqueImages.length) return;

  // Échanger les positions
  [boutiqueImages[index], boutiqueImages[newIndex]] = [boutiqueImages[newIndex], boutiqueImages[index]];

  // Mettre à jour les display_order
  const updatedImages = boutiqueImages.map((img, idx) => ({
    id: img.id,
    display_order: idx + 1
  }));

  try {
    const response = await fetch('/api/boutique/images/reorder', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ images: updatedImages })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la réorganisation');
    }

    // Mettre à jour l'affichage local
    boutiqueImages.forEach((img, idx) => {
      img.display_order = idx + 1;
    });

    displayBoutiqueImages();
  } catch (error) {
    console.error('Erreur réorganisation:', error);
    showNotification('Erreur lors de la réorganisation', 'error');
    loadBoutiqueImages(); // Recharger pour rétablir l'ordre
  }
}
