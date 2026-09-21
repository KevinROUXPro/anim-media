'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MembershipStatus } from '@/types';
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
  const { user } = useAuth();
  const router = useRouter();

  // L'adhésion n'est plus activable depuis le navigateur : les champs
  // membership* sont réservés aux administrateurs par les règles Firestore.
  // Le règlement (15 €, espèces ou chèque) est encaissé au local, puis un
  // membre du bureau active l'adhésion depuis /admin/adherents.

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
              
              <div className="bg-white/80 border-2 border-[#F49928] rounded-xl p-6 sm:p-8 text-left">
                <h3 className="flex items-center justify-center text-xl sm:text-2xl font-bold text-[#DE3156] mb-6">
                  <Star className="h-6 w-6 sm:h-7 sm:w-7 mr-2 sm:mr-3" />
                  Comment adhérer ?
                  <Star className="h-6 w-6 sm:h-7 sm:w-7 ml-2 sm:ml-3" />
                </h3>

                <ol className="space-y-4 text-base sm:text-lg text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DE3156] text-white font-bold flex items-center justify-center">1</span>
                    <span>
                      Votre compte est déjà créé : c&apos;est celui avec lequel vous êtes connecté.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DE3156] text-white font-bold flex items-center justify-center">2</span>
                    <span>
                      Présentez-vous au local de l&apos;association avec votre règlement de{' '}
                      <strong>15 €</strong>, en espèces ou par chèque à l&apos;ordre d&apos;Anim&apos;Média.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DE3156] text-white font-bold flex items-center justify-center">3</span>
                    <span>
                      Un membre du bureau active votre adhésion et vous attribue votre
                      numéro d&apos;adhérent.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DE3156] text-white font-bold flex items-center justify-center">4</span>
                    <span>
                      Votre carte d&apos;adhérent et vos avantages apparaissent aussitôt dans
                      votre profil.
                    </span>
                  </li>
                </ol>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 text-center">
                L&apos;adhésion est enregistrée par l&apos;association après encaissement du règlement.
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
