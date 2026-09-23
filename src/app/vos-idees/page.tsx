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
import { Lightbulb, Heart, Plus, X } from 'lucide-react';
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

  const [sortBy, setSortBy] = useState<'UPVOTES' | 'RECENT'>('UPVOTES');

  // Filtrage et tri des suggestions
  const processedSuggestions = suggestions
    .filter(s => filterCategory === 'ALL' || s.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'UPVOTES') {
        const diff = (b.likes?.length || 0) - (a.likes?.length || 0);
        if (diff !== 0) return diff;
      }
      return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'UNDER_REVIEW':
        return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">🔍 En étude</span>;
      case 'APPROVED':
        return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-300">🚀 Projet retenu</span>;
      case 'COMPLETED':
        return <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-300">🎉 Réalisé</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">💡 Soumise</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h1 className={`text-4xl md:text-5xl font-bold ${THEME_CLASSES.textGradient} mb-4`}>
              Laboratoire d&apos;Idées
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Votez pour les prochains ateliers et découvrez les projets retenus par l&apos;équipe !
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
                <Card className="max-w-2xl mx-auto border-2 border-amber-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-2xl text-amber-900">💡 Proposer une nouvelle idée</CardTitle>
                    <CardDescription>
                      Proposez un atelier ou un événement culturel. Les membres pourront voter pour votre idée !
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Titre de l&apos;idée</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Ex: Atelier poterie & céramique"
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
                          placeholder="Décrivez ce que vous aimeriez réaliser lors de cet atelier..."
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

          {/* Filtres et Tri */}
          <motion.div variants={fadeInUp} className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 p-4 rounded-xl backdrop-blur-sm border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Catégorie :</span>
              <Button
                onClick={() => setFilterCategory('ALL')}
                variant={filterCategory === 'ALL' ? 'default' : 'outline'}
                size="sm"
              >
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

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trier par :</span>
              <Button
                onClick={() => setSortBy('UPVOTES')}
                variant={sortBy === 'UPVOTES' ? 'default' : 'outline'}
                size="sm"
              >
                🔥 Popularité
              </Button>
              <Button
                onClick={() => setSortBy('RECENT')}
                variant={sortBy === 'RECENT' ? 'default' : 'outline'}
                size="sm"
              >
                ⏱️ Plus récentes
              </Button>
            </div>
          </motion.div>

          {/* Liste des suggestions */}
          {processedSuggestions.length === 0 ? (
            <motion.div variants={fadeInUp}>
              <Card className="text-center py-12">
                <CardContent>
                  <Lightbulb className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-xl text-gray-600">
                    {filterCategory === 'ALL' 
                      ? 'Aucune suggestion pour le moment. Soyez le premier à proposer une idée !'
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
              {processedSuggestions.map((suggestion) => (
                <motion.div key={suggestion.id} variants={staggerItem}>
                  <Card className={`h-full flex flex-col justify-between ${THEME_CLASSES.cardHover} transition-all duration-300 relative border border-amber-100/50 shadow-sm`}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{CATEGORY_LABELS[suggestion.category].icon}</span>
                          {getStatusBadge(suggestion.status)}
                        </div>
                        <Button
                          onClick={() => handleLike(suggestion.id)}
                          variant={user && suggestion.likes?.includes(user.id) ? 'default' : 'outline'}
                          size="sm"
                          className={`flex items-center gap-1.5 font-bold ${
                            user && suggestion.likes?.includes(user.id)
                              ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500'
                              : 'text-gray-700 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          <Heart 
                            className={`h-4 w-4 ${user && suggestion.likes?.includes(user.id) ? 'fill-current text-white' : 'text-rose-500'}`}
                          />
                          <span>{suggestion.likes?.length || 0}</span>
                        </Button>
                      </div>
                      <CardTitle className="text-xl text-gray-900">{suggestion.title}</CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        Proposé par {suggestion.userName} • {suggestion.createdAt ? format(suggestion.createdAt, 'dd MMM yyyy', { locale: fr }) : 'Récemment'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{suggestion.description}</p>
                      {suggestion.adminComment && (
                        <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 text-xs text-amber-900 rounded-r">
                          <p className="font-semibold mb-0.5">📢 Note de l&apos;association :</p>
                          <p>{suggestion.adminComment}</p>
                        </div>
                      )}
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
