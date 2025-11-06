'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, Workshop, CATEGORY_LABELS, ActivityCategory, MembershipStatus, CancellationPeriod } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { THEME_CLASSES } from '@/config/theme';
import { getNextSession } from '@/lib/workshop-utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fadeInUp, 
  staggerContainer, 
  staggerItem, 
  bounceIn, 
  slideInLeft, 
  slideInRight,
  floatingAnimation,
  textReveal,
  buttonHover,
  buttonTap,
  cardHover,
  cardTap
} from '@/lib/animations';

export default function Home() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [upcomingWorkshops, setUpcomingWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpcomingActivities() {
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

        // Récupérer tous les ateliers actifs
        const workshopsQuery = query(
          collection(db, 'workshops'),
          orderBy('createdAt', 'desc')
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
            cancellationPeriods: data.cancellationPeriods?.map((period: any) => ({
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
              nextSession = getNextSession(
                workshop.recurrenceDays || [],
                workshop.recurrenceInterval || 1,
                workshop.seasonStartDate,
                workshop.seasonEndDate,
                workshop.startTime || '14:00',
                workshop.cancellationPeriods
              );
            } else if (workshop.startDate && workshop.startDate > new Date()) {
              nextSession = workshop.startDate;
            }
            
            return { workshop, nextSession };
          })
          .filter(item => {
            // Afficher les ateliers avec une prochaine séance OU sans date de fin définie
            return item.nextSession !== null || !item.workshop.seasonEndDate;
          })
          .sort((a, b) => {
            // Ateliers avec prochaine séance d'abord, triés par date
            if (a.nextSession && b.nextSession) {
              return a.nextSession.getTime() - b.nextSession.getTime();
            }
            // Ateliers sans prochaine séance en dernier
            if (a.nextSession && !b.nextSession) return -1;
            if (!a.nextSession && b.nextSession) return 1;
            // Si aucun n'a de prochaine séance, trier par date de création (plus récent d'abord)
            return 0;
          })
          .slice(0, 3)
          .map(item => item.workshop);

        setUpcomingEvents(events);
        setUpcomingWorkshops(workshopsWithNextSession);
      } catch (error) {
        console.error('Erreur lors de la récupération des activités:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUpcomingActivities();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`relative ${THEME_CLASSES.heroGradient} text-white overflow-hidden min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] flex items-center`}>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background shapes with parallax effect */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '12rem',
            height: '12rem'
          }}
          className="bg-white/10 rounded-full blur-3xl sm:w-64 sm:h-64 md:w-72 md:h-72"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            rotate: [360, 180, 0],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '16rem',
            height: '16rem'
          }}
          className="bg-white/10 rounded-full blur-3xl sm:w-80 sm:h-80 md:w-96 md:h-96"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '33.33%',
            width: '16rem',
            height: '16rem'
          }}
          className="bg-white/10 rounded-full blur-2xl"
        />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            animate={{
              y: [0, -100, 0],
              x: [0, (i % 2 === 0 ? 25 : -25), 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 5 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
            style={{
              left: `${10 + i * 10}%`,
              top: `${30 + (i * 5) % 40}%`
            }}
          />
        ))}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-24 lg:py-32 w-full">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.h1
              variants={bounceIn}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 px-2"
            >
              <motion.span
                className="inline-block"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(255,255,255,0.5)",
                    "0 0 40px rgba(255,255,255,0.8)",
                    "0 0 20px rgba(255,255,255,0.5)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Bienvenue à Anim'Média
              </motion.span>
            </motion.h1>
            <motion.p
              variants={textReveal}
              className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-8 sm:mb-12 max-w-4xl mx-auto font-light px-4"
            >
              Découvrez nos activités culturelles : tricot, lecture, écriture, généalogie, informatique et bien plus encore !
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4"
            >
              <Link href="/evenements" className="w-full sm:w-auto">
                <motion.div 
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 20px 40px rgba(222, 49, 86, 0.4)"
                  }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3, type: "spring" as const, stiffness: 400 }}
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" variant="secondary" className="w-full text-lg sm:text-xl px-8 sm:px-10 py-6 sm:py-8 font-bold">
                    🎉 Voir les Événements
                  </Button>
                </motion.div>
              </Link>
              <Link href="/ateliers" className="w-full sm:w-auto">
                <motion.div 
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 20px 40px rgba(0, 168, 168, 0.4)"
                  }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3, type: "spring" as const, stiffness: 400 }}
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" variant="outline" className="w-full text-lg sm:text-xl px-8 sm:px-10 py-6 sm:py-8 bg-white/10 hover:bg-white/20 border-2 border-white text-white font-bold">
                    🎨 Découvrir les Ateliers
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Prochaines Activités */}
      <section ref={ref} className="py-12 sm:py-16 md:py-20 bg-[#F7EDE0]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.h2 
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 ${THEME_CLASSES.textGradient} px-2`}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              Prochaines Activités
            </motion.h2>
            <motion.p 
              className="text-gray-700 text-lg sm:text-xl font-medium px-4"
              variants={textReveal}
            >
              ✨ Ne manquez pas nos événements et ateliers à venir !
            </motion.p>
          </motion.div>

          {loading ? (
            <motion.div 
              className="flex justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <div className={`rounded-full h-16 w-16 border-4 border-t-transparent ${THEME_CLASSES.borderPrimary}`}></div>
            </motion.div>
          ) : (
            <div className="space-y-16">
              {/* Événements */}
              {upcomingEvents.length > 0 && (
                <div>
                  <motion.h3 
                    className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 px-2"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.span
                      animate={{ y: [-10, 10, -10] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut" as const
                      }}
                      className="text-4xl sm:text-5xl"
                    >
                      🎉
                    </motion.span>
                    <span className={THEME_CLASSES.textPrimary}>Événements à venir</span>
                  </motion.h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                    className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 px-2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.span
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-4xl sm:text-5xl"
                    >
                      🎨
                    </motion.span>
                    <span className={THEME_CLASSES.textSecondary}>Ateliers à venir</span>
                  </motion.h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                <p className="text-center text-gray-500 text-xl">
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
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 ${THEME_CLASSES.textGradient}`}>
              À propos d'Anim'Média
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#DE3156] to-[#F49928] mx-auto rounded-full mb-8"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-8 items-center mb-12"
          >
            <div className="space-y-6 text-lg text-gray-700">
              <p className="leading-relaxed">
                <strong className={THEME_CLASSES.textPrimary}>Anim'Média</strong> est une association dynamique dédiée à la promotion des activités culturelles et créatives pour tous les âges.
              </p>
              <p className="leading-relaxed">
                Notre mission est de créer un espace de partage, d'apprentissage et de convivialité à travers des ateliers réguliers et des événements ponctuels variés.
              </p>
              <p className="leading-relaxed">
                Du <strong>tricot</strong> à l'<strong>informatique</strong>, de la <strong>lecture</strong> à la <strong>généalogie</strong>, nous proposons des activités pour tous les goûts et tous les niveaux !
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🎨', color: '#DE3156', value: '10+', label: 'Ateliers réguliers', delay: 0 },
                { icon: '🎭', color: '#F49928', value: '20+', label: 'Événements par an', delay: 0.1 },
                { icon: '👥', color: '#00A8A8', value: '100+', label: 'Membres actifs', delay: 0.2 },
                { icon: '❤️', color: '#9333EA', value: '100%', label: 'Passion', delay: 0.3 }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5, 
                    delay: stat.delay,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    y: -10,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.3 }
                  }}
                  className="bg-gradient-to-br p-6 rounded-2xl border-2 cursor-pointer"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${stat.color}10, ${stat.color}05)`,
                    borderColor: `${stat.color}20`
                  }}
                >
                  <motion.div 
                    className="text-4xl mb-3"
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2
                    }}
                  >
                    {stat.icon}
                  </motion.div>
                  <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-[#F7EDE0] to-[#F7EDE0]/50 rounded-3xl p-8 text-center relative overflow-hidden"
          >
            {/* Effet de particules en arrière-plan */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-[#DE3156]/10 to-[#F49928]/10 blur-2xl"
                animate={{
                  x: [0, (i % 2 === 0 ? 50 : -50), 0],
                  y: [0, (i % 3 === 0 ? 50 : -50), 0],
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 5 + (i * 0.6),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5
                }}
                style={{
                  left: `${20 * i}%`,
                  top: `${30 + (i * 8) % 40}%`
                }}
              />
            ))}
            
            <h3 className="text-2xl font-bold mb-8 text-gray-800 relative z-10">Nos Valeurs</h3>
            <div className="grid sm:grid-cols-3 gap-6 text-center relative z-10">
              {[
                { icon: '🤝', title: 'Partage', desc: 'Créer du lien social et favoriser les échanges', delay: 0.1 },
                { icon: '🌟', title: 'Créativité', desc: 'Encourager l\'expression artistique et culturelle', delay: 0.2 },
                { icon: '📚', title: 'Apprentissage', desc: 'Transmettre des savoir-faire et des connaissances', delay: 0.3 }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + value.delay }}
                  whileHover={{ 
                    scale: 1.1,
                    y: -10,
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div 
                    className="text-5xl mb-3"
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.15, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3
                    }}
                  >
                    {value.icon}
                  </motion.div>
                  <h4 className="font-semibold text-lg mb-2">{value.title}</h4>
                  <p className="text-gray-600 text-sm">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function ActivityCard({ title, description, date, category, location, href, imageUrl, delay, inView }: {
  title: string;
  description: string;
  date: Date;
  category: ActivityCategory;
  location: string;
  href: string;
  imageUrl?: string;
  delay: number;
  inView: boolean;
}) {
  const categoryInfo = CATEGORY_LABELS[category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay }}
    >
      <Link href={href}>
        <motion.div
          whileHover={{ 
            scale: 1.05, 
            y: -10,
            rotateZ: 2,
            boxShadow: "0 20px 40px rgba(222, 49, 86, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            duration: 0.3,
            type: "spring" as const,
            stiffness: 300
          }}
        >
          <motion.div
            animate={{
              y: [0, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay
            }}
          >
            <Card className={`h-full transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#DE3156]/50 ${THEME_CLASSES.cardHover} bg-white/90 backdrop-blur-sm overflow-hidden relative group p-0`}>
              {/* Effet de brillance au survol */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            {imageUrl && (
              <div className="relative h-48 w-full overflow-hidden">
                <motion.img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                  <motion.span 
                    className="text-2xl"
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {categoryInfo.icon}
                  </motion.span>
                  <span className="text-xs font-semibold text-white uppercase tracking-wide drop-shadow-lg">{categoryInfo.label}</span>
                </div>
              </div>
            )}
            <CardHeader className={imageUrl ? "pt-6" : ""}>
              {!imageUrl && (
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <motion.span 
                    className="text-3xl sm:text-4xl"
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {categoryInfo.icon}
                  </motion.span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">{categoryInfo.label}</span>
                </div>
              )}
              <CardTitle className="text-xl sm:text-2xl font-bold">{title}</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                📅 {format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-gray-700 mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">{description}</p>
              <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                📍 {location}
              </p>
            </CardContent>
          </Card>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function WorkshopCard({ workshop, delay, inView }: {
  workshop: Workshop;
  delay: number;
  inView: boolean;
}) {
  const categoryInfo = CATEGORY_LABELS[workshop.category];

  // Calculer la prochaine séance
  const nextSession = workshop.isRecurring
    ? getNextSession(
        workshop.recurrenceDays || [],
        workshop.recurrenceInterval || 1,
        workshop.seasonStartDate,
        workshop.seasonEndDate,
        workshop.startTime || '14:00',
        workshop.cancellationPeriods
      )
    : workshop.startDate && workshop.startDate > new Date()
      ? workshop.startDate
      : null;

  // Formater l'horaire
  const scheduleText = workshop.isRecurring && workshop.recurrenceDays
    ? `📅 ${workshop.recurrenceDays
        .map(day => ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][day])
        .join(', ')} ${workshop.startTime || '14:00'}-${workshop.endTime || '16:00'}`
    : nextSession
      ? `📅 ${format(nextSession, "d MMMM yyyy 'à' HH:mm", { locale: fr })}`
      : '📅 Dates à venir';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <Link href={`/ateliers/${workshop.id}`}>
        <motion.div
          whileHover={{ 
            scale: 1.05, 
            y: -10,
            rotateZ: 2,
            boxShadow: "0 20px 40px rgba(0, 168, 168, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            duration: 0.3,
            type: "spring" as const,
            stiffness: 300
          }}
        >
          <motion.div
            animate={{
              y: [0, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay
            }}
          >
            <Card className={`h-full transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#DE3156]/50 ${THEME_CLASSES.cardHover} bg-white/90 backdrop-blur-sm overflow-hidden relative group p-0`}>
              {/* Effet de brillance au survol */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            {workshop.imageUrl && (
              <div className="relative h-48 w-full overflow-hidden">
                <motion.img
                  src={workshop.imageUrl}
                  alt={workshop.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                  <motion.span 
                    className="text-2xl"
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {categoryInfo.icon}
                  </motion.span>
                  <span className="text-xs font-semibold text-white uppercase tracking-wide drop-shadow-lg">{categoryInfo.label}</span>
                </div>
              </div>
            )}
            <CardHeader className={workshop.imageUrl ? "pt-6" : ""}>
              {!workshop.imageUrl && (
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <motion.span 
                    className="text-3xl sm:text-4xl"
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {categoryInfo.icon}
                  </motion.span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">{categoryInfo.label}</span>
                </div>
              )}
              <CardTitle className="text-xl sm:text-2xl font-bold">{workshop.title}</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {scheduleText}
              </CardDescription>
              {nextSession && (
                <CardDescription className="text-xs sm:text-sm text-green-600 font-medium">
                  ▶️ Prochain: {format(nextSession, "d MMM 'à' HH:mm", { locale: fr })}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-gray-700 mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">{workshop.description}</p>
              <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                📍 {workshop.location}
              </p>
            </CardContent>
          </Card>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Section CTA pour l'adhésion
function MembershipCTA() {
  const { user } = useAuth();

  // Ne pas afficher si l'utilisateur est déjà adhérent actif
  if (user?.membershipStatus === MembershipStatus.ACTIVE) {
    return null;
  }

  return (
    <motion.section
      className="py-12 sm:py-16 md:py-20 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {/* Background animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#DE3156] via-[#F49928] to-[#00A8A8]">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center text-white"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={bounceIn}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-2">
              Rejoignez-nous ! 🎫
            </h2>
          </motion.div>
          
          <motion.p variants={fadeInUp} className="text-xl sm:text-2xl md:text-3xl mb-6 sm:mb-8 font-light px-4">
            Devenez adhérent et profitez d'avantages exclusifs
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="bg-white/20 backdrop-blur-md rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 border-2 border-white/40"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">🎟️</span>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl mb-1">Accès prioritaire</h3>
                  <p className="text-sm sm:text-base text-white/90">Inscriptions en avant-première</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">💰</span>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl mb-1">Tarifs réduits</h3>
                  <p className="text-sm sm:text-base text-white/90">Sur les événements payants</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">🎁</span>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl mb-1">Contenus exclusifs</h3>
                  <p className="text-sm sm:text-base text-white/90">Événements réservés</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
          >
            <div className="text-center">
              <div className="text-5xl sm:text-6xl font-bold mb-2">15€</div>
              <div className="text-lg sm:text-xl opacity-90">par an</div>
            </div>
            
            <Link href={user ? "/adhesion" : "/login"} className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="w-full bg-white text-[#DE3156] hover:bg-white/90 text-xl sm:text-2xl px-8 sm:px-12 py-6 sm:py-8 h-auto font-bold shadow-2xl"
                >
                  ✨ Adhérer Maintenant
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

