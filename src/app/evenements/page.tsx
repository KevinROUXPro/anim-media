'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, ActivityCategory, CATEGORY_LABELS } from '@/types';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    async function fetchEvents() {
      try {
        const now = Timestamp.now();
        const eventsQuery = query(
          collection(db, 'events'),
          where('date', '>=', now),
          orderBy('date', 'asc')
        );
        const snapshot = await getDocs(eventsQuery);
        const eventsData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Event[];
        
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'ALL') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category === selectedCategory));
    }
  }, [selectedCategory, events]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nos Événements
            </h1>
            <p className="text-lg opacity-90">
              Découvrez tous nos événements culturels à venir
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filtres */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('ALL')}
              className={selectedCategory === 'ALL' ? 'bg-purple-600' : ''}
            >
              Tous
            </Button>
            {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(key as ActivityCategory)}
                className={selectedCategory === key ? 'bg-purple-600' : ''}
              >
                {value.icon} {value.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Liste des événements */}
      <section ref={ref} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} inView={inView} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Aucun événement trouvé dans cette catégorie.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EventCard({ event, index, inView }: { event: Event; index: number; inView: boolean }) {
  const categoryInfo = CATEGORY_LABELS[event.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -5 }}
    >
      <Link href={`/evenements/${event.id}`}>
        <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer">
          {event.imageUrl && (
            <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-lg"></div>
          )}
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{categoryInfo.icon}</span>
              <span className="text-sm text-gray-500">{categoryInfo.label}</span>
            </div>
            <CardTitle className="text-xl">{event.title}</CardTitle>
            <CardDescription>
              {format(event.date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3 line-clamp-3">{event.description}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              📍 {event.location}
            </p>
            {event.requiresRegistration && (
              <div className="mt-3 inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                Inscription requise
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
