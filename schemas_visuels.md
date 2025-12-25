# DIAGRAMMES ET SCHÉMAS VISUELS

## 1. FLUX DE TRAITEMENT D'UN MESSAGE DE CONTACT

```
┌─────────────────────────────────────────────────────────────────────┐
│                      VISITEUR DU SITE                               │
│                     (Page Contact)                                   │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     │ Remplit formulaire
                     │ (Nom, Email, Message)
                     ▼
          ┌──────────────────────┐
          │  Clique "Envoyer"    │
          └──────────┬───────────┘
                     │
                     │ POST /api/contact
                     │ {name, email, message}
                     ▼
         ┌───────────────────────────┐
         │  Server Node.js           │
         │  (routes/contact.js)      │
         │                           │
         │  Validation des données   │
         │  Insertion en DB          │
         └──────────┬────────────────┘
                    │
         ┌──────────▼──────────┬─────────────┐
         │                     │             │
    Stocké en DB       Envoi email        Réponse JSON
    (contacts table)   (Nodemailer)       {success: true}
         │                 │                  │
         │                 │                  ▼
         │                 │            Utilisateur voit
         │                 │            message de succès
         │                 │
         │          Admin reçoit email
         │
         ▼
    ┌──────────────────────────────┐
    │  DASHBOARD ADMIN             │
    │  - Se connecte               │
    │  - Va à "Messages"           │
    │  - Voit le nouveau message   │
    │  - Clique "Marquer lu"       │
    └──────────┬───────────────────┘
                │
                │ PUT /api/admin/contacts/:id/status
                │ {status: 'lu'}
                ▼
         ┌──────────────────┐
         │  DB Mise à jour  │
         │  status = 'lu'   │
         └──────────────────┘
```

---

## 2. ARCHITECTURE DES TABLES (RELATIONS)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CONTACTS                                 │
├──────────┬────────┬────────┬──────────┬────────┬────────────────┤
│ id (PK)  │ name   │ email  │ message  │ status │ created_at     │
├──────────┼────────┼────────┼──────────┼────────┼────────────────┤
│ 1        │ Jean   │ j@...  │ Bonjour. │ nouveau│ 2025-01-15...  │
│ 2        │ Marie  │ m@...  │ Question │ lu     │ 2025-01-14...  │
└──────────┴────────┴────────┴──────────┴────────┴────────────────┘

        ┌─────────────────────────────────────────────┐
        │           PRODUCTS (Catalogue)              │
        ├──────────┬──────────┬────────┬──────┬──────┤
        │ id (PK)  │ name     │ price  │stock│...   │
        └──────────┴──────────┴────────┴──────┴──────┘
                │         │
                │         │
    ┌───────────▼──┐  ┌──▼──────────────┐
    │ CATEGORIES   │  │ PRODUCT_STONES  │
    │ ┌──────────┐ │  │ ┌────────────┐  │
    │ │ Bracelets│ │  │ │product_id ─┼──┼→ Products
    │ │ Colliers │ │  │ │stone_id  ──┼──┼→ Stones
    │ │ Boucles..│ │  │ └────────────┘  │
    │ └──────────┘ │  │                  │
    └───────────────┘  └──────────────────┘

    ┌──────────────────┐  ┌──────────────────────┐
    │ STONES           │  │ PRODUCT_COLORS       │
    │ ┌────────────┐  │  │ ┌──────────────────┐ │
    │ │Améthyste   │  │  │ │product_id ────┐  │ │
    │ │Quartz rose │  │  │ │color_id ───┐   │  │ │
    │ │Agate verte │  │  │ │            ▼   ▼  │ │
    │ └────────────┘  │  │ └─────────────────────┘
    └──────────────────┘           │
                                   ▼
                            ┌──────────────┐
                            │ COLORS       │
                            │ ┌──────────┐│
                            │ │Rose      ││
                            │ │Bleu      ││
                            │ │Vert      ││
                            │ └──────────┘│
                            └──────────────┘

