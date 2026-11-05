import React from 'react';

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}) {
  const alignClass = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col max-w-3xl mb-10 md:mb-14 ${alignClass} ${className}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-pill bg-sage/20 border border-sage/40 text-forest text-xs font-medium uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-coffee" />
          {eyebrow}
        </span>
      )}

      {title && (
        <h2 className="text-3xl md:text-5xl font-serif font-medium text-forest leading-tight tracking-tight">
          {title}
        </h2>
      )}

      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-charcoal/75 leading-relaxed font-sans max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
