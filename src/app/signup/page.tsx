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
import { scaleInBounce, slideInRight } from '@/lib/animations';
import { ErrorMessage } from '@/components/ui/error-message';
import { 
  isValidEmail, 
  validatePassword, 
  isValidName, 
  sanitizeString,
  checkRateLimit 
} from '@/lib/validation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { signUp } = useAuth();
  const router = useRouter();

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length > 0) {
      const validation = validatePassword(value);
      setPasswordStrength(validation.strength);
      if (!validation.isValid && value.length >= 6) {
        setFieldErrors(prev => ({ ...prev, password: validation.errors[0] }));
      } else {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.password;
          return newErrors;
        });
      }
    } else {
      setPasswordStrength(null);
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Rate limiting
    if (!checkRateLimit('signup', 3, 60000)) {
      setError('Trop de tentatives. Veuillez patienter avant de réessayer.');
      return;
    }

    // Validation du nom
    const sanitizedName = sanitizeString(name, 100);
    if (!isValidName(sanitizedName)) {
      setFieldErrors(prev => ({ 
        ...prev, 
        name: 'Le nom doit contenir entre 2 et 100 caractères et ne contenir que des lettres, chiffres, espaces et caractères spéciaux français'
      }));
      return;
    }

    // Validation de l'email
    if (!isValidEmail(email)) {
      setFieldErrors(prev => ({ 
        ...prev, 
        email: 'Email invalide'
      }));
      return;
    }

    // Validation du mot de passe
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setFieldErrors(prev => ({ 
        ...prev, 
        password: passwordValidation.errors[0]
      }));
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors(prev => ({ 
        ...prev, 
        confirmPassword: 'Les mots de passe ne correspondent pas'
      }));
      return;
    }

    if (!acceptedPrivacy) {
      setError('Vous devez accepter la politique de confidentialité pour créer un compte');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, sanitizedName);
      toast.success('Compte créé avec succès !');
      
      // Attendre un court instant pour que l'auth se propage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Rafraîchir le router et rediriger
      router.refresh();
      router.push('/profil');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible. Utilisez au moins 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet';
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
                {"Rejoignez Anim'Média et inscrivez-vous à nos activités"}
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
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  className={fieldErrors.name ? 'border-red-500' : ''}
                />
                {fieldErrors.name && (
                  <p id="name-error" className="text-sm text-red-600">{fieldErrors.name}</p>
                )}
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
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  className={fieldErrors.email ? 'border-red-500' : ''}
                />
                {fieldErrors.email && (
                  <p id="email-error" className="text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  minLength={8}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  className={fieldErrors.password ? 'border-red-500' : ''}
                />
                {passwordStrength && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordStrength === 'weak' ? 'bg-red-500 w-1/3' :
                          passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength === 'weak' ? 'text-red-600' :
                      passwordStrength === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength === 'weak' ? 'Faible' :
                       passwordStrength === 'medium' ? 'Moyen' : 'Fort'}
                    </span>
                  </div>
                )}
                {fieldErrors.password && (
                  <p id="password-error" className="text-sm text-red-600">{fieldErrors.password}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Au moins 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux
                </p>
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
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                  className={fieldErrors.confirmPassword ? 'border-red-500' : ''}
                />
                {fieldErrors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                )}
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
                    J&apos;accepte la{' '}
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
              <ErrorMessage error={error || fieldErrors} onDismiss={() => { setError(''); setFieldErrors({}); }} />

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
