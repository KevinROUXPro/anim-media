/**
 * Utilitaires de validation et sanitization pour la sécurité
 */

// Validation des emails
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321
}

// Validation des mots de passe
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  } else {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  } else {
    score += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  } else {
    score += 1;
  }

  // Déterminer la force
  if (score >= 5) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

// Sanitization des chaînes de caractères (protection XSS)
export function sanitizeString(input: string, maxLength?: number): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input
    .trim()
    // Échapper les caractères HTML dangereux
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Supprimer les caractères de contrôle
    .replace(/[\x00-\x1F\x7F]/g, '');

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

// Validation des noms (alphanumériques + espaces et caractères spéciaux français)
export function isValidName(name: string): boolean {
  if (!name || name.trim().length < 2) {
    return false;
  }
  if (name.length > 100) {
    return false;
  }
  // Autoriser lettres, chiffres, espaces, apostrophes, tirets, accents
  const nameRegex = /^[a-zA-ZÀ-ÿ0-9\s'-]+$/;
  return nameRegex.test(name);
}

// Validation des URLs
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Validation des dates
export function isValidDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(dateObj.getTime()) && dateObj instanceof Date;
}

// Validation des nombres
export function isValidNumber(value: number, min?: number, max?: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }
  if (min !== undefined && value < min) {
    return false;
  }
  if (max !== undefined && value > max) {
    return false;
  }
  return true;
}

// Validation des catégories d'activité
export function isValidCategory(category: string): boolean {
  const validCategories = [
    'ARTS_CREATIFS',
    'LECTURE_ECRITURE',
    'NUMERIQUE',
    'PATRIMOINE',
    'ARTS_VIVANTS',
    'JEUX_LOISIRS',
    'AUTRE',
  ];
  return validCategories.includes(category);
}

// Validation des niveaux de compétence
export function isValidLevel(level: string): boolean {
  const validLevels = ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'];
  return validLevels.includes(level);
}

// Rate limiting simple côté client (pour éviter le spam)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute par défaut
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

// Nettoyer le rate limit map périodiquement
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Nettoyer toutes les minutes

// Validation des données d'événement
export interface EventValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateEvent(data: {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  maxParticipants?: number;
}): EventValidationResult {
  const errors: Record<string, string> = {};

  // Titre
  const sanitizedTitle = sanitizeString(data.title, 200);
  if (!sanitizedTitle || sanitizedTitle.length < 3) {
    errors.title = 'Le titre doit contenir au moins 3 caractères';
  }

  // Description
  const sanitizedDescription = sanitizeString(data.description, 5000);
  if (!sanitizedDescription || sanitizedDescription.length < 10) {
    errors.description = 'La description doit contenir au moins 10 caractères';
  }

  // Date et heure
  if (!data.date || !data.time) {
    errors.date = 'La date et l\'heure sont requises';
  } else {
    const eventDate = new Date(`${data.date}T${data.time}`);
    if (!isValidDate(eventDate) || eventDate < new Date()) {
      errors.date = 'La date doit être dans le futur';
    }
  }

  // Lieu
  const sanitizedLocation = sanitizeString(data.location, 200);
  if (!sanitizedLocation || sanitizedLocation.length < 3) {
    errors.location = 'Le lieu doit contenir au moins 3 caractères';
  }

  // Catégorie
  if (!isValidCategory(data.category)) {
    errors.category = 'Catégorie invalide';
  }

  // Nombre de participants
  if (data.maxParticipants !== undefined) {
    if (!isValidNumber(data.maxParticipants, 1, 1000)) {
      errors.maxParticipants = 'Le nombre de participants doit être entre 1 et 1000';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Validation des données d'atelier
export function validateWorkshop(data: {
  title: string;
  description: string;
  location: string;
  instructor: string;
  category: string;
  level: string;
  recurrenceDays: number[];
  recurrenceInterval: number;
  startTime: string;
  endTime: string;
  maxParticipants?: number;
}): EventValidationResult {
  const errors: Record<string, string> = {};

  // Titre
  const sanitizedTitle = sanitizeString(data.title, 200);
  if (!sanitizedTitle || sanitizedTitle.length < 3) {
    errors.title = 'Le titre doit contenir au moins 3 caractères';
  }

  // Description
  const sanitizedDescription = sanitizeString(data.description, 5000);
  if (!sanitizedDescription || sanitizedDescription.length < 10) {
    errors.description = 'La description doit contenir au moins 10 caractères';
  }

  // Lieu
  const sanitizedLocation = sanitizeString(data.location, 200);
  if (!sanitizedLocation || sanitizedLocation.length < 3) {
    errors.location = 'Le lieu doit contenir au moins 3 caractères';
  }

  // Animateur
  const sanitizedInstructor = sanitizeString(data.instructor, 100);
  if (!sanitizedInstructor || sanitizedInstructor.length < 2) {
    errors.instructor = 'Le nom de l\'animateur est requis';
  }

  // Catégorie
  if (!isValidCategory(data.category)) {
    errors.category = 'Catégorie invalide';
  }

  // Niveau
  if (!isValidLevel(data.level)) {
    errors.level = 'Niveau invalide';
  }

  // Jours de récurrence
  if (!data.recurrenceDays || data.recurrenceDays.length === 0) {
    errors.recurrenceDays = 'Au moins un jour doit être sélectionné';
  } else {
    const validDays = data.recurrenceDays.every(day => day >= 0 && day <= 6);
    if (!validDays) {
      errors.recurrenceDays = 'Jours invalides';
    }
  }

  // Intervalle de récurrence
  if (!isValidNumber(data.recurrenceInterval, 1, 4)) {
    errors.recurrenceInterval = 'L\'intervalle doit être entre 1 et 4';
  }

  // Horaires
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(data.startTime)) {
    errors.startTime = 'Format d\'heure invalide (HH:MM)';
  }
  if (!timeRegex.test(data.endTime)) {
    errors.endTime = 'Format d\'heure invalide (HH:MM)';
  }

  // Vérifier que l'heure de fin est après l'heure de début
  if (timeRegex.test(data.startTime) && timeRegex.test(data.endTime)) {
    const [startHours, startMinutes] = data.startTime.split(':').map(Number);
    const [endHours, endMinutes] = data.endTime.split(':').map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    if (endTotal <= startTotal) {
      errors.endTime = 'L\'heure de fin doit être après l\'heure de début';
    }
  }

  // Nombre de participants
  if (data.maxParticipants !== undefined) {
    if (!isValidNumber(data.maxParticipants, 1, 1000)) {
      errors.maxParticipants = 'Le nombre de participants doit être entre 1 et 1000';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
