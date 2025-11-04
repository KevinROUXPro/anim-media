'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, Workshop, CATEGORY_LABELS, ActivityCategory } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
      <section className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              Bienvenue à Anim'Média
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            >
              Découvrez nos activités culturelles : tricot, lecture, écriture, généalogie, informatique et bien plus encore !
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/evenements">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Voir les Événements
                </Button>
              </Link>
              <Link href="/ateliers">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 border-white text-white">
                  Découvrir les Ateliers
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated shapes */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-xl"
        />
      </section>

      {/* Prochaines Activités */}
      <section ref={ref} className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Prochaines Activités
            </h2>
            <p className="text-gray-600 text-lg">
              Ne manquez pas nos événements et ateliers à venir !
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Événements */}
              {upcomingEvents.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    🎉 Événements à venir
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  </div>
                </div>
              )}

              {/* Ateliers */}
              {upcomingWorkshops.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    🎨 Ateliers à venir
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  </div>
                </div>
              )}

              {upcomingEvents.length === 0 && upcomingWorkshops.length === 0 && (
                <p className="text-center text-gray-500 text-lg">
                  Aucune activité prévue pour le moment. Revenez bientôt !
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Rejoignez notre communauté !
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Créez un compte pour vous inscrire à nos activités et ne rien manquer.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Créer un compte gratuit
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
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
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -5 }}
    >
      <Link href={href}>
        <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{categoryInfo.icon}</span>
              <span className="text-sm text-gray-500">{categoryInfo.label}</span>
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>
              {format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3 line-clamp-2">{description}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              📍 {location}
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

