import React from 'react';

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl p-6 bg-ivory border border-sage/30 space-y-4 shadow-sm"
        >
          <div className="aspect-[4/3] rounded-2xl bg-sage/20 w-full" />
          <div className="space-y-2">
            <div className="h-5 bg-sage/25 rounded-pill w-3/4" />
            <div className="h-3 bg-sage/15 rounded-pill w-full" />
            <div className="h-3 bg-sage/15 rounded-pill w-1/2" />
          </div>
          <div className="pt-4 border-t border-sage/20 flex items-center justify-between">
            <div className="h-6 bg-sage/25 rounded-pill w-16" />
            <div className="h-8 bg-sage/20 rounded-pill w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableRowSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          className="p-4 rounded-2xl bg-ivory border border-sage/25 flex items-center justify-between gap-4"
        >
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-4 bg-sage/20 rounded-pill ${
                cIdx === 0 ? 'w-24' : cIdx === 1 ? 'w-36' : 'w-16'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function TextSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className={`h-3 bg-sage/20 rounded-pill ${
            idx === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export default {
  CardSkeleton,
  TableRowSkeleton,
  TextSkeleton,
};
