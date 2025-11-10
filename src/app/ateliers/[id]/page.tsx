'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, query, collection, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Workshop, CATEGORY_LABELS, LEVEL_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Award, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RegisterButton } from '@/components/RegisterButton';
import { THEME_CLASSES } from '@/config/theme';
import { fadeInUp, bounceIn } from '@/lib/animations';
import { generateWorkshopDates, formatWorkshopSchedule, getNextSession } from '@/lib/workshop-utils';
import { useAuth } from '@/contexts/AuthContext';

export default function WorkshopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  const syncParticipantCount = async (workshopId: string) => {
    try {
      const q = query(
        collection(db, 'registrations'),
        where('workshopId', '==', workshopId)
      );
      const snapshot = await getDocs(q);
      const actualCount = snapshot.size;
      
      // Tenter de mettre à jour le compteur dans l'atelier (peut échouer si permissions insuffisantes)
      try {
        const workshopRef = doc(db, 'workshops', workshopId);
        await updateDoc(workshopRef, {
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

  const fetchWorkshop = async () => {
    try {
      const workshopDoc = await getDoc(doc(db, 'workshops', params.id as string));
      if (workshopDoc.exists()) {
        const data = workshopDoc.data();
        
        let actualParticipants = data.currentParticipants || 0;
        
        // Calculer le vrai nombre de participants uniquement si l'utilisateur est connecté
        if (user) {
          try {
            const q = query(
              collection(db, 'registrations'),
              where('workshopId', '==', params.id as string)
            );
            const registrationsSnapshot = await getDocs(q);
            actualParticipants = registrationsSnapshot.size;
          } catch (error) {
            console.warn('Cannot count registrations (not logged in or insufficient permissions)');
            // Utiliser la valeur du document si on ne peut pas compter
            actualParticipants = data.currentParticipants || 0;
          }
        }
        
        setWorkshop({
          id: workshopDoc.id,
          ...data,
          currentParticipants: actualParticipants,
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
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          // Anciens champs pour rétrocompatibilité
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          date: data.date?.toDate(),
        } as Workshop);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'atelier:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshop();
  }, [params.id, user?.id]); // Utiliser user.id pour éviter les changements de taille du tableau

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EDE0]">
        <motion.div 
          className={`h-16 w-16 border-4 ${THEME_CLASSES.borderSecondary} border-t-transparent rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Atelier non trouvé</h1>
        <Button onClick={() => router.push('/ateliers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux ateliers
        </Button>
      </div>
    );
  }

  const category = CATEGORY_LABELS[workshop.category];
  
  // Générer toutes les séances pour les ateliers récurrents (SANS filtrer les annulations pour l'affichage)
  const upcomingSessions = workshop.isRecurring
    ? (() => {
        const dates: Date[] = [];
        const start = workshop.seasonStartDate || new Date();
        const end = workshop.seasonEndDate || new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());
        
        const current = new Date(start);
        current.setHours(0, 0, 0, 0);
        
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        let weekCounter = 0;
        const maxSessions = 20;

        // Parcourir tous les jours entre le début et la fin
        while (current <= endDate && dates.length < maxSessions) {
          const dayOfWeek = current.getDay();
          
          // Si le jour actuel fait partie des jours de récurrence ET que c'est la bonne semaine
          if (workshop.recurrenceDays.includes(dayOfWeek) && weekCounter % (workshop.recurrenceInterval || 1) === 0) {
            const [hours, minutes] = (workshop.startTime || '14:00').split(':').map(Number);
            const sessionDate = new Date(current);
            sessionDate.setHours(hours, minutes, 0, 0);
            
            // Ajouter TOUTES les dates (même annulées) pour l'affichage
            if (sessionDate > new Date()) {
              dates.push(sessionDate);
            }
          }
          
          // Passer au jour suivant
          current.setDate(current.getDate() + 1);
          
          // Incrémenter le compteur de semaine à chaque dimanche
          if (dayOfWeek === 0) {
            weekCounter++;
          }
        }
        
        return dates;
      })()
    : [];
  
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
    <div className="min-h-screen bg-[#F7EDE0] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/ateliers')}
            className="mb-6"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour aux ateliers
          </Button>

          <Card className="overflow-hidden border-2 p-0">
            {workshop.imageUrl && (
              <div className="w-full h-64 md:h-96 relative">
                <Image
                  src={workshop.imageUrl}
                  alt={workshop.title}
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
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-2xl">{category.icon}</span>
                    <span className={`text-sm font-medium text-white px-3 py-1 rounded-full ${THEME_CLASSES.bgSecondary}`}>
                      {category.label}
                    </span>
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      {LEVEL_LABELS[workshop.level]}
                    </span>
                    {workshop.cancellationPeriods && workshop.cancellationPeriods.length > 0 && (
                      <span className="text-sm font-medium text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                        ⚠️ Avec interruptions
                      </span>
                    )}
                    {workshop.seasonEndDate && workshop.seasonEndDate < new Date() && (
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Saison terminée
                      </span>
                    )}
                  </div>
                  <h1 className={`text-4xl font-bold mb-2 ${THEME_CLASSES.textPrimary}`}>
                    {workshop.title}
                  </h1>
                </div>
              </div>

              {/* Périodes d'annulation */}
              {workshop.cancellationPeriods && workshop.cancellationPeriods.length > 0 && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900 mb-2">Périodes d'interruption</p>
                      <ul className="space-y-1">
                        {workshop.cancellationPeriods.map((period, idx) => {
                          const isSameDay = period.startDate.getTime() === period.endDate.getTime();
                          return (
                            <li key={idx} className="text-orange-800">
                              • {isSameDay 
                                  ? `Le ${format(period.startDate, "d MMMM yyyy", { locale: fr })}`
                                  : `Du ${format(period.startDate, "d MMMM", { locale: fr })} au ${format(period.endDate, "d MMMM yyyy", { locale: fr })}`
                                } : {period.reason}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Informations clés */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {workshop.isRecurring ? (
                  <>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className={`h-5 w-5 ${THEME_CLASSES.textSecondary}`} />
                      <div>
                        <div className="text-sm text-gray-500">Horaire</div>
                        <div className="font-semibold">
                          {formatWorkshopSchedule(
                            workshop.recurrenceDays,
                            workshop.startTime,
                            workshop.endTime,
                            workshop.recurrenceInterval
                          )}
                        </div>
                      </div>
                    </div>

                    {nextSession && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className={`h-5 w-5 ${THEME_CLASSES.textSecondary}`} />
                        <div>
                          <div className="text-sm text-gray-500">Prochaine séance</div>
                          <div className="font-semibold text-[#00A8A8]">
                            {format(nextSession, 'd MMMM yyyy à HH:mm', { locale: fr })}
                          </div>
                        </div>
                      </div>
                    )}

                    {workshop.seasonStartDate && workshop.seasonEndDate && (
                      <div className="flex items-center gap-3 text-gray-700 md:col-span-2">
                        <Calendar className={`h-5 w-5 ${THEME_CLASSES.textSecondary}`} />
                        <div>
                          <div className="text-sm text-gray-500">Période saisonnière</div>
                          <div className="font-semibold">
                            Du {format(workshop.seasonStartDate, 'd MMMM', { locale: fr })} au {format(workshop.seasonEndDate, 'd MMMM yyyy', { locale: fr })}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {workshop.startDate && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className={`h-5 w-5 ${THEME_CLASSES.textSecondary}`} />
                        <div>
                          <div className="text-sm text-gray-500">Début</div>
                          <div className="font-semibold">
                            {format(workshop.startDate, 'd MMMM yyyy', { locale: fr })}
                          </div>
                        </div>
                      </div>
                    )}

                    {workshop.endDate && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className={`h-5 w-5 ${THEME_CLASSES.textSecondary}`} />
                        <div>
                          <div className="text-sm text-gray-500">Fin</div>
                          <div className="font-semibold">
                            {format(workshop.endDate, 'd MMMM yyyy', { locale: fr })}
                          </div>
                        </div>
                      </div>
                    )}

                    {workshop.schedule && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className={`h-5 w-5 ${THEME_CLASSES.textSecondary}`} />
                        <div>
                          <div className="text-sm text-gray-500">Horaire</div>
                          <div className="font-semibold">{workshop.schedule}</div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className={`h-5 w-5 ${THEME_CLASSES.textSecondary}`} />
                  <div>
                    <div className="text-sm text-gray-500">Lieu</div>
                    <div className="font-semibold">{workshop.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Users className={`h-5 w-5 ${THEME_CLASSES.textSecondary}`} />
                  <div>
                    <div className="text-sm text-gray-500">Participants</div>
                    <div className="font-semibold">
                      {workshop.currentParticipants || 0} / {workshop.maxParticipants}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Award className={`h-5 w-5 ${THEME_CLASSES.textSecondary}`} />
                  <div>
                    <div className="text-sm text-gray-500">Niveau</div>
                    <div className="font-semibold">
                      {LEVEL_LABELS[workshop.level]}
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
                  {workshop.description}
                </p>
              </div>

              {/* Matériel requis */}
              {workshop.requiredMaterials && workshop.requiredMaterials.length > 0 && (
                <div className="mb-8">
                  <h2 className={`text-2xl font-bold mb-4 ${THEME_CLASSES.textPrimary}`}>
                    Matériel requis
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {workshop.requiredMaterials.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Informations sur l'inscription */}
              <div className="mb-8 bg-gradient-to-r from-[#F7EDE0] to-[#F7EDE0]/50 rounded-2xl p-6 border-2 border-[#00A8A8]/20">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  {workshop.requiresRegistration ? '📝' : '🔓'} 
                  {workshop.requiresRegistration ? 'Modalités d\'inscription' : 'Accès libre'}
                </h3>
                
                {workshop.requiresRegistration ? (
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      <strong>Inscription obligatoire</strong> pour participer à cet atelier.
                    </p>
                    
                    {workshop.maxParticipants && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-700">Places disponibles :</span>
                          <span className={`text-xl font-bold ${
                            (workshop.currentParticipants || 0) >= workshop.maxParticipants 
                              ? 'text-red-600' 
                              : (workshop.currentParticipants || 0) >= workshop.maxParticipants * 0.8 
                                ? 'text-orange-600' 
                                : 'text-green-600'
                          }`}>
                            {workshop.maxParticipants - (workshop.currentParticipants || 0)} / {workshop.maxParticipants}
                          </span>
                        </div>
                        
                        {/* Barre de progression */}
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              (workshop.currentParticipants || 0) >= workshop.maxParticipants 
                                ? 'bg-red-600' 
                                : (workshop.currentParticipants || 0) >= workshop.maxParticipants * 0.8 
                                  ? 'bg-orange-600' 
                                  : 'bg-green-600'
                            }`}
                            style={{ width: `${((workshop.currentParticipants || 0) / workshop.maxParticipants) * 100}%` }}
                          ></div>
                        </div>
                        
                        {(workshop.currentParticipants || 0) >= workshop.maxParticipants && (
                          <p className="text-red-600 font-semibold mt-2 flex items-center gap-2">
                            ⚠️ Atelier complet
                          </p>
                        )}
                      </div>
                    )}
                    
                    {nextSession && !user && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-lg">💡</span>
                          <span>Connectez-vous pour vous inscrire à cet atelier</span>
                        </p>
                      </div>
                    )}
                    
                    {/* Bouton d'inscription intégré dans la section */}
                    {nextSession && (
                      <motion.div 
                        className="pt-4 border-t border-gray-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <RegisterButton
                          activityId={workshop.id}
                          activityType="workshop"
                          requiresRegistration={workshop.requiresRegistration}
                          onRegistrationChange={fetchWorkshop}
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
                      📍 Rendez-vous à : <strong>{workshop.location}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Calendrier des prochaines séances (pour ateliers récurrents) */}
              {workshop.isRecurring && upcomingSessions.length > 0 && (
                <div className="mb-8">
                  <h2 className={`text-2xl font-bold mb-4 ${THEME_CLASSES.textPrimary}`}>
                    📅 Prochaines séances
                  </h2>
                  
                  {/* Message d'info si des annulations existent */}
                  {workshop.cancellationPeriods && workshop.cancellationPeriods.length > 0 && (
                    <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-orange-800 flex items-start gap-2">
                        <span className="text-lg">⚠️</span>
                        <span>
                          Certaines séances sont annulées. Elles sont affichées barrées avec la raison de l'annulation.
                        </span>
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {upcomingSessions.map((session, index) => {
                      // Vérifier si cette séance est dans une période d'interruption
                      // Comparer uniquement les DATES (pas les heures) en normalisant à minuit
                      const sessionDate = new Date(session);
                      sessionDate.setHours(0, 0, 0, 0);
                      const sessionTime = sessionDate.getTime();
                      
                      const isCancelled = workshop.cancellationPeriods?.some(period => {
                        const startDate = new Date(period.startDate);
                        startDate.setHours(0, 0, 0, 0);
                        const endDate = new Date(period.endDate);
                        endDate.setHours(23, 59, 59, 999);
                        
                        return sessionTime >= startDate.getTime() && sessionTime <= endDate.getTime();
                      }) || false;
                      
                      const cancellationReason = workshop.cancellationPeriods?.find(period => {
                        const startDate = new Date(period.startDate);
                        startDate.setHours(0, 0, 0, 0);
                        const endDate = new Date(period.endDate);
                        endDate.setHours(23, 59, 59, 999);
                        
                        return sessionTime >= startDate.getTime() && sessionTime <= endDate.getTime();
                      })?.reason;
                      
                      // Debug: afficher les infos dans la console
                      console.log(`Séance ${index + 1}:`, {
                        date: session.toLocaleString(),
                        dateOnly: sessionDate.toLocaleDateString(),
                        timestamp: sessionTime,
                        isCancelled,
                        reason: cancellationReason,
                        periods: workshop.cancellationPeriods?.map(p => {
                          const start = new Date(p.startDate);
                          start.setHours(0, 0, 0, 0);
                          const end = new Date(p.endDate);
                          end.setHours(23, 59, 59, 999);
                          return {
                            start: start.toLocaleDateString(),
                            end: end.toLocaleDateString(),
                            startTime: start.getTime(),
                            endTime: end.getTime()
                          };
                        })
                      });
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`${
                            isCancelled 
                              ? 'bg-red-50 border-2 border-red-300 opacity-60' 
                              : 'bg-[#00A8A8]/10 border-2 border-[#00A8A8]/30 hover:bg-[#00A8A8]/20'
                          } rounded-lg p-3 text-center transition-colors relative`}
                        >
                          {isCancelled && (
                            <div className="absolute top-1 right-1">
                              <span className="text-red-600 text-xs font-bold">❌</span>
                            </div>
                          )}
                          <div className={`font-semibold ${isCancelled ? 'text-red-600 line-through' : 'text-[#00A8A8]'}`}>
                            {format(session, 'EEEE d MMMM', { locale: fr })}
                          </div>
                          <div className={`text-sm ${isCancelled ? 'text-red-500 line-through' : 'text-gray-600'}`}>
                            {format(session, 'HH:mm', { locale: fr })}
                          </div>
                          {isCancelled && cancellationReason && (
                            <div className="text-xs text-red-600 mt-1 italic">
                              {cancellationReason}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  {workshop.seasonStartDate && workshop.seasonEndDate && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Les séances continuent jusqu'au {format(workshop.seasonEndDate, 'd MMMM yyyy', { locale: fr })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
