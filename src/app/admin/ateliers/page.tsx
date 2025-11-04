'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Workshop, ActivityCategory, SkillLevel, CATEGORY_LABELS, LEVEL_LABELS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

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
    date: '',
    startDate: '',
    endDate: '',
    schedule: '',
    location: '',
    instructor: '',
    category: ActivityCategory.AUTRE,
    level: SkillLevel.DEBUTANT,
    requiresRegistration: true,
    maxParticipants: 15,
    imageUrl: '',
    requiredMaterials: '',
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
        orderBy('startDate', 'desc')
      );
      const snapshot = await getDocs(workshopsQuery);
      const workshopsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate(),
        startDate: doc.data().startDate.toDate(),
        endDate: doc.data().endDate.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Workshop[];
      
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
    
    try {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const date = new Date(formData.date);
      
      const materialsArray = formData.requiredMaterials
        .split('\n')
        .map(m => m.trim())
        .filter(m => m.length > 0);

      const workshopData = {
        title: formData.title,
        description: formData.description,
        date: Timestamp.fromDate(date),
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        schedule: formData.schedule,
        location: formData.location,
        instructor: formData.instructor,
        category: formData.category,
        level: formData.level,
        requiresRegistration: formData.requiresRegistration,
        maxParticipants: formData.maxParticipants,
        currentParticipants: 0,
        imageUrl: formData.imageUrl || undefined,
        requiredMaterials: materialsArray.length > 0 ? materialsArray : undefined,
        updatedAt: Timestamp.now(),
      };

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
      date: format(workshop.date, 'yyyy-MM-dd'),
      startDate: format(workshop.startDate, 'yyyy-MM-dd'),
      endDate: format(workshop.endDate, 'yyyy-MM-dd'),
      schedule: workshop.schedule,
      location: workshop.location,
      instructor: workshop.instructor,
      category: workshop.category,
      level: workshop.level,
      requiresRegistration: workshop.requiresRegistration,
      maxParticipants: workshop.maxParticipants || 15,
      imageUrl: workshop.imageUrl || '',
      requiredMaterials: workshop.requiredMaterials?.join('\n') || '',
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startDate: '',
      endDate: '',
      schedule: '',
      location: '',
      instructor: '',
      category: ActivityCategory.AUTRE,
      level: SkillLevel.DEBUTANT,
      requiresRegistration: true,
      maxParticipants: 15,
      imageUrl: '',
      requiredMaterials: '',
    });
    setEditingWorkshop(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Date de début de l'atelier *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">Période - Début *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">Période - Fin *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule">Horaires *</Label>
                    <Input
                      id="schedule"
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      placeholder="Ex: Mardi 14h-16h"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructor">Animateur *</Label>
                    <Input
                      id="instructor"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      required
                    />
                  </div>
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
            const isPast = workshop.endDate < new Date();

            return (
              <Card key={workshop.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xl">{categoryInfo.icon}</span>
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                          {categoryInfo.label}
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
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{workshop.title}</h3>
                      <p className="text-gray-600 mb-2">{workshop.description}</p>
                      <div className="text-sm text-gray-500">
                        <p>📅 Du {format(workshop.startDate, "d MMM", { locale: fr })} au {format(workshop.endDate, "d MMM yyyy", { locale: fr })}</p>
                        <p>🕐 {workshop.schedule}</p>
                        <p>📍 {workshop.location}</p>
                        <p>👨‍🏫 {workshop.instructor}</p>
                        <p>👥 {workshop.currentParticipants} / {workshop.maxParticipants} participants</p>
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
