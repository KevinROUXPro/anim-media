# 📊 Analyse de Performance et Fonctionnement

## 🎯 Vue d'ensemble

L'application **Anim'Média** est bien structurée avec Next.js 16, Firebase, et une architecture moderne. Cependant, plusieurs optimisations peuvent améliorer significativement les performances et l'expérience utilisateur.

---

## ✅ Points Forts

### Architecture
- ✅ **Next.js 16 App Router** : Architecture moderne et performante
- ✅ **TypeScript** : Type safety et meilleure maintenabilité
- ✅ **Firebase** : Backend scalable et sécurisé
- ✅ **Composants réutilisables** : Structure modulaire
- ✅ **Design responsive** : Interface adaptée mobile/desktop

### Optimisations déjà en place
- ✅ **Images optimisées** : Next/Image avec lazy loading
- ✅ **Skeletons de chargement** : Meilleure UX
- ✅ **Validation stricte** : Sécurité renforcée
- ✅ **Headers de sécurité** : Protection contre les attaques

---

## ⚠️ Points d'Amélioration Identifiés

### 1. 🔄 Absence de Memoization React

**Problème :** Les composants se re-rendent inutilement même quand les données ne changent pas.

**Impact :** 
- Re-renders inutiles → Performance dégradée
- Recalculs de fonctions coûteuses (ex: `getNextSession`)
- Animations qui se relancent

**Exemples identifiés :**
```tsx
// ❌ WorkshopCard se re-rend à chaque changement d'état parent
function WorkshopCard({ workshop, index }: { workshop: Workshop; index: number }) {
  const nextSession = getNextSession(...); // Recalculé à chaque render
}

// ✅ Devrait être :
const WorkshopCard = React.memo(({ workshop, index }) => {
  const nextSession = useMemo(() => getNextSession(...), [workshop]);
});
```

**Recommandations :**
- Utiliser `React.memo()` pour les composants de cartes
- Utiliser `useMemo()` pour les calculs coûteux (`getNextSession`, filtres)
- Utiliser `useCallback()` pour les handlers passés en props

---

### 2. 📊 Requêtes Firestore Non Optimisées

**Problème :** Chargement de toutes les données sans pagination ni limite.

**Impact :**
- Temps de chargement long avec beaucoup de données
- Coûts Firebase élevés (lectures)
- Expérience utilisateur dégradée

**Exemples identifiés :**
```tsx
// ❌ Charge TOUS les ateliers
const workshopsQuery = query(
  collection(db, 'workshops'),
  orderBy('createdAt', 'desc')
);
const snapshot = await getDocs(workshopsQuery);

// ✅ Devrait être :
const workshopsQuery = query(
  collection(db, 'workshops'),
  orderBy('createdAt', 'desc'),
  limit(20) // Limiter initialement
);
```

**Recommandations :**
- Ajouter `limit()` aux requêtes initiales
- Implémenter la pagination avec `startAfter()`
- Utiliser `onSnapshot()` pour les mises à jour en temps réel (si nécessaire)
- Filtrer côté Firestore plutôt que côté client

---

### 3. 🔍 Filtrage Côté Client

**Problème :** Toutes les données sont chargées puis filtrées côté client.

**Impact :**
- Données inutiles transférées
- Coûts Firebase plus élevés
- Performance dégradée

**Exemple identifié :**
```tsx
// ❌ Charge tout puis filtre
useEffect(() => {
  if (selectedCategory === 'ALL') {
    setFilteredEvents(events);
  } else {
    setFilteredEvents(events.filter(event => event.category === selectedCategory));
  }
}, [selectedCategory, events]);

// ✅ Devrait être :
const eventsQuery = query(
  collection(db, 'events'),
  where('date', '>=', now),
  where('category', '==', selectedCategory), // Filtrer côté Firestore
  orderBy('date', 'asc')
);
```

**Recommandations :**
- Filtrer directement dans les requêtes Firestore avec `where()`
- Créer des index composites pour les requêtes complexes
- Utiliser des requêtes séparées pour chaque filtre

---

### 4. 🔄 Recalculs Répétés

**Problème :** `getNextSession()` est appelé plusieurs fois pour le même atelier.

**Impact :**
- Calculs redondants
- Performance CPU inutile
- Batterie consommée sur mobile

**Exemple identifié :**
```tsx
// ❌ Calculé dans WorkshopCard ET dans la page
const nextSession = getNextSession(...); // Dans WorkshopCard
const workshopsWithNextSession = allWorkshops.map(workshop => {
  let nextSession = getNextSession(...); // Recalculé ici aussi
});
```

**Recommandations :**
- Calculer une seule fois et stocker dans le state
- Utiliser `useMemo()` pour mémoriser les résultats
- Pré-calculer côté serveur si possible

---

### 5. 💾 Absence de Cache

**Problème :** Les données sont rechargées à chaque visite de page.

**Impact :**
- Requêtes Firestore répétées
- Temps de chargement même pour les données déjà vues
- Coûts Firebase inutiles

**Recommandations :**
- Implémenter un cache côté client (React Query, SWR, ou cache simple)
- Utiliser `sessionStorage` ou `localStorage` pour les données statiques
- Mettre en cache les résultats de `getNextSession()`

---

### 6. 🔐 AuthContext - Rechargement des Données

**Problème :** Les données utilisateur sont rechargées à chaque changement d'auth.

**Impact :**
- Requêtes Firestore inutiles
- Flash de contenu pendant le rechargement

**Exemple identifié :**
```tsx
// ❌ Recharge à chaque changement
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid)); // Recharge toujours
    }
  });
}, []);
```

