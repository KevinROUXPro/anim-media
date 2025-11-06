'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, Timestamp, updateDoc, increment, getDoc } from 'firebase/firestore';
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
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Fonction pour synchroniser le compteur de participants avec la réalité
  const syncParticipantCount = async () => {
    try {
      const field = activityType === 'event' ? 'eventId' : 'workshopId';
      const q = query(
        collection(db, 'registrations'),
        where(field, '==', activityId)
      );
      const snapshot = await getDocs(q);
      const actualCount = snapshot.size;
      
      // Mettre à jour le compteur dans l'activité
      const collectionName = activityType === 'event' ? 'events' : 'workshops';
      const activityRef = doc(db, collectionName, activityId);
      await updateDoc(activityRef, {
        currentParticipants: actualCount
      });
      
      return actualCount;
    } catch (error) {
      console.error('Error syncing participant count:', error);
      return 0;
    }
  };

  useEffect(() => {
    async function checkRegistration() {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        // Synchroniser le compteur au chargement
        await syncParticipantCount();
        
        const field = activityType === 'event' ? 'eventId' : 'workshopId';
        const q = query(
          collection(db, 'registrations'),
          where('userId', '==', user.id),
          where(field, '==', activityId)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          setIsRegistered(true);
          setRegistrationId(snapshot.docs[0].id);
        }
      } catch (error) {
        console.error('Error checking registration:', error);
      } finally {
        setChecking(false);
      }
    }

    checkRegistration();
  }, [user, activityId, activityType]);

  const handleRegister = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      // Synchroniser d'abord le compteur pour avoir les vraies valeurs
      await syncParticipantCount();
      
      const collectionName = activityType === 'event' ? 'events' : 'workshops';
      const activityRef = doc(db, collectionName, activityId);
      const activityDoc = await getDoc(activityRef);
      
      if (!activityDoc.exists()) {
        toast.error('Activité introuvable');
        setLoading(false);
        return;
      }
      
      const activityData = activityDoc.data();
      const currentParticipants = activityData.currentParticipants || 0;
      const maxParticipants = activityData.maxParticipants;
      
      // Vérifier si l'activité est complète
      if (maxParticipants && currentParticipants >= maxParticipants) {
        toast.error('Désolé, cette activité est complète');
        setLoading(false);
        return;
      }

      const registrationData: any = {
        userId: user.id,
        createdAt: Timestamp.now(),
      };

      if (activityType === 'event') {
        registrationData.eventId = activityId;
      } else {
        registrationData.workshopId = activityId;
      }

      // Ajouter l'inscription
      const docRef = await addDoc(collection(db, 'registrations'), registrationData);
      
      // Synchroniser le compteur après l'ajout
      await syncParticipantCount();
      
      setIsRegistered(true);
      setRegistrationId(docRef.id);
      toast.success('Inscription réussie !');
      
      // Appeler le callback pour rafraîchir les données
      if (onRegistrationChange) {
        onRegistrationChange();
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!registrationId) return;

    setLoading(true);

    try {
      // Supprimer l'inscription
      await deleteDoc(doc(db, 'registrations', registrationId));
      
      // Synchroniser le compteur après la suppression (recalcule automatiquement)
      await syncParticipantCount();
      
      setIsRegistered(false);
      setRegistrationId(null);
      toast.success('Désinscription réussie');
      
      // Appeler le callback pour rafraîchir les données
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
          🔐 Se connecter pour s'inscrire
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
          <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-center w-full max-w-md">
            <p className="text-green-700 font-semibold mb-2">✅ Vous êtes inscrit !</p>
            <p className="text-sm text-green-600">Nous avons hâte de vous voir.</p>
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
