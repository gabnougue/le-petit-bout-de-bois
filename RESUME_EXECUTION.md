# RESUME D'EXECUTION - Analyse "la-ptite-perlouze"

## Fichiers créés et disponibles

Deux documents complets ont été générés :

### 1. **analyse_la_ptite_perlouze.md** (16 KB)
   - Architecture générale du projet
   - Schéma complet de la base de données (11 tables)
   - Système de messages (routes, base de données, interface admin)
   - Gestion des catégories dans les paramètres
   - Flux complet d'un message de contact
   - Sécurité et authentification
   - Points clés à retenir
   - Fichiers clés du projet

### 2. **schemas_visuels.md** (20 KB)
   - Flux de traitement d'un message de contact (diagramme ASCII)
   - Architecture des tables et relations
   - Flux du dashboard admin
   - Flux de gestion des paramètres (exemple catégories)
   - Structures de réponses API JSON
   - Cycle de vie d'une requête admin
   - Tableau comparatif des tables principales

---

## POINTS CLÉS RETIRÉS

### Système de Messages

**Routes API:**
- `POST /api/contact` - Visiteur envoie un message
- `GET /api/admin/contacts` - Admin récupère tous les messages
- `PUT /api/admin/contacts/:id/status` - Admin marque comme lu

**Schéma table "contacts":**
```
id | name | email | message | status | created_at
```
- Statuts possibles: 'nouveau' ou 'lu'
- Messages triés par date décroissante

**Interface Admin:**
- Section "Messages" dans le dashboard
- Tableau affichant tous les messages
- Colonnnes: Date, Nom, Email, Message, Statut, Actions
- Bouton "Marquer lu" pour changer le statut
- Badge visuel pour distinguer nouveau/lu

**Flux complet:**
1. Visiteur soumet formulaire contact → DB + Email optionnel
2. Admin voit message avec statut "nouveau"
3. Admin clique "Marquer lu" → Mise à jour DB + Rafraîchissement

---

### Gestion des Catégories

**Routes API:**
- `GET /api/settings/categories` - Récupérer toutes les catégories
- `POST /api/settings/categories` - Ajouter une catégorie (Admin)
- `DELETE /api/settings/categories/:id` - Supprimer une catégorie (Admin)

**Schéma table "categories":**
```
id | name (UNIQUE)
```

**Interface Admin:**
- Section "Paramètres" → "Catégories de bijoux"
- Input text + bouton "Ajouter"
- Affichage en badges avec bouton × pour supprimer
- Même logique pour Pierres et Couleurs

**Flux:**
```
Input texte → "Ajouter" → POST API → DB update → Rechargement liste
   OU
Badge "Catégorie ×" → DELETE API → DB delete → Rechargement liste
```

**Code JavaScript clé:**
```javascript
loadCategories()     // Charge et affiche la liste
addCategory()        // POST /api/settings/categories
deleteCategory(id)   // DELETE /api/settings/categories/:id
```

---

## TABLES BASE DE DONNÉES

**Nombre total:** 11 tables

| Table | Colonnes principales | Rôle |
|-------|----------------------|------|
| **contacts** | id, name, email, message, status, created_at | Messages de visiteurs |
| **categories** | id, name | Catégories de bijoux |
| **products** | id, name, category, description, price, stock, image | Catalogue |
| **product_images** | id, product_id, image_path, display_order, is_primary | Images avec ordre |
| **stones** | id, name | Pierres naturelles |
| **colors** | id, name | Couleurs disponibles |
| **product_stones** | product_id, stone_id | Relation many-to-many |
| **product_colors** | product_id, color_id | Relation many-to-many |
| **orders** | id, customer_*, total, status, stripe_payment_id | Commandes |
| **order_items** | id, order_id, product_id, quantity, price | Items de commandes |
| **admins** | id, username, password (bcrypt) | Administrateurs |

---

## AUTHENTIFICATION & SÉCURITÉ

**Méthode:** Session-based (Express.js)
**Middleware:** `requireAuth` et `requireAdmin`
**Mot de passe:** Hashé avec bcrypt (10 rounds)

**Variables d'environnement critiques:**
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=***
CONTACT_EMAIL=admin@example.com
SESSION_SECRET=your-secret-key
```

---

## FICHIERS SOURCE CLÉS

```
server/
├── routes/
│   ├── contact.js         ← POST /api/contact
│   ├── admin.js           ← GET /api/admin/contacts, PUT status
│   └── settings.js        ← GET/POST/DELETE /api/settings/categories
└── models/
    └── database.js        ← Classe SQLite avec promesses

public/
├── admin/
│   ├── login.html         ← Page de connexion
│   └── dashboard.html     ← Interface admin (HTML structure)
└── js/
    └── admin.js           ← Logique CRUD (1238 lignes)
```

**Lignes importantes dans admin.js:**
- `loadContacts()` : ligne 711
- `markAsRead()` : ligne 764
- `loadCategories()` : ligne 818
- `addCategory()` : ligne 836
- `deleteCategory()` : ligne 868

---

## APPELS API PRINCIPAUX

### Messages
```bash
# Ajouter un message (public)
POST /api/contact
{"name": "Jean", "email": "jean@ex.com", "message": "..."}

# Récupérer les messages (admin)
GET /api/admin/contacts

# Marquer comme lu (admin)
PUT /api/admin/contacts/1/status
{"status": "lu"}
```

### Catégories
```bash
# Récupérer
GET /api/settings/categories

# Ajouter (admin)
POST /api/settings/categories
{"name": "Pendentifs"}

# Supprimer (admin)
DELETE /api/settings/categories/5
```

---

## POINTS IMPORTANTS À RETENIR

1. **Messages** : Table simple avec 5 colonnes, statut 'nouveau'/'lu'
2. **Catégories** : Référencées dans le formulaire produit
3. **Authentification** : Session + requête check-auth au démarrage
4. **Rafraîchissement** : Manuel après chaque action (pas WebSocket)
5. **Interface** : Single-page app, pas de rechargement de page
6. **Images produits** : Table séparée avec ordre et image primaire
7. **Relations** : Tables de jointure pour stones et colors (many-to-many)
8. **Middleware** : `requireAuth` sur toutes les routes admin (sauf login)
9. **Email** : Optionnel (vérifie variables d'env)
10. **Statut produit** : Stocké en BD (confirmée, expédiée, livrée, etc.)

---

## RÉSUMÉ RAPIDE

**Système de messages:** 
- Public envoie → Table contacts → Admin gère avec statut

**Gestion catégories:**
- Admin ajoute/supprime via interface → API → DB → Affichage

**Architecture:**
- Express.js + SQLite + Vanilla JS
- No ORM, pas de framework frontend (HTML/CSS/JS pur)
- Session-based auth, bcrypt pour passwords

---

## FICHIERS CRÉÉS

```
/Users/gabnougue/Documents/Sites/collab/le-petit-bout-de-bois/
├── analyse_la_ptite_perlouze.md     (Documentation complète)
└── schemas_visuels.md               (Diagrammes et flux)
```

Consultez ces fichiers pour :
- Voir les schémas SQL complets
- Comprendre les flux d'exécution
- Retrouver les numéros de ligne exact dans le code
- Avoir les exemples de requêtes/réponses API
- Voir les diagrammes ASCII des relations

---

**Date d'analyse:** 9 novembre 2025
**Projet analysé:** la-ptite-perlouze (Boutique de bijoux avec gestion admin)