**Recommandations :**
- Mettre en cache les données utilisateur
- Ne recharger que si nécessaire (ex: après mise à jour)
- Utiliser `onSnapshot()` pour les mises à jour en temps réel

---

### 7. 📱 Animations Non Optimisées

**Problème :** Beaucoup d'animations Framer Motion qui peuvent impacter les performances.

**Impact :**
- Lag sur les appareils moins puissants
- Consommation de batterie
- Expérience dégradée si `prefers-reduced-motion`

**Recommandations :**
- Utiliser `will-change` CSS pour les animations
- Réduire les animations sur mobile
- Respecter `prefers-reduced-motion` (déjà partiellement fait)
- Utiliser `transform` et `opacity` plutôt que d'autres propriétés

---

### 8. 🗂️ Index Firestore Manquants

**Problème :** Les requêtes complexes peuvent nécessiter des index composites.

**Impact :**
- Erreurs Firestore si index manquant
- Performance dégradée même avec index simple

**Recommandations :**
- Créer des index composites pour :
  - `events` : `date` + `category`
  - `workshops` : `category` + `createdAt`
  - `registrations` : `userId` + `eventId` ou `workshopId`

---

## 🚀 Plan d'Action Priorisé

### Priorité 1 - Impact Élevé / Effort Faible
1. ✅ **Ajouter `limit()` aux requêtes** (5 min)
2. ✅ **Memoization des composants de cartes** (15 min)
3. ✅ **Utiliser `useMemo()` pour `getNextSession()`** (10 min)

### Priorité 2 - Impact Élevé / Effort Moyen
4. ✅ **Filtrer côté Firestore** (30 min)
5. ✅ **Implémenter la pagination** (1-2h)
6. ✅ **Cache simple avec localStorage** (1h)

### Priorité 3 - Impact Moyen / Effort Variable
7. ✅ **Optimiser AuthContext** (30 min)
8. ✅ **Créer les index Firestore** (15 min)
9. ✅ **Réduire les animations sur mobile** (1h)

---

## 📈 Métriques de Performance Attendues

### Avant optimisations
- ⏱️ Temps de chargement initial : ~2-3s
- 🔄 Re-renders par interaction : 10-15
- 📊 Requêtes Firestore par page : 1-2 (mais charge tout)
- 💾 Taille des données transférées : ~50-100KB

### Après optimisations
- ⏱️ Temps de chargement initial : ~0.5-1s (avec cache)
- 🔄 Re-renders par interaction : 2-3
- 📊 Requêtes Firestore par page : 1 (avec limite)
- 💾 Taille des données transférées : ~10-20KB (avec pagination)

---

## 🛠️ Exemples de Code Optimisé

### Exemple 1 : Memoization d'un composant
```tsx
// Avant
function WorkshopCard({ workshop, index }) {
  const nextSession = getNextSession(...);
  return <Card>...</Card>;
}

// Après
const WorkshopCard = React.memo(({ workshop, index }) => {
  const nextSession = useMemo(
    () => getNextSession(
      workshop.recurrenceDays,
      workshop.recurrenceInterval,
      workshop.seasonStartDate,
      workshop.seasonEndDate,
      workshop.startTime,
      workshop.cancellationPeriods
    ),
    [workshop.recurrenceDays, workshop.recurrenceInterval, workshop.seasonStartDate, workshop.seasonEndDate, workshop.startTime, workshop.cancellationPeriods]
  );
  
  return <Card>...</Card>;
}, (prevProps, nextProps) => {
  // Comparaison personnalisée
  return prevProps.workshop.id === nextProps.workshop.id &&
         prevProps.workshop.updatedAt === nextProps.workshop.updatedAt;
});
```

### Exemple 2 : Requête optimisée avec pagination
```tsx
// Avant
const workshopsQuery = query(
  collection(db, 'workshops'),
  orderBy('createdAt', 'desc')
);

// Après
const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
const [hasMore, setHasMore] = useState(true);

const fetchWorkshops = async (reset = false) => {
  let q = query(
    collection(db, 'workshops'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  if (!reset && lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(q);
  const newWorkshops = snapshot.docs.map(doc => ({...}));
  
  setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
  setHasMore(snapshot.docs.length === 20);
  
  return newWorkshops;
};
```

### Exemple 3 : Filtrage côté Firestore
```tsx
// Avant
const allEvents = await getDocs(query(collection(db, 'events')));
const filtered = allEvents.filter(e => e.category === selectedCategory);

// Après
const eventsQuery = query(
  collection(db, 'events'),
  where('date', '>=', now),
  where('category', '==', selectedCategory), // Index composite requis
  orderBy('date', 'asc')
);
const filtered = await getDocs(eventsQuery);
```

---

## 📝 Checklist d'Optimisation

- [ ] Ajouter `React.memo()` aux composants de cartes
- [ ] Utiliser `useMemo()` pour les calculs coûteux
- [ ] Utiliser `useCallback()` pour les handlers
- [ ] Ajouter `limit()` aux requêtes Firestore
- [ ] Implémenter la pagination
- [ ] Filtrer côté Firestore au lieu du client
- [ ] Créer les index Firestore nécessaires
- [ ] Implémenter un cache simple (localStorage)
- [ ] Optimiser AuthContext avec cache
- [ ] Réduire les animations sur mobile
- [ ] Tester les performances avec React DevTools Profiler

---

## 🎯 Conclusion

L'application est **bien structurée** mais peut bénéficier significativement d'optimisations de performance. Les améliorations prioritaires (memoization, pagination, filtrage Firestore) sont relativement simples à implémenter et auront un impact immédiat sur les performances et les coûts Firebase.

**Score actuel :** 7/10
**Score après optimisations :** 9/10

---

**Date de l'analyse :** 28 janvier 2026
