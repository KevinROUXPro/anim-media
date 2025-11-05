# 🎨 Anim'Media - Plateforme de Gestion d'Activités Culturelles

Application web moderne pour gérer les ateliers et événements culturels d'une association, avec système d'adhésion et gestion administrative.

## ✨ Fonctionnalités

### 👥 Gestion des Utilisateurs
- ✅ Authentification Firebase (email/password)
- ✅ Système de rôles (User / Admin)
- ✅ Premier inscrit devient automatiquement admin
- ✅ Gestion des adhésions avec dates d'expiration
- ✅ Profils utilisateurs complets

### 🎭 Ateliers Récurrents
- ✅ **Ateliers récurrents** avec récurrence personnalisable (hebdo, bi-hebdo, mensuel)
- ✅ Sélection des jours de la semaine
- ✅ Périodes saisonnières optionnelles (ex: septembre à juin)
- ✅ **Périodes d'interruption** (vacances, fermetures, etc.)
- ✅ Génération automatique du calendrier des séances
- ✅ Affichage de la prochaine séance
- ✅ Filtrage par catégories et niveaux

### 📅 Événements Ponctuels
- ✅ Création d'événements uniques
- ✅ Gestion des inscriptions
- ✅ Limitation du nombre de participants
- ✅ Catégorisation et filtres

### 🔐 Espace Admin
- ✅ Dashboard de gestion complet
- ✅ CRUD ateliers et événements
- ✅ Gestion des adhérents
- ✅ Suivi des inscriptions
- ✅ Statistiques

### 🎨 Interface Utilisateur
- ✅ Design moderne et responsive (mobile-first)
- ✅ Animations Framer Motion
- ✅ Thème personnalisé avec couleurs de l'association
- ✅ Composants UI shadcn/ui
- ✅ Navigation intuitive

## 🛠️ Technologies

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS v4
- **Backend** : Firebase (Auth, Firestore, Storage)
- **Animations** : Framer Motion
- **UI Components** : shadcn/ui + Radix UI
- **Dates** : date-fns
- **Icons** : Lucide React

## 🚀 Installation

### Prérequis

- Node.js 20+ 
- npm ou yarn
- Un projet Firebase configuré

### 1. Cloner le projet

```bash
git clone https://github.com/KevinROUXPro/anim-media.git
cd anim-media
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Firebase

1. Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
```

2. Remplissez avec vos identifiants Firebase :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

3. Consultez `FIREBASE_SETUP.md` pour la configuration complète de Firebase

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du Projet

```
anim-media/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── login/             # Connexion
│   │   ├── signup/            # Inscription
│   │   ├── profil/            # Profil utilisateur
│   │   ├── adhesion/          # Adhésion
│   │   ├── ateliers/          # Liste et détails des ateliers
│   │   ├── evenements/        # Liste et détails des événements
│   │   └── admin/             # Espace administration
│   │       ├── adherents/     # Gestion adhérents
│   │       ├── ateliers/      # Gestion ateliers
│   │       ├── evenements/    # Gestion événements
│   │       └── utilisateurs/  # Gestion utilisateurs
│   ├── components/            # Composants React
│   │   ├── ui/               # Composants UI réutilisables
│   │   ├── Navbar.tsx        # Navigation
│   │   ├── ProtectedRoute.tsx # Routes protégées
│   │   └── ...
│   ├── contexts/             # Contextes React
│   │   └── AuthContext.tsx   # Gestion authentification
│   ├── lib/                  # Utilitaires
│   │   ├── firebase.ts       # Configuration Firebase
│   │   ├── animations.ts     # Animations Framer Motion
│   │   └── workshop-utils.ts # Utilitaires ateliers récurrents
│   ├── types/                # Types TypeScript
│   │   └── index.ts          # Interfaces et types
│   └── config/               # Configuration
│       ├── theme.ts          # Thème et couleurs
│       └── logo.ts           # Configuration logo
├── public/                   # Assets statiques
├── vercel.json              # Configuration Vercel
├── .env.example             # Template variables d'environnement
└── DEPLOYMENT.md            # Guide de déploiement
```

## 📚 Documentation

- **[GET_STARTED.md](GET_STARTED.md)** - Guide de démarrage rapide
- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Configuration Firebase
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guide de déploiement Vercel
- **[GUIDE_COMPLET.md](GUIDE_COMPLET.md)** - Documentation complète

## 🌐 Déploiement

### Déploiement sur Vercel (Recommandé)

1. Connectez votre repo GitHub à Vercel
2. Ajoutez les variables d'environnement Firebase
3. Déployez !

Voir **[DEPLOYMENT.md](DEPLOYMENT.md)** pour les instructions détaillées.

## 🔑 Premiers Pas

### Créer le premier admin

Le **premier utilisateur** qui s'inscrit devient automatiquement **administrateur**.

1. Lancez l'application
2. Allez sur `/signup`
3. Créez un compte
4. Vous êtes maintenant admin ! 🎉

### Créer un atelier récurrent

1. Connectez-vous en tant qu'admin
2. Allez dans **Admin** > **Ateliers**
3. Cliquez sur **+ Nouvel Atelier**
4. Configurez :
   - **Titre et description**
   - **Jours de la semaine** (ex: Mardi et Jeudi)
   - **Fréquence** (hebdomadaire, bi-hebdomadaire...)
   - **Horaires** (ex: 16h-18h)
   - **Période saisonnière** (optionnel)
   - **Périodes d'interruption** (vacances, etc.)
5. Enregistrez

L'atelier génère automatiquement toutes les séances !

## 🎨 Personnalisation

### Couleurs du thème

Modifiez `src/config/theme.ts` :

```typescript
export const THEME_COLORS = {
  primary: '#00A8A8',    // Turquoise
  secondary: '#DE3156',  // Rose/Rouge
  beige: '#F7EDE0',      // Beige clair
  dark: '#333333',       // Gris foncé
};
```

### Logo

Remplacez `public/logo.png` par votre logo

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

**Kevin ROUX**
- GitHub: [@KevinROUXPro](https://github.com/KevinROUXPro)

## 🙏 Remerciements

- Next.js et Vercel
- Firebase
- shadcn/ui
- La communauté open source

---

**Fait avec ❤️ pour les associations culturelles**

