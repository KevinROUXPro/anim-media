'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { deleteDoc, doc, getDoc, increment, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { THEME_CLASSES } from '@/config/theme';

export function RegisterButton({
  activityId,
  activityType,
  requiresRegistration = true,
  onRegistrationChange
}: {
  activityId: string;
  activityType: 'event' | 'workshop';
  requiresRegistration?: boolean;
  onRegistrationChange?: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const collectionName = activityType === 'event' ? 'events' : 'workshops';

  // L'identifiant d'inscription est déterministe : "{uid}_{activityId}".
  // Il garantit l'unicité (pas de double inscription possible) et permet aux
  // règles Firestore de vérifier que la jauge n'est ajustée que par une
  // personne réellement inscrite.
  const registrationId = user ? `${user.id}_${activityId}` : null;

  useEffect(() => {
    async function checkRegistration() {
      if (!registrationId) {
        setChecking(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, 'registrations', registrationId));
        setIsRegistered(snapshot.exists());
      } catch (error) {
        console.error('Error checking registration:', error);
      } finally {
        setChecking(false);
      }
    }

    checkRegistration();
  }, [registrationId]);

  const handleRegister = async () => {
    if (!user || !registrationId) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const activityRef = doc(db, collectionName, activityId);
      const activityDoc = await getDoc(activityRef);

      if (!activityDoc.exists()) {
        toast.error('Activité introuvable');
        return;
      }

      const activityData = activityDoc.data();
      const currentParticipants = activityData.currentParticipants || 0;
      const maxParticipants = activityData.maxParticipants;

      // Contrôle d'affichage : la capacité est de toute façon imposée par les
      // règles Firestore, qui refusent un incrément au-delà de maxParticipants.
      if (maxParticipants && currentParticipants >= maxParticipants) {
        toast.error('Désolé, cette activité est complète');
        return;
      }

      await setDoc(doc(db, 'registrations', registrationId), {
        userId: user.id,
        createdAt: Timestamp.now(),
        ...(activityType === 'event'
          ? { eventId: activityId }
          : { workshopId: activityId }),
      });

      // La jauge est incrémentée après coup : les règles vérifient alors que
      // l'inscription existe bien. increment() évite toute perte de compte
      // entre deux inscriptions simultanées.
      try {
        await updateDoc(activityRef, {
          currentParticipants: increment(1),
          updatedAt: Timestamp.now(),
        });
      } catch (counterError) {
        // Refusé par les règles : la dernière place vient d'être prise.
        await deleteDoc(doc(db, 'registrations', registrationId));
        throw counterError;
      }

      setIsRegistered(true);
      toast.success('Inscription réussie !');

      if (onRegistrationChange) {
        onRegistrationChange();
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Erreur lors de l\'inscription. L\'activité est peut-être complète.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!registrationId) return;

    setLoading(true);

    try {
      await deleteDoc(doc(db, 'registrations', registrationId));

      // Décrément seulement si la jauge est strictement positive : les règles
      // interdisent un compteur négatif.
      const activityRef = doc(db, collectionName, activityId);
      const activityDoc = await getDoc(activityRef);
      if (activityDoc.exists() && (activityDoc.data().currentParticipants || 0) > 0) {
        await updateDoc(activityRef, {
          currentParticipants: increment(-1),
          updatedAt: Timestamp.now(),
        });
      }

      setIsRegistered(false);
      toast.success('Désinscription réussie');

      if (onRegistrationChange) {
        onRegistrationChange();
      }
    } catch (error) {
      console.error('Error unregistering:', error);
      toast.error('Erreur lors de la désinscription');
    } finally {
      setLoading(false);
    }
  };

  if (!requiresRegistration) {
    return null; // Ne rien afficher si l'inscription n'est pas requise
  }

  if (checking) {
    return <Button disabled size="lg" className="w-full sm:w-auto min-w-[200px]">Chargement...</Button>;
  }

  if (!user) {
    return (
      <div className="w-full flex flex-col items-center gap-3">
        <Button
          onClick={() => router.push('/login')}
          size="lg"
          className={`w-full sm:w-auto ${THEME_CLASSES.buttonPrimary} min-w-[250px]`}
        >
          🔐 Se connecter pour s&apos;inscrire
        </Button>
        <p className="text-sm text-gray-600 text-center">
          Vous devez être connecté pour vous inscrire à cette activité
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full flex flex-col items-center">
      {isRegistered ? (
        <>
          <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-center w-full max-w-md shadow-sm">
            <p className="text-green-700 font-semibold mb-1">✅ Vous êtes inscrit !</p>
            <p className="text-xs text-green-600 mb-3">Nous avons hâte de vous compter parmi nous.</p>

            {/* Options d'export calendrier */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-green-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white hover:bg-green-50 text-green-700 border-green-300 text-xs"
                onClick={async () => {
                  const docSnap = await getDoc(doc(db, collectionName, activityId));
                  if (docSnap.exists()) {
                    const data = docSnap.data();
                    const { getGoogleCalendarUrl } = await import('@/lib/calendar-utils');
                    const url = getGoogleCalendarUrl({
                      title: data.title,
                      description: data.description || '',
                      location: data.location,
                      date: data.date?.toDate?.() || data.startDate?.toDate?.(),
                      startTime: data.startTime,
                      endTime: data.endTime,
                    });
                    window.open(url, '_blank');
                  }
                }}
              >
                📅 Google Calendar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white hover:bg-green-50 text-green-700 border-green-300 text-xs"
                onClick={async () => {
                  const docSnap = await getDoc(doc(db, collectionName, activityId));
                  if (docSnap.exists()) {
                    const data = docSnap.data();
                    const { downloadICSFile } = await import('@/lib/calendar-utils');
                    downloadICSFile({
                      title: data.title,
                      description: data.description || '',
                      location: data.location,
                      date: data.date?.toDate?.() || data.startDate?.toDate?.(),
                      startTime: data.startTime,
                      endTime: data.endTime,
                    });
                  }
                }}
              >
                📥 Fichier .ics
              </Button>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleUnregister}
            disabled={loading}
            size="lg"
            className="w-full sm:w-auto border-2 border-red-300 text-red-600 hover:bg-red-50"
          >
            {loading ? 'Désinscription...' : '❌ Se désinscrire'}
          </Button>
        </>
      ) : (
        <Button
          onClick={handleRegister}
          disabled={loading}
          size="lg"
          className={`w-full sm:w-auto ${THEME_CLASSES.buttonPrimary} min-w-[250px] text-lg`}
        >
          {loading ? 'Inscription en cours...' : '✨ S\'inscrire maintenant'}
        </Button>
      )}
    </div>
  );
}
