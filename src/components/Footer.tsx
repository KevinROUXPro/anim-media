'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#F49928]">Anim'Média La Guerche</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Association culturelle proposant des ateliers et événements pour tous : 
              tricot, lecture, écriture, généalogie, informatique et bien plus encore !
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#00C2CB]">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/ateliers" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  🎨 Ateliers
                </Link>
              </li>
              <li>
                <Link 
                  href="/evenements" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  🎭 Événements
                </Link>
              </li>
              <li>
                <Link 
                  href="/adhesion" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  💳 Adhésion
                </Link>
              </li>
              <li>
                <Link 
                  href="/vie-associative" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  📋 Vie associative
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations légales */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#DE3156]">Informations légales</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/mentions-legales" 
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  ⚖️ Mentions légales
                </Link>
              </li>
              <li>
                <Link 
                  href="/politique-confidentialite" 
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  🔒 Politique de confidentialité
                </Link>
              </li>
              <li>
                <p className="text-gray-400 text-xs mt-4">
                  Conforme RGPD • Vos données sont protégées
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Anim'Média La Guerche. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <span>Fait avec</span>
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-red-500"
              >
                ❤️
              </motion.span>
              <span>pour la culture</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
