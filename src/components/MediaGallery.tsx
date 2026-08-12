'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CommunityMoment, CommunityMomentDoc } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/OptimizedImage';
import { UploadMomentModal } from '@/components/UploadMomentModal';
import { Camera, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { THEME_CLASSES } from '@/config/theme';

const DEFAULT_MOMENTS: CommunityMoment[] = [
  {
    id: 'demo-1',
    userId: 'demo-u1',
    userName: 'Claire D.',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
    caption: 'Superbe atelier poterie et céramique cet après-midi !',
    activityTitle: 'Atelier Céramique',
    createdAt: new Date(),
    likes: ['user1', 'user2', 'user3'],
    status: 'APPROVED',
  },
  {
    id: 'demo-2',
    userId: 'demo-u2',
    userName: 'Marc T.',
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
    caption: 'Échanges passionnants lors du club lecture et café littéraire.',
    activityTitle: 'Club Lecture',
    createdAt: new Date(),
    likes: ['user1', 'user4'],
    status: 'APPROVED',
  },
  {
    id: 'demo-3',
    userId: 'demo-u3',
    userName: 'Sophie L.',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
    caption: 'Initiation au numérique et retouche photo, très enrichissant !',
    activityTitle: 'Atelier Numérique',
    createdAt: new Date(),
    likes: ['user2', 'user5', 'user6'],
    status: 'APPROVED',
  },
  {
    id: 'demo-4',
    userId: 'demo-u4',
    userName: 'Antoine R.',
    imageUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=800&auto=format&fit=crop',
    caption: 'Répétition générale de la troupe de théâtre de l\'association.',
    activityTitle: 'Arts Vivants',
    createdAt: new Date(),
    likes: ['user1', 'user3', 'user7', 'user8'],
    status: 'APPROVED',
  },
];

export function MediaGallery() {
  const { user } = useAuth();
  const [moments, setMoments] = useState<CommunityMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMoments = async () => {
    try {
      const q = query(
        collection(db, 'moments'),
        orderBy('createdAt', 'desc'),
        limit(8)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => {
        const data = d.data() as CommunityMomentDoc;
        return {
          ...data,
          id: d.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          likes: data.likes || []
        } as CommunityMoment;
      });
      setMoments(docs.length > 0 ? docs : DEFAULT_MOMENTS);
    } catch {
      setMoments(DEFAULT_MOMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, []);

  const handleLike = async (momentId: string) => {
    if (!user) {
      toast.error('Connectez-vous pour j\'aimer un souvenir');
      return;
    }
    try {
      const target = moments.find(m => m.id === momentId);
      if (!target) return;

      const hasLiked = target.likes.includes(user.id);
      const momentRef = doc(db, 'moments', momentId);

      if (hasLiked) {
        await updateDoc(momentRef, { likes: arrayRemove(user.id) });
      } else {
        await updateDoc(momentRef, { likes: arrayUnion(user.id) });
      }

      fetchMoments();
    } catch (err) {
      console.error('Erreur like moment:', err);
    }
  };

  return (
    <section className="py-12 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 rounded-3xl border border-amber-100/80 my-8 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 mb-2">
              <Camera className="h-3.5 w-3.5" /> Galerie Participative
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900">Instants Anim&apos;Media</h2>
            <p className="text-sm text-gray-600 mt-1">Découvrez la vie associative en images, partagée par nos membres.</p>
          </div>

          <Button
            onClick={() => {
              if (!user) {
                toast.error('Veuillez vous connecter pour partager votre photo');
                return;
              }
              setIsModalOpen(true);
            }}
            className={THEME_CLASSES.buttonPrimary}
          >
            <Plus className="h-4 w-4 mr-2" />
            Partager un souvenir
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-56 bg-gray-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : moments.length === 0 ? (
          <div className="text-center py-12 bg-white/80 rounded-2xl border border-dashed border-amber-200">
            <Camera className="mx-auto h-12 w-12 text-amber-400 mb-3" />
            <p className="text-gray-700 font-semibold">Aucune photo partagée pour le moment</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">Soyez le premier membre à immortaliser un atelier !</p>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
              Publier une photo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {moments.map((moment) => (
              <motion.div
                key={moment.id}
                whileHover={{ y: -4 }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-100 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  <OptimizedImage
                    src={moment.imageUrl}
                    alt={moment.caption}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {moment.activityTitle}
                  </div>
                </div>
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <p className="text-xs text-gray-700 line-clamp-2 italic mb-2">&ldquo;{moment.caption}&rdquo;</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                    <span className="font-semibold text-gray-800">{moment.userName}</span>
                    <button
                      onClick={() => handleLike(moment.id)}
                      className={`flex items-center gap-1 font-semibold ${
                        user && moment.likes.includes(user.id) ? 'text-rose-600' : 'text-gray-500 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${user && moment.likes.includes(user.id) ? 'fill-current' : ''}`} />
                      <span>{moment.likes.length}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <UploadMomentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchMoments}
        />
      </div>
    </section>
  );
}
