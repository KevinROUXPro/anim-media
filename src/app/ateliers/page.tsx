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
import { THEME_CLASSES } from '@/config/theme';
import { fadeInUp, staggerContainer, staggerItem, bounceIn } from '@/lib/animations';

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
    <div className="min-h-screen bg-[#F7EDE0]/30">
      {/* Header */}
      <section className={`${THEME_CLASSES.headerGradient} text-white py-20 relative overflow-hidden`}>
        {/* Animated background shapes */}
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={bounceIn}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
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
              🎨 Nos Ateliers
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl opacity-95 font-light"
              variants={fadeInUp}
            >
              Participez à nos ateliers culturels et développez vos compétences
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Filtres */}
      <section className="bg-white border-b border-[#DE3156]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            className="flex flex-wrap gap-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem}>
              <Button
                variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('ALL')}
                className={selectedCategory === 'ALL' ? THEME_CLASSES.buttonPrimary : 'text-base font-semibold'}
                size="lg"
              >
                Tous
              </Button>
            </motion.div>
            {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
              <motion.div key={key} variants={staggerItem}>
                <Button
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(key as ActivityCategory)}
                  className={selectedCategory === key ? THEME_CLASSES.buttonSecondary : 'text-base font-semibold'}
                  size="lg"
                >
                  {value.icon} {value.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Liste des ateliers */}
      <section ref={ref} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <motion.div 
              className="flex justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <div className={`rounded-full h-16 w-16 border-4 border-t-transparent ${THEME_CLASSES.borderPrimary}`}></div>
            </motion.div>
          ) : filteredWorkshops.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {filteredWorkshops.map((workshop, index) => (
                <WorkshopCard key={workshop.id} workshop={workshop} index={index} inView={inView} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-16"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <p className="text-gray-600 text-xl font-medium">
                Aucun atelier trouvé dans cette catégorie.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

function WorkshopCard({ workshop, index, inView }: { workshop: Workshop; index: number; inView: boolean }) {
  const categoryInfo = CATEGORY_LABELS[workshop.category];

  return (
    <motion.div variants={staggerItem}>
      <Link href={`/ateliers/${workshop.id}`}>
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
          <Card className={`h-full transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#00A8A8]/50 ${THEME_CLASSES.cardHover} bg-white/90 backdrop-blur-sm`}>
            {workshop.imageUrl && (
              <div className={`h-48 ${THEME_CLASSES.sectionWorkshops} rounded-t-lg`}></div>
            )}
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
              <CardTitle className="text-2xl font-bold">{workshop.title}</CardTitle>
              <CardDescription className="text-base">
                📅 {format(workshop.date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 line-clamp-2 text-base">{workshop.description}</p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  👤 {workshop.instructor}
                </p>
                <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  📍 {workshop.location}
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={`inline-block ${THEME_CLASSES.bgSecondary} bg-opacity-10 ${THEME_CLASSES.textSecondary} px-3 py-2 rounded-full text-sm font-semibold`}>
                    {LEVEL_LABELS[workshop.level]}
                  </span>
                  {workshop.requiresRegistration && (
                    <span className={`inline-block ${THEME_CLASSES.bgPrimary} bg-opacity-10 ${THEME_CLASSES.textPrimary} px-3 py-2 rounded-full text-sm font-semibold`}>
                      Inscription requise
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    </motion.div>
  );
}
