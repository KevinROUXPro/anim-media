'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { BrandLogo } from '@/components/BrandLogo';
import { THEME_CLASSES } from '@/config/theme';

export function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/evenements', label: 'Événements' },
    { href: '/ateliers', label: 'Ateliers' },
    { href: '/vos-idees', label: 'Vos idées' },
    { href: '/adhesion', label: 'Adhésion' },
  ];

  return (
    <nav aria-label="Navigation principale" className="site-navbar glass-navbar sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="anim’Média — Accueil">
            <BrandLogo />
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden xl:flex items-center space-x-5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link 
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative text-sm font-semibold tracking-wide transition-colors py-1.5 px-1 ${
                    isActive 
                      ? 'text-brand-pink'
                      : 'text-gray-600 dark:text-gray-300 hover:text-brand-pink dark:hover:text-brand-pink'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {user ? (
              <>
                {user.membershipStatus === 'ACTIVE' && (
                  <Link 
                    href="/vie-associative" 
                    className={`relative text-sm font-semibold tracking-wide transition-colors py-1.5 px-1 ${
                      pathname === '/vie-associative'
                        ? 'text-brand-pink'
                        : 'text-gray-600 dark:text-gray-300 hover:text-brand-pink dark:hover:text-brand-pink'
                    }`}
                  >
                    Vie associative
                    {pathname === '/vie-associative' && (
                      <motion.div 
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )}
                <Link 
                  href="/profil" 
                  className={`relative text-sm font-semibold tracking-wide transition-colors py-1.5 px-1 ${
                    pathname === '/profil'
                      ? 'text-brand-pink'
                      : 'text-gray-600 dark:text-gray-300 hover:text-brand-pink dark:hover:text-brand-pink'
                  }`}
                >
                  Mon compte
                  {pathname === '/profil' && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className={`text-sm ${THEME_CLASSES.textPrimary} font-bold hover:opacity-80 transition-colors px-1`}
                  >
                    Administration
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  onClick={signOut} 
                  size="sm" 
                  className="text-xs font-semibold rounded-lg border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900"
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900"
                  >
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    size="sm" 
                    className={`${THEME_CLASSES.buttonPrimary} text-xs font-semibold px-4 py-2`}
                  >
                    Inscription
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Menu Mobile Button */}
          <button
            className="xl:hidden p-2 hover:bg-gray-100/50 dark:hover:bg-zinc-900/50 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu Mobile Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="xl:hidden overflow-hidden border-t border-gray-100 dark:border-zinc-800/50 py-3 space-y-2"
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`block text-base font-semibold py-2 px-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-brand-pink/5 text-brand-pink'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {user ? (
                <>
                  <Link 
                    href="/profil" 
                    className={`block text-base font-semibold py-2 px-3 rounded-lg transition-colors ${
                      pathname === '/profil' 
                        ? 'bg-brand-pink/5 text-brand-pink'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mon compte
                  </Link>
                  {user.membershipStatus === 'ACTIVE' && (
                    <Link 
                      href="/vie-associative" 
                      className={`block text-base font-semibold py-2 px-3 rounded-lg transition-colors ${
                        pathname === '/vie-associative' 
                          ? 'bg-brand-pink/5 text-brand-pink'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Vie associative
                    </Link>
                  )}
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className={`block text-base font-bold ${THEME_CLASSES.textPrimary} py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Administration
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }} 
                    size="lg" 
                    className="w-full mt-2 text-sm font-semibold rounded-xl border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300"
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="lg" className="w-full text-sm font-semibold rounded-xl border-gray-200 dark:border-zinc-800">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button size="lg" className={`w-full ${THEME_CLASSES.buttonPrimary} text-sm font-semibold rounded-xl`}>
                      Inscription
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
