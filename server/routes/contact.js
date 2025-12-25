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
  const { name, email, phone, message, subject } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Informations manquantes' });
  }

  // Enregistrer dans la base de données
  db.run(
    `INSERT INTO contacts (name, email, message, status) VALUES (?, ?, ?, 'nouveau')`,
    [name, email, message],
    async function(err) {
      if (err) {
        console.error('Erreur insertion contact:', err);
        return res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
      }

      const contactId = this.lastID;

      // Récupérer le contact créé pour l'email
      db.get('SELECT * FROM contacts WHERE id = ?', [contactId], async (err, contact) => {
        if (!err && contact) {
          // Envoyer l'email de notification au vendeur
          await sendContactNotification(contact);
        }
      });

      res.json({
        success: true,
        message: 'Message envoyé avec succès',
        contactId: contactId
      });
    }
  );
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
