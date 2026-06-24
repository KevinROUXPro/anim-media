'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, query, orderBy, getDocs, where, limit as firestoreLimit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Workshop, ActivityCategory, CATEGORY_LABELS, LEVEL_LABELS } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { THEME_CLASSES } from '@/config/theme';
import { fadeInUp, staggerContainer, staggerItem, bounceIn } from '@/lib/animations';
import { formatWorkshopSchedule, getNextSession } from '@/lib/workshop-utils';
import { cache, CacheKeys } from '@/lib/cache';
import { EventCardSkeleton } from '@/components/ui/loading-skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';

export default function WorkshopsPage() {
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);
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
          className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
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
              🎨 Nos Ateliers
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-2xl mx-auto font-light"
              variants={fadeInUp}
            >
              Participez à nos ateliers culturels réguliers et développez vos compétences dans la convivialité
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
                      ? 'bg-[#00A8A8] text-white border-[#00A8A8] shadow-sm'
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

      {/* Liste des ateliers */}
      <section ref={ref} className="py-16 sm:py-20">
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
              initial="hidden"
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
              initial="hidden"
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
const WorkshopCard = React.memo(({ workshop, index }: { workshop: Workshop; index: number }) => {
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
          whileHover={{ 
            scale: 1.04, 
            y: -8,
            rotateZ: index % 2 === 0 ? 1 : -1,
            boxShadow: "0 25px 50px -12px rgba(0, 168, 168, 0.15)"
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 18
          }}
          className="card-premium h-full overflow-hidden flex flex-col p-0 cursor-pointer border-transparent hover:border-[#00A8A8]/20 bg-white"
        >
          {workshop.imageUrl && (
            <div className="h-48 w-full relative overflow-hidden border-b border-zinc-100">
              <OptimizedImage
                src={workshop.imageUrl}
                alt={workshop.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
              {/* Badge inscription sur l'image */}
              {workshop.requiresRegistration && (
                <div className="absolute top-3 right-3 bg-emerald-500/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
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
          )}
          <div className="p-6 flex flex-col flex-grow">
            {!workshop.imageUrl && (
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-subtle-secondary">
                  {categoryInfo.icon} {categoryInfo.label}
                </span>
              </div>
            )}
            <h4 className="text-lg font-bold text-zinc-950 mb-2 line-clamp-1">{workshop.title}</h4>
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
                    <div className="text-[#00A8A8] font-bold flex items-center gap-1">
                      <span>📅 Prochain:</span>
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
            
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex flex-wrap gap-2 text-xs">
                {workshop.instructor && (
                  <span className="bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-md font-medium">
                    👤 {workshop.instructor}
                  </span>
                )}
                <span className="bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-md font-medium">
                  📊 {LEVEL_LABELS[workshop.level]}
                </span>
                {workshop.isRecurring && (
                  <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md font-medium">
                    ♻️ Récurrent
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
                <span className="flex items-center gap-1">📍 {workshop.location || 'Local associatif'}</span>
                
                {workshop.requiresRegistration && workshop.maxParticipants && (
                  <div className="flex items-center gap-1.5">
                    <span>Places :</span>
                    <span className={`${
                      (workshop.currentParticipants || 0) >= workshop.maxParticipants 
                        ? 'text-red-600 font-bold' 
                        : (workshop.currentParticipants || 0) >= workshop.maxParticipants * 0.8 
                          ? 'text-orange-600' 
                          : 'text-green-600'
                    }`}>
                      {workshop.currentParticipants || 0}/{workshop.maxParticipants}
                    </span>
                    {(workshop.currentParticipants || 0) >= workshop.maxParticipants && (
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
    prevProps.workshop.id === nextProps.workshop.id &&
    prevProps.workshop.updatedAt?.getTime() === nextProps.workshop.updatedAt?.getTime() &&
    prevProps.index === nextProps.index
  );
});

WorkshopCard.displayName = 'WorkshopCard';
