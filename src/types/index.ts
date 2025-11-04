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

// Types de base
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
  date: Date;
  startDate: Date;
  endDate: Date;
  schedule: string;
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
}

export interface Registration {
  id: string;
  userId: string;
  eventId?: string;
  workshopId?: string;
  createdAt: Date;
}

// Types pour Firestore (avec timestamps Firestore)
export interface UserDoc extends Omit<User, 'createdAt' | 'membershipExpiry' | 'membershipStartDate'> {
  createdAt: any; // Firestore Timestamp
  membershipExpiry?: any;
  membershipStartDate?: any;
}

export interface EventDoc extends Omit<Event, 'date' | 'createdAt' | 'updatedAt'> {
  date: any;
  createdAt: any;
  updatedAt: any;
}

export interface WorkshopDoc extends Omit<Workshop, 'date' | 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> {
  date: any;
  startDate: any;
  endDate: any;
  createdAt: any;
  updatedAt: any;
}

export interface RegistrationDoc extends Omit<Registration, 'createdAt'> {
  createdAt: any;
}
