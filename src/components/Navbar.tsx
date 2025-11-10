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
            <Link href="/vos-idees" className={`text-xl font-semibold text-gray-700 transition-colors ${THEME_CLASSES.linkHover}`}>
              Vos Idées
            </Link>
            <Link href="/adhesion" className={`text-xl font-semibold text-gray-700 transition-colors ${THEME_CLASSES.linkHover}`}>
              Adhésion
            </Link>

            {user ? (
              <>
                {user.membershipStatus === 'ACTIVE' && (
                  <Link href="/vie-associative" className={`text-xl font-semibold text-gray-700 transition-colors ${THEME_CLASSES.linkHover}`}>
                    Vie Associative
                  </Link>
                )}
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
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu Mobile Dropdown */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 space-y-4 border-t border-gray-200"
          >
            <Link 
              href="/evenements" 
              className={`block text-lg font-medium text-gray-700 transition-colors ${THEME_CLASSES.linkHover} py-2`}
              onClick={() => setIsMenuOpen(false)}
            >
              🎉 Événements
            </Link>
            <Link 
              href="/ateliers" 
              className={`block text-lg font-medium text-gray-700 transition-colors ${THEME_CLASSES.linkHover} py-2`}
              onClick={() => setIsMenuOpen(false)}
            >
              🎨 Ateliers
            </Link>
            <Link 
              href="/vos-idees" 
              className={`block text-lg font-medium text-gray-700 transition-colors ${THEME_CLASSES.linkHover} py-2`}
              onClick={() => setIsMenuOpen(false)}
            >
              💡 Vos Idées
            </Link>
            <Link 
              href="/adhesion" 
              className={`block text-lg font-medium text-gray-700 transition-colors ${THEME_CLASSES.linkHover} py-2`}
              onClick={() => setIsMenuOpen(false)}
            >
              🎫 Adhésion
            </Link>

            {user ? (
              <>
                <Link 
                  href="/profil" 
                  className={`block text-lg font-medium text-gray-700 transition-colors ${THEME_CLASSES.linkHover} py-2`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  👤 Mon Profil
                </Link>
                {user.membershipStatus === 'ACTIVE' && (
                  <Link 
                    href="/vie-associative" 
                    className={`block text-lg font-medium text-gray-700 transition-colors ${THEME_CLASSES.linkHover} py-2`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📄 Vie Associative
                  </Link>
                )}
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className={`block text-lg font-bold ${THEME_CLASSES.textPrimary} hover:opacity-80 py-2`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ⚙️ Administration
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }} 
                  size="lg" 
                  className="w-full mt-2 text-base"
                >
                  🚪 Déconnexion
                </Button>
              </>
            ) : (
              <div className="space-y-3 pt-2">
                <Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="lg" className="w-full text-base font-semibold">
                    🔐 Connexion
                  </Button>
                </Link>
                <Link href="/signup" className="block" onClick={() => setIsMenuOpen(false)}>
                  <Button size="lg" className={`w-full ${THEME_CLASSES.buttonPrimary} text-base font-semibold`}>
                    ✨ Inscription
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
