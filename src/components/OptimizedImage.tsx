'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

// Keep the server-side optimiser limited to the hosts in next.config.ts.
// Other existing HTTPS images load directly, without crashing the whole page.
function imageSourceMode(src: string): 'optimized' | 'direct' | 'invalid' {
  if (src.startsWith('/') && !src.startsWith('//')) return 'optimized';
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') return 'invalid';
    return !url.port && (url.hostname === 'firebasestorage.googleapis.com'
      || url.hostname.endsWith('.firebasestorage.app')
      || url.hostname === 'images.unsplash.com') ? 'optimized' : 'direct';
  } catch {
    return 'invalid';
  }
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  objectFit = 'cover',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sourceMode = imageSourceMode(src);

  if (hasError || sourceMode === 'invalid') {
    return (
      <div
        role="img"
        aria-label={alt || 'Illustration indisponible'}
        className={cn(
          'bg-[#edf4ec] text-brand-blue flex items-center justify-center',
          className
        )}
        style={fill ? undefined : { width, height }}
      >
        <ImageIcon size={48} strokeWidth={1.2} aria-hidden="true" />
      </div>
    );
  }

  const imageProps = fill
    ? {
        fill: true,
        sizes,
        className: cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          `object-${objectFit}`,
          className
        ),
      }
    : {
        width: width || 800,
        height: height || 600,
        className: cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          `object-${objectFit}`,
          className
        ),
      };

  return (
    <div className={cn('relative overflow-hidden', fill && 'w-full h-full', className)} style={fill ? undefined : { width, height }}>
      {isLoading && (
        <Skeleton 
          variant="rectangular" 
          className="absolute inset-0"
        />
      )}
      <Image
        src={src}
        unoptimized={sourceMode === 'direct'}
        alt={alt}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...imageProps}
      />
    </div>
  );
}
