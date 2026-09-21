'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole, MembershipStatus } from '@/types';
import { cache, CacheKeys } from '@/lib/cache';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Vérifier le cache d'abord
        const cacheKey = CacheKeys.user(firebaseUser.uid);
        const cachedUser = cache.get<User>(cacheKey);
        
        if (cachedUser) {
          setUser(cachedUser);
          setLoading(false);
          return;
        }

        // Récupérer les données utilisateur depuis Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData.name || firebaseUser.displayName || '',
            role: userData.role || UserRole.USER,
            createdAt: userData.createdAt?.toDate() || new Date(),
            membershipStatus: userData.membershipStatus || MembershipStatus.NONE,
            membershipNumber: userData.membershipNumber,
            membershipExpiry: userData.membershipExpiry?.toDate(),
            membershipStartDate: userData.membershipStartDate?.toDate(),
          };
          
          setUser(user);
          // Mettre en cache (TTL de 10 minutes)
          cache.set(cacheKey, user, 10 * 60 * 1000);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Mettre à jour le profil
    await updateProfile(firebaseUser, { displayName: name });

    // Tout nouveau compte est créé en simple utilisateur, sans adhésion.
    //
    // Le mécanisme « le premier inscrit devient admin » a été retiré : il
    // reposait sur une lecture de toute la collection `users`, ce qui
    // exposait l'annuaire des membres à n'importe quel compte, et il se
    // déclenchait à nouveau si la collection était vidée.
    //
    // Le premier administrateur se promeut une seule fois à la main :
    // console Firebase > Firestore > users/{uid} > role: "ADMIN".
    // Les suivants sont promus depuis /admin/utilisateurs.
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name,
      role: UserRole.USER,
      createdAt: Timestamp.now(),
      membershipStatus: MembershipStatus.NONE,
    });
  };

  const signOut = async () => {
    // Nettoyer le cache utilisateur à la déconnexion
    if (firebaseUser) {
      const cacheKey = CacheKeys.user(firebaseUser.uid);
      cache.delete(cacheKey);
    }
    await firebaseSignOut(auth);
  };

  const refreshUser = async () => {
    if (!firebaseUser) return;
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name || firebaseUser.displayName || '',
        role: userData.role || UserRole.USER,
        createdAt: userData.createdAt?.toDate() || new Date(),
        membershipStatus: userData.membershipStatus || MembershipStatus.NONE,
        membershipNumber: userData.membershipNumber,
        membershipExpiry: userData.membershipExpiry?.toDate(),
        membershipStartDate: userData.membershipStartDate?.toDate(),
      };
      
      setUser(user);
      // Mettre à jour le cache
      const cacheKey = CacheKeys.user(firebaseUser.uid);
      cache.set(cacheKey, user, 10 * 60 * 1000);
    }
  };

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signIn, signUp, signOut, refreshUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
