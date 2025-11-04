'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AutoLogoutProps {
  inactivityTimeout?: number; // en millisecondes (défaut: 30 minutes)
}

export function AutoLogout({ inactivityTimeout = 30 * 60 * 1000 }: AutoLogoutProps) {
  const { signOut, user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    // Effacer le timeout existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Créer un nouveau timeout
    if (user) {
      timeoutRef.current = setTimeout(() => {
        toast.warning('Déconnexion pour inactivité');
        signOut();
      }, inactivityTimeout);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Événements qui réinitialisent le timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });

    // Démarrer le timer initial
    resetTimeout();

    // Nettoyage
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, inactivityTimeout]);

  return null; // Composant invisible
}
