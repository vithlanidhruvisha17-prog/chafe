import React from 'react';
import { Coffee } from 'lucide-react';

export default function Loader({ fullScreen = false, text = 'Brewing your experience...' }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-sage/20 border-t-forest animate-spin" />
        <Coffee className="w-6 h-6 text-coffee absolute animate-pulse" />
      </div>
      {text && (
        <p className="text-sm font-medium font-serif text-forest tracking-wide">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center">{content}</div>;
}
