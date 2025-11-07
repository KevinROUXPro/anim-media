'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { THEME_CLASSES } from '@/config/theme';
import { MembershipStatus } from '@/types';

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireMembership = false
}: { 
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireMembership?: boolean;
}) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requireAdmin && !isAdmin) {
        router.push('/');
      } else if (requireMembership && user.membershipStatus !== MembershipStatus.ACTIVE) {
        router.push('/adhesion');
      }
    }
  }, [user, loading, isAdmin, requireAdmin, requireMembership, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EDE0]/30">
        <div className={`animate-spin rounded-full h-16 w-16 border-4 border-t-transparent ${THEME_CLASSES.borderPrimary}`}></div>
      </div>
    );
  }

  if (!user || (requireAdmin && !isAdmin) || (requireMembership && user.membershipStatus !== MembershipStatus.ACTIVE)) {
    return null;
  }

  return <>{children}</>;
}
