'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { ErrorMessage } from '@/components/ui/error-message';
import { isValidEmail, sanitizeString, checkRateLimit } from '@/lib/validation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Rate limiting pour éviter les attaques par force brute
    if (!checkRateLimit('login', 5, 60000)) {
      setError('Trop de tentatives de connexion. Veuillez patienter avant de réessayer.');
      setLoading(false);
      return;
    }

    // Validation de l'email
    if (!isValidEmail(email)) {
      setError('Email invalide');
      setLoading(false);
      return;
    }

    // Sanitization de l'email
    const sanitizedEmail = sanitizeString(email.toLowerCase().trim(), 254);

    try {
      await signIn(sanitizedEmail, password);
      toast.success('Connexion réussie !');
      
      // Attendre un court instant pour que l'auth se propage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Rafraîchir le router et rediriger
      router.refresh();
      router.push('/profil');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Erreur lors de la connexion';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte ne correspond à cet email';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Ce compte a été désactivé. Contactez un administrateur';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="site-login">
      <div className="site-login-welcome">
        <BrandLogo large />
        <h2>Le plaisir<br />de se retrouver.</h2>
      </div>
      <section className="site-login-form" aria-labelledby="login-title">
        <h1 id="login-title">Bienvenue</h1>
        <p>Connectez-vous à votre compte.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="vous@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="site-password">
              <Input id="password" type={visible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={visible} onClick={() => setVisible(!visible)}>
                {visible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <ErrorMessage error={error} onDismiss={() => setError('')} />
          <Button type="submit" className="site-button w-full" disabled={loading}>
            {loading ? 'Connexion…' : 'Me connecter'} <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </form>
        <p className="site-login-signup">Première visite ? <Link href="/signup">Créer un compte</Link></p>
      </section>
    </div>
  );
}
