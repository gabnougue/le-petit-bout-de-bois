// Migration pour ajouter la table wood_types
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.db');

function migrateWoodTypes() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
      // Créer la table wood_types
      db.run(`
        CREATE TABLE IF NOT EXISTS wood_types (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erreur création table wood_types:', err);
          reject(err);
          return;
        }
        console.log('✅ Table wood_types créée');
      });

      // Insérer les types de bois par défaut si ils n'existent pas
      const defaultWoodTypes = [
        'Chêne massif',
        'Noyer',
        'Bois de rose',
        'Bois recyclé',
        'Pin',
        'Érable',
        'Hêtre',
        'Merisier',
        'Frêne'
      ];

      db.get('SELECT COUNT(*) as count FROM wood_types', [], (err, row) => {
        if (err) {
          console.error('❌ Erreur vérification wood_types:', err);
          reject(err);
          return;
        }

        if (row.count === 0) {
          console.log('🪵 Insertion des types de bois par défaut...');

          const stmt = db.prepare('INSERT OR IGNORE INTO wood_types (name) VALUES (?)');
          defaultWoodTypes.forEach(wood => {
            stmt.run(wood, (err) => {
              if (err) {
                console.error(`❌ Erreur insertion type de bois "${wood}":`, err);
              } else {
                console.log(`  ✓ Type de bois "${wood}" ajouté`);
              }
            });
          });
          stmt.finalize(() => {
            console.log('✅ Types de bois par défaut insérés');
            db.close();
            resolve();
          });
        } else {
          console.log(`ℹ️  ${row.count} types de bois déjà présents`);
          db.close();
          resolve();
        }
      });
    });
  });
}

// Exécuter si appelé directement
if (require.main === module) {
  console.log('🚀 Démarrage de la migration wood_types...\n');
  migrateWoodTypes()
    .then(() => {
      console.log('\n✨ Migration terminée avec succès !');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n💥 Erreur lors de la migration:', err);
      process.exit(1);
    });
}

module.exports = migrateWoodTypes;
