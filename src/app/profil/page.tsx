'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, Workshop, Registration, MembershipStatus, MEMBERSHIP_LABELS } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { THEME_CLASSES } from '@/config/theme';
import { fadeInUp, staggerContainer, staggerItem, bounceIn, pulseAnimation } from '@/lib/animations';

export default function ProfilPage() {
  return (
    <ProtectedRoute>
      <ProfilContent />
    </ProtectedRoute>
  );
}

function ProfilContent() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fonction pour forcer le rafraîchissement
  const refreshRegistrations = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    async function fetchRegistrations() {
      if (!user) return;

      setLoading(true);
      try {
        // Récupérer les inscriptions
        const regsQuery = query(
          collection(db, 'registrations'),
          where('userId', '==', user.id)
        );
        const regsSnapshot = await getDocs(regsQuery);
        
        const regsWithDetails = await Promise.all(
          regsSnapshot.docs.map(async (doc) => {
            const regData = doc.data();
            let activityData = null;
            let activityType = '';

            if (regData.eventId) {
              const eventDoc = await getDocs(query(collection(db, 'events'), where('__name__', '==', regData.eventId)));
              if (!eventDoc.empty) {
                activityData = { ...eventDoc.docs[0].data(), id: eventDoc.docs[0].id };
                activityType = 'event';
              }
            } else if (regData.workshopId) {
              const workshopDoc = await getDocs(query(collection(db, 'workshops'), where('__name__', '==', regData.workshopId)));
              if (!workshopDoc.empty) {
                activityData = { ...workshopDoc.docs[0].data(), id: workshopDoc.docs[0].id };
                activityType = 'workshop';
              }
            }

            return {
              id: doc.id,
              ...regData,
              activity: activityData,
              activityType,
            };
          })
        );

        // Trier côté client par date de création (du plus récent au plus ancien)
        const sortedRegs = regsWithDetails
          .filter(r => r.activity)
          .sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });

        setRegistrations(sortedRegs);
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRegistrations();
  }, [user, refreshKey]); // Ajouter refreshKey comme dépendance

  const upcomingRegistrations = registrations.filter(reg => {
    if (!reg.activity) return false;
    
    // Pour les ateliers récurrents, toujours les afficher comme "à venir"
    if (reg.activityType === 'workshop' && reg.activity.isRecurring) {
      return true;
    }
    
    // Pour les événements et ateliers ponctuels, vérifier la date
    if (!reg.activity.date) return false;
    const activityDate = reg.activity.date.toDate ? reg.activity.date.toDate() : new Date(reg.activity.date);
    return activityDate >= new Date();
  });
  
  const pastRegistrations = registrations.filter(reg => {
    if (!reg.activity) return false;
    
    // Les ateliers récurrents ne sont jamais dans le passé (sauf si seasonEndDate est passée)
    if (reg.activityType === 'workshop' && reg.activity.isRecurring) {
      if (reg.activity.seasonEndDate) {
        const endDate = reg.activity.seasonEndDate.toDate ? reg.activity.seasonEndDate.toDate() : new Date(reg.activity.seasonEndDate);
        return endDate < new Date();
      }
      return false; // Pas de date de fin, donc toujours actif
    }
    
    // Pour les événements et ateliers ponctuels, vérifier la date
    if (!reg.activity.date) return false;
    // Gérer le cas où date est un Timestamp Firebase ou une Date
    const activityDate = reg.activity.date.toDate ? reg.activity.date.toDate() : new Date(reg.activity.date);
    return activityDate < new Date();
  });

  return (
    <div className="min-h-screen bg-[#F7EDE0]">
      {/* Header */}
      <motion.section 
        className={`${THEME_CLASSES.headerGradient} text-white py-16`}
        variants={bounceIn}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.h1 
              className="text-5xl font-bold mb-2"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Mon Profil 👤
            </motion.h1>
            <p className="text-xl opacity-90">{user?.name}</p>
            <p className="text-base opacity-75">{user?.email}</p>
            
            {/* Badge Adhérent */}
            {user?.membershipStatus && user.membershipStatus !== MembershipStatus.NONE && (
              <div className="mt-4">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  user.membershipStatus === MembershipStatus.ACTIVE 
                    ? 'bg-green-500 text-white' 
                    : 'bg-orange-500 text-white'
                }`}>
                  {user.membershipStatus === MembershipStatus.ACTIVE ? '✅ ' : '⏰ '}
                  {MEMBERSHIP_LABELS[user.membershipStatus].label}
                  {user.membershipNumber && ` - ${user.membershipNumber}`}
                </span>
                {user.membershipExpiry && (
                  <p className="text-sm opacity-75 mt-2">
                    Expire le {format(user.membershipExpiry, "d MMMM yyyy", { locale: fr })}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Mes Inscriptions */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className={`text-3xl font-bold ${THEME_CLASSES.textPrimary}`}>
              📅 Mes Inscriptions
            </h2>
            <Button 
              onClick={refreshRegistrations}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              🔄 Actualiser
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <motion.div 
                className={`h-16 w-16 border-4 ${THEME_CLASSES.borderPrimary} border-t-transparent rounded-full`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : (
            <motion.div 
              className="space-y-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Activités à venir */}
              <motion.div variants={staggerItem}>
                <h2 className={`text-3xl font-bold mb-4 ${THEME_CLASSES.textPrimary}`}>Activités à venir 🎯</h2>
                {upcomingRegistrations.length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {upcomingRegistrations.map((reg) => (
                      <ActivityRegistrationCard key={reg.id} registration={reg} />
                    ))}
                  </motion.div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      <p className="mb-4">Aucune inscription à venir</p>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <Link href="/evenements" className="w-full sm:w-auto">
                          <Button size="lg" className="w-full">Voir les événements</Button>
                        </Link>
                        <Link href="/ateliers" className="w-full sm:w-auto">
                          <Button variant="outline" size="lg" className="w-full">Voir les ateliers</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>

              {/* Activités passées */}
              {pastRegistrations.length > 0 && (
                <motion.div variants={staggerItem}>
                  <h2 className={`text-3xl font-bold mb-4 ${THEME_CLASSES.textPrimary}`}>Activités passées 📚</h2>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {pastRegistrations.map((reg) => (
                      <ActivityRegistrationCard key={reg.id} registration={reg} past />
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

function ActivityRegistrationCard({ registration, past = false }: { registration: any; past?: boolean }) {
  const activity = registration.activity;
  const isPastActivity = past;
  const isEvent = registration.activityType === 'event';
  const hoverShadowColor = isEvent ? 'rgba(222, 49, 86, 0.3)' : 'rgba(0, 168, 168, 0.3)';

  return (
    <motion.div variants={staggerItem}>
      <Link href={`/${isEvent ? 'evenements' : 'ateliers'}/${activity.id}`}>
        <motion.div
          whileHover={{ 
            scale: 1.05, 
            y: -10,
            rotateZ: 2,
            boxShadow: isPastActivity ? undefined : `0 20px 40px ${hoverShadowColor}`
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 300
          }}
        >
          <motion.div
            animate={{
              y: isPastActivity ? 0 : [0, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Card className={`h-full transition-all duration-300 cursor-pointer border-2 border-transparent ${isPastActivity ? 'opacity-60' : 'hover:border-[#DE3156]/50'} bg-white/90 backdrop-blur-sm overflow-hidden relative group p-0`}>
              {/* Effet de brillance au survol */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              
              {activity.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden">
                  <motion.img
                    src={activity.imageUrl}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
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
                      {isEvent ? '🎉' : '🎨'}
                    </motion.span>
                  </div>
                </div>
              )}
              
              <CardHeader className={`${isEvent ? THEME_CLASSES.sectionEvents : THEME_CLASSES.sectionWorkshops} ${activity.imageUrl ? 'pt-6' : ''}`}>
                {!activity.imageUrl && (
                  <motion.div 
                    className="flex items-center gap-3 mb-3"
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <span className="text-3xl">{isEvent ? '🎉' : '🎨'}</span>
                  </motion.div>
                )}
                <CardTitle className="text-xl sm:text-2xl text-white font-bold">
                  {activity.title}
                </CardTitle>
                <CardDescription className="text-white/90 text-sm sm:text-base">
                  {activity.isRecurring ? (
                    <>
                      � {activity.recurrenceDays?.map((day: number) => 
                        ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][day]
                      ).join(', ')} {activity.startTime}-{activity.endTime}
                    </>
                  ) : activity.date ? (
                    <>
                      📅 {format(activity.date.toDate ? activity.date.toDate() : new Date(activity.date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </>
                  ) : (
                    'Dates à définir'
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-6">
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-sm sm:text-base text-gray-700 flex items-center gap-2">
                    📍 {activity.location}
                  </p>
                  {!isEvent && activity.instructor && (
                    <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                      👤 {activity.instructor}
                    </p>
                  )}
                  {!isEvent && activity.level && (
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                      📊 Niveau: {activity.level}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 sm:mt-4 flex-wrap">
                    {!isPastActivity && (
                      <motion.span 
                        className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        ✅ Inscrit
                      </motion.span>
                    )}
                    {isPastActivity && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm font-semibold">
                        ⏰ Terminé
                      </span>
                    )}
                    {activity.isRecurring && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
                        ♻️ Récurrent
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
