'use client';

import React from 'react';
import { User, MembershipStatus, MEMBERSHIP_LABELS, UserBadge } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Award, ShieldCheck, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DigitalMembershipCardProps {
  user: User;
}

const DEFAULT_BADGES: UserBadge[] = [
  {
    id: 'active_member',
    title: 'Adhérent Engagé',
    description: 'Membre officiel d\'Anim\'Média',
    icon: '🎖️',
  },
  {
    id: 'idea_creator',
    title: 'Pionnier d\'Idées',
    description: 'A partagé des idées dans le laboratoire',
    icon: '💡',
  },
  {
    id: 'cultural_explorer',
    title: 'Explorateur',
    description: 'Inscrit à plus de 3 activités culturelles',
    icon: '🚀',
  },
  {
    id: 'community_star',
    title: 'Ambassadeur',
    description: 'Acteur actif de la communauté Anim\'Media',
    icon: '⭐',
  },
];

export function DigitalMembershipCard({ user }: DigitalMembershipCardProps) {
  const isActive = user.membershipStatus === MembershipStatus.ACTIVE;
  const expiryFormatted = user.membershipExpiry
    ? format(new Date(user.membershipExpiry), 'dd MMM yyyy', { locale: fr })
    : 'Non renseignée';

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Carte 3D Pass Culturel */}
      <div className="relative group perspective">
        <div className={`w-full rounded-3xl p-6 sm:p-8 shadow-xl transition-transform duration-500 transform group-hover:rotate-1 relative overflow-hidden text-white ${
          isActive 
            ? 'bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 border border-amber-400/30' 
            : 'bg-gradient-to-br from-slate-600 via-gray-700 to-slate-800 border border-gray-500/30'
        }`}>
          {/* Motifs de fond décoratifs */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/20 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-200 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
                Passeport Membre Officiel
              </span>
              <h3 className="text-2xl font-extrabold mt-1 tracking-tight">Anim&apos;Média</h3>
            </div>
            <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
              <QrCode className="h-7 w-7 text-white" />
            </div>
          </div>

          <div className="my-6 relative z-10">
            <p className="text-xs text-amber-100 uppercase tracking-wider mb-0.5 font-medium">Titulaire du pass</p>
            <p className="text-2xl font-bold tracking-wide">{user.name}</p>
            <p className="text-xs text-amber-200/90 font-mono mt-1">
              ID : #{user.membershipNumber || user.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-white/20 relative z-10 text-xs">
            <div>
              <p className="text-[10px] text-amber-200/80 uppercase">Statut d&apos;adhésion</p>
              <div className="flex items-center gap-1.5 font-semibold mt-0.5">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span>{MEMBERSHIP_LABELS[user.membershipStatus].label}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-amber-200/80 uppercase">Valable jusqu&apos;au</p>
              <p className="font-semibold mt-0.5">{expiryFormatted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Badges & Succès Débloqués */}
      <Card className="border-amber-100 bg-amber-50/40 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-amber-600" />
            <h4 className="font-bold text-gray-900 text-lg">Badges & Accomplissements</h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DEFAULT_BADGES.map((badge, idx) => {
              const isUnlocked = idx === 0 || (idx === 1 && isActive);
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isUnlocked
                      ? 'bg-white border-amber-200 shadow-sm'
                      : 'bg-gray-50/60 border-gray-200 opacity-50 grayscale'
                  }`}
                >
                  <div className="text-3xl mb-1">{badge.icon}</div>
                  <div className="font-bold text-xs text-gray-900 leading-snug">{badge.title}</div>
                  <div className="text-[10px] text-gray-500 mt-1 line-clamp-2">{badge.description}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
