const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { sendContactNotification } = require('../services/email');

// Middleware de vérification admin
const requireAdmin = (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
};

// Route publique : envoyer un message de contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, subject } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Informations manquantes' });
    }

    // Utiliser la version async de db
    const dbAsync = require('../models/database');

    // Enregistrer dans la table contacts
    const contactResult = await dbAsync.run(
      `INSERT INTO contacts (name, email, message, status) VALUES (?, ?, ?, 'nouveau')`,
      [name, email, message]
    );

    const contactId = contactResult.id;

    // Récupérer le contact créé
    const contact = await dbAsync.get('SELECT * FROM contacts WHERE id = ?', [contactId]);

    // Créer automatiquement un thread de conversation
    const threadResult = await dbAsync.run(
      'INSERT INTO message_threads (contact_id, subject, customer_name, customer_email, status, last_message_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [contactId, `Message de ${name}`, name, email, 'open']
    );

    // Ajouter le message initial au thread
    await dbAsync.run(
      'INSERT INTO thread_messages (thread_id, sender_type, sender_name, sender_email, message) VALUES (?, ?, ?, ?, ?)',
      [threadResult.id, 'customer', name, email, message]
    );

    // Envoyer l'email de notification
    if (contact) {
      await sendContactNotification(contact);
    }

    res.json({
      success: true,
      message: 'Message envoyé avec succès',
      contactId: contactId
    });
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

// Routes admin pour gérer les contacts
router.get('/admin', requireAdmin, (req, res) => {
  db.all(
    'SELECT * FROM contacts ORDER BY created_at DESC',
    [],
    (err, rows) => {
      if (err) {
        console.error('Erreur récupération contacts:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Marquer un contact comme lu
router.put('/admin/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Statut requis' });
  }

  db.run(
    'UPDATE contacts SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        console.error('Erreur mise à jour contact:', err);
        return res.status(500).json({ error: err.message });
      }

      res.json({
        success: true,
        message: 'Statut mis à jour'
      });
    }
  );
});

// Supprimer un contact
router.delete('/admin/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM contacts WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erreur suppression contact:', err);
      return res.status(500).json({ error: err.message });
    }

    res.json({
      success: true,
      message: 'Message supprimé'
    });
  });
});

module.exports = router;
