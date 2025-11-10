/**
 * Utilitaires pour la gestion des ateliers récurrents
 */

/**
 * Labels des jours de la semaine
 */
import { addDays, startOfDay } from 'date-fns';
import { CancellationPeriod } from '@/types';

export const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
};

/**
 * Labels courts des jours
 */
export const WEEKDAY_SHORT_LABELS: Record<number, string> = {
  0: 'Dim',
  1: 'Lun',
  2: 'Mar',
  3: 'Mer',
  4: 'Jeu',
  5: 'Ven',
  6: 'Sam',
};

/**
 * Labels pour les intervalles de récurrence
 */
export const RECURRENCE_INTERVAL_LABELS: Record<number, string> = {
  1: 'Chaque semaine',
  2: 'Toutes les 2 semaines',
  3: 'Toutes les 3 semaines',
  4: 'Tous les mois',
};

/**
 * Vérifie si une date est dans une période d'annulation
 */
function isDateCancelled(date: Date, cancellationPeriods?: CancellationPeriod[]): boolean {
  if (!cancellationPeriods || cancellationPeriods.length === 0) return false;
  
  // Normaliser la date à vérifier (début de journée pour comparaison)
  const checkDate = startOfDay(date);
  const checkTime = checkDate.getTime();
  
  return cancellationPeriods.some(period => {
    // Normaliser les dates de début et fin de période (début et fin de journée)
    const startTime = startOfDay(period.startDate).getTime();
    const endDate = new Date(period.endDate);
    endDate.setHours(23, 59, 59, 999); // Fin de journée
    const endTime = endDate.getTime();
    
    return checkTime >= startTime && checkTime <= endTime;
  });
}

/**
 * Génère toutes les dates d'occurrence d'un atelier récurrent
 * @param recurrenceDays - Jours de la semaine (0=Dimanche, 1=Lundi, etc.)
 * @param recurrenceInterval - Intervalle en semaines (1 = chaque semaine, 2 = toutes les 2 semaines)
 * @param seasonStartDate - Date de début de saison (optionnel, par défaut aujourd'hui)
 * @param seasonEndDate - Date de fin de saison (optionnel, par défaut dans 1 an)
 * @param startTime - Heure de début (format "HH:mm")
 * @param endTime - Heure de fin (format "HH:mm")
 * @param maxSessions - Nombre maximum de séances à générer (par défaut 100)
 * @param cancellationPeriods - Périodes d'annulation à exclure
 * @returns Array de dates de toutes les séances (sans les périodes annulées)
 */
export function generateWorkshopDates(
  recurrenceDays: number[],
  recurrenceInterval: number = 1,
  seasonStartDate?: Date,
  seasonEndDate?: Date,
  startTime: string = '14:00',
  endTime: string = '18:00',
  maxSessions: number = 100,
  cancellationPeriods?: CancellationPeriod[]
): Date[] {
  const dates: Date[] = [];
  const start = seasonStartDate || new Date();
  const end = seasonEndDate || new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());
  
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  let weekCounter = 0;

  // Parcourir tous les jours entre le début et la fin
  while (current <= endDate && dates.length < maxSessions) {
    const dayOfWeek = current.getDay();
    
    // Si le jour actuel fait partie des jours de récurrence ET que c'est la bonne semaine
    if (recurrenceDays.includes(dayOfWeek) && weekCounter % recurrenceInterval === 0) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const sessionDate = new Date(current);
      sessionDate.setHours(hours, minutes, 0, 0);
      
      // Vérifier si cette date n'est pas dans une période d'annulation
      if (!isDateCancelled(sessionDate, cancellationPeriods)) {
        dates.push(sessionDate);
      }
    }
    
    // Passer au jour suivant
    current.setDate(current.getDate() + 1);
    
    // Incrémenter le compteur de semaine à chaque dimanche
    if (dayOfWeek === 0) {
      weekCounter++;
    }
  }
  
  return dates;
}

/**
 * Obtient la prochaine séance d'un atelier
 * @param recurrenceDays - Jours de la semaine
 * @param recurrenceInterval - Intervalle en semaines
 * @param seasonStartDate - Date de début de saison (optionnel)
 * @param seasonEndDate - Date de fin de saison (optionnel)
 * @param startTime - Heure de début
 * @param cancellationPeriods - Périodes d'annulation
 * @returns La prochaine date de séance ou null
 */
export function getNextSession(
  recurrenceDays: number[],
  recurrenceInterval: number = 1,
  seasonStartDate?: Date,
  seasonEndDate?: Date,
  startTime: string = '14:00',
  cancellationPeriods?: CancellationPeriod[]
): Date | null {
  const now = new Date();
  const allDates = generateWorkshopDates(
    recurrenceDays,
    recurrenceInterval,
    seasonStartDate,
    seasonEndDate,
    startTime,
    '00:00',
    50, // Limiter à 50 prochaines séances
    cancellationPeriods
  );
  
  // Trouver la première date dans le futur
  const nextDate = allDates.find(date => date > now);
  return nextDate || null;
}

/**
 * Formate l'horaire d'un atelier
 * @param recurrenceDays - Jours de la semaine
 * @param recurrenceInterval - Intervalle en semaines (1 = chaque semaine, 2 = toutes les 2 semaines)
 * @param startTime - Heure de début
 * @param endTime - Heure de fin
 * @returns String formatée (ex: "Mardi et Jeudi 16h-18h" ou "Mardi (toutes les 2 semaines) 16h-18h")
 */
export function formatWorkshopSchedule(
  recurrenceDays: number[],
  startTime: string,
  endTime: string,
  recurrenceInterval: number = 1
): string {
  const sortedDays = [...recurrenceDays].sort((a, b) => a - b);
  
  let daysText = '';
  if (sortedDays.length === 1) {
    daysText = `Tous les ${WEEKDAY_LABELS[sortedDays[0]].toLowerCase()}s`;
  } else if (sortedDays.length === 2) {
    daysText = `${WEEKDAY_LABELS[sortedDays[0]]} et ${WEEKDAY_LABELS[sortedDays[1]]}`;
  } else {
    const lastDay = sortedDays[sortedDays.length - 1];
    const otherDays = sortedDays.slice(0, -1).map(d => WEEKDAY_LABELS[d]).join(', ');
    daysText = `${otherDays} et ${WEEKDAY_LABELS[lastDay]}`;
  }
  
  // Ajouter l'intervalle si nécessaire
  if (recurrenceInterval > 1) {
    daysText += ` (${RECURRENCE_INTERVAL_LABELS[recurrenceInterval] || `toutes les ${recurrenceInterval} semaines`})`;
  }
  
  // Formater les heures (enlever les :00 si présent)
  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    return m === '00' ? `${h}h` : `${h}h${m}`;
  };
  
  return `${daysText} ${formatTime(startTime)}-${formatTime(endTime)}`;
}

/**
 * Compte le nombre total de séances d'un atelier
 */
export function countTotalSessions(
  recurrenceDays: number[],
  recurrenceInterval: number = 1,
  seasonStartDate?: Date,
  seasonEndDate?: Date,
  startTime: string = '14:00',
  cancellationPeriods?: CancellationPeriod[]
): number {
  return generateWorkshopDates(
    recurrenceDays,
    recurrenceInterval,
    seasonStartDate,
    seasonEndDate,
    startTime,
    '00:00',
    100,
    cancellationPeriods
  ).length;
}
