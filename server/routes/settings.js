const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Middleware de vérification admin
const requireAdmin = (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
};

// Récupérer tous les paramètres
router.get('/', (req, res) => {
  db.all('SELECT * FROM settings', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Convertir en objet clé-valeur
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json(settings);
  });
});

// Mettre à jour un paramètre
router.put('/:key', requireAdmin, (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  db.run(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
  `, [key, value, value], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      success: true,
      message: 'Paramètre mis à jour'
    });
  });
});

// ===== GESTION DES CATEGORIES =====

// Récupérer toutes les catégories (public)
router.get('/categories', (req, res) => {
  db.all(
    'SELECT * FROM categories ORDER BY name ASC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Ajouter une catégorie (admin)
router.post('/categories', requireAdmin, (req, res) => {
  const { name, emoji, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nom de catégorie requis' });
  }

  db.run(
    'INSERT INTO categories (name, emoji, description) VALUES (?, ?, ?)',
    [name.trim(), emoji || '🪵', description || ''],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Cette catégorie existe déjà' });
        }
        return res.status(500).json({ error: err.message });
      }

      res.json({
        success: true,
        message: 'Catégorie ajoutée',
        category: {
          id: this.lastID,
          name: name.trim(),
          emoji: emoji || '🪵',
          description: description || ''
        }
      });
    }
  );
});

// Modifier une catégorie (admin)
router.put('/categories/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, emoji, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nom de catégorie requis' });
  }

  db.run(
    'UPDATE categories SET name = ?, emoji = ?, description = ? WHERE id = ?',
    [name.trim(), emoji || '🪵', description || '', id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Cette catégorie existe déjà' });
        }
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Catégorie non trouvée' });
      }

      res.json({
        success: true,
        message: 'Catégorie modifiée',
        category: {
          id: parseInt(id),
          name: name.trim(),
          emoji: emoji || '🪵',
          description: description || ''
        }
      });
    }
  );
});

// Supprimer une catégorie (admin)
router.delete('/categories/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  // Vérifier si des produits utilisent cette catégorie
  db.get(
    'SELECT COUNT(*) as count FROM products WHERE category = (SELECT name FROM categories WHERE id = ?)',
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row.count > 0) {
        return res.status(400).json({
          error: `Impossible de supprimer : ${row.count} produit(s) utilisent cette catégorie`
        });
      }

      // Supprimer la catégorie
      db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Catégorie non trouvée' });
        }

        res.json({
          success: true,
          message: 'Catégorie supprimée'
        });
      });
    }
  );
});

// ===== GESTION DES TYPES DE BOIS =====

// Récupérer tous les types de bois (public)
router.get('/wood-types', (req, res) => {
  db.all(
    'SELECT * FROM wood_types ORDER BY name ASC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Ajouter un type de bois (admin)
router.post('/wood-types', requireAdmin, (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nom de type de bois requis' });
  }

  db.run(
    'INSERT INTO wood_types (name) VALUES (?)',
    [name.trim()],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Ce type de bois existe déjà' });
        }
        return res.status(500).json({ error: err.message });
      }

      res.json({
        success: true,
        message: 'Type de bois ajouté',
        woodType: {
          id: this.lastID,
          name: name.trim()
        }
      });
    }
  );
});

// Supprimer un type de bois (admin)
router.delete('/wood-types/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  // Vérifier si des produits utilisent ce type de bois
  db.get(
    'SELECT COUNT(*) as count FROM products WHERE wood_type = (SELECT name FROM wood_types WHERE id = ?)',
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row.count > 0) {
        return res.status(400).json({
          error: `Impossible de supprimer : ${row.count} produit(s) utilisent ce type de bois`
        });
      }

      // Supprimer le type de bois
      db.run('DELETE FROM wood_types WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Type de bois non trouvé' });
        }

        res.json({
          success: true,
          message: 'Type de bois supprimé'
        });
      });
    }
  );
});

module.exports = router;
