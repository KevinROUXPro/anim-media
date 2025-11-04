# 📋 TODO - Fonctionnalités à Compléter

Cette application est fonctionnelle mais certaines fonctionnalités restent à implémenter pour une version complète.

## ✅ Fonctionnalités Implémentées

- ✅ Configuration Next.js 14 + TypeScript + Tailwind
- ✅ Configuration Firebase (Auth, Firestore, Storage)
- ✅ Authentification (Inscription/Connexion)
- ✅ Page d'accueil animée avec Framer Motion
- ✅ Liste des événements avec filtres
- ✅ Liste des ateliers avec filtres
- ✅ Contexte d'authentification
- ✅ Protection des routes (utilisateur/admin)
- ✅ Dashboard utilisateur (/profil)
- ✅ Dashboard admin (/admin)
- ✅ Composant d'inscription aux activités
- ✅ Navigation responsive
- ✅ Premier utilisateur = Admin automatique

## 🚧 Fonctionnalités à Implémenter

### 1. Pages de Détails des Activités

**Fichiers à créer :**
- `src/app/evenements/[id]/page.tsx`
- `src/app/ateliers/[id]/page.tsx`

**Contenu :**
```tsx
// Afficher :
// - Toutes les informations de l'événement/atelier
// - Image (si disponible)
// - Bouton d'inscription (composant RegisterButton)
// - Nombre de participants (optionnel)
// - Bouton retour vers la liste
```

### 2. CRUD Événements (Admin)

**Fichiers à créer :**
- `src/app/admin/evenements/page.tsx` - Liste et gestion
- `src/app/admin/evenements/nouveau/page.tsx` - Création
- `src/app/admin/evenements/[id]/modifier/page.tsx` - Modification

**Fonctionnalités :**
- Formulaire avec tous les champs (titre, description, date, lieu, catégorie, image)
- Upload d'image vers Firebase Storage
- Validation des données
- Liste avec boutons modifier/supprimer
- Confirmation avant suppression

### 3. CRUD Ateliers (Admin)

**Fichiers à créer :**
- `src/app/admin/ateliers/page.tsx`
- `src/app/admin/ateliers/nouveau/page.tsx`
- `src/app/admin/ateliers/[id]/modifier/page.tsx`

**Champs spécifiques :**
- Intervenant
- Niveau de compétence
- Nombre maximum de participants (optionnel)

### 4. Gestion des Utilisateurs (Admin)

**Fichier à créer :**
- `src/app/admin/utilisateurs/page.tsx`

**Fonctionnalités :**
- Liste de tous les utilisateurs
- Promouvoir un utilisateur en admin
- Révoquer les droits admin (sauf soi-même)
- Supprimer un utilisateur (sauf soi-même)
- Voir les inscriptions d'un utilisateur

### 5. Upload d'Images

**Composant à créer :**
- `src/components/ImageUpload.tsx`

**Fonctionnalités :**
- Upload vers Firebase Storage
- Prévisualisation de l'image
- Barre de progression
- Compression optionnelle
- Génération d'URL publique

### 6. Améliorations UI/UX

**À ajouter :**
- Skeletons pour les états de chargement
- Modales de confirmation pour suppressions
- Gestion des erreurs Firebase avec messages clairs
- Pagination pour les listes longues
- Recherche textuelle
- Tri (date, catégorie, etc.)

### 7. Optimisations

**Performance :**
- Lazy loading des images
- Mise en cache avec SWR ou React Query
- Optimisation des requêtes Firestore
- Service Worker pour mode hors ligne

### 8. Fonctionnalités Avancées (Optionnel)

**Nice to have :**
- Notifications push pour nouveaux événements
- Export des listes (CSV/PDF)
- Statistiques avancées (graphiques)
- Système de commentaires/avis
- Calendrier intégré
- Envoi d'emails de confirmation
- Génération de QR codes pour les inscriptions

## 🎯 Exemples de Code

### Exemple : Page de Détail Événement

```tsx
// src/app/evenements/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, CATEGORY_LABELS } from '@/types';
import { RegisterButton } from '@/components/RegisterButton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      const eventDoc = await getDoc(doc(db, 'events', params.id as string));
      if (eventDoc.exists()) {
        setEvent({
          ...eventDoc.data(),
          id: eventDoc.id,
          date: eventDoc.data().date.toDate(),
        } as Event);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [params.id]);

  if (loading) return <div>Chargement...</div>;
  if (!event) return <div>Événement introuvable</div>;

  const categoryInfo = CATEGORY_LABELS[event.category];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
      <div className="flex items-center gap-4 mb-6">
        <span>{categoryInfo.icon} {categoryInfo.label}</span>
        <span>📅 {format(event.date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
        <span>📍 {event.location}</span>
      </div>
      <p className="text-lg mb-8">{event.description}</p>
      <RegisterButton 
        activityId={event.id} 
        activityType="event" 
        requiresRegistration={event.requiresRegistration}
      />
    </div>
  );
}
```

### Exemple : Upload d'Image

```tsx
// src/components/ImageUpload.tsx
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `events/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        onUpload(url);
        setUploading(false);
      }
    );
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {uploading && <progress value={progress} max="100" />}
    </div>
  );
}
```

## 📚 Ressources Utiles

- [Firebase Storage Upload](https://firebase.google.com/docs/storage/web/upload-files)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Firestore CRUD Operations](https://firebase.google.com/docs/firestore/manage-data/add-data)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Framer Motion Animations](https://www.framer.com/motion/)

## 🚀 Priorités

1. **Pages de détails** (événements et ateliers) - CRITIQUE
2. **CRUD Événements** (admin) - HAUTE
3. **CRUD Ateliers** (admin) - HAUTE
4. **Upload d'images** - HAUTE
5. **Gestion utilisateurs** - MOYENNE
6. **Améliorations UI/UX** - MOYENNE
7. **Fonctionnalités avancées** - BASSE

Bon courage ! 🎉
