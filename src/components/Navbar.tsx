'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              Anim'Média
            </motion.div>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/evenements" className="text-gray-700 hover:text-purple-600 transition-colors">
              Événements
            </Link>
            <Link href="/ateliers" className="text-gray-700 hover:text-purple-600 transition-colors">
              Ateliers
            </Link>

            {user ? (
              <>
                <Link href="/profil" className="text-gray-700 hover:text-purple-600 transition-colors">
                  Mon Profil
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                    Administration
                  </Link>
                )}
                <Button variant="outline" onClick={signOut} size="sm">
                  Déconnexion
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
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
            <Link href="/evenements" className="block text-gray-700 hover:text-purple-600">
              Événements
            </Link>
            <Link href="/ateliers" className="block text-gray-700 hover:text-purple-600">
              Ateliers
            </Link>
            {user ? (
              <>
                <Link href="/profil" className="block text-gray-700 hover:text-purple-600">
                  Mon Profil
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="block text-purple-600 font-medium">
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
                  <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
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
