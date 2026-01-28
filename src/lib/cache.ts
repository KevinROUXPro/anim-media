/**
 * Système de cache simple pour les données Firestore
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Vérifier si l'entrée a expiré
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Vérifie si une clé existe et est valide
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Instance singleton
export const cache = new SimpleCache();

// Nettoyer le cache toutes les 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}

/**
 * Clés de cache standardisées
 */
export const CacheKeys = {
  workshops: (category?: string) => `workshops_${category || 'all'}`,
  events: (category?: string) => `events_${category || 'all'}`,
  user: (userId: string) => `user_${userId}`,
  workshop: (workshopId: string) => `workshop_${workshopId}`,
  event: (eventId: string) => `event_${eventId}`,
  nextSession: (workshopId: string) => `nextSession_${workshopId}`,
};
