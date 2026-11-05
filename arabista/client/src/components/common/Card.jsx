import React from 'react';

export default function Card({
  children,
  variant = 'default',
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'bg-ivory border border-sage/30 transition-all duration-300';

  const variants = {
    default: 'rounded-2xl p-6 shadow-sm',
    hoverable:
      'rounded-2xl p-6 shadow-soft hover:shadow-soft-hover hover:border-sage/60 hover:-translate-y-1 cursor-pointer',
    elevated: 'rounded-2xl p-8 shadow-md border-sage/40',
    arch: 'rounded-arch p-6 shadow-soft hover:shadow-soft-hover border-sage/40',
  };

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
