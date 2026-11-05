import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-pill transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

  const variants = {
    primary:
      'bg-forest text-ivory hover:bg-forest/90 shadow-soft hover:shadow-soft-hover border border-forest/10',
    secondary:
      'bg-coffee text-ivory hover:bg-coffee/90 shadow-soft hover:shadow-soft-hover border border-coffee/10',
    outline:
      'border-2 border-forest/30 text-forest bg-transparent hover:bg-forest/10 hover:border-forest/50',
    ghost:
      'text-forest bg-transparent hover:bg-sage/20',
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 gap-1.5',
    md: 'text-sm px-6 py-2.5 gap-2',
    lg: 'text-base px-8 py-3.5 gap-2.5',
  };

  const combinedClasses = `${baseStyles} ${variants[variant] || variants.primary} ${
    sizes[size] || sizes.md
  } ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
