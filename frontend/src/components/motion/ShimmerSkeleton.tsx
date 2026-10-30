import React from 'react';

interface ShimmerSkeletonProps {
  className?: string;
  count?: number;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  className = 'h-4 w-full',
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-stone-200/70 rounded animate-hud-shimmer ${className}`}
        />
      ))}
    </>
  );
};

export const DashboardCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg border border-stone-300 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-stone-200 pb-3">
        <ShimmerSkeleton className="h-5 w-48" />
        <ShimmerSkeleton className="h-4 w-24" />
      </div>
      <div className="space-y-3">
        <ShimmerSkeleton className="h-20 w-full" count={3} />
      </div>
    </div>
  );
};
