'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { cn } from '@/lib/utils';

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

  if (hasError) {
    return (
      <div 
        className={cn(
          'bg-gray-200 flex items-center justify-center',
          className
        )}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-gray-400 text-sm">Image non disponible</span>
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
    <div className={cn('relative overflow-hidden', className)} style={fill ? undefined : { width, height }}>
      {isLoading && (
        <Skeleton 
          variant="rectangular" 
          className="absolute inset-0"
        />
      )}
      <Image
        src={src}
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
