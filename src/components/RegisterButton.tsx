'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function RegisterButton({ 
  activityId, 
  activityType,
  requiresRegistration = true 
}: { 
  activityId: string; 
  activityType: 'event' | 'workshop';
  requiresRegistration?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkRegistration() {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
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
      const registrationData: any = {
        userId: user.id,
        createdAt: Timestamp.now(),
      };

      if (activityType === 'event') {
        registrationData.eventId = activityId;
      } else {
        registrationData.workshopId = activityId;
      }

      const docRef = await addDoc(collection(db, 'registrations'), registrationData);
      setIsRegistered(true);
      setRegistrationId(docRef.id);
      toast.success('Inscription réussie !');
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
      await deleteDoc(doc(db, 'registrations', registrationId));
      setIsRegistered(false);
      setRegistrationId(null);
      toast.success('Désinscription réussie');
    } catch (error) {
      console.error('Error unregistering:', error);
      toast.error('Erreur lors de la désinscription');
    } finally {
      setLoading(false);
    }
  };

  if (!requiresRegistration) {
    return (
      <div className="text-sm text-gray-500 italic">
        Accès libre - Aucune inscription nécessaire
      </div>
    );
  }

  if (checking) {
    return <Button disabled>Chargement...</Button>;
  }

  if (!user) {
    return (
      <Button onClick={() => router.push('/login')} size="lg" className="w-full">
        Se connecter pour s'inscrire
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      {isRegistered ? (
        <Button 
          variant="outline" 
          onClick={handleUnregister} 
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? 'Désinscription...' : '✓ Inscrit - Se désinscrire'}
        </Button>
      ) : (
        <Button 
          onClick={handleRegister} 
          disabled={loading}
          size="lg"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {loading ? 'Inscription...' : 'S\'inscrire'}
        </Button>
      )}
    </div>
  );
}
