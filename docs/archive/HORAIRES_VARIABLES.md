# Solution pour les Horaires Variables d'Ateliers

## Problématique
Il faut pouvoir modifier ponctuellement la date et/ou les horaires d'un atelier pour une séance spécifique (changement exceptionnel, report, etc.) sans affecter les autres séances.

## Solution Proposée : Exceptions de Séances

### 1. Structure de Données

Ajouter un nouveau champ `sessionExceptions` dans la collection `workshops` :

```typescript
interface SessionException {
  originalDate: Date;           // Date originale de la séance
  newDate?: Date;               // Nouvelle date si reportée
  newStartTime?: string;        // Nouvel horaire de début (format "HH:mm")
  newEndTime?: string;          // Nouvel horaire de fin (format "HH:mm")
  newLocation?: string;         // Nouveau lieu si changé
  reason?: string;              // Raison du changement
  isCancelled?: boolean;        // true si la séance est annulée (pas reportée)
}

interface Workshop {
  // ... champs existants
  sessionExceptions?: SessionException[];  // Liste des exceptions ponctuelles
}
```

### 2. Mise à Jour du Type dans `src/types/index.ts`

```typescript
export interface SessionException {
  originalDate: Date;
  newDate?: Date;
  newStartTime?: string;
  newEndTime?: string;
  newLocation?: string;
  reason?: string;
  isCancelled?: boolean;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  instructor: string;
  location: string;
  level?: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  imageUrl?: string;
  
  // Champs pour ateliers récurrents
  isRecurring: boolean;
  recurrenceDays?: number[];
  recurrenceInterval?: number;
  startTime?: string;
  endTime?: string;
  seasonStartDate?: Date;
  seasonEndDate?: Date;
  
  // Champs pour ateliers ponctuels
  startDate?: Date;
  endDate?: Date;
  
  // Périodes d'interruption
  cancellationPeriods?: CancellationPeriod[];
  
  // Exceptions ponctuelles (NOUVEAU)
  sessionExceptions?: SessionException[];
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Interface Admin pour Gérer les Exceptions

Dans `src/app/admin/ateliers/page.tsx`, ajouter une fonctionnalité pour :

1. **Afficher le calendrier des séances** avec possibilité de cliquer sur une date
2. **Modal de modification** avec :
   - Date actuelle (readonly)
   - Nouvelle date (optionnel)
   - Nouveaux horaires (optionnel)
   - Nouveau lieu (optionnel)
   - Raison du changement
   - Case à cocher "Annuler cette séance"

```typescript
function SessionExceptionModal({ 
  workshop, 
  sessionDate, 
  onSave, 
  onClose 
}: {
  workshop: Workshop;
  sessionDate: Date;
  onSave: (exception: SessionException) => void;
  onClose: () => void;
}) {
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [reason, setReason] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);

  const handleSave = () => {
    onSave({
      originalDate: sessionDate,
      newDate,
      newStartTime: newStartTime || undefined,
      newEndTime: newEndTime || undefined,
      newLocation: newLocation || undefined,
      reason,
      isCancelled
    });
  };

  return (
    // ... UI du modal
  );
}
```

### 4. Fonction pour Appliquer les Exceptions

Dans `src/lib/workshop-utils.ts` :

```typescript
export function applySessionExceptions(
  sessions: Date[],
  exceptions: SessionException[]
): Array<{ date: Date; exception?: SessionException }> {
  return sessions.map(sessionDate => {
    // Normaliser la date pour la comparaison
    const normalizedDate = new Date(sessionDate);
    normalizedDate.setHours(0, 0, 0, 0);

    // Chercher une exception pour cette date
    const exception = exceptions?.find(exc => {
      const excDate = new Date(exc.originalDate);
      excDate.setHours(0, 0, 0, 0);
      return excDate.getTime() === normalizedDate.getTime();
    });

    return {
      date: exception?.newDate || sessionDate,
      exception
    };
  }).filter(session => !session.exception?.isCancelled); // Filtrer les séances annulées
}
```

### 5. Affichage dans les Pages Publiques

Dans `src/app/ateliers/[id]/page.tsx`, modifier l'affichage des séances :

```typescript
const sessionsWithExceptions = applySessionExceptions(
  upcomingSessions,
  workshop.sessionExceptions || []
);

// Dans le rendu :
sessionsWithExceptions.map(({ date, exception }) => (
  <div key={date.toISOString()} className={exception ? 'border-orange-300 bg-orange-50' : ''}>
    <p>
      {format(date, "EEEE d MMMM yyyy", { locale: fr })}
      {exception && (
        <span className="ml-2 text-orange-600 text-sm">
          ⚠️ Modifié
        </span>
      )}
    </p>
    <p>
      {exception?.newStartTime || workshop.startTime} - {exception?.newEndTime || workshop.endTime}
    </p>
    {exception?.newLocation && (
      <p className="text-sm text-gray-600">
        Nouveau lieu: {exception.newLocation}
      </p>
    )}
    {exception?.reason && (
      <p className="text-sm italic text-gray-500">
        {exception.reason}
      </p>
    )}
  </div>
))
```

### 6. Notifications Automatiques

Lors de l'ajout d'une exception, envoyer une notification aux inscrits :

```typescript
async function notifyParticipantsOfChange(
  workshopId: string,
  exception: SessionException
) {
  // 1. Récupérer tous les participants inscrits
  const registrationsQuery = query(
    collection(db, 'registrations'),
    where('workshopId', '==', workshopId)
  );
  const registrations = await getDocs(registrationsQuery);

  // 2. Envoyer un email à chaque participant
  registrations.forEach(async (regDoc) => {
    const registration = regDoc.data();
    const userDoc = await getDoc(doc(db, 'users', registration.userId));
    const user = userDoc.data();

    if (user?.email) {
      // Utiliser Firebase Cloud Functions ou un service d'email
      await sendEmail({
        to: user.email,
        subject: 'Modification d\'horaire - Atelier',
        body: `
          Bonjour,
          
          L'atelier prévu le ${format(exception.originalDate, 'PPP', { locale: fr })}
          a été modifié.
          
          ${exception.newDate ? `Nouvelle date : ${format(exception.newDate, 'PPP', { locale: fr })}` : ''}
          ${exception.newStartTime ? `Nouveaux horaires : ${exception.newStartTime} - ${exception.newEndTime}` : ''}
          ${exception.newLocation ? `Nouveau lieu : ${exception.newLocation}` : ''}
          ${exception.reason ? `Raison : ${exception.reason}` : ''}
        `
      });
    }
  });
}
```

## Avantages de cette Solution

✅ **Flexibilité** : Modifier n'importe quelle séance individuellement  
✅ **Traçabilité** : Historique des changements avec raisons  
✅ **Communication** : Notification automatique aux participants  
✅ **Simplicité** : Pas besoin de nouvelle collection, juste un champ supplémentaire  
✅ **Compatibilité** : Fonctionne avec les ateliers récurrents et ponctuels  

## Alternative : Collection Séparée

Si le nombre d'exceptions devient très important, on pourrait créer une collection `sessionExceptions` :

```typescript
// Collection: sessionExceptions
interface SessionExceptionDoc {
  workshopId: string;
  originalDate: Timestamp;
  newDate?: Timestamp;
  newStartTime?: string;
  newEndTime?: string;
  newLocation?: string;
  reason?: string;
  isCancelled?: boolean;
  createdAt: Timestamp;
  createdBy: string;
}
```

Mais pour la plupart des cas d'usage, un simple array dans le document Workshop est suffisant.
