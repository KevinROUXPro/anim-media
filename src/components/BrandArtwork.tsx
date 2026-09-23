import Image from 'next/image';
import { LOGO_CONFIG } from '@/config/logo';

/** The real identity is the hero artwork; the surrounding shapes simply extend its energy. */
export function BrandArtwork() {
  return (
    <div className="brand-artwork">
      <span className="brand-artwork-splash brand-artwork-splash--pink" aria-hidden="true" />
      <span className="brand-artwork-splash brand-artwork-splash--orange" aria-hidden="true" />
      <span className="brand-artwork-splash brand-artwork-splash--teal" aria-hidden="true" />
      <div className="brand-artwork-frame">
        <Image
          src={LOGO_CONFIG.storageUrl}
          alt={LOGO_CONFIG.alt}
          width={LOGO_CONFIG.width}
          height={LOGO_CONFIG.height}
          className="brand-artwork-logo"
          sizes="(max-width: 767px) 92vw, (max-width: 1200px) 45vw, 540px"
          preload
          unoptimized
        />
      </div>
      <p className="brand-artwork-caption"><span>Imaginer.</span> Créer. <strong>Partager.</strong></p>
    </div>
  );
}
