'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { LOGO_CONFIG } from '@/config/logo';
import { THEME_CLASSES } from '@/config/theme';

export function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#F7EDE0] backdrop-blur-md border-b border-[#DE3156]/10 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="flex items-center"
            >
              <Image 
                src={LOGO_CONFIG.storageUrl} 
                alt={LOGO_CONFIG.alt}
                width={LOGO_CONFIG.width}
                height={LOGO_CONFIG.height}
                className="object-contain drop-shadow-md"
                priority
              />
            </motion.div>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-10">
            <Link href="/evenements" className={`text-xl font-semibold text-gray-700 transition-colors ${THEME_CLASSES.linkHover}`}>
              Événements
            </Link>
            <Link href="/ateliers" className={`text-xl font-semibold text-gray-700 transition-colors ${THEME_CLASSES.linkHover}`}>
              Ateliers
            </Link>
            <Link href="/adhesion" className={`text-xl font-semibold text-gray-700 transition-colors ${THEME_CLASSES.linkHover}`}>
              Adhésion
            </Link>

            {user ? (
              <>
                <Link href="/profil" className={`text-xl font-semibold text-gray-700 transition-colors ${THEME_CLASSES.linkHover}`}>
                  Mon Profil
                </Link>
                {isAdmin && (
                  <Link href="/admin" className={`text-xl ${THEME_CLASSES.textPrimary} font-bold hover:opacity-80 transition-colors`}>
                    Administration
                  </Link>
                )}
                <Button variant="outline" onClick={signOut} size="lg" className="text-base font-semibold">
                  Déconnexion
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline" size="lg" className="text-base font-semibold">
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" className={`${THEME_CLASSES.buttonPrimary} text-base font-semibold`}>
                    Inscription
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Menu Mobile */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Menu Mobile Dropdown */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 space-y-3"
          >
            <Link href="/evenements" className={`block text-gray-700 transition-colors ${THEME_CLASSES.linkHover}`}>
              Événements
            </Link>
            <Link href="/ateliers" className={`block text-gray-700 transition-colors ${THEME_CLASSES.linkHover}`}>
              Ateliers
            </Link>
            <Link href="/adhesion" className={`block text-gray-700 transition-colors ${THEME_CLASSES.linkHover}`}>
              Adhésion
            </Link>

            {user ? (
              <>
                <Link href="/profil" className={`block text-gray-700 transition-colors ${THEME_CLASSES.linkHover}`}>
                  Mon Profil
                </Link>
                {isAdmin && (
                  <Link href="/admin" className={`${THEME_CLASSES.textPrimary} font-semibold hover:opacity-80`}>
                    Administration
                  </Link>
                )}
                <Button variant="outline" onClick={signOut} size="sm" className="w-full">
                  Déconnexion
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Link href="/login" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup" className="block">
                  <Button size="sm" className={`w-full ${THEME_CLASSES.buttonPrimary}`}>
                    Inscription
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