┌────────────────────────────┐
│ PRODUCT_IMAGES             │
├──────────┬─────────┬────────┤
│product_id│image_..│display_│
│display...│is_prim │        │
├──────────┼─────────┼────────┤
│ 1        │img1.jpg│ 0 (★)  │
│ 1        │img2.jpg│ 1      │
│ 2        │img3.jpg│ 0 (★)  │
└──────────┴─────────┴────────┘
```

---

## 3. FLUX DU DASHBOARD ADMIN

```
┌────────────────────────────────────────────────┐
│         LOGIN ADMIN (/admin)                   │
│    - Username/Password                         │
│    - Authentification bcrypt                   │
└────────────┬─────────────────────────────────┘
             │
             │ Succès
             ▼
    ┌────────────────────────┐
    │ DASHBOARD (/admin/...)│
    │                        │
    │ Navigation:            │
    │ • Statistiques         │
    │ • Produits             │
    │ • Commandes            │
    │ • Messages             │
    │ • Paramètres           │
    └────────────┬───────────┘
                 │
        ┌────────┴───────┬──────────┬──────────┬──────────┐
        │                │          │          │          │
        ▼                ▼          ▼          ▼          ▼
    STATS         PRODUITS     COMMANDES    MESSAGES   PARAMÈTRES
    ────────      ────────────  ──────────  ────────   ──────────
    • Total      • Liste       • Liste     • Tous les  • Catégories
      produits     CRUD         CRUD         messages   • Pierres
    • Commandes  • Upload                  • Marquer   • Couleurs
    • Revenus      images        • Statut    lu        • Thème
    • Messages                     dropdown  • Voir
      non lus                                détails
```

---

## 4. FLUX DE GESTION DES PARAMÈTRES (EXEMPLE: CATÉGORIES)

```
INTERFACE ADMIN
┌────────────────────────────────────────────────────────┐
│            Paramètres - Catégories                     │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │ Nouvelle catégorie: [Texte input]  [Ajouter]│   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│  Catégories existantes:                              │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────┐   │
│  │ Bracelets ×│ │ Colliers ×   │ │Boucles ×   │   │
│  └─────────────┘ └──────────────┘ └────────────┘   │
│  ┌────────────┐ ┌──────────────┐                    │
│  │ Bagues × │ │ Mala ×       │                    │
│  └────────────┘ └──────────────┘                    │
└────────────────────────────────────────────────────────┘
         │                    │
         │                    │ Clique sur ×
         │                    │ (Supprimer)
         │                    ▼
         │          DELETE /api/settings/categories/:id
         │          {requireAdmin}
         │                    │
         │ Tape nom +         │
         │ Clique Ajouter     │
         │                    │
         ▼                    ▼
    POST /api/settings/categories    UPDATE DB
    {name: "Pendentifs"}             DELETE FROM categories
    {requireAdmin}                   WHERE id = 5
         │                    │
         ▼                    ▼
    ┌─────────────────────────────────┐
    │  DATABASE (SQLite)              │
    │                                 │
    │  categories table:              │
    │  ┌────┬─────────────┐          │
    │  │ id │ name        │          │
    │  ├────┼─────────────┤          │
    │  │ 1  │ Bracelets   │          │
    │  │ 2  │ Colliers    │          │
    │  │ 3  │ Boucles     │   (Après update)
    │  │ 4  │ Bagues      │   id=5 supprimé
    │  │ 5  │ Mala ------→ Suppression
    │  │ 6  │ Pendentifs  │ (nouveau)
    │  └────┴─────────────┘          │
    └─────────────────────────────────┘
         │
         └─────→ loadCategories()
              (rechargement de la liste)
```

---

## 5. STRUCTURE DE RÉPONSE API

### Messages - GET /api/admin/contacts
```javascript
[
  {
    "id": 1,
    "name": "Sophie Martin",
    "email": "sophie@example.com",
    "message": "Bonjour, j'aimerais des informations sur vos bracelets...",
    "status": "nouveau",
    "created_at": "2025-01-15 14:32:00"
  },
  {
    "id": 2,
    "name": "Pierre Leclerc",
    "email": "pierre@example.com",
    "message": "Question concernant les délais de livraison",
    "status": "lu",
    "created_at": "2025-01-14 09:15:00"
  }
]
```

### Catégories - GET /api/settings/categories
```javascript
[
  {"id": 1, "name": "Bracelets"},
  {"id": 2, "name": "Colliers"},
  {"id": 3, "name": "Boucles d'oreilles"},
  {"id": 4, "name": "Bagues"},
  {"id": 5, "name": "Mala"},
  {"id": 6, "name": "Pendentifs"}
]
```

### Produit enrichi - GET /api/admin/products/:id
```javascript
{
  "id": 1,
  "name": "Bracelet Sérénité",
  "category": "Bracelets",
  "description": "Un bracelet délicat...",
  "price": 25.00,
  "stock": 5,
  "image": "bracelet-serenite.jpg",
  "stones": "Améthyste, Quartz rose",
  "colors": "Violet, Rose",
  
  // Données enrichies
  "stone_ids": [1, 3],
  "stone_names": ["Améthyste", "Quartz rose"],
  "color_ids": [4, 5],
  "color_names": ["Violet", "Rose"],
  
  "images": [
    {
      "id": 15,
      "product_id": 1,
      "image_path": "1234567890-img1.jpg",
      "display_order": 0,
      "is_primary": 1
    },
    {
      "id": 16,
      "product_id": 1,
      "image_path": "1234567891-img2.jpg",
      "display_order": 1,
      "is_primary": 0
    }
  ]
}
```

---

## 6. CYCLE DE VIE D'UNE REQUÊTE ADMIN

```
┌──────────────────────────────────────────────────────────────┐
│  REQUÊTE AUTHENTIFIÉE AU DASHBOARD                           │
└──────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ GET /admin/dashboard                    │
│ (Express sert le fichier HTML)          │
└──────────┬──────────────────────────────┘
           │
           ▼ (Navigateur charge HTML + JS)
