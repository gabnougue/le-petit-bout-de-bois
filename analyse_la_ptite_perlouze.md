# Analyse Complète : LA P'TITE PERLOUZE

## 1. ARCHITECTURE GÉNÉRALE

### Structure du projet
```
la-ptite-perlouze/
├── server.js                 (Point d'entrée principal)
├── database.db              (Base de données SQLite)
├── server/
│   ├── routes/             (API REST)
│   │   ├── admin.js       (Routes administrateur)
│   │   ├── contact.js     (Routes messages de contact)
│   │   ├── products.js    (Routes produits)
│   │   ├── orders.js      (Routes commandes)
│   │   └── settings.js    (Routes paramètres)
│   └── models/
│       ├── database.js    (Classe de connexion DB)
│       ├── initDatabase.js (Initialisation DB)
│       └── migrateDatabase.js
├── public/
│   ├── admin/
│   │   ├── login.html
│   │   └── dashboard.html (Interface admin)
│   └── js/
│       └── admin.js       (Logique du dashboard)
```

---

## 2. SCHÉMA DE LA BASE DE DONNÉES

### Table: contacts (Messages de contact)
```sql
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'nouveau',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Colonnes:**
- `id`: Identifiant unique
- `name`: Nom du visiteur
- `email`: Email du visiteur
- `message`: Contenu du message
- `status`: État du message ('nouveau' ou 'lu')
- `created_at`: Date/heure de création

### Table: products
```sql
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stones TEXT NOT NULL,
  colors TEXT,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Table: categories
```sql
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
)
```

### Table: stones
```sql
CREATE TABLE IF NOT EXISTS stones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
)
```

### Table: colors
```sql
CREATE TABLE IF NOT EXISTS colors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
)
```

### Table: product_stones (Relation Many-to-Many)
```sql
CREATE TABLE IF NOT EXISTS product_stones (
  product_id INTEGER NOT NULL,
  stone_id INTEGER NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (stone_id) REFERENCES stones(id)
)
```

### Table: product_colors (Relation Many-to-Many)
```sql
CREATE TABLE IF NOT EXISTS product_colors (
  product_id INTEGER NOT NULL,
  color_id INTEGER NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (color_id) REFERENCES colors(id)
)
```

### Table: product_images
```sql
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  image_path TEXT NOT NULL,
  display_order INTEGER,
  is_primary BOOLEAN DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id)
)
```

### Table: orders
```sql
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  total REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Table: order_items
```sql
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
)
```

### Table: admins
```sql
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## 3. SYSTÈME DE MESSAGES - DÉTAILS COMPLETS

### 3.1 ROUTES API POUR LES MESSAGES

**Fichier:** `/Users/gabnougue/Documents/Sites/collab/la-ptite-perlouze/server/routes/contact.js`

#### POST /api/contact (Ajouter un message)
```javascript
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  
  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  
  // Sauvegarde en base de données
  await db.run(
    'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
    [name, email, message]
  );
  
  // Envoi email via Nodemailer (optionnel)
  if (process.env.EMAIL_USER && process.env.CONTACT_EMAIL) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL,
      subject: `Nouveau message de ${name}`,
      html: `...`
    });
  }
  
  return res.json({
    success: true,
    message: 'Message envoyé avec succès'
  });
});
```

**Requête exemple:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "message": "J'aimerais des informations sur..."
}
```

#### GET /api/admin/contacts (Récupérer tous les messages - Admin)

**Fichier:** `/Users/gabnougue/Documents/Sites/collab/la-ptite-perlouze/server/routes/admin.js` (ligne 354)

```javascript
router.get('/contacts', requireAuth, async (req, res) => {
  const contacts = await db.all(
    'SELECT * FROM contacts ORDER BY created_at DESC'
  );
  res.json(contacts);
});
```

**Authentification requise:** OUI (requireAuth)

**Réponse exemple:**
```json
[
  {
    "id": 1,
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "message": "Bonjour, j'aimerais...",
    "status": "nouveau",
    "created_at": "2025-01-15 10:30:00"
  }
]
```

#### PUT /api/admin/contacts/:id/status (Marquer un message comme lu)

**Fichier:** `/Users/gabnougue/Documents/Sites/collab/la-ptite-perlouze/server/routes/admin.js` (ligne 365)

```javascript
router.put('/contacts/:id/status', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  await db.run(
    'UPDATE contacts SET status = ? WHERE id = ?',
    [status, id]
  );
  
  return res.json({
    success: true,
    message: 'Statut du message mis à jour'
  });
});
```

**Requête exemple:**
```json
{
  "status": "lu"
}
```

---

### 3.2 INTERFACE ADMIN POUR LES MESSAGES

**Fichier:** `/Users/gabnougue/Documents/Sites/collab/la-ptite-perlouze/public/admin/dashboard.html` (ligne 400-420)

#### HTML Structure
```html
<!-- Section Messages -->
<section id="contacts-section" class="section-content">
  <h2 class="section-title">Messages de contact</h2>
  <div class="card">
    <table id="contacts-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Nom</th>
          <th>Email</th>
          <th>Message</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <!-- Chargé dynamiquement par JavaScript -->
      </tbody>
    </table>
  </div>
