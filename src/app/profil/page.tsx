'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, Workshop, Registration } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

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
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc')
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

        setRegistrations(regsWithDetails.filter(r => r.activity));
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">Mon Profil</h1>
            <p className="text-lg opacity-90">{user?.name}</p>
            <p className="text-sm opacity-75">{user?.email}</p>
          </motion.div>
        </div>
      </section>

      {/* Mes Inscriptions */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Activités à venir */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Activités à venir</h2>
                {upcomingRegistrations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingRegistrations.map((reg) => (
                      <ActivityRegistrationCard key={reg.id} registration={reg} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      <p className="mb-4">Aucune inscription à venir</p>
                      <div className="flex gap-4 justify-center">
                        <Link href="/evenements">
                          <Button>Voir les événements</Button>
                        </Link>
                        <Link href="/ateliers">
                          <Button variant="outline">Voir les ateliers</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Activités passées */}
              {pastRegistrations.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Activités passées</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastRegistrations.map((reg) => (
                      <ActivityRegistrationCard key={reg.id} registration={reg} past />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ActivityRegistrationCard({ registration, past = false }: { registration: any; past?: boolean }) {
  const activity = registration.activity;
  const isPastActivity = past;

  return (
    <Card className={isPastActivity ? 'opacity-60' : ''}>
      <CardHeader>
        <CardTitle className="text-lg">
          {registration.activityType === 'event' ? '🎉' : '🎨'} {activity.title}
        </CardTitle>
        <CardDescription>
          {format(activity.date.toDate(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">{activity.location}</p>
        {registration.activityType === 'workshop' && (
          <p className="text-sm text-gray-500">👤 {activity.instructor}</p>
        )}
      </CardContent>
    </Card>
  );
}
