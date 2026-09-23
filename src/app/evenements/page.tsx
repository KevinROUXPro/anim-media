'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, query, orderBy, getDocs, Timestamp, where, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, ActivityCategory, CATEGORY_LABELS } from '@/types';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { cache, CacheKeys } from '@/lib/cache';
import { EventCardSkeleton } from '@/components/ui/loading-skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';

export default function EventsPage() {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [availableCategories, setAvailableCategories] = useState<ActivityCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  // Fonction pour récupérer les événements avec cache et filtre Firestore
  const fetchEvents = useCallback(async (category?: ActivityCategory | 'ALL') => {
    const cacheKey = CacheKeys.events(category === 'ALL' ? undefined : category);
    
    // Vérifier le cache
    const cached = cache.get<Event[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const now = Timestamp.now();
      
      // Construire la requête avec filtre côté Firestore
      const eventsQuery = query(
        collection(db, 'events'),
        where('date', '>=', now),
        orderBy('date', 'asc'),
        firestoreLimit(50) // Limiter à 50 événements
      );

      const snapshot = await getDocs(eventsQuery);
      let eventsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Event[];

      // Filtrer par catégorie
      if (category && category !== 'ALL') {
        eventsData = eventsData.filter(event => event.category === category);
      }
      
      // Mettre en cache (TTL de 5 minutes)
      cache.set(cacheKey, eventsData, 5 * 60 * 1000);
      
      return eventsData;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const data = await fetchEvents(selectedCategory);
        setFilteredEvents(data);
        if (selectedCategory === 'ALL') setAvailableCategories([...new Set(data.map(item => item.category))]);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [selectedCategory, fetchEvents]);

  // Mémoriser les événements filtrés
  const memoizedFilteredEvents = useMemo(() => {
    return filteredEvents;
  }, [filteredEvents]);

  return (
    <div className="min-h-screen bg-brand-surface">
      <section className="site-page-heading">
        <h1>Les événements</h1>
        <p>Les prochaines occasions de se retrouver.</p>
      </section>

      {availableCategories.length > 1 && (
        <section className="site-filters" aria-label="Filtrer les activités">
          <button aria-pressed={selectedCategory === 'ALL'} onClick={() => setSelectedCategory('ALL')}>Toutes les activités</button>
          {Object.entries(CATEGORY_LABELS).filter(([key]) => availableCategories.includes(key as ActivityCategory)).map(([key, value]) => (
            <button key={key} aria-pressed={selectedCategory === key} onClick={() => setSelectedCategory(key as ActivityCategory)}>{value.label}</button>
          ))}
        </section>
      )}

      {/* Liste des événements */}
      <section ref={ref} className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : memoizedFilteredEvents.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial={false}
              animate={inView ? "visible" : "hidden"}
            >
              {memoizedFilteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} inView={inView} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
              variants={fadeInUp}
              initial={false}
              animate="visible"
            >
              <p className="text-zinc-500 text-lg font-medium">
                Aucun événement trouvé dans cette catégorie.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

// Memoization du composant EventCard
const EventCard = React.memo((props: { event: Event; index: number; inView: boolean }) => {
  const { event } = props;
  const categoryInfo = CATEGORY_LABELS[event.category];

  // Mémoriser le formatage de la date
  const formattedDate = useMemo(() => {
    return format(event.date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
  }, [event.date]);

  return (
    <motion.div
      variants={fadeInUp}
      className="h-full"
    >
      <Link href={`/evenements/${event.id}`} className="block h-full">
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 18
          }}
          className="site-activity-card card-premium h-full overflow-hidden flex flex-col p-0 cursor-pointer border-transparent hover:border-brand-pink/20 bg-white"
        >
          <div className="h-48 w-full relative overflow-hidden border-b border-zinc-100">
            <OptimizedImage
              src={event.imageUrl || categoryInfo.defaultImage}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
            {/* Badge inscription sur l'image */}
            {event.requiresRegistration && (
              <div className="absolute top-3 right-3 bg-brand-pink text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                Inscription requise
              </div>
            )}
            {!event.requiresRegistration && (
              <div className="absolute top-3 right-3 bg-zinc-900/85 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                Accès libre
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
              <span className="text-lg bg-white/95 rounded-full w-7 h-7 flex items-center justify-center shadow-sm">
                {categoryInfo.icon}
              </span>
              <span className="text-xs font-semibold text-white drop-shadow-md uppercase tracking-wider">{categoryInfo.label}</span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h2 className="text-lg font-bold text-zinc-950 mb-2">{event.title}</h2>
            <p className="text-xs font-semibold text-zinc-500 mb-4">
              📅 {formattedDate}
            </p>
            <p className="text-zinc-600 text-sm mb-6 line-clamp-2 flex-grow">{event.description}</p>
            
            <div className="site-activity-details">
              <p>{event.location || 'Local associatif'}</p>
              {event.requiresRegistration && event.maxParticipants ? (
                <p>{(event.currentParticipants || 0) >= event.maxParticipants ? 'Complet' : `Places disponibles : ${Math.max(0, event.maxParticipants - (event.currentParticipants || 0))}`}</p>
              ) : null}
              <span className="site-card-action">Voir l’événement <span aria-hidden="true">→</span></span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.updatedAt?.getTime() === nextProps.event.updatedAt?.getTime() &&
    prevProps.index === nextProps.index &&
    prevProps.inView === nextProps.inView
  );
});

EventCard.displayName = 'EventCard';