</section>
```

#### JavaScript pour les messages

**Fichier:** `/Users/gabnougue/Documents/Sites/collab/la-ptite-perlouze/public/js/admin.js`

##### Charger les messages (ligne 711)
```javascript
async function loadContacts() {
  const response = await fetch('/api/admin/contacts');
  const contacts = await response.json();
  
  const tbody = document.querySelector('#contacts-table tbody');
  tbody.innerHTML = '';
  
  contacts.forEach(contact => {
    const row = document.createElement('tr');
    const date = new Date(contact.created_at).toLocaleDateString('fr-FR');
    
    row.innerHTML = `
      <td data-label="Date">${date}</td>
      <td data-label="Nom">${contact.name}</td>
      <td data-label="Email">${contact.email}</td>
      <td data-label="Message" style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">
        ${contact.message}
      </td>
      <td data-label="Statut">
        ${contact.status === 'nouveau'
          ? '<span class="badge badge-warning">Nouveau</span>'
          : '<span class="badge badge-success">Lu</span>'
        }
      </td>
      <td data-label="Actions">
        <button onclick="markAsRead(${contact.id})" class="btn btn-primary btn-small">
          ${contact.status === 'nouveau' ? 'Marquer lu' : 'Lu'}
        </button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}
```

##### Marquer un message comme lu (ligne 764)
```javascript
async function markAsRead(contactId) {
  const response = await fetch(`/api/admin/contacts/${contactId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'lu' })
  });
  
  const result = await response.json();
  
  if (result.success) {
    showMessage('Message marqué comme lu', 'success');
    loadContacts();
    loadStats();
  }
}
```

---

## 4. GESTION DES CATÉGORIES DANS LES PARAMÈTRES

### 4.1 ROUTES API POUR LES CATÉGORIES

**Fichier:** `/Users/gabnougue/Documents/Sites/collab/la-ptite-perlouze/server/routes/settings.js` (ligne 13-58)

#### GET /api/settings/categories (Récupérer toutes les catégories)
```javascript
router.get('/categories', async (req, res) => {
  const rows = await db.all(
    'SELECT * FROM categories ORDER BY name ASC',
    []
  );
  res.json(rows);
});
```

#### POST /api/settings/categories (Ajouter une catégorie - Admin)
```javascript
router.post('/categories', requireAdmin, async (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Le nom est requis' });
  }
  
  const result = await db.run(
    'INSERT INTO categories (name) VALUES (?)',
    [name.trim()]
  );
  
  return res.json({
    success: true,
    id: result.id,
    name: name.trim()
  });
});
```

#### DELETE /api/settings/categories/:id (Supprimer une catégorie - Admin)
```javascript
router.delete('/categories/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  await db.run('DELETE FROM categories WHERE id = ?', [id]);
  return res.json({ success: true });
});
```

### 4.2 INTERFACE ADMIN POUR LES CATÉGORIES

**Fichier:** `/Users/gabnougue/Documents/Sites/collab/la-ptite-perlouze/public/admin/dashboard.html` (ligne 498-513)

#### HTML Structure
```html
<!-- Catégories -->
<div class="card" style="margin-bottom: 2rem;">
  <h3 style="color: var(--lavande); font-family: var(--font-manuscrite); font-size: 1.5rem; margin-bottom: 1rem;">
    Catégories de bijoux
  </h3>
  <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
    <input type="text" id="new-category" placeholder="Nouvelle catégorie" 
           style="flex: 1; min-width: 200px;">
    <button onclick="addCategory()" class="btn btn-primary">Ajouter</button>
  </div>
  
  <p style="color: var(--texte-secondaire); font-size: 0.9rem; margin-bottom: 0.5rem;">
    <strong>Catégories existantes :</strong>
  </p>
  <div id="categories-list" style="display: flex; flex-wrap: wrap; gap: 0.5rem; 
       min-height: 50px; padding: 1rem; background: var(--fond-secondaire); border-radius: 10px;">
    <span style="color: var(--texte-secondaire); font-style: italic;">Chargement...</span>
  </div>
