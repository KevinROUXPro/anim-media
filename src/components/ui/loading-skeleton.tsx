'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      aria-hidden="true"
    />
  );
}

// Composants de skeleton pré-configurés
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border-2 p-6 space-y-4">
      <Skeleton variant="rectangular" height={200} className="w-full rounded-lg" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border-2 overflow-hidden shadow-sm">
      <Skeleton variant="rectangular" height={200} className="w-full" />
      <div className="p-6 space-y-3">
        <Skeleton variant="text" width="70%" height={24} />
        <Skeleton variant="text" width="50%" height={20} />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton variant="text" width="30%" height={20} />
        <Skeleton variant="rectangular" height={40} className="w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="30%" height={20} />
        <Skeleton variant="rectangular" height={100} className="w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="30%" height={20} />
        <Skeleton variant="rectangular" height={40} className="w-full" />
      </div>
      <Skeleton variant="rectangular" height={44} width="30%" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border-2 p-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="60%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
