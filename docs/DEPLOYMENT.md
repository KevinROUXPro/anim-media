# Guide de déploiement sur Vercel

## 📋 Prérequis

- Un compte Vercel (gratuit) : https://vercel.com/signup
- Un compte GitHub (pour connecter votre repo)
- Votre projet Firebase configuré

## 🚀 Étapes de déploiement

### 1. Préparer votre projet

Assurez-vous que `.env.local` est bien dans `.gitignore` (déjà configuré ✅)

### 2. Variables d'environnement

Dans le dashboard Vercel, vous devrez ajouter ces variables d'environnement :

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

**Important** : Toutes ces variables commencent par `NEXT_PUBLIC_` car elles sont utilisées côté client.

### 3. Déployer sur Vercel

#### Option A : Via le Dashboard Vercel (Recommandé)

1. **Connectez-vous à Vercel** : https://vercel.com
2. **Cliquez sur "New Project"**
3. **Importez votre dépôt GitHub**
   - Connectez votre compte GitHub si ce n'est pas déjà fait
   - Sélectionnez le repo `anim-media`
4. **Configuration du projet**
   - Framework Preset : Next.js (détecté automatiquement)
   - Root Directory : `./` (racine)
   - Build Command : `next build` (par défaut)
   - Output Directory : `.next` (par défaut)
5. **Ajoutez les variables d'environnement**
   - Allez dans "Environment Variables"
   - Ajoutez toutes les variables Firebase une par une
   - Environnement : Production, Preview, Development (cochez les 3)
6. **Cliquez sur "Deploy"**

#### Option B : Via la CLI Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Premier déploiement (depuis le dossier du projet)
vercel

# Suivez les instructions :
# - Set up and deploy? Yes
# - Which scope? Votre compte
# - Link to existing project? No
# - What's your project's name? anim-media
# - In which directory is your code located? ./
# - Want to modify these settings? No

# Ajouter les variables d'environnement
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# Répétez pour chaque variable

# Déployer en production
vercel --prod
```

### 4. Configuration Firebase pour Vercel

Une fois déployé, vous obtiendrez une URL (ex: `anim-media.vercel.app`)

**Important** : Ajoutez cette URL dans Firebase Console :

1. Allez dans **Firebase Console** > **Authentication** > **Settings**
2. Sous **Authorized domains**, ajoutez :
   - `anim-media.vercel.app` (ou votre URL Vercel)
   - `*.vercel.app` (pour les preview deployments)

### 5. Tester votre déploiement

1. Visitez votre URL Vercel
2. Testez l'authentification
3. Vérifiez que toutes les fonctionnalités fonctionnent

## 🔄 Déploiements automatiques

Vercel déploie automatiquement :
- **Production** : À chaque push sur la branche `main`
- **Preview** : À chaque push sur les autres branches
- **Preview** : À chaque Pull Request

## 🛠️ Commandes utiles

```bash
# Voir les logs de déploiement
vercel logs

# Lister vos déploiements
vercel ls

# Voir les variables d'environnement
vercel env ls

# Supprimer un déploiement
vercel rm [deployment-url]
```

## ⚠️ Points d'attention

### Firestore Rules
Assurez-vous que vos règles Firestore sont configurées pour la production.

**Fichier disponible :** `firestore.rules` à la racine du projet

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Fonction helper pour vérifier si l'utilisateur est admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Fonction helper pour vérifier si l'utilisateur est adhérent actif
    function isActiveMember() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.membershipStatus == 'ACTIVE';
    }
    
    // Utilisateurs
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Ateliers (lecture publique)
    match /workshops/{workshopId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Événements (lecture publique)
    match /events/{eventId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Inscriptions
    match /registrations/{registrationId} {
      allow read: if request.auth != null && 
                    (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
                      (resource.data.userId == request.auth.uid || isAdmin());
    }
    
    // Suggestions
    match /suggestions/{suggestionId} {
      allow read: if true;  // Lecture publique
      allow create: if isActiveMember() && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
                      (resource.data.userId == request.auth.uid || isAdmin());
      allow delete: if request.auth != null && 
                      (resource.data.userId == request.auth.uid || isAdmin());
    }
    
    // Comptes rendus d'AG
    match /agReports/{reportId} {
      allow read: if isActiveMember();  // Lecture pour adhérents actifs uniquement
      allow write: if isAdmin();
    }
  }
}
```

### Storage Rules
Pour Firebase Storage (si vous utilisez l'upload d'images).

**Fichier disponible :** `storage.rules` à la racine du projet

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    match /workshops/{imageId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /events/{imageId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /ag-reports/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

## 🔍 Debugging

Si vous rencontrez des problèmes :

1. **Vérifiez les logs Vercel** : Dashboard > Votre projet > Deployments > Logs
2. **Variables d'environnement** : Assurez-vous qu'elles sont toutes définies
3. **Firebase Console** : Vérifiez que l'URL est autorisée
4. **Build errors** : Corrigez les erreurs TypeScript avant de déployer

## 📱 Domaine personnalisé (Optionnel)

Pour utiliser votre propre domaine :

1. Allez dans **Settings** > **Domains**
2. Ajoutez votre domaine
3. Suivez les instructions pour configurer les DNS
4. N'oubliez pas d'ajouter ce domaine dans Firebase Authorized Domains

## 🎉 C'est tout !

Votre application est maintenant en ligne et se met à jour automatiquement à chaque push !
