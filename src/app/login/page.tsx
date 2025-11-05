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
import { fadeIn, scaleInBounce, slideInLeft } from '@/lib/animations';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Réinitialiser l'erreur

    try {
      await signIn(email, password);
      toast.success('Connexion réussie !');
      
      // Attendre un court instant pour que l'auth se propage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Rafraîchir le router et rediriger
      router.refresh();
      router.push('/profil');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Erreur lors de la connexion';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte ne correspond à cet email';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
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
        className="absolute top-10 right-10 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-[#DE3156]/20 to-[#F49928]/20 rounded-full blur-3xl"
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
        className="absolute bottom-10 left-10 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-[#00A8A8]/20 to-[#00C2CB]/20 rounded-full blur-3xl"
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
              variants={slideInLeft}
              initial="hidden"
              animate="visible"
            >
              <CardTitle className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 ${THEME_CLASSES.textGradient}`}>
                ✨ Connexion
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Connectez-vous pour accéder à votre compte
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </motion.div>

              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="password" className="text-base font-semibold">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </motion.div>

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
                    <h3 className="text-red-800 font-bold text-base mb-1">Erreur de connexion</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className={`w-full ${THEME_CLASSES.buttonPrimary} text-lg py-6`}
                    disabled={loading}
                  >
                    {loading ? '⏳ Connexion...' : '🚀 Se connecter'}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>

            <motion.div 
              className="mt-6 text-center text-base text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Pas encore de compte ?{' '}
              <Link href="/signup" className={`${THEME_CLASSES.textPrimary} hover:opacity-80 font-semibold`}>
                Créer un compte
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
