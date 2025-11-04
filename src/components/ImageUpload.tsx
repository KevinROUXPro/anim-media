'use client';

import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  folder?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  folder = 'images',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille du fichier
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      toast.error(`L'image ne doit pas dépasser ${maxSizeMB}MB`);
      return;
    }

    try {
      setUploading(true);

      // Créer un nom de fichier unique
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);

      // Upload le fichier
      await uploadBytes(storageRef, file);

      // Récupérer l'URL de téléchargement
      const downloadURL = await getDownloadURL(storageRef);

      // Mettre à jour le preview et notifier le parent
      setPreview(downloadURL);
      onImageUploaded(downloadURL);

      toast.success('Image uploadée avec succès');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreview('');
    if (onImageRemoved) {
      onImageRemoved();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>Image</Label>

      {preview ? (
        <div className="relative">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-4">
            Cliquez pour sélectionner une image ou glissez-la ici
          </p>
          <p className="text-xs text-gray-500 mb-4">
            PNG, JPG, GIF jusqu'à {maxSizeMB}MB
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Upload en cours...' : preview ? 'Changer l\'image' : 'Sélectionner une image'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
