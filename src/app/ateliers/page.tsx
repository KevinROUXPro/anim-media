'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Workshop, ActivityCategory, CATEGORY_LABELS, LEVEL_LABELS } from '@/types';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    async function fetchWorkshops() {
      try {
        const now = Timestamp.now();
        const workshopsQuery = query(
          collection(db, 'workshops'),
          where('date', '>=', now),
          orderBy('date', 'asc')
        );
        const snapshot = await getDocs(workshopsQuery);
        const workshopsData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Workshop[];
        
        setWorkshops(workshopsData);
        setFilteredWorkshops(workshopsData);
      } catch (error) {
        console.error('Error fetching workshops:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkshops();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'ALL') {
      setFilteredWorkshops(workshops);
    } else {
      setFilteredWorkshops(workshops.filter(workshop => workshop.category === selectedCategory));
    }
  }, [selectedCategory, workshops]);

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
              Nos Ateliers
            </h1>
            <p className="text-lg opacity-90">
              Participez à nos ateliers culturels et développez vos compétences
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

      {/* Liste des ateliers */}
      <section ref={ref} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredWorkshops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkshops.map((workshop, index) => (
                <WorkshopCard key={workshop.id} workshop={workshop} index={index} inView={inView} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Aucun atelier trouvé dans cette catégorie.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function WorkshopCard({ workshop, index, inView }: { workshop: Workshop; index: number; inView: boolean }) {
  const categoryInfo = CATEGORY_LABELS[workshop.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -5 }}
    >
      <Link href={`/ateliers/${workshop.id}`}>
        <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer">
          {workshop.imageUrl && (
            <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-lg"></div>
          )}
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{categoryInfo.icon}</span>
              <span className="text-sm text-gray-500">{categoryInfo.label}</span>
            </div>
            <CardTitle className="text-xl">{workshop.title}</CardTitle>
            <CardDescription>
              {format(workshop.date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3 line-clamp-2">{workshop.description}</p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-500 flex items-center gap-1">
                👤 {workshop.instructor}
              </p>
              <p className="text-gray-500 flex items-center gap-1">
                📍 {workshop.location}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                  {LEVEL_LABELS[workshop.level]}
                </span>
                {workshop.requiresRegistration && (
                  <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs">
                    Inscription requise
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
