'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Workshop, CATEGORY_LABELS, LEVEL_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RegisterButton } from '@/components/RegisterButton';

export default function WorkshopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const workshopDoc = await getDoc(doc(db, 'workshops', params.id as string));
        if (workshopDoc.exists()) {
          const data = workshopDoc.data();
          setWorkshop({
            id: workshopDoc.id,
            ...data,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
            createdAt: data.createdAt?.toDate(),
          } as Workshop);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'atelier:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
  const isPast = workshop.endDate < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/ateliers')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux ateliers
          </Button>

          <Card className="overflow-hidden">
            {workshop.imageUrl && (
              <div className="w-full h-64 md:h-96 relative">
                <img
                  src={workshop.imageUrl}
                  alt={workshop.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* En-tête */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      {category.label}
                    </span>
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      {LEVEL_LABELS[workshop.level]}
                    </span>
                    {isPast && (
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Terminé
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {workshop.title}
                  </h1>
                </div>
              </div>

              {/* Informations clés */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">Début</div>
                    <div className="font-semibold">
                      {format(workshop.startDate, 'd MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">Fin</div>
                    <div className="font-semibold">
                      {format(workshop.endDate, 'd MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">Horaire</div>
                    <div className="font-semibold">{workshop.schedule}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">Lieu</div>
                    <div className="font-semibold">{workshop.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">Participants</div>
                    <div className="font-semibold">
                      {workshop.currentParticipants} / {workshop.maxParticipants}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Award className="h-5 w-5 text-purple-600" />
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {workshop.description}
                </p>
              </div>

              {/* Matériel requis */}
              {workshop.requiredMaterials && workshop.requiredMaterials.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Matériel requis
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {workshop.requiredMaterials.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bouton d'inscription */}
              {!isPast && (
                <div className="flex justify-center pt-6 border-t">
                  <RegisterButton
                    activityId={workshop.id}
                    activityType="workshop"
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
