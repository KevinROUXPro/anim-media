'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Workshop, ActivityCategory, CATEGORY_LABELS, LEVEL_LABELS } from '@/types';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { THEME_CLASSES } from '@/config/theme';
import { fadeInUp, staggerContainer, staggerItem, bounceIn } from '@/lib/animations';
import { formatWorkshopSchedule, getNextSession } from '@/lib/workshop-utils';

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    async function fetchWorkshops() {
      try {
        const workshopsQuery = query(
          collection(db, 'workshops'),
          orderBy('createdAt', 'desc')
        );
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
            cancellationPeriods: data.cancellationPeriods?.map((p: any) => ({
              startDate: p.startDate.toDate(),
              endDate: p.endDate.toDate(),
              reason: p.reason
            })),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            // Anciens champs pour rétrocompatibilité
            date: data.date?.toDate(),
          };
        }) as Workshop[];
        
        // Filtrer les ateliers dont la saison est terminée
        const activeWorkshops = workshopsData.filter(w => {
          // Si l'atelier est récurrent, vérifier s'il a une prochaine séance
          if (w.isRecurring) {
            const nextSession = getNextSession(
              w.recurrenceDays || [],
              w.recurrenceInterval || 1,
              w.seasonStartDate,
              w.seasonEndDate,
              w.startTime || '14:00',
              w.cancellationPeriods
            );
            // Afficher l'atelier s'il a une prochaine séance OU si aucune date de fin n'est définie
            return nextSession !== null || !w.seasonEndDate;
          }
          
          // Pour les ateliers ponctuels (ancienne structure ou non-récurrents)
          // Afficher si pas de seasonEndDate OU si elle n'est pas encore passée
          if (w.seasonEndDate && w.seasonEndDate < new Date()) return false;
          
          return true;
        });
        
        setWorkshops(activeWorkshops);
        setFilteredWorkshops(activeWorkshops);
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
          ) : (() => {
            return filteredWorkshops.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredWorkshops.map((workshop, index) => (
                  <WorkshopCard key={workshop.id} workshop={workshop} index={index} />
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
            );
          })()}
        </div>
      </section>
    </div>
  );
}

function WorkshopCard({ workshop, index }: { workshop: Workshop; index: number }) {
  const categoryInfo = CATEGORY_LABELS[workshop.category];
  
  // Pour les ateliers récurrents, calculer la prochaine séance
  const nextSession = workshop.isRecurring 
    ? getNextSession(
        workshop.recurrenceDays, 
        workshop.recurrenceInterval || 1,
        workshop.seasonStartDate,
        workshop.seasonEndDate,
        workshop.startTime,
        workshop.cancellationPeriods
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
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
          <Card className={`h-full transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#00A8A8]/50 ${THEME_CLASSES.cardHover} bg-white/90 backdrop-blur-sm overflow-hidden p-0`}>
            {workshop.imageUrl && (
              <div className="h-48 w-full relative overflow-hidden">
                <Image
                  src={workshop.imageUrl}
                  alt={workshop.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                {/* Badge inscription sur l'image */}
                {workshop.requiresRegistration && (
                  <div className="absolute top-2 right-2 bg-[#00A8A8] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    ✅ Inscription requise
                  </div>
                )}
                {!workshop.requiresRegistration && (
                  <div className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    🔓 Accès libre
                  </div>
                )}
              </div>
            )}
            <CardHeader className={workshop.imageUrl ? "pt-6" : ""}>
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
                {workshop.isRecurring ? (
                  <>
                    <div className="mb-1">
                      🕐 {formatWorkshopSchedule(
                        workshop.recurrenceDays, 
                        workshop.startTime, 
                        workshop.endTime,
                        workshop.recurrenceInterval
                      )}
                    </div>
                    {nextSession && (
                      <div className="text-[#00A8A8] font-semibold">
                        📅 Prochaine séance : {format(nextSession, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </div>
                    )}
                  </>
                ) : (
                  workshop.date && (
                    <>📅 {format(workshop.date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}</>
                  )
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-gray-700 mb-4 line-clamp-2 text-base">{workshop.description}</p>
              <div className="space-y-2">
                {workshop.instructor && (
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    👤 {workshop.instructor}
                  </p>
                )}
                {workshop.location && (
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    📍 {workshop.location}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-semibold">
                    📊 {LEVEL_LABELS[workshop.level]}
                  </span>
                  {workshop.isRecurring && (
                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-sm font-semibold">
                      ♻️ Récurrent
                    </span>
                  )}
                </div>
                
                <div className="mt-3 space-y-2">
                  {/* Badge uniquement si pas d'image (sinon il est sur l'image) */}
                  {!workshop.imageUrl && workshop.requiresRegistration && (
                    <div className="inline-block bg-[#00A8A8] bg-opacity-10 text-[#00A8A8] px-3 py-2 rounded-full text-sm font-semibold">
                      ✅ Inscription requise
                    </div>
                  )}
                  {!workshop.imageUrl && !workshop.requiresRegistration && (
                    <div className="inline-block bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm font-semibold">
                      🔓 Accès libre
                    </div>
                  )}
                  {/* Compteur de participants */}
                  {workshop.requiresRegistration && workshop.maxParticipants && (
                    <div className="flex items-center gap-2 text-sm mt-2">
                      <span className="font-medium text-gray-700">Places :</span>
                      <span className={`font-bold ${
                        (workshop.currentParticipants || 0) >= workshop.maxParticipants 
                          ? 'text-red-600' 
                          : (workshop.currentParticipants || 0) >= workshop.maxParticipants * 0.8 
                            ? 'text-orange-600' 
                            : 'text-green-600'
                      }`}>
                        {workshop.currentParticipants || 0}/{workshop.maxParticipants}
                      </span>
                      {(workshop.currentParticipants || 0) >= workshop.maxParticipants && (
                        <span className="text-red-600 font-semibold">Complet</span>
                      )}
                    </div>
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
