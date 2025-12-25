# 🔗 Intégration avec La p'tite perlouze

Guide pour relier les deux sites et créer un écosystème harmonieux.

---

## 🌟 Vue d'ensemble

**Le petit bout de bois** et **La p'tite perlouze** sont deux sites jumeaux qui se complètent :
- 🪵 **Le petit bout de bois** : créations en bois (jeux, accessoires)
- ✨ **La p'tite perlouze** : bijoux en pierres naturelles

Certains produits combinent les deux univers (bijoux bois & pierres).

---

## 🎨 Portail visuel

### Position
En haut à droite de chaque site, un portail circulaire animé permet de basculer entre les deux univers.

### Design
- **Sur Le petit bout de bois** :
  - Portail avec effet de "fente dans le bois"
  - Aperçu de l'univers pierres (couleurs violettes/magentas)
  - Label : "Pierres ✨"

- **Sur La p'tite perlouze** :
  - Portail avec effet de "déchirure magique"
  - Aperçu de l'univers bois (couleurs brunes/naturelles)
  - Label : "Bois 🪵"

### Code du portail (à ajouter sur La p'tite perlouze)

```html
<!-- Dans le HTML -->
<div class="portal-container">
  <div class="wood-portal" onclick="goToBois()">
    <div class="wood-peek"></div>
  </div>
  <div class="portal-label">Bois 🪵</div>
</div>

<script>
function goToBois() {
  window.location.href = 'http://localhost:3001';
}
</script>
```

```css
/* Dans le CSS */
.portal-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  width: 120px;
  height: 120px;
}

.wood-portal {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.wood-portal:hover {
  transform: scale(1.1);
}

.wood-peek {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #D4A574 0%, #8B5A3C 100%);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(74, 44, 31, 0.25);
  animation: pulse-glow 3s ease-in-out infinite;
}

.wood-peek::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
  background: radial-gradient(circle, #8B5A3C 0%, #4A2C1F 100%);
  border-radius: 50%;
  opacity: 0.7;
}

.wood-peek::after {
  content: '→';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  z-index: 1;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 6px 24px rgba(74, 44, 31, 0.25), 0 0 15px rgba(139, 90, 60, 0.3);
  }
  50% {
    box-shadow: 0 6px 24px rgba(74, 44, 31, 0.25), 0 0 25px rgba(139, 90, 60, 0.5);
  }
}
```

---

## 🔗 Liens croisés entre produits

### Principe
Les produits peuvent avoir des liens vers des produits complémentaires sur l'autre site.

### Exemples de liens logiques

#### Depuis Le petit bout de bois → La p'tite perlouze
1. **Porte-bracelet en bois** → Catégorie bracelets
   ```
   http://localhost:3000/catalogue?category=Bracelets
   ```

2. **Porte-lunettes** → Chaînes de lunettes (si disponible)
   ```
   http://localhost:3000/catalogue?search=lunettes
   ```

3. **Bracelet mixte bois/améthyste** → Bracelet améthyste pur
   ```
   http://localhost:3000/produit/5
   ```

#### Depuis La p'tite perlouze → Le petit bout de bois
1. **Bracelet en améthyste** → Porte-bracelet assorti
   ```
   http://localhost:3001/catalogue?category=Accessoires
   ```

2. **Collier** → Support pour collier (si disponible)
   ```
   http://localhost:3001/catalogue?search=porte-collier
   ```

### Ajout de liens dans l'admin

1. Se connecter à l'admin du site
2. Modifier un produit
3. Remplir le champ "Lien vers La p'tite perlouze" (ou "Lien vers Le petit bout de bois")
4. Enregistrer

Le lien apparaîtra automatiquement sur la fiche produit :
```html
✨ Voir les bijoux assortis sur La p'tite perlouze →
```

---

## ⚙️ Configuration technique

### Variables d'environnement

**Dans `.env` de Le petit bout de bois :**
```env
PERLOUZE_URL=http://localhost:3000
```

**Dans `.env` de La p'tite perlouze :**
```env
BOIS_URL=http://localhost:3001
```

### Ports par défaut
- 🪵 Le petit bout de bois : **3001**
- ✨ La p'tite perlouze : **3000**

---

## 📱 Messages croisés

### Sur Le petit bout de bois

Section "Univers jumeau" sur la page d'accueil :
```html
<section class="twin-universe">
  <h2>✨ Découvrez aussi La p'tite perlouze</h2>
  <p>L'univers complémentaire des bijoux en pierres naturelles...</p>
  <a href="http://localhost:3000">Visiter La p'tite perlouze →</a>
</section>
```

