'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MembershipStatus } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { THEME_CLASSES } from '@/config/theme';
import { bounceIn, fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { Check, Star, Sparkles, Crown } from 'lucide-react';

export default function AdhesionPage() {
  return (
    <ProtectedRoute>
      <AdhesionContent />
    </ProtectedRoute>
  );
}

function AdhesionContent() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const membershipStartDate = new Date();
      const membershipExpiry = new Date();
      membershipExpiry.setFullYear(membershipExpiry.getFullYear() + 1);

      // Générer un numéro d'adhérent
      const membershipNumber = `ADH${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      await updateDoc(doc(db, 'users', user.id), {
        membershipStatus: MembershipStatus.ACTIVE,
        membershipNumber,
        membershipStartDate: Timestamp.fromDate(membershipStartDate),
        membershipExpiry: Timestamp.fromDate(membershipExpiry),
      });

      // Rafraîchir les données utilisateur
      await refreshUser();
      
      toast.success('Adhésion activée avec succès ! 🎉', {
        description: `Votre numéro d'adhérent : ${membershipNumber}`,
      });

      // Rediriger vers le profil après 2 secondes
      setTimeout(() => {
        router.push('/profil');
      }, 2000);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Erreur lors de l\'activation de l\'adhésion');
    } finally {
      setLoading(false);
    }
  };

  // Si déjà adhérent actif
  if (user?.membershipStatus === MembershipStatus.ACTIVE) {
    return (
      <div className="min-h-screen bg-[#F7EDE0] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <Card className="border-2 border-green-500">
              <CardHeader>
                <CardTitle className="text-3xl text-green-600 flex items-center justify-center gap-2">
                  <Crown className="h-8 w-8" />
                  Vous êtes déjà adhérent !
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xl">✅ Votre adhésion est active</p>
                <p className="text-gray-600">
                  Numéro d'adhérent : <strong>{user.membershipNumber}</strong>
                </p>
                {user.membershipExpiry && (
                  <p className="text-gray-600">
                    Valable jusqu'au : <strong>{new Date(user.membershipExpiry).toLocaleDateString('fr-FR')}</strong>
                  </p>
                )}
                <Button onClick={() => router.push('/profil')} size="lg" className="mt-4 w-full sm:w-auto">
                  Retour au profil
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7EDE0] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.section
          className={`${THEME_CLASSES.headerGradient} text-white py-16 rounded-2xl mb-12`}
          variants={bounceIn}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center">
            <motion.h1 
              className="text-5xl font-bold mb-4"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Devenez Adhérent ! 🎫
            </motion.h1>
            <p className="text-2xl opacity-90">Soutenez notre médiathèque et profitez d'avantages exclusifs</p>
          </div>
        </motion.section>

        {/* Prix et CTA principal */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <Card className="border-4 border-[#DE3156] shadow-2xl overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center bg-gradient-to-br from-white to-[#F7EDE0]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="h-12 w-12 text-[#F49928]" />
                <h2 className="text-6xl font-bold text-[#DE3156]">15€</h2>
                <Sparkles className="h-12 w-12 text-[#F49928]" />
              </div>
              <p className="text-2xl text-gray-700 mb-6">par an seulement</p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full"
              >
                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  size="lg"
                  className={`w-full ${THEME_CLASSES.buttonPrimary} text-xl sm:text-2xl py-6 sm:py-8 px-8 sm:px-12 h-auto font-bold shadow-xl`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        className="h-5 w-5 sm:h-6 sm:w-6 border-4 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Activation en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Star className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                      Adhérer Maintenant
                      <Star className="h-6 w-6 sm:h-8 sm:w-8 ml-2 sm:ml-3" />
                    </span>
                  )}
                </Button>
              </motion.div>

              <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 text-center">
                ⚠️ Mode démo : L'adhésion est activée immédiatement sans paiement réel
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Avantages */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <motion.h2 
            className={`text-4xl font-bold text-center mb-8 ${THEME_CLASSES.textPrimary}`}
            variants={staggerItem}
          >
            Vos Avantages 🎁
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((advantage, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card className="h-full border-2 hover:border-[#DE3156] transition-all duration-300 hover:shadow-xl">
                  <CardHeader>
                    <div className="text-5xl mb-3">{advantage.icon}</div>
                    <CardTitle className="text-xl">{advantage.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{advantage.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Informations complémentaires */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <Card>
            <CardHeader>
              <CardTitle className={`text-2xl ${THEME_CLASSES.textPrimary}`}>
                Informations pratiques 📋
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <strong>Durée :</strong> 1 an à partir de la date d'adhésion
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <strong>Numéro d'adhérent :</strong> Vous recevrez un numéro unique lors de votre inscription
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <strong>Renouvellement :</strong> Nous vous préviendrons avant l'expiration de votre adhésion
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <strong>Support :</strong> Notre équipe est disponible pour toute question
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}

const advantages = [
  {
    icon: '🎟️',
    title: 'Accès prioritaire',
    description: 'Inscrivez-vous en priorité aux événements et ateliers avec places limitées',
  },
  {
    icon: '💰',
    title: 'Tarifs préférentiels',
    description: 'Bénéficiez de réductions sur certaines activités et événements payants',
  },
  {
    icon: '📚',
    title: 'Emprunts privilégiés',
    description: 'Empruntez plus de documents et pour une durée plus longue',
  },
  {
    icon: '🎁',
    title: 'Événements exclusifs',
    description: 'Accédez à des rencontres, conférences et ateliers réservés aux adhérents',
  },
  {
    icon: '📧',
    title: 'Newsletter VIP',
    description: 'Recevez en avant-première les informations sur les nouveautés et programmes',
  },
  {
    icon: '🤝',
    title: 'Communauté active',
    description: 'Rejoignez une communauté engagée et participez à la vie de la médiathèque',
  },
];
