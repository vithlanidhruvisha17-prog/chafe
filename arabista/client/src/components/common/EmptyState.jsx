import React from 'react';
import { Coffee } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Coffee,
  title = 'Nothing here yet',
  description = 'No items found. Explore other artisanal brews or check back soon.',
  actionLabel,
  onAction,
  actionTo,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-sage/40 rounded-3xl bg-ivory/50 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-sage/20 flex items-center justify-center text-coffee mb-4">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-serif font-medium text-forest mb-2">
        {title}
      </h3>

      <p className="text-sm text-charcoal/70 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <Button to={actionTo} onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
