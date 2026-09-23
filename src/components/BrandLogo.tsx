'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LOGO_CONFIG } from '@/config/logo';

export function BrandLogo({ large = false }: { large?: boolean }) {
  const [unavailable, setUnavailable] = useState(false);

  if (unavailable) {
    return <span className={`brand-wordmark ${large ? 'brand-wordmark--large' : 'brand-wordmark--nav'}`}>anim<span>’Média</span></span>;
  }

  return (
    <Image
      src={LOGO_CONFIG.storageUrl}
      alt={LOGO_CONFIG.alt}
      width={large ? 320 : 96}
      height={large ? 320 : 96}
      className={large ? 'site-login-logo' : 'site-nav-logo'}
      preload={large}
      loading={large ? undefined : 'eager'}
      unoptimized
      onError={() => setUnavailable(true)}
    />
  );
}
