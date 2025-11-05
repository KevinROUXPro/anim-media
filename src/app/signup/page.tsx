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
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
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
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Cet email est déjà utilisé');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Le mot de passe est trop faible');
      } else {
        toast.error('Erreur lors de la création du compte');
      }
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
