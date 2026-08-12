'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { THEME_CLASSES } from '@/config/theme';

interface UploadMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadMomentModal({ isOpen, onClose, onSuccess }: UploadMomentModalProps) {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vous devez être connecté pour partager un souvenir');
      return;
    }

    if (!imageUrl) {
      toast.error('Veuillez ajouter une photo');
      return;
    }

    if (!caption.trim()) {
      toast.error('Veuillez ajouter une légende');
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, 'moments'), {
        userId: user.id,
        userName: user.name || 'Membre Anim\'Media',
        imageUrl,
        caption,
        activityTitle: activityTitle.trim() || 'Atelier créatif',
        createdAt: Timestamp.now(),
        likes: [],
        status: 'APPROVED', // Par défaut direct
      });

      toast.success('Votre souvenir a été publié dans la galerie !');
      setImageUrl('');
      setCaption('');
      setActivityTitle('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Erreur lors du partage de la photo:', err);
      toast.error('Erreur lors du partage');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-md border-amber-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-amber-950">
            <Camera className="h-5 w-5 text-amber-600" />
            Partager un instant en photo
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Partagez un cliché de votre créativité ou des moments forts vécus à l&apos;association !
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label className="text-sm font-semibold mb-1 block">Photo de l&apos;atelier / événement</Label>
            <ImageUpload
              currentImageUrl={imageUrl}
              onImageUploaded={(url: string) => setImageUrl(url)}
              onImageRemoved={() => setImageUrl('')}
              folder="moments"
            />
          </div>

          <div>
            <Label htmlFor="activityTitle" className="text-sm font-semibold">Titre de l&apos;activité (optionnel)</Label>
            <Input
              id="activityTitle"
              placeholder="Ex: Atelier Peinture sur Soie"
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="caption" className="text-sm font-semibold">Légende / Votre retour</Label>
            <Textarea
              id="caption"
              placeholder="Partagez quelques mots sur ce moment créatif..."
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting} className={THEME_CLASSES.buttonPrimary}>
              {submitting ? 'Publication...' : '✨ Publier le souvenir'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
