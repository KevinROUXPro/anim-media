'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, Workshop, CATEGORY_LABELS, ActivityCategory, MembershipStatus } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { THEME_CLASSES } from '@/config/theme';
import { getNextSession } from '@/lib/workshop-utils';
import { useAuth } from '@/contexts/AuthContext';
import { EventCardSkeleton } from '@/components/ui/loading-skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';
import { cache, CacheKeys } from '@/lib/cache';
import { 
  fadeInUp, 
  staggerContainer, 
  bounceIn, 
  textReveal
} from '@/lib/animations';

export default function Home() {
  const pageRef = React.useRef<HTMLDivElement>(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [upcomingWorkshops, setUpcomingWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!pageRef.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pageRef.current.style.setProperty('--mouse-x', `${x}px`);
    pageRef.current.style.setProperty('--mouse-y', `${y}px`);
  }, []);

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
    <div 
      ref={pageRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen relative overflow-hidden bg-[#FAF9F6] group/page"
    >
      {/* Mouse spotlight glow tracker */}
      <div 
        className="absolute inset-0 opacity-0 group-hover/page:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
        style={{
          background: `radial-gradient(
            800px circle at var(--mouse-x, 0px) var(--mouse-y, 0px),
            rgba(222, 49, 86, 0.05) 0%,
            rgba(244, 153, 40, 0.03) 35%,
            rgba(0, 168, 168, 0.05) 70%,
            transparent 100%
          )`,
        }}
      />

      {/* Hero Section */}
      <section className="relative bg-transparent text-gray-900 overflow-hidden min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] flex items-center border-b border-gray-100/50 z-10">
        
        {/* Animated background shapes with brand colors (subtle opacity) */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
            opacity: [0.08, 0.15, 0.08]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-[10%] left-[8%] w-72 h-72 bg-[#DE3156] rounded-full blur-3xl sm:w-96 sm:h-96"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 270, 180, 90, 0],
            opacity: [0.08, 0.18, 0.08],
            x: [0, 30, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-[10%] right-[8%] w-96 h-96 bg-[#00A8A8] rounded-full blur-3xl sm:w-[32rem] sm:h-[32rem]"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
            y: [0, -20, 0],
            opacity: [0.05, 0.12, 0.05]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[40%] left-[35%] w-80 h-80 bg-[#F49928] rounded-full blur-3xl"
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#DE3156]/20 rounded-full"
            animate={{
              y: [0, -80, 0],
              x: [0, (i % 2 === 0 ? 15 : -15), 0],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 6 + (i * 0.8),
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeInOut"
            }}
            style={{
              left: `${15 + i * 15}%`,
              top: `${40 + (i * 6) % 30}%`
            }}
          />
        ))}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-28 lg:py-32 w-full">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.h1
              variants={bounceIn}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 px-2 tracking-tight text-zinc-900"
            >
              <motion.span 
                className={THEME_CLASSES.textGradient}
                animate={{ 
                  filter: [
                    "drop-shadow(0 0 0px rgba(222, 49, 86, 0))",
                    "drop-shadow(0 4px 16px rgba(222, 49, 86, 0.12))",
                    "drop-shadow(0 0 0px rgba(222, 49, 86, 0))"
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {"Bienvenue à Anim'Média"}
              </motion.span>
            </motion.h1>
            <motion.p
              variants={textReveal}
              className="text-base sm:text-lg md:text-xl lg:text-2xl mb-12 max-w-3xl mx-auto font-medium text-zinc-600 px-4 leading-relaxed"
            >
              Découvrez nos activités culturelles et créatives : tricot, lecture, écriture, généalogie, informatique et bien plus encore !
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-5 justify-center px-4"
            >
              <Link href="/evenements" className="w-full sm:w-auto">
                <motion.div 
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: "0 20px 40px rgba(222, 49, 86, 0.22)"
                  }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="w-full sm:w-auto rounded-xl"
                >
                  <Button size="lg" className={`${THEME_CLASSES.buttonPrimary} w-full text-base px-8 py-6 h-auto`}>
                    🎉 Voir les Événements
                  </Button>
                </motion.div>
              </Link>
              <Link href="/ateliers" className="w-full sm:w-auto">
                <motion.div 
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: "0 20px 40px rgba(0, 168, 168, 0.15)"
                  }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="w-full sm:w-auto rounded-xl"
                >
                  <Button size="lg" variant="outline" className="w-full text-base px-8 py-6 h-auto bg-white/50 border border-gray-200 text-zinc-800 hover:bg-white/90 font-semibold rounded-xl transition-all duration-200">
                    🎨 Découvrir les Ateliers
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Prochaines Activités */}
      <section ref={ref} className="py-16 sm:py-20 md:py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2 
              className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 ${THEME_CLASSES.textGradient} px-2`}
            >
              Prochaines Activités
            </motion.h2>
            <p className="text-zinc-600 text-lg font-medium px-4">
              ✨ Ne manquez pas nos événements et ateliers à venir !
            </p>
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

      {/* Section adhésion */}
      <MembershipCTA />

      {/* Section À propos */}
      <section className="py-20 sm:py-24 bg-transparent border-t border-gray-100/40 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 ${THEME_CLASSES.textGradient}`}>
              {"À propos d'Anim'Média"}
            </h2>
            <div className="h-1.5 w-16 bg-gradient-to-r from-[#DE3156] to-[#F49928] mx-auto rounded-full"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid md:grid-cols-2 gap-12 items-center mb-16"
          >
            <div className="space-y-6 text-zinc-600 text-base sm:text-lg">
              <p className="leading-relaxed">
                <strong className={THEME_CLASSES.textPrimary}>{"Anim'Média"}</strong> est une association culturelle qui favorise le partage des passions et des connaissances pour tous les âges.
              </p>
              <p className="leading-relaxed">
                Notre mission est de créer du lien social et d&apos;animer la vie locale à travers des ateliers d&apos;apprentissage réguliers et des événements thématiques conviviaux.
              </p>
              <p className="leading-relaxed font-semibold text-zinc-800">
                Du tricot à l&apos;informatique, de la lecture à la généalogie, découvrez des activités pour tous les goûts !
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: '🎨', color: '#DE3156', value: '10+', label: 'Ateliers réguliers' },
                { icon: '🎭', color: '#F49928', value: '20+', label: 'Événements par an' },
                { icon: '👥', color: '#00A8A8', value: '100+', label: 'Membres actifs' },
                { icon: '❤️', color: '#DE3156', value: '100%', label: 'Convivialité' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 hover:border-zinc-200/80 transition-all duration-300 shadow-sm"
                >
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <div className="text-3xl font-black mb-1 text-zinc-950">{stat.value}</div>
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#FAF9F6] border border-gray-100 rounded-3xl p-8 sm:p-12 relative overflow-hidden"
          >
            {/* Soft decorative blur circles */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#00A8A8]/5 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[#DE3156]/5 blur-2xl"></div>
            
            <h3 className="text-2xl font-extrabold mb-10 text-zinc-900 text-center relative z-10">Nos Valeurs Clés</h3>
            <div className="grid sm:grid-cols-3 gap-8 text-center relative z-10">
              {[
                { icon: '🤝', title: 'Partage', desc: 'Favoriser les échanges de compétences et de savoirs.' },
                { icon: '🌟', title: 'Créativité', desc: 'Encourager l\'expression culturelle et artistique.' },
                { icon: '📚', title: 'Apprentissage', desc: 'Accompagner chacun dans ses découvertes à son rythme.' }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="space-y-3"
                >
                  <div className="text-4xl mb-2 inline-block">{value.icon}</div>
                  <h4 className="font-bold text-lg text-zinc-900">{value.title}</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
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
          whileHover={{ 
            scale: 1.05, 
            y: -10,
            rotateZ: 1.5,
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
          {imageUrl && (
            <div className="relative h-48 w-full overflow-hidden border-b border-zinc-100">
              <OptimizedImage
                src={imageUrl}
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
          )}
          <div className="p-6 flex flex-col flex-grow">
            {!imageUrl && (
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-subtle-primary">
                  {categoryInfo.icon} {categoryInfo.label}
                </span>
              </div>
            )}
            <h4 className="text-lg font-bold text-zinc-950 mb-1.5 line-clamp-1">{title}</h4>
            <p className="text-xs font-semibold text-zinc-500 mb-4">
              📅 {formattedDate}
            </p>
            <p className="text-zinc-600 text-sm mb-6 line-clamp-2 flex-grow">{description}</p>
            <div className="pt-4 border-t border-zinc-100/80 text-xs font-medium text-zinc-500 flex items-center gap-1.5">
              📍 {location}
            </div>
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
          whileHover={{ 
            scale: 1.05, 
            y: -10,
            rotateZ: -1.5,
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
            <div className="relative h-48 w-full overflow-hidden border-b border-zinc-100">
              <OptimizedImage
                src={workshop.imageUrl}
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
          )}
          <div className="p-6 flex flex-col flex-grow">
            {!workshop.imageUrl && (
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-subtle-secondary">
                  {categoryInfo.icon} {categoryInfo.label}
                </span>
              </div>
            )}
            <h4 className="text-lg font-bold text-zinc-950 mb-1.5 line-clamp-1">{workshop.title}</h4>
            <p className="text-xs font-semibold text-zinc-500 mb-1">
              {scheduleText}
            </p>
            {nextSession && (
              <p className="text-xs text-emerald-600 font-semibold mb-4">
                ▶️ Prochaine séance : {format(nextSession, "d MMM 'à' HH:mm", { locale: fr })}
              </p>
            )}
            <p className="text-zinc-600 text-sm mb-6 line-clamp-2 flex-grow">{workshop.description}</p>
            <div className="pt-4 border-t border-zinc-100/80 text-xs font-medium text-zinc-500 flex items-center gap-1.5">
              📍 {workshop.location}
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
    <section className="py-20 sm:py-24 relative overflow-hidden bg-gradient-to-br from-[#DE3156] via-[#DE3156] to-[#F49928] text-white">
      {/* Decorative patterns */}
      <div 
        className="absolute inset-0 opacity-10 bg-repeat bg-center"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M54 48c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3zm-24 0c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3zm-24 0c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3zm12-24c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3zm24 0c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3zM18 12c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3zm24 0c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3z" fill="%23ffffff" fill-opacity="0.3" fill-rule="evenodd"/%3E%3C/svg%3E")',
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-y-1/2"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-8">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-black px-2 tracking-tight"
          >
            Rejoignez l&apos;aventure ! 🎫
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl md:text-2xl font-medium max-w-2xl mx-auto opacity-95 px-4"
          >
            Devenez adhérent et profitez d&apos;avantages exclusifs sur toutes nos activités
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
          >
            {[
              { icon: '🎟️', title: 'Accès prioritaire', desc: 'Inscrivez-vous en avant-première aux ateliers' },
              { icon: '💰', title: 'Tarifs réduits', desc: 'Bénéficiez de réductions sur les grands événements' },
              { icon: '🎁', title: 'Contenus exclusifs', desc: 'Participez à des ateliers réservés aux membres' }
            ].map((adv, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-3xl">{adv.icon}</div>
                <h3 className="font-bold text-lg text-white">{adv.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4"
          >
            <div className="text-center sm:text-left">
              <div className="text-6xl font-black">15€</div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mt-1">par an</div>
            </div>
            
            <Link href={user ? "/adhesion" : "/login"} className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="w-full bg-white text-[#DE3156] hover:bg-zinc-50 text-lg px-8 py-6 h-auto font-bold rounded-2xl shadow-xl shadow-black/10"
                >
                  ✨ Adhérer Maintenant
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
