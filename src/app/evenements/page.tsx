'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, query, orderBy, getDocs, Timestamp, where, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, ActivityCategory, CATEGORY_LABELS } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { THEME_CLASSES } from '@/config/theme';
import { fadeInUp, staggerContainer, staggerItem, bounceIn } from '@/lib/animations';
import { cache, CacheKeys } from '@/lib/cache';
import { EventCardSkeleton } from '@/components/ui/loading-skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';

export default function EventsPage() {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
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
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#DE3156] via-[#F49928] to-[#00A8A8] text-white py-20 sm:py-24 relative overflow-hidden">
        {/* Animated background shape */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            variants={bounceIn}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
            >
              🎉 Nos Événements
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-2xl mx-auto font-light"
              variants={fadeInUp}
            >
              Découvrez tous nos événements culturels et festifs à venir
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Filtres */}
      <section className="bg-white border-b border-gray-100 shadow-sm sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div 
            className="flex flex-wrap gap-2.5 items-center justify-center sm:justify-start"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem}>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`text-sm font-semibold tracking-wide px-5 py-2.5 rounded-full border transition-all duration-300 ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#DE3156] text-white border-[#DE3156] shadow-sm'
                    : 'bg-white text-zinc-700 border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                Tous
              </button>
            </motion.div>
            {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
              <motion.div key={key} variants={staggerItem}>
                <button
                  onClick={() => setSelectedCategory(key as ActivityCategory)}
                  className={`text-sm font-semibold tracking-wide px-5 py-2.5 rounded-full border transition-all duration-300 flex items-center gap-1.5 ${
                    selectedCategory === key
                      ? 'bg-[#DE3156] text-white border-[#DE3156] shadow-sm'
                      : 'bg-white text-zinc-700 border-zinc-200/80 hover:bg-zinc-50'
                  }`}
                >
                  <span>{value.icon}</span>
                  <span>{value.label}</span>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Liste des événements */}
      <section ref={ref} className="py-16 sm:py-20">
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
              initial="hidden"
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
              initial="hidden"
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
  const { event, index } = props;
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
          whileHover={{ 
            scale: 1.04, 
            y: -8,
            rotateZ: index % 2 === 0 ? 1 : -1,
            boxShadow: "0 25px 50px -12px rgba(222, 49, 86, 0.15)"
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 18
          }}
          className="card-premium h-full overflow-hidden flex flex-col p-0 cursor-pointer border-transparent hover:border-[#DE3156]/20 bg-white"
        >
          {event.imageUrl && (
            <div className="h-48 w-full relative overflow-hidden border-b border-zinc-100">
              <OptimizedImage
                src={event.imageUrl}
                alt={event.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
              {/* Badge inscription sur l'image */}
              {event.requiresRegistration && (
                <div className="absolute top-3 right-3 bg-[#DE3156] text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
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
          )}
          <div className="p-6 flex flex-col flex-grow">
            {!event.imageUrl && (
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-subtle-primary">
                  {categoryInfo.icon} {categoryInfo.label}
                </span>
              </div>
            )}
            <h4 className="text-lg font-bold text-zinc-950 mb-2 line-clamp-1">{event.title}</h4>
            <p className="text-xs font-semibold text-zinc-500 mb-4">
              📅 {formattedDate}
            </p>
            <p className="text-zinc-600 text-sm mb-6 line-clamp-2 flex-grow">{event.description}</p>
            
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
                <span className="flex items-center gap-1.5">📍 {event.location}</span>
                
                {event.requiresRegistration && event.maxParticipants && (
                  <div className="flex items-center gap-1.5">
                    <span>Places :</span>
                    <span className={`${
                      (event.currentParticipants || 0) >= event.maxParticipants 
                        ? 'text-red-600 font-bold' 
                        : (event.currentParticipants || 0) >= event.maxParticipants * 0.8 
                          ? 'text-orange-600' 
                          : 'text-green-600'
                    }`}>
                      {event.currentParticipants || 0}/{event.maxParticipants}
                    </span>
                    {(event.currentParticipants || 0) >= event.maxParticipants && (
                      <span className="text-red-600 text-[10px] uppercase font-bold tracking-wide border border-red-200 bg-red-50 px-1.5 py-0.5 rounded">Complet</span>
                    )}
                  </div>
                )}
              </div>
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
