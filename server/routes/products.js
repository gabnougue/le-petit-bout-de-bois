const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Fonction utilitaire pour enrichir un produit avec ses images
function enrichProduct(product) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, image_path, display_order, is_primary
       FROM product_images
       WHERE product_id = ?
       ORDER BY display_order ASC`,
      [product.id],
      (err, images) => {
        if (err) {
          reject(err);
          return;
        }

        product.images = images || [];
        product.image_paths = images.map(img => img.image_path);

        resolve(product);
      }
    );
  });
}

// Enrichir plusieurs produits
async function enrichProducts(products) {
  const enrichedProducts = [];
  for (const product of products) {
    try {
      const enriched = await enrichProduct(product);
      enrichedProducts.push(enriched);
    } catch (err) {
      console.error('Erreur enrichissement produit:', err);
      enrichedProducts.push(product); // Retourner le produit sans enrichissement
    }
  }
  return enrichedProducts;
}

// Récupérer tous les produits
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM products WHERE stock > 0';
  const params = [];

  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ? OR wood_type LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, async (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    try {
      const enrichedProducts = await enrichProducts(rows);
      res.json(enrichedProducts);
    } catch (error) {
      console.error('Erreur enrichissement produits:', error);
      res.json(rows); // Fallback: retourner sans enrichissement
    }
  });
});

// Récupérer un produit par ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ?', [id], async (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Produit non trouvé' });
      return;
    }

    try {
      const enrichedProduct = await enrichProduct(row);
      res.json(enrichedProduct);
    } catch (error) {
      console.error('Erreur enrichissement produit:', error);
      res.json(row); // Fallback
    }
  });
});

// Récupérer les catégories
router.get('/meta/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM products ORDER BY category', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const categories = rows.map(row => row.category);
    res.json(categories);
  });
});

// Récupérer les types de bois
router.get('/meta/wood-types', (req, res) => {
  db.all('SELECT DISTINCT wood_type FROM products WHERE wood_type IS NOT NULL AND wood_type != "" ORDER BY wood_type', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const woodTypes = rows.map(row => row.wood_type);
    res.json(woodTypes);
  });
});

module.exports = router;
