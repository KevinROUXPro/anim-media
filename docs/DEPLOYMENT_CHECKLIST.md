# ✅ Checklist de déploiement Vercel

## Avant de déployer

### 🔧 Configuration locale

- [ ] Le projet se lance sans erreur avec `npm run dev`
- [ ] Le build fonctionne avec `npm run build`
- [ ] Pas d'erreurs TypeScript
- [ ] Pas d'erreurs ESLint
- [ ] `.env.local` existe et contient toutes les variables Firebase
- [ ] `.env.local` est bien dans `.gitignore`

### 🔥 Firebase

- [ ] Projet Firebase créé
- [ ] Authentication activée (Email/Password)
- [ ] Firestore Database créé
- [ ] Storage activé (si vous utilisez l'upload d'images)
- [ ] Règles Firestore configurées (voir DEPLOYMENT.md)
- [ ] Règles Storage configurées (si nécessaire)
- [ ] Domaine localhost autorisé dans Authentication > Settings > Authorized domains

### 📁 Fichiers de configuration

- [ ] `vercel.json` présent
- [ ] `.env.example` à jour avec toutes les variables
- [ ] `.gitignore` contient `.env*` et `.vercel`
- [ ] `package.json` a les scripts `build` et `start`

## Pendant le déploiement

### 🌐 Vercel Dashboard

- [ ] Compte Vercel créé
- [ ] Repo GitHub connecté
- [ ] Projet importé sur Vercel
- [ ] Framework détecté : Next.js
- [ ] Build Command : `next build`
- [ ] Output Directory : `.next`
- [ ] Install Command : `npm install`

### 🔑 Variables d'environnement Vercel

Ajoutez ces variables dans Settings > Environment Variables :

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

**Important** : Sélectionnez les 3 environnements (Production, Preview, Development)

### 🚀 Premier déploiement

- [ ] Cliquez sur "Deploy"
- [ ] Le build se termine sans erreur
- [ ] Vous obtenez une URL de déploiement (ex: `anim-media.vercel.app`)

## Après le déploiement

### ✅ Tests de base

- [ ] Le site s'affiche correctement
- [ ] La page d'accueil se charge
- [ ] Les images/logo s'affichent
- [ ] La navigation fonctionne
- [ ] Le responsive mobile fonctionne

### 🔐 Tests d'authentification

- [ ] **IMPORTANT** : Ajoutez l'URL Vercel dans Firebase Console > Authentication > Settings > Authorized domains
  - Exemple : `anim-media.vercel.app`
  - Ajoutez aussi : `*.vercel.app` pour les preview deployments
- [ ] La page de connexion s'affiche
- [ ] La page d'inscription s'affiche
- [ ] Vous pouvez créer un compte
- [ ] Vous pouvez vous connecter
- [ ] La déconnexion fonctionne

### 📊 Tests fonctionnels

- [ ] Premier utilisateur devient admin
- [ ] Les ateliers s'affichent
- [ ] Les événements s'affichent
- [ ] L'espace admin est accessible (pour les admins)
- [ ] On peut créer un atelier
- [ ] On peut créer un événement
- [ ] Le calendrier des séances récurrentes fonctionne
- [ ] Les périodes d'interruption fonctionnent

### 🎨 Tests visuels

- [ ] Les couleurs du thème sont correctes
- [ ] Le logo s'affiche
- [ ] Les animations fonctionnent
- [ ] Pas de problèmes de layout
- [ ] Mobile : menu burger fonctionne
- [ ] Mobile : tous les boutons sont accessibles

## 🔍 En cas de problème

### Le build échoue

1. Vérifiez les logs dans Vercel Dashboard
2. Corrigez les erreurs TypeScript localement
3. Testez `npm run build` localement
4. Poussez les corrections et redéployez

### L'authentification ne fonctionne pas

1. Vérifiez que l'URL Vercel est dans Firebase Authorized domains
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez qu'elles commencent bien par `NEXT_PUBLIC_`
4. Redéployez après modification des variables

### Les données ne se chargent pas

1. Vérifiez les règles Firestore
2. Ouvrez la console du navigateur (F12)
3. Regardez les erreurs dans l'onglet Console
4. Vérifiez l'onglet Network pour voir les requêtes

### Erreur 404 sur les routes

1. Vérifiez que les fichiers `page.tsx` existent
2. Vérifiez la structure des dossiers dans `src/app/`
3. Redéployez

## 📱 Tests mobiles

- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Tablette (iPad / Android)
- [ ] Rotation portrait / paysage

## 🎉 Tout fonctionne ?

Félicitations ! Votre application est en ligne ! 🚀

### Prochaines étapes

1. Configurez un domaine personnalisé (optionnel)
2. Activez les analytics Vercel (optionnel)
3. Configurez les notifications de déploiement
4. Partagez l'URL avec vos utilisateurs !

## 📝 Notes

- Les déploiements sur `main` vont en production
- Les déploiements sur les autres branches créent des previews
- Chaque PR crée automatiquement un preview deployment
- Vercel garde l'historique de tous vos déploiements
