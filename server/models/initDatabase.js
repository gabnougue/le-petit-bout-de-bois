const db = require('./database');
const bcrypt = require('bcrypt');

// Initialisation des tables
const initDatabase = () => {
  // Table des produits
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      wood_type TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      stock INTEGER DEFAULT 0,
      image_url TEXT,
      perlouze_link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erreur création table products:', err.message);
    } else {
      console.log('✅ Table products créée');
    }
  });

  // Table des commandes
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      customer_address TEXT,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_id TEXT,
      items TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erreur création table orders:', err.message);
    } else {
      console.log('✅ Table orders créée');
    }
  });

  // Table des administrateurs
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, async (err) => {
    if (err) {
      console.error('❌ Erreur création table admins:', err.message);
    } else {
      console.log('✅ Table admins créée');

      // Créer un admin par défaut
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.run(`
        INSERT OR IGNORE INTO admins (username, password, email)
        VALUES (?, ?, ?)
      `, ['admin', hashedPassword, 'admin@lepetitboutdebois.fr'], (err) => {
        if (err) {
          console.error('❌ Erreur création admin:', err.message);
        } else {
          console.log('👤 Admin par défaut créé (username: admin, password: admin123)');
        }
      });
    }
  });

  // Table des paramètres du site
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erreur création table settings:', err.message);
    } else {
      console.log('✅ Table settings créée');

      // Insérer paramètres par défaut
      const defaultSettings = [
        ['site_name', 'Le ptit bout de bois'],
        ['site_description', 'Créations artisanales en bois par Jean-Michel Nougué-Lecocq'],
        ['contact_email', 'contact@lepetitboutdebois.fr'],
        ['perlouze_url', 'http://localhost:3000']
      ];

      defaultSettings.forEach(([key, value]) => {
        db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
      });
    }
  });

  // Insérer quelques produits d'exemple
  setTimeout(() => {
    const sampleProducts = [
      {
        name: 'Jeu de petits chevaux en chêne',
        description: 'Magnifique jeu de petits chevaux entièrement fait main en chêne massif. Plateau gravé et verni, pions tournés à la main. Un cadeau parfait pour toute la famille.',
        wood_type: 'Chêne massif',
        price: 65.00,
        category: 'Jeux',
        stock: 3,
        image_url: '/images/products/petits-chevaux.jpg'
      },
      {
        name: 'Porte-bracelet tournant',
        description: 'Présentoir rotatif pour bracelets, idéal pour mettre en valeur vos bijoux. Fini huilé naturel.',
        wood_type: 'Noyer',
        price: 28.00,
        category: 'Accessoires',
        stock: 8,
        image_url: '/images/products/porte-bracelet.jpg',
        perlouze_link: 'http://localhost:3000/catalogue?category=bracelets'
      },
      {
        name: 'Bracelet bois et pierres naturelles',
        description: 'Bracelet mixte associant perles de bois de rose et améthyste. Élastique résistant.',
        wood_type: 'Bois de rose',
        price: 22.00,
        category: 'Bijoux bois & pierres',
        stock: 5,
        image_url: '/images/products/bracelet-mixte.jpg',
        perlouze_link: 'http://localhost:3000/produit/1'
      },
      {
        name: 'Set de 4 dessous de verre',
        description: 'Ensemble de 4 dessous de verre en bois recyclé, finition naturelle cirée.',
        wood_type: 'Bois recyclé',
        price: 18.00,
        category: 'Accessoires',
        stock: 12,
        image_url: '/images/products/dessous-verre.jpg'
      },
      {
        name: 'Porte-lunettes mural',
        description: 'Support mural pratique pour ranger vos lunettes. Fixation discrète incluse.',
        wood_type: 'Pin',
        price: 15.00,
        category: 'Accessoires',
        stock: 6,
        image_url: '/images/products/porte-lunettes.jpg'
      },
      {
        name: 'Jeu de dominos personnalisable',
        description: 'Jeu de 28 dominos en érable, avec possibilité de gravure personnalisée.',
        wood_type: 'Érable',
        price: 45.00,
        category: 'Jeux',
        stock: 4,
        image_url: '/images/products/dominos.jpg'
      }
    ];

    sampleProducts.forEach(product => {
      db.run(`
        INSERT INTO products (name, description, wood_type, price, category, stock, image_url, perlouze_link)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.name,
        product.description,
        product.wood_type,
        product.price,
        product.category,
        product.stock,
        product.image_url,
        product.perlouze_link || null
      ]);
    });

    console.log('🪵 Produits d\'exemple ajoutés');
    console.log('\n🌳 ════════════════════════════════════════ 🌳');
    console.log('   Base de données initialisée avec succès !');
    console.log('🌳 ════════════════════════════════════════ 🌳\n');

    db.close();
  }, 1000);
};

initDatabase();
