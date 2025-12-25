# 🎯 Le petit bout de bois - Projet complet

Récapitulatif complet du site e-commerce créé pour Jean-Michel Nougué-Lecocq.

---

## 📋 Résumé du projet

### Description
Site e-commerce de créations artisanales en bois, jumeau de "La p'tite perlouze" (bijoux en pierres naturelles).

### Artisan
**Jean-Michel Nougué-Lecocq** - Créateur passionné de pièces uniques en bois.

### Partenariat
En collaboration avec **Yvonne Lecocq** (La p'tite perlouze) pour des créations mixtes bois & pierres.

---

## ✨ Fonctionnalités réalisées

### 🎨 Design et ambiance
✅ Thème bois/artisan avec couleurs naturelles (brun, chêne, crème, vert mousse)
✅ Style cartoon illustré, doux et poétique
✅ Enseigne suspendue avec effet de planche de bois, cordes et clous
✅ Animations de copeaux de bois qui tombent
✅ Portail circulaire vers La p'tite perlouze avec effet de fente
✅ Responsive complet (mobile, tablette, desktop)

### 🛒 Fonctionnalités e-commerce
✅ **Page d'accueil** : présentation de l'atelier, catégories, produits phares
✅ **Catalogue** : filtres par catégorie, barre de recherche, cartes produits
✅ **Fiches produits** : détails complets, gestion du stock, quantité, liens croisés
✅ **Panier** : gestion des articles, modification des quantités, récapitulatif
✅ **Commande** : formulaire complet, confirmation par email
✅ **Contact** : formulaire avec informations de l'atelier

### 🔧 Administration
✅ **Login sécurisé** : authentification par session
✅ **Dashboard** : statistiques (produits, commandes, CA, ruptures)
✅ **Gestion produits** : CRUD complet, upload d'images, liens Perlouze
✅ **Gestion commandes** : liste, détails, changement de statut
✅ **Paramètres** : configuration du site

### 🔗 Passerelles avec La p'tite perlouze
✅ Portail visuel animé en haut à droite
✅ Liens croisés dans les fiches produits
✅ Section "univers jumeau" sur l'accueil
✅ Catégorie spéciale "Bijoux bois & pierres"
✅ Configuration flexible des URLs

---

## 📂 Structure complète

```
le-petit-bout-de-bois/
│
├── 📄 Configuration
│   ├── package.json              # Dépendances npm
│   ├── .env                      # Variables d'environnement
│   ├── .env.example              # Exemple de configuration
│   └── .gitignore                # Fichiers à ignorer
│
├── 🗄️ Backend
│   ├── server.js                 # Serveur Express
│   └── server/
│       ├── models/
│       │   ├── database.js       # Connexion SQLite
│       │   └── initDatabase.js   # Init + données exemple
│       └── routes/
│           ├── products.js       # API produits
│           ├── orders.js         # API commandes
│           ├── admin.js          # API admin (CRUD)
│           ├── contact.js        # API contact
│           └── settings.js       # API paramètres
│
├── 🎨 Frontend
│   └── public/
│       ├── 📄 Pages HTML
│       │   ├── index.html        # Accueil
│       │   ├── catalogue.html    # Catalogue
│       │   ├── produit.html      # Fiche produit
│       │   ├── panier.html       # Panier
│       │   ├── contact.html      # Contact
│       │   └── admin/
│       │       ├── login.html    # Login admin
│       │       └── dashboard.html # Dashboard admin
│       │
│       ├── 🎨 Styles
│       │   └── css/
│       │       ├── styles.css    # Thème bois principal
│       │       └── admin.css     # Styles admin
│       │
│       ├── ⚡ Scripts
│       │   └── js/
│       │       ├── main.js       # Panier + fonctions globales
│       │       ├── catalogue.js  # Filtres + recherche
│       │       ├── panier.js     # Gestion panier
│       │       └── admin.js      # Dashboard admin
│       │
│       └── 🖼️ Images
│           └── images/
│               ├── products/     # Photos produits
│               └── placeholder.jpg
│
├── 📚 Documentation
│   ├── README.md                 # Documentation complète
│   ├── DEMARRAGE_RAPIDE.md       # Guide d'installation
│   ├── INTEGRATION_PERLOUZE.md   # Guide d'intégration
│   └── PROJET_COMPLET.md         # Ce fichier
│
└── 💾 Base de données
    └── database.db               # SQLite (créée à l'init)
```

---

## 🎨 Palette de couleurs

```css
/* Couleurs principales */
--wood-light: #D4A574      /* Bois clair */
--wood-medium: #8B5A3C     /* Bois moyen */
--wood-dark: #4A2C1F       /* Bois foncé */
--cream: #F5F1E8           /* Crème */
--moss-green: #6B7F5A      /* Vert mousse */
--slate-gray: #5C6B73      /* Gris ardoise */

/* Accents */
--accent-orange: #D97642   /* Orange vif */
--accent-green: #7FA650    /* Vert vif */
```

---

## 🗃️ Base de données

### Tables créées

#### `products`
| Champ | Type | Description |
|-------|------|-------------|
| id | INTEGER | Clé primaire auto-incrémentée |
| name | TEXT | Nom du produit |
| description | TEXT | Description complète |
| wood_type | TEXT | Type de bois utilisé |
| price | REAL | Prix en euros |
| category | TEXT | Catégorie (Jeux, Accessoires, etc.) |
| stock | INTEGER | Quantité en stock |
| image_url | TEXT | Chemin de l'image |
| perlouze_link | TEXT | Lien vers La p'tite perlouze |
| created_at | DATETIME | Date de création |
| updated_at | DATETIME | Date de modification |

#### `orders`
| Champ | Type | Description |
|-------|------|-------------|
| id | INTEGER | Clé primaire |
| customer_name | TEXT | Nom du client |
| customer_email | TEXT | Email du client |
| customer_phone | TEXT | Téléphone |
| customer_address | TEXT | Adresse de livraison |
| total_amount | REAL | Montant total |
| status | TEXT | pending/confirmed/shipped/delivered |
| payment_method | TEXT | Méthode de paiement |
| payment_id | TEXT | ID de paiement (Stripe) |
| items | TEXT | JSON des articles commandés |
| created_at | DATETIME | Date de commande |

#### `admins`
| Champ | Type | Description |
|-------|------|-------------|
| id | INTEGER | Clé primaire |
| username | TEXT | Nom d'utilisateur |
| password | TEXT | Mot de passe hashé (bcrypt) |
| email | TEXT | Email |
| created_at | DATETIME | Date de création |

#### `settings`
| Champ | Type | Description |
|-------|------|-------------|
| key | TEXT | Clé du paramètre (PRIMARY KEY) |
| value | TEXT | Valeur du paramètre |
| updated_at | DATETIME | Date de modification |

---

## 🔐 Sécurité

### Mesures implémentées
✅ Sessions sécurisées avec `express-session`
✅ Mots de passe hashés avec `bcrypt` (10 rounds)
✅ Protection des routes admin par middleware
✅ Variables sensibles dans `.env` (non commitées)
✅ Validation des entrées utilisateur
✅ Upload d'images filtré par type MIME

### À faire en production
- [ ] Passer en HTTPS (Let's Encrypt)
- [ ] Configurer un vrai serveur SMTP
- [ ] Limiter les tentatives de connexion
- [ ] Ajouter un CAPTCHA sur le formulaire de contact
- [ ] Mettre en place des sauvegardes automatiques de la BDD

---

## 📦 Dépendances npm

### Production
```json
{
  "express": "^4.18.2",         // Serveur web
  "sqlite3": "^5.1.6",          // Base de données
  "bcrypt": "^5.1.1",           // Hashage mots de passe
  "express-session": "^1.17.3", // Gestion sessions
  "multer": "^1.4.5-lts.1",     // Upload fichiers
  "dotenv": "^16.3.1",          // Variables d'env
  "stripe": "^14.10.0",         // Paiements (optionnel)
  "nodemailer": "^6.9.7"        // Envoi emails
}
```

### Développement
```json
{
  "nodemon": "^3.0.2"           // Rechargement auto
}
```

---

## 🚀 Scripts disponibles

```bash
# Démarrage
npm start              # Mode production
npm run dev            # Mode développement (nodemon)

# Base de données
npm run init-db        # Initialiser la BDD + données exemple
```

---

## 📊 Produits d'exemple créés

1. **Jeu de petits chevaux en chêne** - 65,00 €
   - Catégorie : Jeux
   - Bois : Chêne massif
   - Stock : 3

2. **Porte-bracelet tournant** - 28,00 €
   - Catégorie : Accessoires
   - Bois : Noyer
   - Stock : 8
   - 🔗 Lien vers bracelets La p'tite perlouze

3. **Bracelet bois et pierres naturelles** - 22,00 €
   - Catégorie : Bijoux bois & pierres
   - Bois : Bois de rose
   - Stock : 5
   - 🔗 Lien vers produit La p'tite perlouze

4. **Set de 4 dessous de verre** - 18,00 €
   - Catégorie : Accessoires
   - Bois : Bois recyclé
   - Stock : 12

5. **Porte-lunettes mural** - 15,00 €
   - Catégorie : Accessoires
   - Bois : Pin
   - Stock : 6

6. **Jeu de dominos personnalisable** - 45,00 €
   - Catégorie : Jeux
   - Bois : Érable
   - Stock : 4

---

## 🎯 Points clés du design

### Enseigne suspendue
- Planche de bois avec rotation subtile (-1° à 1°)
- Deux cordes/fixations en haut
- Deux clous décoratifs
- Animation de balancement doux (6s)

### Portail vers La p'tite perlouze
- Cercle de 120px en haut à droite
- Effet de fente dans le bois
- Aperçu de l'univers pierres (violet/magenta)
- Animation de pulsation
- Parallaxe au survol de la souris

### Cartes produits
- Bordure boisée (3px)
- Élévation au survol avec rotation (1°)
- Badge de catégorie arrondi
- Type de bois affiché avec emoji 🪵
- Lien vers La p'tite perlouze si pertinent

### Animations
- **Copeaux de bois** : 8 particules qui tombent en permanence
- **Balancement enseigne** : rotation douce infinie
- **Pulsation portail** : lueur qui grandit/rétrécit
- **Survol cartes** : élévation + rotation
- **Transition inter-sites** : overlay coloré en fondu

---

## 📱 Responsive breakpoints

```css
/* Mobile */
@media (max-width: 480px) {
  .site-title h1 { font-size: 1.5rem; }
  .product-grid { grid-template-columns: 1fr; }
}

/* Tablette */
@media (max-width: 768px) {
  .site-title h1 { font-size: 1.75rem; }
  .portal-container { width: 80px; height: 80px; }
  .product-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
}

/* Desktop */
@media (min-width: 769px) {
  .container { max-width: 1200px; }
}
```

---

## 🔗 URLs et routes

### Pages publiques
```
/                          → Page d'accueil
/catalogue                 → Catalogue avec filtres
/catalogue?category=Jeux   → Catalogue filtré
/catalogue?search=chêne    → Recherche
/produit/:id               → Fiche produit
/panier                    → Panier
/contact                   → Formulaire de contact
```

### Pages admin
```
/admin                     → Login admin
/admin/dashboard           → Dashboard (protégé)
```

### API
```
GET    /api/products              → Liste produits (public)
GET    /api/products/:id          → Détail produit (public)
GET    /api/products/meta/categories → Catégories (public)

POST   /api/orders                → Créer commande (public)
GET    /api/orders                → Liste commandes (admin)
PATCH  /api/orders/:id/status     → Changer statut (admin)

POST   /api/contact               → Envoyer message (public)

POST   /api/admin/login           → Connexion admin
POST   /api/admin/logout          → Déconnexion admin
GET    /api/admin/check-session   → Vérifier session
GET    /api/admin/stats           → Statistiques (admin)

GET    /api/admin/products        → Produits + ruptures (admin)
POST   /api/admin/products        → Créer produit (admin)
PUT    /api/admin/products/:id    → Modifier produit (admin)
DELETE /api/admin/products/:id    → Supprimer produit (admin)

GET    /api/settings              → Paramètres site (public)
PUT    /api/settings/:key         → Modifier paramètre (admin)
```

---

## 🌟 Différences avec La p'tite perlouze

| Aspect | Le petit bout de bois | La p'tite perlouze |
|--------|----------------------|-------------------|
| Couleur dominante | Brun/Chêne | Violet/Magenta |
| Matériau | Bois | Pierres naturelles |
| Ambiance | Chaleureuse, artisan | Féerique, magique |
| Public cible | Mixte, familles | Plutôt féminin |
| Prix moyen | 20-65€ | 15-50€ |
| Catégories | Jeux, Accessoires, Mixtes | Bracelets, Colliers, Boucles |
| Port | 3001 | 3000 |

### Points communs
- ✅ Architecture identique (Express + SQLite)
- ✅ Interface admin similaire (facilite l'entraide)
- ✅ Style cartoon illustré
- ✅ Système de commande comparable
- ✅ Passerelles fluides entre les deux
- ✅ Responsive complet

---

## ✅ Checklist de déploiement

### Avant la mise en ligne
- [ ] Changer le mot de passe admin par défaut
- [ ] Configurer les emails (SMTP)
- [ ] Ajouter les vrais produits
- [ ] Télécharger les photos des créations
- [ ] Configurer Stripe (si paiement en ligne)
- [ ] Tester tous les formulaires
- [ ] Tester la responsivité
- [ ] Vérifier les liens vers La p'tite perlouze

### Déploiement
- [ ] Choisir un hébergeur (VPS ou PaaS)
- [ ] Configurer le domaine
- [ ] Installer les certificats SSL (HTTPS)
- [ ] Configurer le serveur (Nginx + PM2)
- [ ] Mettre en place les sauvegardes
- [ ] Configurer les logs
- [ ] Tester en production

### Après la mise en ligne
- [ ] Créer un compte Google Analytics (optionnel)
- [ ] Surveiller les performances
- [ ] Recueillir les retours utilisateurs
- [ ] Optimiser le référencement (SEO)

---

## 📧 Contact et support

### Artisans
- 🪵 **Jean-Michel Nougué-Lecocq** : contact@lepetitboutdebois.fr
- ✨ **Yvonne Lecocq** : contact@laptiteperlouze.fr

### Sites
- 🪵 Le petit bout de bois : http://localhost:3001 (dev)
- ✨ La p'tite perlouze : http://localhost:3000 (dev)

---

## 🎉 Conclusion

Le site **Le petit bout de bois** est maintenant complet et prêt à l'emploi !

### Ce qui a été livré
✅ Site e-commerce complet et fonctionnel
✅ Design unique thème bois/artisan
✅ Interface admin intuitive
✅ Passerelles fluides avec La p'tite perlouze
✅ 6 produits d'exemple
✅ Documentation complète
✅ Code propre et commenté

### Prochaines étapes suggérées
1. Ajouter vos propres produits et photos
2. Personnaliser les textes selon votre style
3. Configurer les emails et le paiement
4. Tester en conditions réelles
5. Déployer en production

---

**Merci de votre confiance et bon succès ! 🪵✨**

*Fait avec passion, un copeau à la fois.*
