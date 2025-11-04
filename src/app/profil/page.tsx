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

  useEffect(() => {
    async function fetchRegistrations() {
      if (!user) return;

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
  }, [user]);

  const upcomingRegistrations = registrations.filter(reg => 
    reg.activity && new Date(reg.activity.date.toDate()) >= new Date()
  );
  const pastRegistrations = registrations.filter(reg => 
    reg.activity && new Date(reg.activity.date.toDate()) < new Date()
  );

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
                      <div className="flex gap-4 justify-center">
                        <Link href="/evenements">
                          <Button size="lg">Voir les événements</Button>
                        </Link>
                        <Link href="/ateliers">
                          <Button variant="outline" size="lg">Voir les ateliers</Button>
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

  return (
    <motion.div variants={staggerItem}>
      <Card 
        className={`${isPastActivity ? 'opacity-60' : ''} border-2 border-transparent hover:border-[${isEvent ? '#DE3156' : '#00A8A8'}] transition-all duration-300 cursor-pointer overflow-hidden`}
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -10, rotateZ: 2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <CardHeader className={isEvent ? THEME_CLASSES.sectionEvents : THEME_CLASSES.sectionWorkshops}>
            <CardTitle className="text-2xl text-white">
              <motion.span
                whileHover={{ scale: 1.2, rotate: 15 }}
                className="inline-block"
              >
                {isEvent ? '🎉' : '🎨'}
              </motion.span>{' '}
              {activity.title}
            </CardTitle>
            <CardDescription className="text-white/90 text-base">
              {format(activity.date.toDate(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-base text-gray-700 mb-2">📍 {activity.location}</p>
            {!isEvent && (
              <p className="text-base text-gray-600">👤 {activity.instructor}</p>
            )}
            {!isPastActivity && (
              <div className="mt-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  ✅ Inscrit
                </span>
              </div>
            )}
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
}
