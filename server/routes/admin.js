const express = require('express');
const router = express.Router();
const db = require('../models/database');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seules les images sont autorisées'));
  }
});

// Middleware de vérification admin
const requireAdmin = (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
};

// Login admin
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Identifiants manquants' });
  }

  db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, admin) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (!admin) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;

    res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  });
});

// Logout admin
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
    res.json({ success: true });
  });
});

// Vérifier la session
router.get('/check-session', (req, res) => {
  if (req.session.adminId) {
    res.json({
      authenticated: true,
      username: req.session.adminUsername
    });
  } else {
    res.json({ authenticated: false });
  }
});

// CRUD Produits

// Middleware pour gérer les erreurs Multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('Erreur Multer:', err);
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Créer un produit (avec plusieurs images)
router.post('/products', requireAdmin, (req, res, next) => {
  upload.fields([{ name: 'images', maxCount: 10 }])(req, res, (err) => {
    if (err) {
      console.error('Erreur upload:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, (req, res) => {
  const { name, description, wood_type, price, category, stock, perlouze_link } = req.body;

  // Démarrer une transaction
  db.serialize(() => {
    // Insérer le produit
    db.run(`
      INSERT INTO products (name, description, wood_type, price, category, stock, perlouze_link)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, description, wood_type, price, category, stock, perlouze_link || null],
    function(err) {
      if (err) {
        console.error('Erreur création produit:', err);
        return res.status(500).json({ error: err.message });
      }

      const productId = this.lastID;

      // Gérer les images si présentes
      if (req.files && req.files.images && req.files.images.length > 0) {
        const images = req.files.images;
        let insertedCount = 0;
        let primaryImagePath = null;

        images.forEach((file, index) => {
          const imagePath = `/images/products/${file.filename}`;
          const isPrimary = index === 0 ? 1 : 0;

          if (isPrimary) {
            primaryImagePath = imagePath;
          }

          db.run(`
            INSERT INTO product_images (product_id, image_path, display_order, is_primary)
            VALUES (?, ?, ?, ?)
          `, [productId, imagePath, index + 1, isPrimary], (err) => {
            if (err) {
              console.error('Erreur insertion image:', err);
            }

            insertedCount++;

            // Si toutes les images sont insérées
            if (insertedCount === images.length) {
              // Mettre à jour image_url du produit avec la première image
              if (primaryImagePath) {
                db.run(`UPDATE products SET image_url = ? WHERE id = ?`,
                  [primaryImagePath, productId]);
              }

              res.json({
                success: true,
                productId: productId,
                imagesCount: images.length,
                message: 'Produit créé avec succès'
              });
            }
          });
        });
      } else {
        // Aucune image
        res.json({
          success: true,
          productId: productId,
          message: 'Produit créé avec succès (sans images)'
        });
      }
    });
  });
});

// Modifier un produit (ajout de nouvelles images)
router.put('/products/:id', requireAdmin, (req, res, next) => {
  upload.fields([{ name: 'images', maxCount: 10 }])(req, res, (err) => {
    if (err) {
      console.error('Erreur upload:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, (req, res) => {
  const { id } = req.params;
  const { name, description, wood_type, price, category, stock, perlouze_link } = req.body;

  // Mettre à jour les informations du produit
  db.run(`
    UPDATE products
    SET name = ?, description = ?, wood_type = ?, price = ?, category = ?,
        stock = ?, perlouze_link = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [name, description, wood_type, price, category, stock, perlouze_link || null, id],
  function(err) {
    if (err) {
      console.error('Erreur modification produit:', err);
      return res.status(500).json({ error: err.message });
    }

    // Ajouter les nouvelles images si présentes
    if (req.files && req.files.images && req.files.images.length > 0) {
      // Trouver l'ordre maximal actuel
      db.get(`SELECT MAX(display_order) as maxOrder FROM product_images WHERE product_id = ?`,
        [id], (err, row) => {
          const startOrder = (row && row.maxOrder !== null) ? row.maxOrder + 1 : 1;
          const images = req.files.images;
          let insertedCount = 0;

          images.forEach((file, index) => {
            const imagePath = `/images/products/${file.filename}`;

            db.run(`
              INSERT INTO product_images (product_id, image_path, display_order, is_primary)
              VALUES (?, ?, ?, 0)
            `, [id, imagePath, startOrder + index], (err) => {
              if (err) {
                console.error('Erreur insertion image:', err);
              }

              insertedCount++;

              if (insertedCount === images.length) {
                res.json({
                  success: true,
                  imagesAdded: images.length,
                  message: 'Produit modifié avec succès'
                });
              }
            });
          });
        });
    } else {
      res.json({
        success: true,
        message: 'Produit modifié avec succès'
      });
    }
  });
});

// Supprimer un produit
router.delete('/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erreur suppression produit:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  });
});

// Fonction utilitaire pour enrichir un produit avec ses images (admin)
async function enrichProductAdmin(product) {
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

// Enrichir plusieurs produits (admin)
async function enrichProductsAdmin(products) {
  const enrichedProducts = [];
  for (const product of products) {
    try {
      const enriched = await enrichProductAdmin(product);
      enrichedProducts.push(enriched);
    } catch (err) {
      console.error('Erreur enrichissement produit:', err);
      enrichedProducts.push(product);
    }
  }
  return enrichedProducts;
}

// Récupérer tous les produits (y compris en rupture)
router.get('/products', requireAdmin, async (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', [], async (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Enrichir avec les images
    try {
      const enrichedProducts = await enrichProductsAdmin(rows);
      res.json(enrichedProducts);
    } catch (error) {
      console.error('Erreur enrichissement produits admin:', error);
      res.json(rows); // Fallback sans enrichissement
    }
  });
});

// Supprimer une image spécifique
router.delete('/product-images/:id', requireAdmin, (req, res) => {
  const imageId = req.params.id;

  // Récupérer d'abord l'image pour connaître le product_id
  db.get('SELECT * FROM product_images WHERE id = ?', [imageId], (err, image) => {
    if (err || !image) {
      return res.status(404).json({ error: 'Image non trouvée' });
    }

    const productId = image.product_id;
    const wasPrimary = image.is_primary;

    // Supprimer l'image
    db.run('DELETE FROM product_images WHERE id = ?', [imageId], function(err) {
      if (err) {
        console.error('Erreur suppression image:', err);
        return res.status(500).json({ error: err.message });
      }

      // Si c'était l'image principale, promouvoir la première image restante
      if (wasPrimary) {
        db.get(
          'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC LIMIT 1',
          [productId],
          (err, firstImage) => {
            if (firstImage) {
              // Mettre cette image en principale
              db.run(
                'UPDATE product_images SET is_primary = 1 WHERE id = ?',
                [firstImage.id]
              );

              // Mettre à jour le produit
              db.run(
                'UPDATE products SET image_url = ? WHERE id = ?',
                [firstImage.image_path, productId]
              );
            } else {
              // Plus d'images, mettre à NULL
              db.run('UPDATE products SET image_url = NULL WHERE id = ?', [productId]);
            }

            res.json({ success: true, message: 'Image supprimée' });
          }
        );
      } else {
        res.json({ success: true, message: 'Image supprimée' });
      }
    });
  });
});

// Réorganiser les images d'un produit
router.put('/products/:id/reorder-images', requireAdmin, (req, res) => {
  const productId = req.params.id;
  const { images } = req.body; // Array d'objets {id, display_order, is_primary}

  if (!images || !Array.isArray(images)) {
    return res.status(400).json({ error: 'Données invalides' });
  }

  let updated = 0;
  let primaryImagePath = null;

  images.forEach((img, index) => {
    db.run(
      'UPDATE product_images SET display_order = ?, is_primary = ? WHERE id = ?',
      [img.display_order, img.is_primary, img.id],
      (err) => {
        if (err) {
          console.error('Erreur mise à jour image:', err);
        }

        // Trouver le chemin de l'image principale
        if (img.is_primary) {
          db.get('SELECT image_path FROM product_images WHERE id = ?', [img.id], (err, row) => {
            if (row) {
              primaryImagePath = row.image_path;
            }
          });
        }

        updated++;

        if (updated === images.length) {
          // Mettre à jour le produit avec la nouvelle image principale
          if (primaryImagePath) {
            db.run('UPDATE products SET image_url = ? WHERE id = ?', [primaryImagePath, productId]);
          }

          res.json({ success: true, message: 'Images réorganisées' });
        }
      }
    );
  });
});

// Statistiques du dashboard
router.get('/stats', requireAdmin, (req, res) => {
  const stats = {};

  // Nombre total de produits
  db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
    stats.totalProducts = row ? row.count : 0;

    // Nombre de commandes
    db.get('SELECT COUNT(*) as count FROM orders', [], (err, row) => {
      stats.totalOrders = row ? row.count : 0;

      // Chiffre d'affaires total
      db.get('SELECT SUM(total_amount) as total FROM orders WHERE status = "confirmed"', [], (err, row) => {
        stats.totalRevenue = row && row.total ? row.total : 0;

        // Produits en rupture de stock
        db.get('SELECT COUNT(*) as count FROM products WHERE stock = 0', [], (err, row) => {
          stats.outOfStock = row ? row.count : 0;

          res.json(stats);
        });
      });
    });
  });
});

module.exports = router;
