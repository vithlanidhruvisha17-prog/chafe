import React from 'react';
import { Link } from 'react-router-dom';
import logoPng from '../../assets/logo/arabista-logo.png';
import wordmarkPng from '../../assets/logo/arabista-wordmark.png';

const TONES = {
  forest: 'text-forest',
  ivory: 'text-ivory',
  auto: 'text-forest [[data-surface=dark]_&]:text-ivory [[data-surface=light]_&]:text-forest',
};

const SIZES = {
  sm: 'h-8',  // 32px
  md: 'h-11', // 44px
  lg: 'h-16', // 64px
  xl: 'h-24', // 96px
};

export default function Logo({
  tone = 'forest',
  size = 'md',
  showTagline = true,
  className = '',
  to,
  ...props
}) {
  const toneClass = TONES[tone] || TONES.forest;
  const sizeClass = SIZES[size] || SIZES.md;
  const combinedClasses = `inline-flex items-center shrink-0 transition-transform duration-200 hover:scale-[1.01] ${toneClass} ${sizeClass} ${className}`;

  const maskUrl = showTagline ? logoPng : wordmarkPng;
  const aspectRatio = showTagline ? '2400 / 630' : '2400 / 482';

  const mark = (
    <span
      className="inline-block h-full w-auto select-none pointer-events-none"
      style={{
        aspectRatio,
        maskImage: `url("${maskUrl}")`,
        WebkitMaskImage: `url("${maskUrl}")`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        backgroundColor: 'currentColor',
      }}
      aria-hidden="true"
    />
  );

  if (to) {
    return (
      <Link
        to={to}
        aria-label="ARABISTA - Coffee, Community, Connection"
        className={combinedClasses}
        {...props}
      >
        {mark}
      </Link>
    );
  }

  return (
    <span
      role="img"
      aria-label="ARABISTA - Coffee, Community, Connection"
      className={combinedClasses}
      {...props}
    >
      {mark}
    </span>
  );
}