┌─────────────────────────────────────────┐
│ DOMContentLoaded                        │
│                                         │
│ 1. checkAuth()                          │
│    → GET /api/admin/check-auth          │
│    → Redirige si pas auth               │
│                                         │
│ 2. loadStats()                          │
│    → GET /api/admin/stats               │
│    → Affiche cartes statistiques        │
│                                         │
│ 3. loadProducts()                       │
│    → GET /api/admin/products            │
│    → Remplit tableau produits           │
│                                         │
│ 4. loadCurrentTheme()                   │
│    → GET /api/settings/theme            │
│    → Applique le thème                  │
│                                         │
│ 5. Event listeners                      │
│    → Clics boutons                      │
│    → Soumissions formulaires            │
└──────────┬───────────────────────────────┘
           │
           │ Admin interagit
           │
           ▼
┌──────────────────────────────┐
│ Exemple: Admin clique        │
│ "Marquer lu" sur un message  │
└──────────┬───────────────────┘
           │
           │ Event listener déclenché
           │ markAsRead(contactId)
           │
           ▼
┌─────────────────────────────────────┐
│ fetch(`/api/admin/contacts/:id/...`)│
│ method: PUT                         │
│ body: {status: 'lu'}                │
├─────────────────────────────────────┤
│ Header d'authentification implicite:│
│ Cookie de session inclus            │
└──────────┬──────────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Server Express (requireAuth)     │
│                                  │
│ 1. Valide session (Cookie)       │
│ 2. Si non auth → 401             │
│ 3. UPDATE DB                     │
│ 4. Retourne {success: true}      │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Client JavaScript                │
│ - Affiche message "Succès"       │
│ - Recharge loadContacts()        │
│ - Recharge loadStats()           │
│ - Table se rafraîchit            │
└──────────────────────────────────┘
```

---

## 7. COMPARAISON: TABLES PRINCIPALES

```
Tableau comparatif des tables de gestion:

╔════════════╦═══════════╦═══════════╦════════════════╗
║ Table      ║ CRUD API  ║ Protection║ Cas d'usage    ║
╠════════════╬═══════════╬═══════════╬════════════════╣
║ contacts   ║ POST (pub)║ Non       ║ Formulaire     ║
║            ║ GET (ad)  ║ Admin     ║ contact public ║
║            ║ PUT (ad)  ║           ║ ou visiteurs   ║
╠════════════╬═══════════╬═══════════╬════════════════╣
║categories  ║ GET (pub) ║ Non       ║ Sélectionnée  ║
║stones      ║ POST (ad) ║ Admin     ║ lors ajout     ║
║colors      ║ DELETE(ad)║           ║ produit        ║
╠════════════╬═══════════╬═══════════╬════════════════╣
║ products   ║ FULL CRUD ║ Admin     ║ Gestion stock  ║
║            ║ (sauf GET)║ pour CUD  ║ catalogue      ║
╠════════════╬═══════════╬═══════════╬════════════════╣
║ orders     ║ POST (pub)║ Admin     ║ Paiements      ║
║            ║ GET (ad)  ║ pour GET  ║ clients        ║
║            ║ PUT (ad)  ║           ║                ║
╚════════════╩═══════════╩═══════════╩════════════════╝
```

