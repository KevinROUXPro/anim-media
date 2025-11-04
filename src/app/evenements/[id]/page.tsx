'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, CATEGORY_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RegisterButton } from '@/components/RegisterButton';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', params.id as string));
        if (eventDoc.exists()) {
          const data = eventDoc.data();
          setEvent({
            id: eventDoc.id,
            ...data,
            date: data.date.toDate(),
            createdAt: data.createdAt?.toDate(),
          } as Event);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'événement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Événement non trouvé</h1>
        <Button onClick={() => router.push('/evenements')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux événements
        </Button>
      </div>
    );
  }

  const category = CATEGORY_LABELS[event.category];
  const isPast = event.date < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/evenements')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux événements
          </Button>

          <Card className="overflow-hidden">
            {event.imageUrl && (
              <div className="w-full h-64 md:h-96 relative">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* En-tête */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {category.label}
                    </span>
                    {isPast && (
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Terminé
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </h1>
                </div>
              </div>

              {/* Informations clés */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">
                      {format(event.date, 'EEEE d MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">
                      {format(event.date, 'HH:mm', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">{event.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">
                      {event.currentParticipants} / {event.maxParticipants} participants
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Bouton d'inscription */}
              {!isPast && (
                <div className="flex justify-center pt-6 border-t">
                  <RegisterButton
                    activityId={event.id}
                    activityType="event"
                  />
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
