'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  error?: string | Record<string, string>;
  className?: string;
  onDismiss?: () => void;
  variant?: 'default' | 'inline';
}

export function ErrorMessage({ 
  error, 
  className,
  onDismiss,
  variant = 'default'
}: ErrorMessageProps) {
  if (!error) return null;

  // Si c'est un objet d'erreurs (formulaire avec plusieurs champs)
  if (typeof error === 'object' && !Array.isArray(error)) {
    const errorEntries = Object.entries(error);
    if (errorEntries.length === 0) return null;

    return (
      <div className={cn('space-y-2', className)}>
        {errorEntries.map(([field, message]) => (
          <motion.div
            key={field}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start gap-3',
              variant === 'inline' && 'bg-red-50/50 border-red-300 p-3'
            )}
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-red-800 font-semibold text-sm mb-1 capitalize">
                {field.replace(/([A-Z])/g, ' $1').trim()}:
              </p>
              <p className="text-red-700 text-sm">{message}</p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-600 hover:text-red-800 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  // Erreur simple (string)
  if (typeof error === 'string') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start gap-3',
            variant === 'inline' && 'bg-red-50/50 border-red-300 p-3',
            className
          )}
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-red-800 font-semibold text-sm mb-1">Erreur</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-600 hover:text-red-800 transition-colors"
              aria-label="Fermer l'erreur"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
