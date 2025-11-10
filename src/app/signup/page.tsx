'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { THEME_CLASSES } from '@/config/theme';
import { scaleInBounce, slideInRight, fadeIn } from '@/lib/animations';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Réinitialiser l'erreur

    if (!acceptedPrivacy) {
      setError('Vous devez accepter la politique de confidentialité pour créer un compte');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name);
      toast.success('Compte créé avec succès !');
      
      // Attendre un court instant pour que l'auth se propage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Rafraîchir le router et rediriger
      router.refresh();
      router.push('/profil');
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F7EDE0]/50 p-3 sm:p-4 relative overflow-hidden">
      {/* Animated background shapes */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-10 left-10 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-[#F49928]/20 to-[#DE3156]/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-10 right-10 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-[#00C2CB]/20 to-[#00A8A8]/20 rounded-full blur-3xl"
      />
      
      <motion.div
        variants={scaleInBounce}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-2">
          <CardHeader className="text-center pb-6 sm:pb-8">
            <motion.div
              variants={slideInRight}
              initial="hidden"
              animate="visible"
            >
              <CardTitle className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 ${THEME_CLASSES.textGradient}`}>
                🎊 Créer un compte
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Rejoignez Anim'Média et inscrivez-vous à nos activités
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* Consentement RGPD */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-700 cursor-pointer">
                    J'accepte la{' '}
                    <Link 
                      href="/politique-confidentialite" 
                      target="_blank"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      politique de confidentialité
                    </Link>
                    {' '}et consens au traitement de mes données personnelles conformément au RGPD.
                  </label>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start gap-3"
                >
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-red-800 font-bold text-base mb-1">Erreur</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                className={`w-full ${THEME_CLASSES.buttonPrimary} text-lg py-6`}
                disabled={loading}
              >
                {loading ? '⏳ Création...' : '🎉 Créer mon compte'}
              </Button>
            </form>

            <div className="mt-6 text-center text-base text-gray-600">
              Déjà un compte ?{' '}
              <Link href="/login" className={`${THEME_CLASSES.textPrimary} hover:opacity-80 font-semibold`}>
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