</div>
```

### 4.3 JAVASCRIPT POUR LES CATÉGORIES

**Fichier:** `/Users/gabnougue/Documents/Sites/collab/la-ptite-perlouze/public/js/admin.js` (ligne 817-891)

#### Charger les catégories (ligne 818)
```javascript
async function loadCategories() {
  const response = await fetch('/api/settings/categories');
  const categories = await response.json();
  
  const container = document.getElementById('categories-list');
  container.innerHTML = categories.map(cat => `
    <span class="badge badge-info" 
          style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;">
      ${cat.name}
      <button onclick="deleteCategory(${cat.id})" 
              style="background: none; border: none; cursor: pointer; color: white; 
                     font-size: 1.2rem; line-height: 1;">
        ×
      </button>
    </span>
  `).join('');
}
```

#### Ajouter une catégorie (ligne 836)
```javascript
async function addCategory() {
  const input = document.getElementById('new-category');
  const name = input.value.trim();
  
  if (!name) {
    showMessage('Veuillez entrer un nom', 'error');
    return;
  }
  
  const response = await fetch('/api/settings/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  
  const result = await response.json();
  
  if (result.success) {
    showMessage('Catégorie ajoutée', 'success');
    input.value = '';
    loadCategories();
  } else {
    showMessage(result.error || 'Erreur lors de l\'ajout', 'error');
  }
}
```

#### Supprimer une catégorie (ligne 868)
```javascript
async function deleteCategory(id) {
  const confirmed = await showConfirm(
    'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
    'Supprimer la catégorie'
  );
  
  if (!confirmed) return;
  
  const response = await fetch(`/api/settings/categories/${id}`, {
    method: 'DELETE'
  });
  
  const result = await response.json();
  
  if (result.success) {
    showMessage('Catégorie supprimée', 'success');
    loadCategories();
  }
}
```

---

## 5. AUTRES PARAMÈTRES GÉRÉS (Pierres et Couleurs)

Le système fonctionne de manière identique pour:

### Pierres
- **Route API:** `/api/settings/stones`
- **Méthodes:** GET, POST (requireAdmin), DELETE (requireAdmin)
- **Table DB:** `stones`
- **HTML:** Section "Pierres naturelles" (ligne 515-530)
- **JS:** `loadStones()`, `addStone()`, `deleteStone()`

### Couleurs
- **Route API:** `/api/settings/colors`
- **Méthodes:** GET, POST (requireAdmin), DELETE (requireAdmin)
- **Table DB:** `colors`
- **HTML:** Section "Couleurs" (ligne 532-547)
- **JS:** `loadColors()`, `addColor()`, `deleteColor()`

---

## 6. FLUX COMPLET D'UN MESSAGE DE CONTACT

### Côté Client
1. Utilisateur remplit le formulaire contact
2. JavaScript envoie POST `/api/contact` avec `{name, email, message}`
3. Message stocké en DB avec `status = 'nouveau'`
4. Email optionnel envoyé à l'admin

### Côté Admin
1. Admin se connecte au dashboard
2. Section "Messages" affiche tous les messages
3. Admin peut voir:
   - Date du message
   - Nom et email de l'expéditeur
   - Contenu du message
   - Statut (Nouveau/Lu)
4. Admin clique "Marquer lu"
5. JS envoie PUT `/api/admin/contacts/:id/status` avec `{status: 'lu'}`
6. Le statut du message change visuellement

---

## 7. SÉCURITÉ

### Authentification
- Session-based avec Express.js
- Middleware `requireAuth` sur les routes admin
- Password hashé avec bcrypt

### Middleware de Protection
```javascript
function requireAuth(req, res, next) {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  next();
}
```

### Variables d'environnement requises
- `ADMIN_USERNAME`: Utilisateur admin
- `ADMIN_PASSWORD`: Mot de passe admin
- `EMAIL_HOST`: Serveur SMTP
- `EMAIL_PORT`: Port SMTP
- `EMAIL_USER`: Email expéditeur
- `EMAIL_PASSWORD`: Mot de passe email
- `CONTACT_EMAIL`: Email destinataire des messages
- `SESSION_SECRET`: Clé de session

---

## 8. POINTS CLÉS À RETENIR

| Aspect | Détail |
|--------|--------|
| **Base de données** | SQLite (database.db) |
| **ORM** | Aucun (SQL brut + promesses) |
| **Système de messages** | Table `contacts` avec statuts |
| **Catégories** | Table `categories` (CRUD complet) |
| **Authentification** | Session Express + bcrypt |
| **Frontend admin** | Dashboard single-page en HTML/JS |
| **API REST** | Endpoints JSON avec authentification |
| **Email** | Nodemailer (optionnel) |
| **Images produits** | Table `product_images` avec ordre et primaire |

---

## 9. FICHIERS CLÉS

| Fichier | Rôle |
|---------|------|
| `/server/routes/contact.js` | Routes messages de contact |
| `/server/routes/admin.js` | Routes admin (messages, contacts, stats) |
| `/server/routes/settings.js` | Routes paramètres (catégories, pierres, couleurs) |
| `/public/admin/dashboard.html` | Interface admin (structure HTML) |
| `/public/js/admin.js` | Logique admin (CRUD, affichage) |
| `/server/models/database.js` | Classe de connexion SQLite |
| `/server/models/initDatabase.js` | Initialisation DB au premier lancement |

