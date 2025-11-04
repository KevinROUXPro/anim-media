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

// Labels pour l'affichage
export const CATEGORY_LABELS: Record<ActivityCategory, { label: string; icon: string }> = {
  [ActivityCategory.ARTS_CREATIFS]: { label: 'Arts Créatifs', icon: '🧶' },
  [ActivityCategory.LECTURE_ECRITURE]: { label: 'Lecture & Écriture', icon: '📚' },
  [ActivityCategory.NUMERIQUE]: { label: 'Numérique', icon: '💻' },
  [ActivityCategory.PATRIMOINE]: { label: 'Patrimoine', icon: '🌳' },
  [ActivityCategory.ARTS_VIVANTS]: { label: 'Arts Vivants', icon: '🎭' },
  [ActivityCategory.JEUX_LOISIRS]: { label: 'Jeux & Loisirs', icon: '🎲' },
  [ActivityCategory.AUTRE]: { label: 'Autre', icon: '🌍' },
};

export const LEVEL_LABELS: Record<SkillLevel, string> = {
  [SkillLevel.DEBUTANT]: 'Débutant',
  [SkillLevel.INTERMEDIAIRE]: 'Intermédiaire',
  [SkillLevel.AVANCE]: 'Avancé',
};

// Types de base
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  date: Date;
  instructor: string;
  level: SkillLevel;
  category: ActivityCategory;
  imageUrl?: string;
  location: string;
  requiresRegistration: boolean;
  maxParticipants?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Registration {
  id: string;
  userId: string;
  eventId?: string;
  workshopId?: string;
  createdAt: Date;
}

// Types pour Firestore (avec timestamps Firestore)
export interface UserDoc extends Omit<User, 'createdAt'> {
  createdAt: any; // Firestore Timestamp
}

export interface EventDoc extends Omit<Event, 'date' | 'createdAt' | 'updatedAt'> {
  date: any;
  createdAt: any;
  updatedAt: any;
}

export interface WorkshopDoc extends Omit<Workshop, 'date' | 'createdAt' | 'updatedAt'> {
  date: any;
  createdAt: any;
  updatedAt: any;
}

export interface RegistrationDoc extends Omit<Registration, 'createdAt'> {
  createdAt: any;
}