### Sur La p'tite perlouze

Section similaire à ajouter :
```html
<section class="twin-universe">
  <h2>🪵 Découvrez aussi Le petit bout de bois</h2>
  <p>Créations artisanales en bois qui s'harmonisent avec nos bijoux...</p>
  <a href="http://localhost:3001">Visiter Le petit bout de bois →</a>
</section>
```

---

## 🎁 Produits mixtes (bois + pierres)

### Catégorie spéciale
Sur les deux sites, créer la catégorie :
- **"Bijoux bois & pierres"** ou **"Créations mixtes"**

### Base de données
Ajouter un champ `sister_product_id` pour lier directement deux produits :

```sql
ALTER TABLE products ADD COLUMN sister_product_id INTEGER;
ALTER TABLE products ADD COLUMN sister_site TEXT; -- 'perlouze' ou 'bois'
```

### Synchronisation (optionnel)
Pour des créations vraiment liées, on peut imaginer :
- Une API partagée pour les produits mixtes
- Un script de synchronisation
- Une base de données commune pour ces produits

---

## 🚀 Déploiement des deux sites

### Sur le même serveur
```nginx
# Configuration Nginx
server {
  listen 80;
  server_name boutique.example.com;

  location /bois/ {
    proxy_pass http://localhost:3001/;
  }

  location / {
    proxy_pass http://localhost:3000/;
  }
}
```

### Sur des sous-domaines
- **bois.example.com** → Le petit bout de bois
- **pierres.example.com** → La p'tite perlouze

Adapter les URLs dans les `.env` respectifs.

---

## 📊 Statistiques communes (optionnel)

### Dashboard unifié
Créer une page admin qui agrège les stats des deux sites :

```javascript
// Exemple d'API partagée
async function getGlobalStats() {
  const boisStats = await fetch('http://localhost:3001/api/admin/stats');
  const perlouzeStats = await fetch('http://localhost:3000/api/admin/stats');

  return {
    totalProducts: boisStats.totalProducts + perlouzeStats.totalProducts,
    totalRevenue: boisStats.totalRevenue + perlouzeStats.totalRevenue,
    // ...
  };
}
```

---

## 🎨 Animations de transition

### Effet de morphing (avancé)
Pour une transition encore plus fluide entre les deux sites :

```css
/* Animation de transition */
@keyframes morphToWood {
  0% {
    background: linear-gradient(135deg, #E8B4F8, #9333EA);
  }
  100% {
    background: linear-gradient(135deg, #D4A574, #8B5A3C);
  }
}

@keyframes morphToStone {
  0% {
    background: linear-gradient(135deg, #D4A574, #8B5A3C);
  }
  100% {
    background: linear-gradient(135deg, #E8B4F8, #9333EA);
  }
}
```

---

## ✅ Checklist d'intégration

- [ ] Les deux sites tournent en parallèle
- [ ] Le portail est visible et fonctionnel sur les deux
- [ ] Les URLs sont correctement configurées dans `.env`
- [ ] Au moins 3 liens croisés ont été ajoutés
- [ ] La section "univers jumeau" est présente sur les accueils
- [ ] Les produits mixtes sont bien catégorisés
- [ ] Les animations de transition fonctionnent
- [ ] Les deux sites sont responsive
- [ ] Test de navigation entre les deux sites

---

## 🤝 Communication entre Jean-Michel et Yvonne

### Partage des fichiers
Créer un dossier partagé :
```
/shared/
  ├── images/          # Photos des créations mixtes
  ├── themes/          # Thèmes saisonniers
  └── docs/            # Documentation commune
```

### Synchronisation des commandes
Pour les produits mixtes, notifier les deux artisans :
```javascript
// Dans routes/orders.js
if (order.items.some(item => item.category === 'Bijoux bois & pierres')) {
  // Envoyer email aux deux artisans
  sendEmail('jean-michel@bois.fr', orderDetails);
  sendEmail('yvonne@perlouze.fr', orderDetails);
}
```

---

## 🌐 En production

### Checklist finale
- [ ] Utiliser HTTPS sur les deux sites
- [ ] Configurer les CORS si nécessaire
- [ ] Vérifier les URLs de production dans `.env`
- [ ] Tester tous les liens croisés
- [ ] Optimiser les images
- [ ] Configurer le cache
- [ ] Surveiller les logs des deux sites

---

**Ensemble, créons une expérience unique ! 🪵✨**
