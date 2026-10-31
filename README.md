# FOUADstore 🛍️

Boutique en ligne e-commerce conçue spécialement pour le marché algérien (Prix en DA, 58 Wilayas, confirmation WhatsApp, paiement à la livraison).

---

## 🚀 Fonctionnalités Implémentées

### 1. Page d'Accueil (`/`)
- **Épurée et directe** : Contient **uniquement** la grille des produits (sans hero, sans bannière, sans section de catégories ni nouveautés).
- **Header minimaliste** : Nom/logo **FOUADstore**, sélecteur de langue **FR / العربية** (avec support complet du mode **RTL**), et icône du panier avec badge compteur d'articles.
- **Barre de recherche** intégrée directement au-dessus de la grille avec compteur de résultats en temps réel et bouton d'effacement.
- **Grille de produits 100% responsive** :
  - `2 colonnes` sur mobile
  - `3 colonnes` sur tablette
  - `4 colonnes` sur desktop
- **Cartes produits** : Image avec effet de zoom, nom, prix en **DA**, prix promo barré avec badge de réduction, badge rouge **« Rupture de stock »** si stock = 0, et bouton interactif **« Ajouter au panier »** avec retour visuel immédiat.
- **Bouton « Voir plus de produits »** pour charger les produits supplémentaires de façon fluide.

### 2. Page Produit (`/produit/:id`)
- **Galerie d'images** : Affichage haute définition avec miniatures interactives.
- **Détails & Tarifs** : Prix actuel, prix d'origine barré, pourcentage de remise, statut précis du stock.
- **Variantes** : Sélection de la taille (ex: S, M, L, XL, 40-44) et de la couleur avec pastilles visuelles.
- **Sélecteur de quantité** (+ / -).
- **Boutons d'action** : « Ajouter au panier » et « Acheter maintenant » (qui redirige directement vers le checkout).

### 3. Panier Interactif & Persistant
- **Drawer latéral (Tiroir)** s'ouvrant instantanément au clic sur l'icône du panier ou lors d'un ajout.
- **Page dédiée (`/panier`)** également disponible.
- Modification des quantités en direct avec recalcul automatique du sous-total.
- Suppression d'articles unitaire.
- Persistance automatique dans le **localStorage** du navigateur.

### 4. Checkout Algérie Optimisé (`/checkout`)
- Formulaire client complet :
  - **Nom et prénom**
  - **Numéro de téléphone** (format algérien vérifié 05/06/07...)
  - **Wilaya** : Menu déroulant complet des **58 wilayas d'Algérie**.
  - **Commune** : Suggestions dynamiques des communes selon la wilaya sélectionnée.
  - **Adresse exacte**
  - **Note optionnelle** pour le livreur
- **Mode de livraison au choix** :
  - 🏠 **Livraison à domicile** (tarif adapté par wilaya)
  - 🏢 **Livraison au bureau (Stop Desk)** (tarif économique adapté)
- Frais de livraison calculés instantanément et ajoutés au **TOTAL en DA**.

### 5. Validation de Commande & WhatsApp
- **Enregistrement dans MongoDB** avec le statut `"en attente"`.
- Génération d'un numéro de commande unique (ex: `FS-261029-XXXX`).
- **Redirection automatique vers WhatsApp (`wa.me`)** avec un message complet pré-rempli :
  - Numéro de commande
  - Nom, téléphone, wilaya, commune et adresse exacte
  - Mode de livraison (domicile ou bureau)
  - Liste détaillée des articles (nom, taille, couleur, quantité, prix)
  - Sous-total, frais de livraison et total général en DA (Paiement à la livraison)
- **Page de confirmation (`/confirmation/:id`)** :
  - Numéro de commande bien en évidence avec bouton de copie rapide
  - Badge de statut « En attente de confirmation »
  - Récapitulatif détaillé de la commande
  - Gros bouton pour relancer/envoyer le message WhatsApp à tout moment
  - Bouton « Continuer les achats »

### 6. Design & Internationalisation (FR / AR)
- Design **Mobile-First** moderne avec **Tailwind CSS** et icônes **Lucide React**.
- Tous les montants en **DA** (Dinars Algériens).
- Basculement instantané **Français / Arabe** avec gestion native du sens d'écriture **RTL** (`dir="rtl"`).

---

## 🛠️ Stack Technique

- **Framework** : Next.js 14 (App Router) + TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : MongoDB via Mongoose
- **Icônes** : Lucide React
- **Gestion d'état** : React Context API (`CartContext`, `LanguageContext`)

---

## ⚙️ Configuration & Lancement

### Variables d'environnement (`.env.local`)
```env
MONGODB_URI=mongodb://127.0.0.1:27017/fouadstore
NEXT_PUBLIC_STORE_NAME=FOUADstore
NEXT_PUBLIC_WHATSAPP_PHONE=213555123456
NEXT_PUBLIC_CURRENCY=DA
ADMIN_PASSWORD=fouad97
```

### 🔐 Espace Administration
- **Accès** : `http://localhost:3000/admin`
- **Mot de passe** : `fouad97`
- Protégé par middleware Next.js et cookie HTTP-only sécurisé.
- Bouton de déconnexion disponible dans le menu latéral.

### Commandes utiles

```bash
# 1. Remplir la base de données avec des produits de démonstration
npm run seed

# 2. Lancer le serveur de développement
npm run dev

# 3. Compiler pour la production
npm run build
npm start
```
