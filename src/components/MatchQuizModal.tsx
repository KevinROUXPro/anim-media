'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ActivityCategory, CATEGORY_LABELS, Event, Workshop } from '@/types';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { THEME_CLASSES } from '@/config/theme';

interface MatchQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MatchQuizModal({ isOpen, onClose }: MatchQuizModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | null>(null);
  const [results, setResults] = useState<{ events: Event[]; workshops: Workshop[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const resetQuiz = () => {
    setStep(1);
    setSelectedCategory(null);
    setResults(null);
  };

  const handleFinish = async (cat: ActivityCategory | null, type: 'ALL' | 'EVENT' | 'WORKSHOP') => {
    setLoading(true);
    setStep(3);
    try {
      // Récupérer les événements
      const eventsSnap = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc'), limit(10)));
      const events = eventsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, date: doc.data().date?.toDate() })) as Event[];

      // Récupérer les ateliers
      const workshopsSnap = await getDocs(query(collection(db, 'workshops'), limit(10)));
      const workshops = workshopsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Workshop[];

      // Filtrer
      const filteredEvents = events.filter(e => {
        if (cat && e.category !== cat) return false;
        if (type === 'WORKSHOP') return false;
        return true;
      });

      const filteredWorkshops = workshops.filter(w => {
        if (cat && w.category !== cat) return false;
        if (type === 'EVENT') return false;
        return true;
      });

      setResults({
        events: filteredEvents.slice(0, 2),
        workshops: filteredWorkshops.slice(0, 2),
      });
    } catch (err) {
      console.error('Erreur Quiz Match:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); resetQuiz(); } }}>
      <DialogContent className="sm:max-w-xl bg-gradient-to-br from-amber-50/90 via-white to-orange-50/90 backdrop-blur-md border-amber-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-amber-950">
            <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
            Trouver mon Match Culturel
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Répondez à 2 questions pour découvrir l&apos;activité faite pour vous !
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Catégorie / Envie */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <h3 className="font-semibold text-gray-800 text-center">Étape 1/2 : Quel univers vous attire aujourd&apos;hui ?</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(ActivityCategory).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setStep(2);
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-200/80 bg-white/80 hover:bg-amber-100/60 hover:border-amber-400 transition-all text-left group shadow-sm"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {CATEGORY_LABELS[cat].icon}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{CATEGORY_LABELS[cat].label}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                className="text-xs text-gray-500 hover:text-gray-800"
                onClick={() => {
                  setSelectedCategory(null);
                  setStep(2);
                }}
              >
                Passer et voir toutes les catégories →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Disponibilité / Format */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <h3 className="font-semibold text-gray-800 text-center">Étape 2/2 : Quel format préférez-vous ?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleFinish(selectedCategory, 'EVENT')}
                className="p-4 rounded-xl border border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50 text-center space-y-2 shadow-sm transition-all"
              >
                <div className="text-3xl">🎉</div>
                <div className="font-semibold text-sm">Événement</div>
                <div className="text-xs text-gray-500">Ponctuel & Convivial</div>
              </button>
              <button
                onClick={() => handleFinish(selectedCategory, 'WORKSHOP')}
                className="p-4 rounded-xl border border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50 text-center space-y-2 shadow-sm transition-all"
              >
                <div className="text-3xl">📅</div>
                <div className="font-semibold text-sm">Atelier</div>
                <div className="text-xs text-gray-500">Récurrent & Pratique</div>
              </button>
              <button
                onClick={() => handleFinish(selectedCategory, 'ALL')}
                className="p-4 rounded-xl border border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50 text-center space-y-2 shadow-sm transition-all"
              >
                <div className="text-3xl">🌟</div>
                <div className="font-semibold text-sm">Peu importe</div>
                <div className="text-xs text-gray-500">Surprenez-moi !</div>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Résultats */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            {loading ? (
              <div className="py-12 text-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto"></div>
                <p className="text-sm text-gray-600">Recherche de vos pépites culturelles...</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    ✨ Nos recommandations pour vous
                  </span>
                  <Button variant="ghost" size="sm" onClick={resetQuiz} className="text-xs text-gray-500">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Recommencer
                  </Button>
                </div>

                {(!results?.events?.length && !results?.workshops?.length) ? (
                  <div className="text-center py-8 bg-white/70 rounded-xl border border-amber-100">
                    <p className="text-gray-600 font-medium mb-2">Aucune activité exacte pour ce filtre actuellement.</p>
                    <p className="text-xs text-gray-500 mb-4">Découvrez nos autres ateliers ou proposez votre propre idée !</p>
                    <Link href="/ateliers" onClick={onClose}>
                      <Button className={THEME_CLASSES.buttonPrimary} size="sm">Consulter le catalogue complet</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {results?.events.map((event) => (
                      <div key={event.id} className="p-4 bg-white rounded-xl border border-amber-200/80 shadow-sm flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">Événement</span>
                          <h4 className="font-bold text-gray-900 mt-1 text-sm">{event.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-1">{event.description}</p>
                        </div>
                        <Link href={`/evenements`} onClick={onClose}>
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 text-xs">
                            Voir <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                    {results?.workshops.map((workshop) => (
                      <div key={workshop.id} className="p-4 bg-white rounded-xl border border-amber-200/80 shadow-sm flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">Atelier Récurrent</span>
                          <h4 className="font-bold text-gray-900 mt-1 text-sm">{workshop.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-1">{workshop.description}</p>
                        </div>
                        <Link href={`/ateliers`} onClick={onClose}>
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 text-xs">
                            Voir <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
