// Énumérations
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum ActivityCategory {
  ARTS_CREATIFS = 'ARTS_CREATIFS',
  LECTURE_ECRITURE = 'LECTURE_ECRITURE',
  NUMERIQUE = 'NUMERIQUE',
  PATRIMOINE = 'PATRIMOINE',
  ARTS_VIVANTS = 'ARTS_VIVANTS',
  JEUX_LOISIRS = 'JEUX_LOISIRS',
  AUTRE = 'AUTRE',
}

export enum SkillLevel {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  AVANCE = 'AVANCE',
}

// Labels et images par défaut pour l'affichage
export const CATEGORY_LABELS: Record<ActivityCategory, { label: string; icon: string; defaultImage: string }> = {
  [ActivityCategory.ARTS_CREATIFS]: { 
    label: 'Arts Créatifs', 
    icon: '🧶',
    defaultImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop'
  },
  [ActivityCategory.LECTURE_ECRITURE]: { 
    label: 'Lecture & Écriture', 
    icon: '📚',
    defaultImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop'
  },
  [ActivityCategory.NUMERIQUE]: { 
    label: 'Numérique', 
    icon: '💻',
    defaultImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop'
  },
  [ActivityCategory.PATRIMOINE]: { 
    label: 'Patrimoine', 
    icon: '🌳',
    defaultImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop'
  },
  [ActivityCategory.ARTS_VIVANTS]: { 
    label: 'Arts Vivants', 
    icon: '🎭',
    defaultImage: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=800&auto=format&fit=crop'
  },
  [ActivityCategory.JEUX_LOISIRS]: { 
    label: 'Jeux & Loisirs', 
    icon: '🎲',
    defaultImage: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=800&auto=format&fit=crop'
  },
  [ActivityCategory.AUTRE]: { 
    label: 'Autre', 
    icon: '🌍',
    defaultImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop'
  },
};

export const LEVEL_LABELS: Record<SkillLevel, string> = {
  [SkillLevel.DEBUTANT]: 'Débutant',
  [SkillLevel.INTERMEDIAIRE]: 'Intermédiaire',
  [SkillLevel.AVANCE]: 'Avancé',
};

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  NONE = 'NONE',
}

export const MEMBERSHIP_LABELS: Record<MembershipStatus, { label: string; color: string }> = {
  [MembershipStatus.ACTIVE]: { label: 'Adhérent actif', color: 'green' },
  [MembershipStatus.EXPIRED]: { label: 'Adhésion expirée', color: 'orange' },
    [MembershipStatus.NONE]: { label: 'Non adhérent', color: 'gray' },
};

// Type pour les périodes d'annulation
export interface CancellationPeriod {
  startDate: Date;
  endDate: Date;
  reason: string;
}

// Types de base
export interface UserBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  // Adhésion
  membershipStatus: MembershipStatus;
  membershipNumber?: string;
  membershipExpiry?: Date;
  membershipStartDate?: Date;
  // Gamification & Badges
  points?: number;
  badges?: UserBadge[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  imageUrl?: string;
  category: ActivityCategory;
  requiresRegistration: boolean;
  maxParticipants?: number;
  currentParticipants: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  
  // Récurrence
  isRecurring: boolean;              // true pour les ateliers récurrents
  recurrenceDays: number[];          // Jours de la semaine : 0=Dimanche, 1=Lundi, 2=Mardi, etc.
  recurrenceInterval: number;        // 1 = chaque semaine, 2 = toutes les 2 semaines, etc.
  startTime: string;                 // Heure de début : "16:00"
  endTime: string;                   // Heure de fin : "18:00"
  
  // Période active (optionnel - pour saisons/cycles)
  seasonStartDate?: Date;            // Début de la saison (ex: septembre)
  seasonEndDate?: Date;              // Fin de la saison (ex: juin)
  
  // Périodes d'annulation (ex: vacances de l'animateur)
  cancellationPeriods?: CancellationPeriod[];  // Liste des périodes où l'atelier est annulé
  
  // Informations de l'atelier
  instructor: string;
  level: SkillLevel;
  category: ActivityCategory;
  imageUrl?: string;
  location: string;
  requiresRegistration: boolean;
  maxParticipants?: number;
  currentParticipants: number;
  requiredMaterials?: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Champs obsolètes (à garder temporairement pour compatibilité)
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  schedule?: string;
  firstSessionDate?: Date;
  lastSessionDate?: Date;
}

export interface Registration {
  id: string;
  userId: string;
  eventId?: string;
  workshopId?: string;
  createdAt: Date;
}

export interface AGReport {
  id: string;
  title: string;
  description: string;
  date: Date;
  pdfUrl: string;
  fileName: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SuggestionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'COMPLETED';

export interface Suggestion {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: ActivityCategory;
  likes: string[]; // Array of user IDs who liked
  status?: SuggestionStatus;
  adminComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityMoment {
  id: string;
  userId: string;
  userName: string;
  imageUrl: string;
  caption: string;
  activityTitle?: string;
  createdAt: Date;
  likes: string[];
  status: 'APPROVED' | 'PENDING';
}

import { Timestamp } from 'firebase/firestore';

// Types pour Firestore (avec timestamps Firestore)
export interface UserDoc extends Omit<User, 'createdAt' | 'membershipExpiry' | 'membershipStartDate'> {
  createdAt: Timestamp; // Firestore Timestamp
  membershipExpiry?: Timestamp;
  membershipStartDate?: Timestamp;
}

export interface EventDoc extends Omit<Event, 'date' | 'createdAt' | 'updatedAt'> {
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WorkshopDoc extends Omit<Workshop, 'seasonStartDate' | 'seasonEndDate' | 'cancellationPeriods' | 'createdAt' | 'updatedAt' | 'date' | 'startDate' | 'endDate' | 'firstSessionDate' | 'lastSessionDate'> {
  seasonStartDate?: Timestamp;
  seasonEndDate?: Timestamp;
  cancellationPeriods?: Array<{
    startDate: Timestamp;
    endDate: Timestamp;
    reason: string;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Champs obsolètes optionnels
  date?: Timestamp;
  startDate?: Timestamp;
  endDate?: Timestamp;
  firstSessionDate?: Timestamp;
  lastSessionDate?: Timestamp;
}

export interface RegistrationDoc extends Omit<Registration, 'createdAt'> {
  createdAt: Timestamp;
}

export interface AGReportDoc extends Omit<AGReport, 'date' | 'createdAt' | 'updatedAt'> {
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SuggestionDoc extends Omit<Suggestion, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CommunityMomentDoc extends Omit<CommunityMoment, 'createdAt'> {
  createdAt: Timestamp;
}
