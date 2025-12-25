// Migration pour ajouter la table product_images
// Permet de gérer plusieurs images par produit avec ordre et image principale

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.db');

function migrateProductImages() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
      // Créer la table product_images
      db.run(`
        CREATE TABLE IF NOT EXISTS product_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          image_path TEXT NOT NULL,
          display_order INTEGER DEFAULT 0,
          is_primary BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erreur création table product_images:', err);
          reject(err);
          return;
        }
        console.log('✅ Table product_images créée');
      });

      // Créer un index sur product_id pour améliorer les performances
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_product_images_product_id
        ON product_images(product_id)
      `, (err) => {
        if (err) {
          console.error('❌ Erreur création index:', err);
        } else {
          console.log('✅ Index créé sur product_id');
        }
      });

      // Créer un index sur display_order
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_product_images_order
        ON product_images(product_id, display_order)
      `, (err) => {
        if (err) {
          console.error('❌ Erreur création index order:', err);
        } else {
          console.log('✅ Index créé sur display_order');
        }
      });

      // Migrer les images existantes de la colonne image_url vers product_images
      db.all(`SELECT id, image_url FROM products WHERE image_url IS NOT NULL AND image_url != ''`, [], (err, products) => {
        if (err) {
          console.error('❌ Erreur lecture produits:', err);
          reject(err);
          return;
        }

        if (products.length === 0) {
          console.log('ℹ️  Aucune image existante à migrer');
          db.close();
          resolve();
          return;
        }

        console.log(`🔄 Migration de ${products.length} images existantes...`);

        let migrated = 0;
        let errors = 0;

        products.forEach((product, index) => {
          // Vérifier si l'image n'a pas déjà été migrée
          db.get(
            `SELECT id FROM product_images WHERE product_id = ? AND image_path = ?`,
            [product.id, product.image_url],
            (err, existing) => {
              if (err) {
                console.error(`❌ Erreur vérification produit ${product.id}:`, err);
                errors++;
              } else if (!existing) {
                // Insérer l'image dans product_images
                db.run(
                  `INSERT INTO product_images (product_id, image_path, display_order, is_primary)
                   VALUES (?, ?, 0, 1)`,
                  [product.id, product.image_url],
                  (err) => {
                    if (err) {
                      console.error(`❌ Erreur migration produit ${product.id}:`, err);
                      errors++;
                    } else {
                      migrated++;
                      console.log(`  ✓ Image migrée pour produit ${product.id}`);
                    }

                    // Si c'est le dernier produit
                    if (index === products.length - 1) {
                      console.log(`\n📊 Résultat migration:`);
                      console.log(`   - ${migrated} images migrées`);
                      console.log(`   - ${errors} erreurs`);
                      db.close();
                      resolve();
                    }
                  }
                );
              } else {
                console.log(`  ⊙ Image déjà migrée pour produit ${product.id}`);

                // Si c'est le dernier produit
                if (index === products.length - 1) {
                  console.log(`\n📊 Résultat migration:`);
                  console.log(`   - ${migrated} images migrées`);
                  console.log(`   - ${errors} erreurs`);
                  db.close();
                  resolve();
                }
              }
            }
          );
        });
      });
    });
  });
}

// Exécuter si appelé directement
if (require.main === module) {
  console.log('🚀 Démarrage de la migration product_images...\n');
  migrateProductImages()
    .then(() => {
      console.log('\n✨ Migration terminée avec succès !');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n💥 Erreur lors de la migration:', err);
      process.exit(1);
    });
}

module.exports = migrateProductImages;
