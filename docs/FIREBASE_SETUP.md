# 🔥 Configuration Firebase pour Anim'Média

## 📋 Guide de Configuration Complet

### 1️⃣ Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur **"Ajouter un projet"**
3. Nommez votre projet : `animmedia` (ou autre nom)
4. Désactivez Google Analytics (optionnel)
5. Cliquez sur **"Créer le projet"**

### 2️⃣ Activer l'authentification

1. Menu gauche > **Authentication**
2. Cliquez sur **"Commencer"**
3. Activez **"E-mail/Mot de passe"**
4. Sauvegardez

### 3️⃣ Créer Firestore Database

1. Menu gauche > **Firestore Database**
2. Cliquez sur **"Créer une base de données"**
3. Sélectionnez **"Commencer en mode test"**
4. Région : `europe-west1` (ou proche de vous)
5. Cliquez sur **"Activer"**

### 4️⃣ Activer Firebase Storage

1. Menu gauche > **Storage**
2. Cliquez sur **"Commencer"**
3. Acceptez les règles par défaut
4. Même région que Firestore
5. Cliquez sur **"Terminé"**

### 5️⃣ Configurer les Règles Firestore

Dans **Firestore Database > Règles**, remplacez par :

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
      allow update, delete: if isAdmin();
    }
    
    match /events/{eventId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    match /workshops/{workshopId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    match /registrations/{registrationId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId || isAdmin();
    }
    
    match /metadata/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
\`\`\`

Cliquez sur **"Publier"**.

### 6️⃣ Configurer les Règles Storage

Dans **Storage > Règles**, remplacez par :

\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /events/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /workshops/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
\`\`\`

Cliquez sur **"Publier"**.

### 7️⃣ Obtenir les Clés de Configuration

1. Cliquez sur ⚙️ (en haut à gauche) > **Paramètres du projet**
2. Faites défiler jusqu'à **"Vos applications"**
3. Cliquez sur l'icône **</>** (Web)
4. Nom de l'app : `animmedia-web`
5. **NE COCHEZ PAS** Firebase Hosting
6. Cliquez sur **"Enregistrer l'application"**
7. **Copiez** les valeurs de `firebaseConfig`

### 8️⃣ Configurer le fichier `.env.local`

Dans le fichier `.env.local` à la racine du projet `animmedia`, remplacez :

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=VotreCléAPIIci
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-projet-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
\`\`\`

## ✅ Vérification

1. Démarrez l'app : `npm run dev`
2. Ouvrez : http://localhost:3000
3. Créez un compte sur /signup
4. Le premier compte devient **ADMIN** automatiquement !

## 🎯 Indexation Firestore (Important)

Pour améliorer les performances, créez ces index composites :

1. Menu gauche > **Firestore Database > Index**
2. Cliquez sur **"Ajouter un index"**

**Index pour Events :**
- Collection : `events`
- Champs :
  - `date` : Croissant
  - `__name__` : Croissant

**Index pour Workshops :**
- Collection : `workshops`
- Champs :
  - `date` : Croissant
  - `__name__` : Croissant

**Index pour Registrations :**
- Collection : `registrations`
- Champs :
  - `userId` : Croissant
  - `createdAt` : Décroissant

OU attendez que Firebase vous propose de créer les index automatiquement quand vous utilisez l'app !

## 🚀 Prêt !

Votre application est maintenant configurée et prête à l'emploi !
