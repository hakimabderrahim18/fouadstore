# Frères Zeboudj - محل الإخوة زبوج 🚗🛢️
### Boutique en ligne spécialisée en Huiles Moteur & Accessoires Automobiles
*(Pour le marché algérien : Paiement à la livraison, 58 Wilayas, confirmation WhatsApp)*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hakimabderrahim18/fouadstore)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/hakimabderrahim18/fouadstore)

---

## 🚀 Fonctionnalités Clés

### 1. Page d'Accueil (`/`) – Boutique Directe
- **Sans fioritures** : Accès direct au catalogue de produits sans bannières publicitaires ni carrousels encombrants.
- **Header épuré avec Logo officiel** : Nom du magasin en français/arabe, bouton d'appel direct, sélecteur de langue **FR / العربية** (support **RTL** complet), et panier avec compteur en direct.
- **Barre de recherche instantanée** : Recherche multi-critères (nom, marque, catégorie, description).
- **Grille 100% responsive** :
  - `2 colonnes` sur mobile
  - `3 colonnes` sur tablette
  - `4 colonnes` sur ordinateur
- **Cartes produits complètes** : Prix en Dinars Algériens (**DA**), prix promotionnels barrés avec pourcentage de remise, badge **« Rupture de stock »** si stock = 0, et bouton d'ajout au panier avec confirmation visuelle immédiate.
- **Bouton « Voir plus de produits »** pour le chargement fluide de la suite du catalogue.

### 2. Page Produit (`/produit/:id`)
- Galerie de photos haute définition avec miniatures cliquables.
- Description technique complète et spécifications.
- Choix des variantes (tailles/volumes : 5L, 4L, 1L et couleurs/culots : H7, H4, etc.).
- Compteur de quantité dynamique (+ / -) avec calcul du total en temps réel.
- Boutons d'action : « Ajouter au panier » et « Acheter maintenant » (redirection directe vers le checkout).

### 3. Panier Interactif & Sauvegardé
- Tiroir latéral (Drawer) qui s'ouvre au clic ou lors d'un ajout sans quitter la page.
- Modification des quantités en temps réel et suppression d'articles.
- Sauvegarde automatique dans le `localStorage` du client.
- Page panier dédiée accessible sur `/panier`.

### 4. Checkout Algérie 58 Wilayas (`/checkout`)
- Formulaire client simplifié : Nom complet, téléphone (vérification format algérien 05/06/07...), wilaya, commune avec suggestions automatiques, adresse exacte et note optionnelle pour le livreur.
- Choix du mode de livraison :
  - 🏠 **Livraison à domicile** (tarif calculé par wilaya)
  - 🏢 **Livraison au bureau / Stop Desk** (tarif économique calculé par wilaya)
- Total général en DA calculé en direct.

### 5. Enregistrement MongoDB & Redirection WhatsApp
- Enregistrement immédiat de la commande dans MongoDB avec statut `"en attente"`.
- Génération d'un numéro de commande unique (ex: `FS-261031-XXXX`).
- Redirection automatique vers **WhatsApp (`wa.me`)** sur le numéro **`0555 46 07 70`** avec message complet pré-rempli (articles, quantités, variantes, coordonnées du client, mode de livraison et total à payer).
- Page de confirmation (`/confirmation/:id`) avec récapitulatif et bouton de relance WhatsApp en 1 clic.

### 6. Espace d'Administration Sécurisé (`/admin`)
- **Accès protégé** par mot de passe (**`fouad97`**) via middleware Next.js et cookies `httpOnly`.
- **Tableau de bord** : Inventaire total, alertes de rupture (stock = 0), alertes de stock faible ($\le 5$), et aperçu rapide.
- **Gestion des Produits (`/admin/produits`)** :
  - Ajout de nouveau produit avec variantes et photos.
  - Modification complète des prix, remises, descriptions et catégories.
  - Ajustement rapide du stock en direct (+ / -) directement depuis le tableau.
  - Suppression sécurisée avec confirmation.

---

## ☁️ Guide de Déploiement Cloud

### 1. Déploiement sur VERCEL (Recommandé pour Next.js)

1. Connectez-vous sur [vercel.com](https://vercel.com) (avec votre compte GitHub).
2. Cliquez sur **"Add New..."** -> **"Project"**.
3. Importez le dépôt **`hakimabderrahim18/fouadstore`**.
4. Dans **Environment Variables**, ajoutez les variables suivantes :

| Variable | Valeur |
| :--- | :--- |
| `MONGODB_URI` | Votre URL MongoDB Atlas (ex: `mongodb+srv://user:pass@cluster.mongodb.net/fouadstore`) |
| `NEXT_PUBLIC_STORE_NAME` | `Frères Zeboudj` |
| `NEXT_PUBLIC_STORE_NAME_AR` | `محل الإخوة زبوج` |
| `NEXT_PUBLIC_STORE_TAGLINE` | `Huiles Moteur & Accessoires Automobiles` |
| `NEXT_PUBLIC_STORE_TAGLINE_AR` | `للزيوت و لوازم السيارات` |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | `213555460770` |
| `NEXT_PUBLIC_SECONDARY_PHONE` | `0542816442` |
| `NEXT_PUBLIC_CURRENCY` | `DA` |
| `ADMIN_PASSWORD` | `fouad97` |
| `ADMIN_SECRET` | `fouadstore_secure_admin_token_97` |

5. Cliquez sur **Deploy**. Votre site est en ligne en ~1 minute sur une URL `*.vercel.app` !

---

### 2. Déploiement sur RENDER

Le dépôt contient déjà le fichier `render.yaml` pré-configuré :

1. Connectez-vous sur [render.com](https://render.com).
2. Cliquez sur **"New +"** -> **"Blueprint"** (ou **"Web Service"**).
3. Connectez votre dépôt GitHub `hakimabderrahim18/fouadstore`.
4. Renseignez la variable secrète `MONGODB_URI` avec votre chaîne de connexion MongoDB Atlas.
5. Cliquez sur **Apply** : Render configure automatiquement le service Node.js, lance `npm install && npm run build` puis `npm start`.

---

## 💻 Lancement Local

```bash
# 1. Cloner le projet
git clone https://github.com/hakimabderrahim18/fouadstore.git
cd fouadstore

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement (.env.local)
cp .env.example .env.local

# 4. Peupler la base de données avec les produits automobiles
npm run seed

# 5. Démarrer le serveur de développement
npm run dev

# 6. Ouvrir http://localhost:3000
```
