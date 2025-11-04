'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, Workshop, CATEGORY_LABELS, ActivityCategory, MembershipStatus } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { THEME_CLASSES } from '@/config/theme';
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

        // Récupérer les 3 prochains ateliers
        const workshopsQuery = query(
          collection(db, 'workshops'),
          where('date', '>=', now),
          orderBy('date', 'asc'),
          limit(3)
        );
        const workshopsSnapshot = await getDocs(workshopsQuery);
        const workshops = workshopsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Workshop[];

        setUpcomingEvents(events);
        setUpcomingWorkshops(workshops);
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
      <section className={`relative ${THEME_CLASSES.heroGradient} text-white overflow-hidden min-h-[80vh] flex items-center`}>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background shapes */}
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
          className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            rotate: [360, 180, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/10 rounded-full blur-2xl"
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.h1
              variants={bounceIn}
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
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
              className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto font-light"
            >
              Découvrez nos activités culturelles : tricot, lecture, écriture, généalogie, informatique et bien plus encore !
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link href="/evenements">
                <motion.div 
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 20px 40px rgba(222, 49, 86, 0.4)"
                  }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3, type: "spring" as const, stiffness: 400 }}
                >
                  <Button size="lg" variant="secondary" className="text-xl px-10 py-8 font-bold">
                    🎉 Voir les Événements
                  </Button>
                </motion.div>
              </Link>
              <Link href="/ateliers">
                <motion.div 
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 20px 40px rgba(0, 168, 168, 0.4)"
                  }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3, type: "spring" as const, stiffness: 400 }}
                >
                  <Button size="lg" variant="outline" className="text-xl px-10 py-8 bg-white/10 hover:bg-white/20 border-2 border-white text-white font-bold">
                    🎨 Découvrir les Ateliers
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Prochaines Activités */}
      <section ref={ref} className="py-20 bg-[#F7EDE0]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2 
              className={`text-5xl md:text-6xl font-bold mb-6 ${THEME_CLASSES.textGradient}`}
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
              className="text-gray-700 text-xl font-medium"
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
            <motion.div 
              className="space-y-16"
              variants={staggerContainer}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {/* Événements */}
              {upcomingEvents.length > 0 && (
                <motion.div variants={staggerItem}>
                  <motion.h3 
                    className="text-3xl font-bold mb-8 flex items-center gap-3"
                    variants={slideInLeft}
                  >
                    <motion.span
                      animate={{ y: [-10, 10, -10] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut" as const
                      }}
                      className="text-5xl"
                    >
                      🎉
                    </motion.span>
                    <span className={THEME_CLASSES.textPrimary}>Événements à venir</span>
                  </motion.h3>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={staggerContainer}
                  >
                    {upcomingEvents.map((event, index) => (
                      <ActivityCard
                        key={event.id}
                        title={event.title}
                        description={event.description}
                        date={event.date}
                        category={event.category}
                        location={event.location}
                        href={`/evenements/${event.id}`}
                        delay={index * 0.1}
                        inView={inView}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Ateliers */}
              {upcomingWorkshops.length > 0 && (
                <motion.div variants={staggerItem}>
                  <motion.h3 
                    className="text-3xl font-bold mb-8 flex items-center gap-3"
                    variants={slideInRight}
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
                      className="text-5xl"
                    >
                      🎨
                    </motion.span>
                    <span className={THEME_CLASSES.textSecondary}>Ateliers à venir</span>
                  </motion.h3>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={staggerContainer}
                  >
                    {upcomingWorkshops.map((workshop, index) => (
                      <ActivityCard
                        key={workshop.id}
                        title={workshop.title}
                        description={workshop.description}
                        date={workshop.date}
                        category={workshop.category}
                        location={workshop.location}
                        href={`/ateliers/${workshop.id}`}
                        delay={index * 0.1}
                        inView={inView}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {upcomingEvents.length === 0 && upcomingWorkshops.length === 0 && (
                <motion.p 
                  className="text-center text-gray-500 text-xl"
                  variants={fadeInUp}
                >
                  Aucune activité prévue pour le moment. Revenez bientôt !
                </motion.p>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${THEME_CLASSES.headerGradient} text-white relative overflow-hidden`}>
        {/* Background animated shapes */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              animate={{
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 30px rgba(255,255,255,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)"
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎊 Rejoignez notre communauté !
            </motion.h2>
            <motion.p 
              className="text-xl md:text-2xl mb-10 opacity-95 font-light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 0.95, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Créez un compte pour vous inscrire à nos activités et ne rien manquer.
            </motion.p>
            <Link href="/signup">
              <motion.div
                whileHover={{ 
                  scale: 1.15,
                  rotate: [0, -2, 2, 0],
                  boxShadow: "0 30px 60px rgba(0,0,0,0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Button size="lg" variant="secondary" className="text-xl px-12 py-8 font-bold shadow-2xl">
                  ✨ Créer un compte gratuit
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section adhésion */}
      <MembershipCTA />
    </div>
  );
}

function ActivityCard({ title, description, date, category, location, href, delay, inView }: {
  title: string;
  description: string;
  date: Date;
  category: ActivityCategory;
  location: string;
  href: string;
  delay: number;
  inView: boolean;
}) {
  const categoryInfo = CATEGORY_LABELS[category];

  return (
    <motion.div
      variants={staggerItem}
    >
      <Link href={href}>
        <motion.div
          whileHover={{ 
            scale: 1.05, 
            y: -10,
            rotateZ: 2
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            duration: 0.3,
            type: "spring" as const,
            stiffness: 300
          }}
        >
          <Card className={`h-full transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#DE3156]/50 ${THEME_CLASSES.cardHover} bg-white/90 backdrop-blur-sm`}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <motion.span 
                  className="text-4xl"
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
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{categoryInfo.label}</span>
              </div>
              <CardTitle className="text-2xl font-bold">{title}</CardTitle>
              <CardDescription className="text-base">
                📅 {format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 line-clamp-2 text-base">{description}</p>
              <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                📍 {location}
              </p>
            </CardContent>
          </Card>
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
      className="py-20 relative overflow-hidden"
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
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Rejoignez-nous ! 🎫
            </h2>
          </motion.div>
          
          <motion.p variants={fadeInUp} className="text-2xl md:text-3xl mb-8 font-light">
            Devenez adhérent et profitez d'avantages exclusifs
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="bg-white/20 backdrop-blur-md rounded-2xl p-8 mb-8 border-2 border-white/40"
          >
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🎟️</span>
                <div>
                  <h3 className="font-bold text-xl mb-1">Accès prioritaire</h3>
                  <p className="text-white/90">Inscriptions en avant-première</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">💰</span>
                <div>
                  <h3 className="font-bold text-xl mb-1">Tarifs réduits</h3>
                  <p className="text-white/90">Sur les événements payants</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">🎁</span>
                <div>
                  <h3 className="font-bold text-xl mb-1">Contenus exclusifs</h3>
                  <p className="text-white/90">Événements réservés</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">15€</div>
              <div className="text-xl opacity-90">par an</div>
            </div>
            
            <Link href={user ? "/adhesion" : "/login"}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-[#DE3156] hover:bg-white/90 text-2xl px-12 py-8 h-auto font-bold shadow-2xl"
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

