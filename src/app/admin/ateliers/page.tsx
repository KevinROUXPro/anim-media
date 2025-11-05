'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Workshop, ActivityCategory, SkillLevel, CATEGORY_LABELS, LEVEL_LABELS, CancellationPeriod } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ArrowLeft, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { WEEKDAY_LABELS, formatWorkshopSchedule, countTotalSessions } from '@/lib/workshop-utils';

export default function AdminWorkshopsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recurrenceDays: [] as number[],
    recurrenceInterval: 1, // 1 = chaque semaine, 2 = toutes les 2 semaines, etc.
    startTime: '14:00',
    endTime: '16:00',
    seasonStartDate: '', // Optionnel : début de saison
    seasonEndDate: '', // Optionnel : fin de saison
    location: '',
    instructor: '',
    category: ActivityCategory.AUTRE,
    level: SkillLevel.DEBUTANT,
    requiresRegistration: true,
    maxParticipants: 15,
    imageUrl: '',
    requiredMaterials: '',
    cancellationPeriods: [] as Array<{ startDate: string; endDate: string; reason: string }>,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchWorkshops();
  }, [user, isAdmin, router]);

  const fetchWorkshops = async () => {
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
          firstSessionDate: data.firstSessionDate?.toDate(),
          lastSessionDate: data.lastSessionDate?.toDate(),
          date: data.date?.toDate(),
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
        };
      }) as Workshop[];
      
      setWorkshops(workshopsData);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      toast.error('Erreur lors du chargement des ateliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.recurrenceDays.length === 0) {
      toast.error('Veuillez sélectionner au moins un jour de la semaine');
      return;
    }
    
    try {
      const materialsArray = formData.requiredMaterials
        .split('\n')
        .map(m => m.trim())
        .filter(m => m.length > 0);

      const workshopData: any = {
        title: formData.title,
        description: formData.description,
        isRecurring: true,
        recurrenceDays: formData.recurrenceDays,
        recurrenceInterval: formData.recurrenceInterval,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        instructor: formData.instructor,
        category: formData.category,
        level: formData.level,
        requiresRegistration: formData.requiresRegistration,
        maxParticipants: formData.maxParticipants,
        currentParticipants: editingWorkshop?.currentParticipants || 0,
        imageUrl: formData.imageUrl || undefined,
        requiredMaterials: materialsArray.length > 0 ? materialsArray : undefined,
        updatedAt: Timestamp.now(),
      };

      // Ajouter les périodes d'annulation si spécifiées
      if (formData.cancellationPeriods && formData.cancellationPeriods.length > 0) {
        workshopData.cancellationPeriods = formData.cancellationPeriods.map(period => ({
          startDate: Timestamp.fromDate(new Date(period.startDate)),
          endDate: Timestamp.fromDate(new Date(period.endDate)),
          reason: period.reason
        }));
      }

      // Ajouter les dates saisonnières si spécifiées
      if (formData.seasonStartDate) {
        workshopData.seasonStartDate = Timestamp.fromDate(new Date(formData.seasonStartDate));
      }
      if (formData.seasonEndDate) {
        workshopData.seasonEndDate = Timestamp.fromDate(new Date(formData.seasonEndDate));
      }

      if (editingWorkshop) {
        await updateDoc(doc(db, 'workshops', editingWorkshop.id), workshopData);
        toast.success('Atelier modifié avec succès');
      } else {
        await addDoc(collection(db, 'workshops'), {
          ...workshopData,
          createdAt: Timestamp.now(),
        });
        toast.success('Atelier créé avec succès');
      }

      resetForm();
      fetchWorkshops();
    } catch (error) {
      console.error('Error saving workshop:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title,
      description: workshop.description,
      recurrenceDays: workshop.recurrenceDays || [],
      recurrenceInterval: workshop.recurrenceInterval || 1,
      startTime: workshop.startTime || '14:00',
      endTime: workshop.endTime || '16:00',
      seasonStartDate: workshop.seasonStartDate ? format(workshop.seasonStartDate, 'yyyy-MM-dd') : '',
      seasonEndDate: workshop.seasonEndDate ? format(workshop.seasonEndDate, 'yyyy-MM-dd') : '',
      location: workshop.location,
      instructor: workshop.instructor,
      category: workshop.category,
      level: workshop.level,
      requiresRegistration: workshop.requiresRegistration,
      maxParticipants: workshop.maxParticipants || 15,
      imageUrl: workshop.imageUrl || '',
      requiredMaterials: workshop.requiredMaterials?.join('\n') || '',
      cancellationPeriods: workshop.cancellationPeriods?.map(p => ({
        startDate: format(p.startDate, 'yyyy-MM-dd'),
        endDate: format(p.endDate, 'yyyy-MM-dd'),
        reason: p.reason
      })) || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (workshopId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet atelier ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'workshops', workshopId));
      toast.success('Atelier supprimé avec succès');
      fetchWorkshops();
    } catch (error) {
      console.error('Error deleting workshop:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter(d => d !== day)
        : [...prev.recurrenceDays, day].sort((a, b) => a - b)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      recurrenceDays: [],
      recurrenceInterval: 1,
      startTime: '14:00',
      endTime: '16:00',
      seasonStartDate: '',
      seasonEndDate: '',
      location: '',
      instructor: '',
      category: ActivityCategory.AUTRE,
      level: SkillLevel.DEBUTANT,
      requiresRegistration: true,
      maxParticipants: 15,
      imageUrl: '',
      requiredMaterials: '',
      cancellationPeriods: [],
    });
    setEditingWorkshop(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EDE0]">
        <motion.div 
          className="h-16 w-16 border-4 border-[#00A8A8] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Ateliers</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Atelier
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingWorkshop ? 'Modifier l\'atelier' : 'Nouvel atelier'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                {/* Jours de la semaine */}
                <div>
                  <Label className="mb-3 block">Jours de la semaine *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                          formData.recurrenceDays.includes(day)
                            ? 'bg-[#00A8A8] border-[#00A8A8] text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-[#00A8A8]'
                        }`}
                      >
                        {WEEKDAY_LABELS[day]}
                      </button>
                    ))}
                  </div>
                  {formData.recurrenceDays.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      📅 {formatWorkshopSchedule(formData.recurrenceDays, formData.startTime, formData.endTime)}
                    </p>
                  )}
                </div>

                {/* Horaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Heure de début *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime">Heure de fin *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Intervalle de récurrence */}
                <div>
                  <Label htmlFor="recurrenceInterval">Fréquence *</Label>
                  <Select
                    value={formData.recurrenceInterval.toString()}
                    onValueChange={(value) => setFormData({ ...formData, recurrenceInterval: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Chaque semaine</SelectItem>
                      <SelectItem value="2">Toutes les 2 semaines</SelectItem>
                      <SelectItem value="3">Toutes les 3 semaines</SelectItem>
                      <SelectItem value="4">Toutes les 4 semaines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Période saisonnière (optionnelle) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seasonStartDate">Début de saison (optionnel)</Label>
                    <Input
                      id="seasonStartDate"
                      type="date"
                      value={formData.seasonStartDate}
                      onChange={(e) => setFormData({ ...formData, seasonStartDate: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Laisser vide pour un atelier permanent</p>
                  </div>

                  <div>
                    <Label htmlFor="seasonEndDate">Fin de saison (optionnel)</Label>
                    <Input
                      id="seasonEndDate"
                      type="date"
                      value={formData.seasonEndDate}
                      onChange={(e) => setFormData({ ...formData, seasonEndDate: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Laisser vide pour un atelier permanent</p>
                  </div>
                </div>

                {/* Afficher le nombre de séances */}
                {formData.recurrenceDays.length > 0 && formData.seasonStartDate && formData.seasonEndDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900">
                      📊 Cet atelier comprendra <strong>{countTotalSessions(
                        formData.recurrenceDays,
                        formData.recurrenceInterval,
                        new Date(formData.seasonStartDate),
                        new Date(formData.seasonEndDate),
                        formData.startTime
                      )} séances</strong> sur la période saisonnière
                    </p>
                  </div>
                )}

                {/* Périodes d'annulation */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-lg font-semibold">Périodes d'annulation (optionnel)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          cancellationPeriods: [
                            ...formData.cancellationPeriods,
                            { startDate: '', endDate: '', reason: '' }
                          ]
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une période
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    Indiquez les périodes où l'atelier n'aura pas lieu (ex: vacances de l'animateur, fermeture du lieu...)
                  </p>

                  {formData.cancellationPeriods.length > 0 && (
                    <div className="space-y-3">
                      {formData.cancellationPeriods.map((period, index) => (
                        <div key={index} className="flex gap-2 items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <Label htmlFor={`period-start-${index}`} className="text-xs">Début *</Label>
                              <Input
                                id={`period-start-${index}`}
                                type="date"
                                value={period.startDate}
                                onChange={(e) => {
                                  const newPeriods = [...formData.cancellationPeriods];
                                  newPeriods[index].startDate = e.target.value;
                                  setFormData({ ...formData, cancellationPeriods: newPeriods });
                                }}
                                required
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`period-end-${index}`} className="text-xs">Fin *</Label>
                              <Input
                                id={`period-end-${index}`}
                                type="date"
                                value={period.endDate}
                                onChange={(e) => {
                                  const newPeriods = [...formData.cancellationPeriods];
                                  newPeriods[index].endDate = e.target.value;
                                  setFormData({ ...formData, cancellationPeriods: newPeriods });
                                }}
                                required
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`period-reason-${index}`} className="text-xs">Raison *</Label>
                              <Input
                                id={`period-reason-${index}`}
                                type="text"
                                value={period.reason}
                                onChange={(e) => {
                                  const newPeriods = [...formData.cancellationPeriods];
                                  newPeriods[index].reason = e.target.value;
                                  setFormData({ ...formData, cancellationPeriods: newPeriods });
                                }}
                                placeholder="Ex: Vacances"
                                required
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newPeriods = formData.cancellationPeriods.filter((_, i) => i !== index);
                              setFormData({ ...formData, cancellationPeriods: newPeriods });
                            }}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instructor">Animateur *</Label>
                    <Input
                      id="instructor"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Lieu *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as ActivityCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.icon} {value.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level">Niveau *</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({ ...formData, level: value as SkillLevel })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LEVEL_LABELS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxParticipants">Nombre maximum de participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="requiredMaterials">Matériel requis (un par ligne)</Label>
                  <Textarea
                    id="requiredMaterials"
                    value={formData.requiredMaterials}
                    onChange={(e) => setFormData({ ...formData, requiredMaterials: e.target.value })}
                    rows={3}
                    placeholder="Crayon&#10;Gomme&#10;Cahier"
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">URL de l'image (optionnel)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit">
                    {editingWorkshop ? 'Modifier' : 'Créer'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {workshops.map((workshop) => {
            const categoryInfo = CATEGORY_LABELS[workshop.category];
            const schedule = workshop.isRecurring 
              ? formatWorkshopSchedule(workshop.recurrenceDays, workshop.startTime, workshop.endTime, workshop.recurrenceInterval)
              : workshop.schedule || 'Horaires non définis';
            
            const hasActiveCancellations = workshop.cancellationPeriods && workshop.cancellationPeriods.length > 0;

            return (
              <Card key={workshop.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xl">{categoryInfo.icon}</span>
                        <span className="text-sm font-medium text-white bg-[#00A8A8] px-3 py-1 rounded-full">
                          {categoryInfo.label}
                        </span>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          {LEVEL_LABELS[workshop.level]}
                        </span>
                        {hasActiveCancellations && (
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
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{workshop.title}</h3>
                      <p className="text-gray-600 mb-2">{workshop.description}</p>
                      
                      {hasActiveCancellations && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-3">
                          <p className="text-sm font-semibold text-orange-900 mb-1">Périodes d'annulation :</p>
                          <ul className="text-sm text-orange-800 space-y-1">
                            {workshop.cancellationPeriods!.map((period, idx) => (
                              <li key={idx}>
                                • Du {format(period.startDate, "d MMM", { locale: fr })} au {format(period.endDate, "d MMM yyyy", { locale: fr })} - {period.reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        {workshop.seasonStartDate && workshop.seasonEndDate ? (
                          <p>📅 Saison: {format(workshop.seasonStartDate, "d MMM", { locale: fr })} au {format(workshop.seasonEndDate, "d MMM yyyy", { locale: fr })}</p>
                        ) : (
                          <p>📅 Atelier permanent</p>
                        )}
                        <p>🕐 {schedule}</p>
                        <p>📍 {workshop.location}</p>
                        <p>👨‍🏫 {workshop.instructor}</p>
                        <p>👥 {workshop.currentParticipants} / {workshop.maxParticipants} participants</p>
                        {workshop.isRecurring && workshop.seasonStartDate && workshop.seasonEndDate && (
                          <p className="text-blue-600 font-medium">
                            ♻️ {countTotalSessions(
                              workshop.recurrenceDays, 
                              workshop.recurrenceInterval || 1, 
                              workshop.seasonStartDate, 
                              workshop.seasonEndDate, 
                              workshop.startTime
                            )} séances sur la saison
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(workshop)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(workshop.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {workshops.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                Aucun atelier créé pour le moment
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
