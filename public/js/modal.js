// Système de modales personnalisées
class CustomModal {
  constructor() {
    this.modal = null;
    this.createModalElement();
  }

  createModalElement() {
    // Créer l'élément modal s'il n'existe pas déjà
    if (document.getElementById('confirm-modal')) {
      this.modal = document.getElementById('confirm-modal');
      return;
    }

    this.modal = document.createElement('div');
    this.modal.id = 'confirm-modal';
    this.modal.className = 'confirm-modal';
    this.modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 10001;';
    this.modal.innerHTML = `
      <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
        <div id="modal-icon" style="font-size: 3rem; text-align: center; margin-bottom: 1rem;"></div>
        <h2 id="modal-title" style="text-align: center; margin-bottom: 1rem; color: #333;"></h2>
        <p id="modal-message" style="text-align: center; margin-bottom: 2rem; color: #666; line-height: 1.6;"></p>
        <div id="modal-buttons" style="display: flex; gap: 1rem; justify-content: center;"></div>
      </div>
    `;
    document.body.appendChild(this.modal);

    // Fermer sur clic en dehors
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }

  show() {
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Empêcher le scroll
  }

  close() {
    this.modal.style.display = 'none';
    document.body.style.overflow = ''; // Restaurer le scroll
  }

  // Modale de confirmation (remplace confirm())
  confirm(options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Confirmation',
        message = 'Êtes-vous sûr ?',
        icon = '⚠️',
        confirmText = 'Confirmer',
        cancelText = 'Annuler'
      } = options;

      document.getElementById('modal-icon').textContent = icon;
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-message').textContent = message;

      const buttonsContainer = document.getElementById('modal-buttons');
      buttonsContainer.innerHTML = `
        <button id="modal-cancel" style="padding: 0.75rem 1.5rem; border: 2px solid #ccc; background: white; color: #666; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; transition: all 0.2s;">${cancelText}</button>
        <button id="modal-confirm" style="padding: 0.75rem 1.5rem; border: none; background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3); transition: all 0.2s;">${confirmText}</button>
      `;

      const handleConfirm = () => {
        this.close();
        cleanup();
        resolve(true);
      };

      const handleCancel = () => {
        this.close();
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
        document.getElementById('modal-confirm')?.removeEventListener('click', handleConfirm);
        document.getElementById('modal-cancel')?.removeEventListener('click', handleCancel);
      };

      document.getElementById('modal-confirm').addEventListener('click', handleConfirm);
      document.getElementById('modal-cancel').addEventListener('click', handleCancel);

      this.show();
    });
  }

  // Modale d'alerte (remplace alert())
  alert(options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Information',
        message = '',
        icon = 'ℹ️',
        buttonText = 'OK'
      } = options;

      document.getElementById('modal-icon').textContent = icon;
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-message').textContent = message;

      const buttonsContainer = document.getElementById('modal-buttons');
      buttonsContainer.innerHTML = `
        <button id="modal-ok" style="padding: 0.75rem 1.5rem; border: none; background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3); transition: all 0.2s;">${buttonText}</button>
      `;

      const handleOk = () => {
        this.close();
        document.getElementById('modal-ok')?.removeEventListener('click', handleOk);
        resolve(true);
      };

      document.getElementById('modal-ok').addEventListener('click', handleOk);

      this.show();
    });
  }
}

// Instance globale
window.customModal = new CustomModal();

// Fonctions d'aide pour remplacer facilement confirm() et alert()
window.showConfirm = (options) => window.customModal.confirm(options);
window.showAlert = (options) => window.customModal.alert(options);
