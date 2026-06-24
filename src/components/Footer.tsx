'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900/60 text-zinc-400 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* À propos */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-zinc-100 uppercase">
              Anim&apos;Média La Guerche
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              Association culturelle dynamique favorisant le partage de savoirs et de passions : 
              tricot, lecture, écriture, généalogie, informatique, et plus encore !
            </p>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-zinc-100 uppercase">
              Liens rapides
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  href="/ateliers" 
                  className="text-sm hover:text-zinc-100 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  🎨 Ateliers
                </Link>
              </li>
              <li>
                <Link 
                  href="/evenements" 
                  className="text-sm hover:text-zinc-100 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  🎭 Événements
                </Link>
              </li>
              <li>
                <Link 
                  href="/adhesion" 
                  className="text-sm hover:text-zinc-100 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  💳 Adhésion
                </Link>
              </li>
              <li>
                <Link 
                  href="/vie-associative" 
                  className="text-sm hover:text-zinc-100 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  📋 Vie associative
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations légales */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-zinc-100 uppercase">
              Informations légales
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  href="/mentions-legales" 
                  className="text-sm hover:text-zinc-100 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  ⚖️ Mentions légales
                </Link>
              </li>
              <li>
                <Link 
                  href="/politique-confidentialite" 
                  className="text-sm hover:text-zinc-100 hover:translate-x-1 inline-block transition-all duration-200"
                >
                  🔒 Politique de confidentialité
                </Link>
              </li>
              <li className="pt-2">
                <p className="text-zinc-500 text-xs border-l-2 border-zinc-800 pl-3">
                  Conforme RGPD • Vos données sont sécurisées
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-zinc-900 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-500 text-sm text-center md:text-left">
              © {currentYear} Anim&apos;Média La Guerche. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <span>Fait avec</span>
              <motion.span
                animate={{
                  scale: [1, 1.25, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-[#DE3156] inline-block"
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
