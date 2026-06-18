// Lightweight skeleton primitives for loading states. Plain blocks with a
// shimmer sweep, tuned for the warm light base.

export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton animate-shimmer rounded-xl ${className}`} aria-hidden="true" />;
}

export function RoundCardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-cream-line bg-cream-panel p-4">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-16" />
        <SkeletonBlock className="h-5 w-20 rounded-full" />
      </div>
      <SkeletonBlock className="mt-3 h-4 w-3/4" />
      <div className="mt-4 flex gap-2">
        <SkeletonBlock className="h-14 flex-1" />
        <SkeletonBlock className="h-14 flex-1" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6" aria-hidden="true">
      <SkeletonBlock className="h-10 w-64 rounded-full" />
      <div className="flex w-full max-w-3xl items-center justify-center gap-6">
        <SkeletonBlock className="h-40 w-40 rounded-3xl sm:h-52 sm:w-52" />
        <SkeletonBlock className="h-16 w-16 rounded-full" />
        <SkeletonBlock className="h-40 w-40 rounded-3xl sm:h-52 sm:w-52" />
      </div>
    </div>
  );
}
