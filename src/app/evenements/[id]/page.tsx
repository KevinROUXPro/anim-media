'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, query, collection, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, CATEGORY_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RegisterButton } from '@/components/RegisterButton';
import { THEME_CLASSES } from '@/config/theme';
import { fadeInUp } from '@/lib/animations';
import { useAuth } from '@/contexts/AuthContext';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const syncParticipantCount = async (eventId: string) => {
    try {
      const q = query(
        collection(db, 'registrations'),
        where('eventId', '==', eventId)
      );
      const snapshot = await getDocs(q);
      const actualCount = snapshot.size;
      
      // Tenter de mettre à jour le compteur dans l'événement (peut échouer si permissions insuffisantes)
      try {
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
          currentParticipants: actualCount
        });
      } catch (updateError) {
        console.warn('Cannot update participant count (permissions):', updateError);
        // Continue sans bloquer - on utilisera le compteur calculé
      }
      
      return actualCount;
    } catch (error) {
      console.error('Error syncing participant count:', error);
      return 0;
    }
  };

  const fetchEvent = async () => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', params.id as string));
      if (eventDoc.exists()) {
        const data = eventDoc.data();
        
        let actualParticipants = data.currentParticipants || 0;
        
        // Calculer le vrai nombre de participants uniquement si l'utilisateur est connecté
        if (user) {
          try {
            const q = query(
              collection(db, 'registrations'),
              where('eventId', '==', params.id as string)
            );
            const registrationsSnapshot = await getDocs(q);
            actualParticipants = registrationsSnapshot.size;
          } catch (error) {
            console.warn('Cannot count registrations (not logged in or insufficient permissions)');
            // Utiliser la valeur du document si on ne peut pas compter
            actualParticipants = data.currentParticipants || 0;
          }
        }
        
        setEvent({
          id: eventDoc.id,
          ...data,
          currentParticipants: actualParticipants,
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

  useEffect(() => {
    fetchEvent();
  }, [params.id, user?.id]); // Utiliser user.id pour éviter les changements de taille du tableau

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EDE0]">
        <motion.div 
          className={`h-16 w-16 border-4 ${THEME_CLASSES.borderPrimary} border-t-transparent rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7EDE0]">
        <h1 className={`text-2xl font-bold mb-4 ${THEME_CLASSES.textPrimary}`}>Événement non trouvé</h1>
        <Button onClick={() => router.push('/evenements')} size="lg">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour aux événements
        </Button>
      </div>
    );
  }

  const category = CATEGORY_LABELS[event.category];
  const isPast = event.date < new Date();

  return (
    <div className="min-h-screen bg-[#F7EDE0] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/evenements')}
            className="mb-6"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour aux événements
          </Button>

          <Card className="overflow-hidden border-2 shadow-lg p-0">
            {event.imageUrl && (
              <div className="w-full h-64 md:h-96 relative">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1200px"
                  priority
                />
              </div>
            )}

            <div className="p-8">
              {/* En-tête */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span className={`text-sm font-medium text-white px-3 py-1 rounded-full ${THEME_CLASSES.bgPrimary}`}>
                      {category.label}
                    </span>
                    {isPast && (
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Terminé
                      </span>
                    )}
                  </div>
                  <h1 className={`text-4xl font-bold mb-2 ${THEME_CLASSES.textPrimary}`}>
                    {event.title}
                  </h1>
                </div>
              </div>

              {/* Informations clés */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className={`h-5 w-5 ${THEME_CLASSES.textPrimary}`} />
                  <div>
                    <div className="font-semibold">
                      {format(event.date, 'EEEE d MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className={`h-5 w-5 ${THEME_CLASSES.textPrimary}`} />
                  <div>
                    <div className="font-semibold">
                      {format(event.date, 'HH:mm', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className={`h-5 w-5 ${THEME_CLASSES.textPrimary}`} />
                  <div>
                    <div className="font-semibold">{event.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Users className={`h-5 w-5 ${THEME_CLASSES.textPrimary}`} />
                  <div>
                    <div className="font-semibold">
                      {event.currentParticipants || 0} / {event.maxParticipants} participants
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className={`text-2xl font-bold mb-4 ${THEME_CLASSES.textPrimary}`}>
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Informations sur l'inscription */}
              <div className="mb-8 bg-gradient-to-r from-[#F7EDE0] to-[#F7EDE0]/50 rounded-2xl p-6 border-2 border-[#DE3156]/20">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  {event.requiresRegistration ? '📝' : '🔓'} 
                  {event.requiresRegistration ? 'Modalités d\'inscription' : 'Accès libre'}
                </h3>
                
                {event.requiresRegistration ? (
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      <strong>Inscription obligatoire</strong> pour participer à cet événement.
                    </p>
                    
                    {event.maxParticipants && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-700">Places disponibles :</span>
                          <span className={`text-xl font-bold ${
                            (event.currentParticipants || 0) >= event.maxParticipants 
                              ? 'text-red-600' 
                              : (event.currentParticipants || 0) >= event.maxParticipants * 0.8 
                                ? 'text-orange-600' 
                                : 'text-green-600'
                          }`}>
                            {event.maxParticipants - (event.currentParticipants || 0)} / {event.maxParticipants}
                          </span>
                        </div>
                        
                        {/* Barre de progression */}
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              (event.currentParticipants || 0) >= event.maxParticipants 
                                ? 'bg-red-600' 
                                : (event.currentParticipants || 0) >= event.maxParticipants * 0.8 
                                  ? 'bg-orange-600' 
                                  : 'bg-green-600'
                            }`}
                            style={{ width: `${((event.currentParticipants || 0) / event.maxParticipants) * 100}%` }}
                          ></div>
                        </div>
                        
                        {(event.currentParticipants || 0) >= event.maxParticipants && (
                          <p className="text-red-600 font-semibold mt-2 flex items-center gap-2">
                            ⚠️ Événement complet
                          </p>
                        )}
                      </div>
                    )}
                    
                    {!isPast && !user && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-lg">💡</span>
                          <span>Connectez-vous pour vous inscrire à cet événement</span>
                        </p>
                      </div>
                    )}
                    
                    {/* Bouton d'inscription intégré dans la section */}
                    {!isPast && (
                      <motion.div 
                        className="pt-4 border-t border-gray-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <RegisterButton
                          activityId={event.id}
                          activityType="event"
                          requiresRegistration={event.requiresRegistration}
                          onRegistrationChange={fetchEvent}
                        />
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700">
                      <strong>Accès libre</strong> - Aucune inscription nécessaire. Venez simplement nous rejoindre !
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      📍 Rendez-vous à : <strong>{event.location}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
