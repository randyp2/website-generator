"use client";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="space-y-4">
          {/* Question Header Skeleton */}
          <div className="space-y-2">
            <div className="h-6 bg-white/10 rounded-lg w-3/4" />
            <div className="h-4 bg-white/5 rounded-lg w-1/2" />
          </div>

          {/* Options Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[...Array(3)].map((_, optionIndex) => (
              <div
                key={optionIndex}
                className="h-16 bg-white/5 rounded-xl border-2 border-white/10"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
