'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, Workshop, CATEGORY_LABELS, ActivityCategory, MembershipStatus } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getNextSession } from '@/lib/workshop-utils';
import { useAuth } from '@/contexts/AuthContext';
import { EventCardSkeleton } from '@/components/ui/loading-skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';
import { cache, CacheKeys } from '@/lib/cache';
import { MatchQuizModal } from '@/components/MatchQuizModal';
import { MediaGallery } from '@/components/MediaGallery';
import { BrandArtwork } from '@/components/BrandArtwork';
import { 
  fadeInUp, 
} from '@/lib/animations';

export default function Home() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [upcomingWorkshops, setUpcomingWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Fonction pour récupérer les activités avec cache
  const fetchUpcomingActivities = useCallback(async () => {
    const cacheKey = 'home_upcoming_activities';
    
    // Vérifier le cache
    const cached = cache.get<{ events: Event[]; workshops: Workshop[] }>(cacheKey);
    if (cached) {
      setUpcomingEvents(cached.events);
      setUpcomingWorkshops(cached.workshops);
      setLoading(false);
      return;
    }

    try {
      const now = Timestamp.now();

      // Récupérer les 3 prochains événements
      const eventsQuery = query(
        collection(db, 'events'),
        where('date', '>=', now),
        orderBy('date', 'asc'),
        limit(3)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Event[];

      // Récupérer les ateliers avec limite
      const workshopsQuery = query(
        collection(db, 'workshops'),
        orderBy('createdAt', 'desc'),
        limit(20) // Limiter à 20 pour le traitement
      );
      const workshopsSnapshot = await getDocs(workshopsQuery);
      
      const allWorkshops = workshopsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          isRecurring: data.isRecurring || false,
          recurrenceDays: data.recurrenceDays || [],
          recurrenceInterval: data.recurrenceInterval || 1,
          startTime: data.startTime || '14:00',
          endTime: data.endTime || '16:00',
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          seasonStartDate: data.seasonStartDate?.toDate(),
          seasonEndDate: data.seasonEndDate?.toDate(),
          cancellationPeriods: data.cancellationPeriods?.map((period: { startDate: Timestamp; endDate: Timestamp; reason: string }) => ({
            startDate: period.startDate.toDate(),
            endDate: period.endDate.toDate(),
            reason: period.reason
          }))
        } as Workshop;
      });

      // Filtrer et trier les ateliers par prochaine séance
      const workshopsWithNextSession = allWorkshops
        .map(workshop => {
          let nextSession: Date | null = null;
          
          if (workshop.isRecurring) {
            // Vérifier le cache pour nextSession
            const sessionCacheKey = CacheKeys.nextSession(workshop.id);
            const cachedSession = cache.get<Date | null>(sessionCacheKey);
            if (cachedSession !== null) {
              nextSession = cachedSession;
            } else {
              nextSession = getNextSession(
                workshop.recurrenceDays || [],
                workshop.recurrenceInterval || 1,
                workshop.seasonStartDate,
                workshop.seasonEndDate,
                workshop.startTime || '14:00',
                workshop.cancellationPeriods
              );
              // Mettre en cache
              cache.set(sessionCacheKey, nextSession, 60 * 60 * 1000);
            }
          } else if (workshop.startDate && workshop.startDate > new Date()) {
            nextSession = workshop.startDate;
          }
          
          return { workshop, nextSession };
        })
        .filter(item => {
          return item.nextSession !== null || !item.workshop.seasonEndDate;
        })
        .sort((a, b) => {
          if (a.nextSession && b.nextSession) {
            return a.nextSession.getTime() - b.nextSession.getTime();
          }
          if (a.nextSession && !b.nextSession) return -1;
          if (!a.nextSession && b.nextSession) return 1;
          return 0;
        })
        .slice(0, 3)
        .map(item => item.workshop);

      setUpcomingEvents(events);
      setUpcomingWorkshops(workshopsWithNextSession);
      
      // Mettre en cache (TTL de 2 minutes pour la page d'accueil)
      cache.set(cacheKey, { events, workshops: workshopsWithNextSession }, 2 * 60 * 1000);
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingActivities();
  }, [fetchUpcomingActivities]);

  return (
    <div className="site-home">
      <section className="welcome-hero">
        <div className="welcome-copy">
          <p className="site-kicker"><span aria-hidden="true" /> Anim’Média · La Guerche</p>
          <h1><span>Des passions</span><br /><strong>à partager.</strong></h1>
          <p>Des ateliers et des rencontres, pour le plaisir d’apprendre ensemble.</p>
          <div className="welcome-actions">
            <Link className="site-button" href="/ateliers">Découvrir les ateliers <ArrowRight size={19} aria-hidden="true" /></Link>
            <Link className="site-secondary-link" href="/evenements">Voir les événements <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
          <button className="site-quiz-link" onClick={() => setIsQuizOpen(true)}><Sparkles size={17} aria-hidden="true" /> Aidez-moi à choisir un atelier</button>
        </div>

        <BrandArtwork />
      </section>

      {/* Les prochains rendez-vous */}
      <section ref={ref} className="activities-section py-12 sm:py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="mb-8"
          >
            <motion.h2 
              className="text-3xl font-semibold text-zinc-800"
            >
              Les prochains rendez-vous
            </motion.h2>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-20">
              {/* Événements */}
              {upcomingEvents.length > 0 && (
                <div>
                  <motion.h3 
                    className="text-xl sm:text-2xl font-extrabold mb-8 flex items-center gap-3 px-2"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-3xl">🎉</span>
                    <span className="text-zinc-800">Événements à venir</span>
                  </motion.h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingEvents.map((event, index) => (
                      <ActivityCard
                        key={event.id}
                        title={event.title}
                        description={event.description}
                        date={event.date}
                        category={event.category}
                        location={event.location}
                        imageUrl={event.imageUrl}
                        href={`/evenements/${event.id}`}
                        delay={index * 0.1}
                        inView={inView}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Ateliers */}
              {upcomingWorkshops.length > 0 && (
                <div>
                  <motion.h3 
                    className="text-xl sm:text-2xl font-extrabold mb-8 flex items-center gap-3 px-2"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-3xl">🎨</span>
                    <span className="text-zinc-800">Ateliers à venir</span>
                  </motion.h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingWorkshops.map((workshop, index) => (
                      <WorkshopCard
                        key={workshop.id}
                        workshop={workshop}
                        delay={index * 0.1}
                        inView={inView}
                      />
                    ))}
                  </div>
                </div>
              )}

              {upcomingEvents.length === 0 && upcomingWorkshops.length === 0 && (
                <p className="text-center text-zinc-500 text-lg py-12">
                  Aucune activité prévue pour le moment. Revenez bientôt !
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="association-note">
        <h2>Le plaisir de se retrouver.</h2>
        <p>Lecture, tricot, écriture, généalogie, informatique… À Anim’Média, chacun partage ses envies et apprend à son rythme.</p>
      </section>

      {/* Galerie Participative */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MediaGallery />
      </div>

      {/* CTA Adhésion */}
      <MembershipCTA />

      {/* Modal Quiz Match Culturel */}
      <MatchQuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </div>
  );
}

// Composant ActivityCard
const ActivityCard = React.memo((props: {
  title: string;
  description: string;
  date: Date;
  category: ActivityCategory;
  location: string;
  href: string;
  imageUrl?: string;
  delay: number;
  inView: boolean;
}) => {
  const { title, description, date, category, location, href, imageUrl, delay } = props;
  const categoryInfo = CATEGORY_LABELS[category];

  const formattedDate = useMemo(() => {
    return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
  }, [date]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay }}
      className="h-full"
    >
      <Link href={href} className="block h-full">
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
          <div className="relative h-48 w-full overflow-hidden border-b border-zinc-100">
            <OptimizedImage
              src={imageUrl || categoryInfo.defaultImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="text-xl bg-white/95 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                {categoryInfo.icon}
              </span>
              <span className="text-xs font-semibold text-white drop-shadow-md uppercase tracking-wider">{categoryInfo.label}</span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h4 className="text-lg font-bold text-zinc-950 mb-1.5 line-clamp-1">{title}</h4>
            <p className="text-xs font-semibold text-zinc-500 mb-4">
              📅 {formattedDate}
            </p>
            <p className="text-zinc-600 text-sm mb-6 line-clamp-2 flex-grow">{description}</p>
            <div className="pt-4 border-t border-zinc-100/80 text-xs font-medium text-zinc-500 flex items-center gap-1.5">
              📍 {location}
            </div>
            <span className="site-card-action">Voir l’événement <span aria-hidden="true">→</span></span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.date?.getTime() === nextProps.date?.getTime() &&
    prevProps.category === nextProps.category &&
    prevProps.location === nextProps.location &&
    prevProps.href === nextProps.href &&
    prevProps.imageUrl === nextProps.imageUrl &&
    prevProps.delay === nextProps.delay &&
    prevProps.inView === nextProps.inView
  );
});

ActivityCard.displayName = 'ActivityCard';

// Composant WorkshopCard
const WorkshopCard = React.memo((props: {
  workshop: Workshop;
  delay: number;
  inView: boolean;
}) => {
  const { workshop, delay } = props;
  const categoryInfo = CATEGORY_LABELS[workshop.category];

  const nextSession = useMemo(() => {
    if (!workshop.isRecurring) {
      return workshop.startDate && workshop.startDate > new Date() ? workshop.startDate : null;
    }
    
    const cacheKey = CacheKeys.nextSession(workshop.id);
    const cached = cache.get<Date | null>(cacheKey);
    if (cached !== null) return cached;
    
    const session = getNextSession(
      workshop.recurrenceDays || [],
      workshop.recurrenceInterval || 1,
      workshop.seasonStartDate,
      workshop.seasonEndDate,
      workshop.startTime || '14:00',
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
    workshop.startDate,
    workshop.id,
    workshop.cancellationPeriods,
  ]);

  const scheduleText = useMemo(() => {
    if (workshop.isRecurring && workshop.recurrenceDays) {
      return `📅 Chaque ${workshop.recurrenceDays
        .map(day => ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][day])
        .join(', ')} à ${workshop.startTime || '14:00'}`;
    }
    return nextSession
      ? `📅 Le ${format(nextSession, "d MMMM yyyy 'à' HH:mm", { locale: fr })}`
      : '📅 Dates à venir';
  }, [workshop.isRecurring, workshop.recurrenceDays, workshop.startTime, nextSession]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay }}
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
          <div className="relative h-48 w-full overflow-hidden border-b border-zinc-100">
            <OptimizedImage
              src={workshop.imageUrl || categoryInfo.defaultImage}
              alt={workshop.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="text-xl bg-white/95 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
                {categoryInfo.icon}
              </span>
              <span className="text-xs font-semibold text-white drop-shadow-md uppercase tracking-wider">{categoryInfo.label}</span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h4 className="text-lg font-bold text-zinc-950 mb-1.5 line-clamp-1">{workshop.title}</h4>
            <p className="text-xs font-semibold text-zinc-500 mb-1">
              {scheduleText}
            </p>
            {nextSession && (
              <p className="text-xs text-emerald-800 font-semibold mb-4">
                ▶️ Prochaine séance : {format(nextSession, "d MMM 'à' HH:mm", { locale: fr })}
              </p>
            )}
            <p className="text-zinc-600 text-sm mb-6 line-clamp-2 flex-grow">{workshop.description}</p>
            <div className="pt-4 border-t border-zinc-100/80 text-xs font-medium text-zinc-500 flex items-center gap-1.5">
              📍 {workshop.location}
            </div>
            <span className="site-card-action">Voir l’atelier <span aria-hidden="true">→</span></span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.workshop.id === nextProps.workshop.id &&
    prevProps.workshop.updatedAt?.getTime() === nextProps.workshop.updatedAt?.getTime() &&
    prevProps.delay === nextProps.delay &&
    prevProps.inView === nextProps.inView
  );
});

WorkshopCard.displayName = 'WorkshopCard';

// Section CTA pour l'adhésion
function MembershipCTA() {
  const { user } = useAuth();

  if (user?.membershipStatus === MembershipStatus.ACTIVE) {
    return null;
  }

  return (
    <section className="membership-note">
      <div>
        <h2>Rejoindre l’association</h2>
        <p>15 € par an pour soutenir Anim’Média et profiter des avantages adhérents.</p>
      </div>
      <Link className="site-button" href="/adhesion">Découvrir l’adhésion <ArrowRight size={18} aria-hidden="true" /></Link>
    </section>
  );
}
