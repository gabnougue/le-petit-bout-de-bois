// Migration pour ajouter les tables contacts et categories
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.db');

function migrateContactsCategories() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
      // Créer la table contacts
      db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'nouveau',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erreur création table contacts:', err);
          reject(err);
          return;
        }
        console.log('✅ Table contacts créée');
      });

      // Créer un index sur le statut des contacts
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_contacts_status
        ON contacts(status)
      `, (err) => {
        if (err) {
          console.error('❌ Erreur création index contacts:', err);
        } else {
          console.log('✅ Index créé sur contacts.status');
        }
      });

      // Créer la table categories
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erreur création table categories:', err);
          reject(err);
          return;
        }
        console.log('✅ Table categories créée');
      });

      // Insérer les catégories par défaut si elles n'existent pas
      const defaultCategories = ['Jeux', 'Accessoires', 'Bijoux bois & pierres', 'Objets décoratifs'];

      db.get('SELECT COUNT(*) as count FROM categories', [], (err, row) => {
        if (err) {
          console.error('❌ Erreur vérification categories:', err);
          reject(err);
          return;
        }

        if (row.count === 0) {
          console.log('📦 Insertion des catégories par défaut...');

          const stmt = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
          defaultCategories.forEach(cat => {
            stmt.run(cat, (err) => {
              if (err) {
                console.error(`❌ Erreur insertion catégorie "${cat}":`, err);
              } else {
                console.log(`  ✓ Catégorie "${cat}" ajoutée`);
              }
            });
          });
          stmt.finalize(() => {
            console.log('✅ Catégories par défaut insérées');
            db.close();
            resolve();
          });
        } else {
          console.log(`ℹ️  ${row.count} catégories déjà présentes`);
          db.close();
          resolve();
        }
      });
    });
  });
}

// Exécuter si appelé directement
if (require.main === module) {
  console.log('🚀 Démarrage de la migration contacts & categories...\n');
  migrateContactsCategories()
    .then(() => {
      console.log('\n✨ Migration terminée avec succès !');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n💥 Erreur lors de la migration:', err);
      process.exit(1);
    });
}

module.exports = migrateContactsCategories;
