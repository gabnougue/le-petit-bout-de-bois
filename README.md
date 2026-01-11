# 🪵 Le ptit bout de bois

Site e-commerce de créations artisanales en bois par Jean-Michel Nougué-Lecocq.

Site jumeau de **La p'tite perlouze** (bijoux en pierres naturelles), avec des passerelles fluides entre les deux univers.

---

## 🌳 Caractéristiques

### Design et ambiance
- **Thème bois/artisan** : couleurs naturelles (brun, chêne, crème, vert mousse)
- **Style cartoon illustré** : doux et poétique, dans la continuité de La p'tite perlouze
- **Enseigne suspendue** : planche de bois avec cordes et clous
- **Animations** : copeaux de bois qui tombent, effets de survol
- **Portail inter-sites** : transition fluide vers La p'tite perlouze (effet de fente dans le bois)

### Fonctionnalités principales
✓ **Catalogue de produits** avec filtres et recherche
✓ **Fiches produits détaillées** avec liens croisés vers La p'tite perlouze
✓ **Panier** avec gestion des quantités
✓ **Système de commande** complet
✓ **Page de contact** avec formulaire
✓ **Zone d'administration** complète et sécurisée
✓ **Responsive** : compatible mobile et tablette

### Catégories de produits
- 🎲 Jeux en bois (petits chevaux, dominos, etc.)
- 🪑 Accessoires (porte-bracelets, dessous de verre, porte-lunettes)
- 💎 Bijoux bois & pierres (créations mixtes avec La p'tite perlouze)
- 🎨 Objets décoratifs

---

## 🚀 Installation

### Prérequis
- Node.js (v14 ou supérieur)
- npm

### Installation des dépendances

```bash
cd le-petit-bout-de-bois
npm install
```

### Configuration

1. Copier le fichier `.env.example` en `.env` :
```bash
cp .env.example .env
```

2. Modifier les variables d'environnement dans `.env` :
```env
PORT=3001
SESSION_SECRET=votre-secret-unique
STRIPE_SECRET_KEY=votre_cle_stripe
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_email
PERLOUZE_URL=http://localhost:3000
```

### Initialisation de la base de données

```bash
npm run init-db
```

Cette commande va :
- Créer toutes les tables nécessaires
- Créer un compte admin par défaut (username: `admin`, password: `admin123`)
- Ajouter 6 produits d'exemple

---

## 🎯 Démarrage

### Mode développement (avec rechargement automatique)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le site sera accessible sur **http://localhost:3001**

---

## 👤 Administration

### Accès à l'interface admin
- URL : **http://localhost:3001/admin**
- Identifiants par défaut :
  - Username : `admin`
  - Password : `admin123`

⚠️ **Important** : Changez le mot de passe par défaut dès la première connexion !

### Fonctionnalités admin

#### Gestion des produits
- ➕ Ajouter de nouveaux produits
- ✏️ Modifier les produits existants
- 🗑️ Supprimer des produits
- 📸 Upload d'images
- 🔗 Ajouter des liens vers La p'tite perlouze

#### Gestion des commandes
- 📋 Voir toutes les commandes
- 👁️ Détails de chaque commande
- 🔄 Changer le statut (en attente → confirmée → expédiée → livrée)

#### Statistiques
- Nombre total de produits
- Nombre de commandes
- Chiffre d'affaires
- Produits en rupture de stock

---

## 🔗 Liaison avec La p'tite perlouze

### Portail de transition
Un portail circulaire animé en haut à droite permet de basculer entre les deux sites avec une transition fluide.

### Liens croisés dans les produits
- Les produits peuvent avoir un champ `perlouze_link` pointant vers un produit complémentaire
- Exemple : un porte-bracelet en bois peut pointer vers la catégorie bracelets de La p'tite perlouze
- Les bijoux mixtes (bois + pierres) ont des liens bidirectionnels

### Configuration du lien
Dans `.env`, définir l'URL de La p'tite perlouze :
```env
PERLOUZE_URL=http://localhost:3000
```

---

## 📁 Structure du projet

```
le-petit-bout-de-bois/
│
├── server.js                 # Serveur Express principal
├── package.json              # Dépendances et scripts
├── .env                      # Configuration (ne pas commiter)
│
├── server/
│   ├── models/
│   │   ├── database.js       # Connexion SQLite
│   │   └── initDatabase.js   # Initialisation de la BDD
│   └── routes/
│       ├── products.js       # Routes API produits
│       ├── orders.js         # Routes API commandes
│       ├── admin.js          # Routes API admin
│       ├── contact.js        # Routes API contact
│       └── settings.js       # Routes API paramètres
│
├── public/
│   ├── index.html            # Page d'accueil
│   ├── catalogue.html        # Page catalogue
│   ├── produit.html          # Page produit
│   ├── panier.html           # Page panier
│   ├── contact.html          # Page contact
│   │
│   ├── admin/
│   │   ├── login.html        # Connexion admin
│   │   └── dashboard.html    # Dashboard admin
│   │
│   ├── css/
│   │   ├── styles.css        # Styles principaux (thème bois)
│   │   └── admin.css         # Styles admin
│   │
│   ├── js/
│   │   ├── main.js           # Script principal + gestion panier
│   │   ├── catalogue.js      # Script catalogue
│   │   ├── panier.js         # Script panier
│   │   └── admin.js          # Script admin
│   │
│   └── images/
│       ├── products/         # Images des produits
│       └── placeholder.jpg   # Image par défaut
│
└── database.db               # Base de données SQLite
```

---

## 🎨 Personnalisation du thème

### Couleurs principales (dans `styles.css`)
```css
:root {
  --wood-light: #D4A574;      /* Bois clair */
  --wood-medium: #8B5A3C;     /* Bois moyen */
  --wood-dark: #4A2C1F;       /* Bois foncé */
  --cream: #F5F1E8;           /* Crème */
  --moss-green: #6B7F5A;      /* Vert mousse */
  --slate-gray: #5C6B73;      /* Gris ardoise */
  --accent-orange: #D97642;   /* Orange accent */
  --accent-green: #7FA650;    /* Vert accent */
}
```

### Animations
- **Copeaux de bois** : ajoutés automatiquement sur chaque page
- **Balancement de l'enseigne** : animation CSS douce
- **Portail pulsant** : effet de lueur pour le portail inter-sites
- **Survol des cartes** : légère rotation et élévation

---

## 📧 Configuration des emails

Pour activer l'envoi d'emails (confirmations de commande, messages de contact) :

1. Utiliser un compte Gmail
2. Activer l'authentification à deux facteurs
3. Créer un mot de passe d'application
4. Ajouter dans `.env` :
```env
EMAIL_USER=votre.email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application
```

---

## 💳 Configuration Stripe (optionnel)

Pour activer les paiements par carte :

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Récupérer les clés API (mode test)
3. Ajouter dans `.env` :
```env
STRIPE_SECRET_KEY=sk_test_votre_cle
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle
```

---

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifier que le port 3001 n'est pas déjà utilisé
- Vérifier que toutes les dépendances sont installées : `npm install`

### Les produits ne s'affichent pas
- Vérifier que la base de données est initialisée : `npm run init-db`
- Vérifier la console du navigateur pour les erreurs

### Les images ne s'affichent pas
- Vérifier que le dossier `public/images/products/` existe
- Utiliser le bon format d'image (jpg, png, webp)

### Erreur de connexion admin
- Vérifier les identifiants (admin / admin123 par défaut)
- Vérifier que la table `admins` existe dans la base

---

## 🔒 Sécurité

### Bonnes pratiques
- ✅ Changer le mot de passe admin par défaut
- ✅ Modifier le `SESSION_SECRET` dans `.env`
- ✅ Ne jamais commiter le fichier `.env`
- ✅ Utiliser HTTPS en production
- ✅ Limiter les tentatives de connexion

### Protection des routes admin
Toutes les routes admin vérifient la session :
```javascript
if (!req.session.adminId) {
  return res.status(401).json({ error: 'Non autorisé' });
}
```

---

## 📱 Responsive

Le site est entièrement responsive avec des breakpoints :
- **Mobile** : < 480px
- **Tablette** : 480px - 768px
- **Desktop** : > 768px

---

## 🌐 Déploiement en production

### Préparer l'environnement
1. Modifier `.env` pour la production :
```env
NODE_ENV=production
PORT=80
SESSION_SECRET=secret-tres-long-et-aleatoire
```

2. Utiliser un vrai serveur SMTP (pas Gmail)
3. Configurer Stripe en mode live
4. Utiliser HTTPS (Let's Encrypt recommandé)

### Serveurs recommandés
- **VPS** : DigitalOcean, Linode, OVH
- **PaaS** : Heroku, Railway, Render
- **Serveur web** : Nginx + PM2 pour Node.js

---

## 🤝 Collaboration avec La p'tite perlouze

### Synchronisation des données
Les deux sites peuvent partager :
- Un même dossier `/themes/` pour les animations saisonnières
- Une API commune pour les liens croisés
- Une base de données partagée (optionnel)

### Communication entre les sites
```javascript
// Dans .env de chaque site
PERLOUZE_URL=http://localhost:3000
BOIS_URL=http://localhost:3001
```

---

## 📝 Licence

© 2024 Le ptit bout de bois - Jean-Michel Nougué-Lecocq

Créé avec ❤️ et 🪵

---

## 🆘 Support

Pour toute question ou problème :
- 📧 Email : contact@lepetitboutdebois.fr
- 💬 Voir aussi : La p'tite perlouze (http://localhost:3000)

---

**Fait avec passion, un copeau à la fois** 🪵✨
