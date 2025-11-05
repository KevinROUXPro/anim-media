'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MembershipStatus } from '@/types';
import { motion } from 'framer-motion';
import { THEME_CLASSES } from '@/config/theme';

export function MembershipButton() {
  const { user } = useAuth();
  const router = useRouter();

  // Si l'utilisateur est déjà adhérent actif, ne pas afficher le bouton
  if (user?.membershipStatus === MembershipStatus.ACTIVE) {
    return null;
  }

  const handleClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      router.push('/adhesion');
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-full"
    >
      <Button
        onClick={handleClick}
        size="lg"
        className={`w-full ${THEME_CLASSES.buttonPrimary} font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl relative overflow-hidden group`}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#F49928] to-[#DE3156] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <span className="relative z-10 flex items-center gap-2">
          🎫 Adhérer - 15€/an
        </span>
      </Button>
    </motion.div>
  );
}
