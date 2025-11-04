'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, ActivityCategory, CATEGORY_LABELS } from '@/types';
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

export default function AdminEventsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: ActivityCategory.AUTRE,
    requiresRegistration: true,
    maxParticipants: 30,
    imageUrl: '',
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
    fetchEvents();
  }, [user, isAdmin, router]);

  const fetchEvents = async () => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Event[];
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventDate = new Date(`${formData.date}T${formData.time}`);
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: Timestamp.fromDate(eventDate),
        location: formData.location,
        category: formData.category,
        requiresRegistration: formData.requiresRegistration,
        maxParticipants: formData.maxParticipants,
        currentParticipants: 0,
        imageUrl: formData.imageUrl || undefined,
        updatedAt: Timestamp.now(),
      };

      if (editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), eventData);
        toast.success('Événement modifié avec succès');
      } else {
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdAt: Timestamp.now(),
        });
        toast.success('Événement créé avec succès');
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: format(event.date, 'yyyy-MM-dd'),
      time: format(event.date, 'HH:mm'),
      location: event.location,
      category: event.category,
      requiresRegistration: event.requiresRegistration,
      maxParticipants: event.maxParticipants || 30,
      imageUrl: event.imageUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'events', eventId));
      toast.success('Événement supprimé avec succès');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: ActivityCategory.AUTRE,
      requiresRegistration: true,
      maxParticipants: 30,
      imageUrl: '',
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Événements</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Événement
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="time">Heure *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
                    {editingEvent ? 'Modifier' : 'Créer'}
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
          {events.map((event) => {
            const categoryInfo = CATEGORY_LABELS[event.category];
            const isPast = event.date < new Date();

            return (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{categoryInfo.icon}</span>
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {categoryInfo.label}
                        </span>
                        {isPast && (
                          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Terminé
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-600 mb-2">{event.description}</p>
                      <div className="text-sm text-gray-500">
                        <p>📅 {format(event.date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
                        <p>📍 {event.location}</p>
                        <p>👥 {event.currentParticipants} / {event.maxParticipants} participants</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {events.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                Aucun événement créé pour le moment
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
