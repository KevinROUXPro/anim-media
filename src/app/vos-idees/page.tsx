'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, orderBy, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Suggestion, SuggestionDoc, ActivityCategory, CATEGORY_LABELS, MembershipStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { THEME_CLASSES } from '@/config/theme';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { Lightbulb, Heart, Plus, X, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function VosIdeesPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<ActivityCategory | 'ALL'>('ALL');
  
  // Formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ActivityCategory.AUTRE,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  async function fetchSuggestions() {
    setLoading(true);
    try {
      const suggestionsQuery = query(
        collection(db, 'suggestions'),
        orderBy('createdAt', 'desc')
      );
      const suggestionsSnapshot = await getDocs(suggestionsQuery);
      
      const suggestionsData = suggestionsSnapshot.docs.map(doc => {
        const data = doc.data() as SuggestionDoc;
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Suggestion;
      });

      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
      toast.error('Erreur lors du chargement des suggestions');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user || user.membershipStatus !== MembershipStatus.ACTIVE) {
      toast.error('Vous devez être adhérent pour soumettre une suggestion');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setSubmitting(true);
    try {
      const newSuggestion = {
        userId: user.id,
        userName: user.name,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        likes: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'suggestions'), newSuggestion);
      
      toast.success('Votre suggestion a été ajoutée !');
      setFormData({ title: '', description: '', category: ActivityCategory.AUTRE });
      setShowForm(false);
      fetchSuggestions();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la suggestion:', error);
      toast.error('Erreur lors de l\'ajout de la suggestion');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(suggestionId: string) {
    if (!user) {
      toast.error('Vous devez être connecté pour liker une suggestion');
      return;
    }

    try {
      const suggestionRef = doc(db, 'suggestions', suggestionId);
      const suggestion = suggestions.find(s => s.id === suggestionId);
      
      if (!suggestion) return;

      const hasLiked = suggestion.likes.includes(user.id);

      if (hasLiked) {
        await updateDoc(suggestionRef, {
          likes: arrayRemove(user.id),
          updatedAt: Timestamp.now(),
        });
      } else {
        await updateDoc(suggestionRef, {
          likes: arrayUnion(user.id),
          updatedAt: Timestamp.now(),
        });
      }

      fetchSuggestions();
    } catch (error) {
      console.error('Erreur lors du like:', error);
      toast.error('Erreur lors du like');
    }
  }

  const filteredSuggestions = filterCategory === 'ALL' 
    ? suggestions 
    : suggestions.filter(s => s.category === filterCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7EDE0]/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h1 className={`text-4xl md:text-5xl font-bold ${THEME_CLASSES.textGradient} mb-4`}>
              Vos Idées
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Partagez vos suggestions d'ateliers, d'événements et d'activités !
            </p>
            
            {user && user.membershipStatus === MembershipStatus.ACTIVE && (
              <Button
                onClick={() => setShowForm(!showForm)}
                className={THEME_CLASSES.buttonPrimary}
                size="lg"
              >
                {showForm ? <X className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                {showForm ? 'Annuler' : 'Proposer une idée'}
              </Button>
            )}
          </motion.div>

          {/* Formulaire de suggestion */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Nouvelle suggestion</CardTitle>
                    <CardDescription>
                      Partagez votre idée avec la communauté
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Titre de l'idée</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Ex: Atelier poterie"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Catégorie</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value as ActivityCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ActivityCategory).map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {CATEGORY_LABELS[cat].icon} {CATEGORY_LABELS[cat].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Décrivez votre idée en détail..."
                          rows={5}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className={THEME_CLASSES.buttonPrimary}
                      >
                        {submitting ? 'Envoi...' : 'Soumettre l\'idée'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filtre par catégorie */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <Button
                onClick={() => setFilterCategory('ALL')}
                variant={filterCategory === 'ALL' ? 'default' : 'outline'}
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Toutes
              </Button>
              {Object.values(ActivityCategory).map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  variant={filterCategory === cat ? 'default' : 'outline'}
                  size="sm"
                >
                  {CATEGORY_LABELS[cat].icon} {CATEGORY_LABELS[cat].label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Liste des suggestions */}
          {filteredSuggestions.length === 0 ? (
            <motion.div variants={fadeInUp}>
              <Card className="text-center py-12">
                <CardContent>
                  <Lightbulb className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-xl text-gray-600">
                    {filterCategory === 'ALL' 
                      ? 'Aucune suggestion pour le moment. Soyez le premier à partager vos idées !'
                      : 'Aucune suggestion dans cette catégorie'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredSuggestions.map((suggestion) => (
                <motion.div key={suggestion.id} variants={staggerItem}>
                  <Card className={`h-full ${THEME_CLASSES.cardHover} transition-all duration-300`}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-2xl">
                          {CATEGORY_LABELS[suggestion.category].icon}
                        </div>
                        <Button
                          onClick={() => handleLike(suggestion.id)}
                          variant={user && suggestion.likes.includes(user.id) ? 'default' : 'outline'}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Heart 
                            className={`h-4 w-4 ${user && suggestion.likes.includes(user.id) ? 'fill-current' : ''}`}
                          />
                          {suggestion.likes.length}
                        </Button>
                      </div>
                      <CardTitle className="text-xl">{suggestion.title}</CardTitle>
                      <CardDescription className="text-sm">
                        Par {suggestion.userName} • {format(suggestion.createdAt, 'dd MMM yyyy', { locale: fr })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 whitespace-pre-wrap">{suggestion.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
