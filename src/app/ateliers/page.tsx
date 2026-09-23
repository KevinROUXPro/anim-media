'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, query, orderBy, getDocs, where, limit as firestoreLimit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Workshop, ActivityCategory, CATEGORY_LABELS } from '@/types';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { formatWorkshopSchedule, getNextSession } from '@/lib/workshop-utils';
import { cache, CacheKeys } from '@/lib/cache';
import { EventCardSkeleton } from '@/components/ui/loading-skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';

export default function WorkshopsPage() {
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);
  const [availableCategories, setAvailableCategories] = useState<ActivityCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  // Fonction pour récupérer les ateliers avec cache
  const fetchWorkshops = useCallback(async (category?: ActivityCategory | 'ALL') => {
    const cacheKey = CacheKeys.workshops(category === 'ALL' ? undefined : category);
    
    // Vérifier le cache
    const cached = cache.get<Workshop[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Construire la requête avec filtre côté Firestore si une catégorie est sélectionnée
      let workshopsQuery = query(
        collection(db, 'workshops'),
        orderBy('createdAt', 'desc'),
        firestoreLimit(50) // Limiter à 50 ateliers initialement
      );

      // Filtrer par catégorie côté Firestore si nécessaire
      if (category && category !== 'ALL') {
        workshopsQuery = query(
          collection(db, 'workshops'),
          where('category', '==', category),
          orderBy('createdAt', 'desc'),
          firestoreLimit(50)
        );
      }

      const snapshot = await getDocs(workshopsQuery);
      const workshopsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          isRecurring: data.isRecurring || false,
          recurrenceDays: data.recurrenceDays || [],
          recurrenceInterval: data.recurrenceInterval || 1,
          startTime: data.startTime || '14:00',
          endTime: data.endTime || '16:00',
          seasonStartDate: data.seasonStartDate?.toDate(),
          seasonEndDate: data.seasonEndDate?.toDate(),
          cancellationPeriods: data.cancellationPeriods?.map((p: { startDate: Timestamp; endDate: Timestamp; reason: string }) => ({
            startDate: p.startDate.toDate(),
            endDate: p.endDate.toDate(),
            reason: p.reason
          })),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          date: data.date?.toDate(),
        };
      }) as Workshop[];
      
      // Filtrer les ateliers dont la saison est terminée
      const activeWorkshops = workshopsData.filter(w => {
        if (w.isRecurring) {
          const nextSession = getNextSession(
            w.recurrenceDays || [],
            w.recurrenceInterval || 1,
            w.seasonStartDate,
            w.seasonEndDate,
            w.startTime || '14:00',
            w.cancellationPeriods
          );
          return nextSession !== null || !w.seasonEndDate;
        }
        
        if (w.seasonEndDate && w.seasonEndDate < new Date()) return false;
        return true;
      });
      
      // Mettre en cache (TTL de 5 minutes)
      cache.set(cacheKey, activeWorkshops, 5 * 60 * 1000);
      
      return activeWorkshops;
    } catch (error) {
      console.error('Error fetching workshops:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    async function loadWorkshops() {
      setLoading(true);
      try {
        const data = await fetchWorkshops(selectedCategory);
        setFilteredWorkshops(data);
        if (selectedCategory === 'ALL') setAvailableCategories([...new Set(data.map(item => item.category))]);
      } catch (error) {
        console.error('Error loading workshops:', error);
      } finally {
        setLoading(false);
      }
    }

    loadWorkshops();
  }, [selectedCategory, fetchWorkshops]);

  // Mémoriser les ateliers filtrés
  const memoizedFilteredWorkshops = useMemo(() => {
    return filteredWorkshops;
  }, [filteredWorkshops]);

  return (
    <div className="min-h-screen bg-brand-surface">
      <section className="site-page-heading">
        <h1>Les ateliers</h1>
        <p>Choisissez une activité qui vous plaît.</p>
      </section>

      {availableCategories.length > 1 && (
        <section className="site-filters" aria-label="Filtrer les activités">
          <button aria-pressed={selectedCategory === 'ALL'} onClick={() => setSelectedCategory('ALL')}>Toutes les activités</button>
          {Object.entries(CATEGORY_LABELS).filter(([key]) => availableCategories.includes(key as ActivityCategory)).map(([key, value]) => (
            <button key={key} aria-pressed={selectedCategory === key} onClick={() => setSelectedCategory(key as ActivityCategory)}>{value.label}</button>
          ))}
        </section>
      )}

      {/* Liste des ateliers */}
      <section ref={ref} className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : memoizedFilteredWorkshops.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial={false}
              animate={inView ? "visible" : "hidden"}
            >
              {memoizedFilteredWorkshops.map((workshop, index) => (
                <WorkshopCard key={workshop.id} workshop={workshop} index={index} />
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
                Aucun atelier trouvé dans cette catégorie.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

// Memoization du composant WorkshopCard
const WorkshopCard = React.memo(({ workshop }: { workshop: Workshop; index: number }) => {
  const categoryInfo = CATEGORY_LABELS[workshop.category];
  
  // Mémoriser le calcul de la prochaine séance
  const nextSession = useMemo(() => {
    if (!workshop.isRecurring) return null;
    
    // Vérifier le cache
    const cacheKey = CacheKeys.nextSession(workshop.id);
    const cached = cache.get<Date | null>(cacheKey);
    if (cached !== null) return cached;
    
    const session = getNextSession(
      workshop.recurrenceDays, 
      workshop.recurrenceInterval || 1,
      workshop.seasonStartDate,
      workshop.seasonEndDate,
      workshop.startTime,
      workshop.cancellationPeriods
    );
    
    cache.set(cacheKey, session, 60 * 60 * 1000);
    return session;
  }, [
    workshop.isRecurring,
    workshop.recurrenceDays,
    workshop.recurrenceInterval,
    workshop.seasonStartDate,
    workshop.seasonEndDate,
    workshop.startTime,
    workshop.id,
    workshop.cancellationPeriods,
  ]);

  const scheduleText = useMemo(() => {
    if (!workshop.isRecurring) {
      return workshop.date ? format(workshop.date, "d MMMM yyyy 'à' HH:mm", { locale: fr }) : null;
    }
    return formatWorkshopSchedule(
      workshop.recurrenceDays, 
      workshop.startTime, 
      workshop.endTime,
      workshop.recurrenceInterval
    );
  }, [workshop.isRecurring, workshop.recurrenceDays, workshop.startTime, workshop.endTime, workshop.recurrenceInterval, workshop.date]);

  return (
    <motion.div
      variants={fadeInUp}
      className="h-full"
    >
      <Link href={`/ateliers/${workshop.id}`} className="block h-full">
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 18
          }}
          className="site-activity-card card-premium h-full overflow-hidden flex flex-col p-0 cursor-pointer border-transparent hover:border-brand-blue/20 bg-white"
        >
          <div className="h-48 w-full relative overflow-hidden border-b border-zinc-100">
            <OptimizedImage
              src={workshop.imageUrl || categoryInfo.defaultImage}
              alt={workshop.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
            {/* Badge inscription sur l'image */}
            {workshop.requiresRegistration && (
              <div className="absolute top-3 right-3 bg-brand-blue text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                Inscription requise
              </div>
            )}
            {!workshop.requiresRegistration && (
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
            <h2 className="text-lg font-bold text-zinc-950 mb-2">{workshop.title}</h2>
            <div className="text-xs font-medium text-zinc-500 space-y-1 mb-4">
              {workshop.isRecurring ? (
                <>
                  {scheduleText && (
                    <div className="flex items-center gap-1">
                      <span>🕐</span>
                      <span>{scheduleText}</span>
                    </div>
                  )}
                  {nextSession && (
                    <div className="text-brand-blue font-bold flex items-center gap-1">
                      <span>📅 Prochain :</span>
                      <span>{format(nextSession, "d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
                    </div>
                  )}
                </>
              ) : (
                scheduleText && (
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>{scheduleText}</span>
                  </div>
                )
              )}
            </div>
            
            <p className="text-zinc-600 text-sm mb-6 line-clamp-2 flex-grow">{workshop.description}</p>
            
            <div className="site-activity-details">
              <p>{workshop.location || 'Local associatif'}</p>
              {workshop.requiresRegistration && workshop.maxParticipants ? (
                <p>{(workshop.currentParticipants || 0) >= workshop.maxParticipants ? 'Complet' : `Places disponibles : ${Math.max(0, workshop.maxParticipants - (workshop.currentParticipants || 0))}`}</p>
              ) : null}
              <span className="site-card-action">Voir l’atelier <span aria-hidden="true">→</span></span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.workshop.id === nextProps.workshop.id &&
    prevProps.workshop.updatedAt?.getTime() === nextProps.workshop.updatedAt?.getTime() &&
    prevProps.index === nextProps.index
  );
});

WorkshopCard.displayName = 'WorkshopCard';
