import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Coffee, Sparkles } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

// Tunable animation & geometry constants
export const DESKTOP = {
  step: 32, // deg between items
  R: '52vw', // wheel radius
  restX: '66%',
  restY: '50%',
  spin: 60, // extra self-rotation deg per step
  size: 'clamp(300px, min(42vw, 72svh), 800px)',
};

export const MOBILE = {
  step: 36,
  R: '75vw',
  restX: '50%',
  restY: '50%',
  spin: 50,
  size: '78vw',
};

export const DURATION = 900; // ms
export const EASE = 'cubic-bezier(0.33, 0, 0.15, 1)';

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 1024px)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsDesktop(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  return isDesktop;
};

const usePrefersReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
};

export default function SignatureShowcase({
  signatureItems = [],
  items: propItems,
  onAdd,
  autoPlay = false,
  imageShape = 'circle',
  leftAccent = true,
}) {
  const rawItems = propItems || signatureItems || [];
  const items = rawItems.slice(0, 6);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [pulseKey, setPulseKey] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, top: 0, width: 24 });

  const tabRefs = useRef([]);
  const tabsContainerRef = useRef(null);

  const isDesktop = useIsDesktop();
  const reducedMotion = usePrefersReducedMotion();

  const { addItem } = useCart();
  const toast = useToast();

  const P = isDesktop ? DESKTOP : MOBILE;
  const currentItem = items[selectedIndex] || items[0];

  useEffect(() => {
    items.forEach((item) => {
      if (item.imageUrl) {
        const img = new Image();
        img.src = item.imageUrl;
      }
    });
  }, [items]);

  const handleSelect = useCallback(
    (targetIndex, userInitiated = true) => {
      if (
        targetIndex === selectedIndex ||
        targetIndex < 0 ||
        targetIndex >= items.length
      ) {
        return;
      }

      if (userInitiated) {
        setHasInteracted(true);
      }

      setSelectedIndex(targetIndex);
      setPulseKey((k) => k + 1);
    },
    [selectedIndex, items.length]
  );

  // Auto-play: loop to first item after the last
  useEffect(() => {
    if (!autoPlay || hasInteracted || items.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setSelectedIndex((curr) => {
        const next = (curr + 1) % items.length;
        setPulseKey((k) => k + 1);
        return next;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [autoPlay, hasInteracted, items.length, isPaused]);

  // Dash indicator position & mobile horizontal scroll-into-view
  const updateIndicator = useCallback(() => {
    const activeTab = tabRefs.current[selectedIndex];
    if (activeTab) {
      const tabWidth = activeTab.offsetWidth;
      const tabHeight = activeTab.offsetHeight;
      const dashWidth = 24;
      const leftOffset = activeTab.offsetLeft + (tabWidth - dashWidth) / 2;
      const topOffset = activeTab.offsetTop + tabHeight + 4;

      setIndicatorStyle({
        left: leftOffset,
        top: topOffset,
        width: dashWidth,
      });

      if (!isDesktop && tabsContainerRef.current) {
        const container = tabsContainerRef.current;
        const tabLeft = activeTab.offsetLeft;
        const tabRight = tabLeft + activeTab.offsetWidth;
        if (tabLeft < container.scrollLeft) {
          container.scrollTo({ left: tabLeft - 16, behavior: 'smooth' });
        } else if (tabRight > container.scrollLeft + container.clientWidth) {
          container.scrollTo({
            left: tabRight - container.clientWidth + 16,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [selectedIndex, isDesktop]);

  useEffect(() => {
    updateIndicator();
    const timer = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [updateIndicator]);

  // Keyboard navigation: do not wrap at ends
  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < items.length - 1) {
        const nextIdx = index + 1;
        handleSelect(nextIdx, true);
        tabRefs.current[nextIdx]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        const prevIdx = index - 1;
        handleSelect(prevIdx, true);
        tabRefs.current[prevIdx]?.focus();
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleSelect(0, true);
      tabRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      handleSelect(items.length - 1, true);
      tabRefs.current[items.length - 1]?.focus();
    }
  };

  const handleAddToCart = (item) => {
    if (!item.isAvailable) return;
    if (onAdd) {
      onAdd(item);
    } else {
      addItem(item, 1);
      toast.success(`Added ${item.name} to order`);
    }
  };

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  if (!items.length || !currentItem) {
    return null;
  }

  const renderItemVisual = (item, isThumb = false) => {
    const hasValidImage = item.imageUrl && !imageErrors[item.id];
    const isCutout = imageShape === 'cutout';

    if (hasValidImage) {
      if (isThumb) {
        return (
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={() => handleImageError(item.id)}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
          />
        );
      }

      if (isCutout) {
        return (
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={() => handleImageError(item.id)}
            className="w-full h-full object-contain drop-shadow-[0_24px_48px_rgba(23,61,50,0.3)] select-none"
            loading="eager"
          />
        );
      }

      return (
        <div className="w-full h-full rounded-full overflow-hidden shadow-[0_20px_50px_-10px_rgba(23,61,50,0.28)] bg-sage/20 border-2 border-ivory/80">
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={() => handleImageError(item.id)}
            className="w-full h-full object-cover rounded-full select-none"
            loading="eager"
          />
        </div>
      );
    }

    return (
      <div
        className={`w-full h-full rounded-full bg-sage/25 text-forest/60 flex flex-col items-center justify-center select-none ${
          !isThumb
            ? 'shadow-[0_20px_50px_-10px_rgba(23,61,50,0.22)] border-2 border-ivory/80'
            : ''
        }`}
      >
        <Coffee
          className={
            isThumb
              ? 'w-6 h-6 text-forest/50'
              : 'w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 text-forest/40 mb-3'
          }
        />
        {!isThumb && (
          <span className="font-serif text-sm sm:text-base lg:text-xl font-bold uppercase tracking-widest text-forest/60">
            ARABISTA
          </span>
        )}
      </div>
    );
  };

  // Reusable Thumbnails Row
  const renderThumbnails = () => {
    if (items.length <= 1) return null;
    return (
      <div className="mt-8 sm:mt-10">
        <span className="block text-xs font-semibold text-coffee uppercase tracking-wider mb-4">
          Explore Signatures
        </span>
        <div className="relative max-w-full">
          <div
            ref={tabsContainerRef}
            role="tablist"
            aria-label="Signature specials selection"
            className={`relative flex items-center gap-2.5 sm:gap-3 lg:gap-3 pb-5 ${
              isDesktop
                ? 'flex-wrap overflow-visible'
                : 'overflow-x-auto overflow-y-hidden scrollbar-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]'
            }`}
          >
            {items.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={item.id}
                  ref={(el) => (tabRefs.current[idx] = el)}
                  role="tab"
                  id={`signature-tab-${idx}`}
                  aria-selected={isSelected}
                  aria-controls={`signature-panel-${idx}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => handleSelect(idx, true)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  aria-label={`${item.name}, ₹${item.price}`}
                  className={`group relative rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-coffee focus-visible:ring-offset-2 focus-visible:ring-offset-ivory shrink-0 p-1 ${
                    isSelected
                      ? 'scale-100 opacity-100 shadow-[0_8px_24px_-4px_rgba(183,139,89,0.35)] ring-2 ring-coffee/60'
                      : 'scale-90 opacity-65 hover:opacity-100 hover:scale-95 hover:-translate-y-0.5 shadow-[0_4px_16px_-2px_rgba(36,35,33,0.1)]'
                  }`}
                >
                  <div className="w-16 h-16 sm:w-[70px] sm:h-[70px] lg:w-[72px] lg:h-[72px] rounded-full overflow-hidden bg-sage/20 border-2 border-sage/40 group-hover:border-coffee transition-colors">
                    {renderItemVisual(item, true)}
                  </div>
                </button>
              );
            })}

            {/* 24px wide, 3px high Coffee Tan sliding dash */}
            <div
              className="absolute h-[3px] bg-coffee rounded-full pointer-events-none"
              style={{
                left: `${indicatorStyle.left}px`,
                top: `${indicatorStyle.top}px`,
                width: `${indicatorStyle.width}px`,
                transition: reducedMotion
                  ? 'none'
                  : `left ${DURATION}ms ${EASE}, top ${DURATION}ms ${EASE}`,
              }}
            />
          </div>

          {/* Right edge fade on mobile */}
          {!isDesktop && (
            <div className="absolute right-0 top-0 bottom-5 w-8 pointer-events-none bg-gradient-to-l from-ivory to-transparent" />
          )}
        </div>
      </div>
    );
  };

  // Reusable Wheel Canvas
  const renderWheel = (params) => {
    return (
      <div
        className="pointer-events-none"
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          left: `calc(${params.restX} + ${params.R})`,
          top: params.restY,
          transform: reducedMotion
            ? 'none'
            : `rotate(${selectedIndex * params.step}deg)`,
          transition: reducedMotion
            ? 'none'
            : `transform ${DURATION}ms ${EASE}`,
        }}
      >
        {items.map((item, i) => {
          const isActive = i === selectedIndex;
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: params.size,
                height: params.size,
                marginLeft: `calc(${params.size} / -2)`,
                marginTop: `calc(${params.size} / -2)`,
                transform: `rotate(${-i * params.step}deg) translateX(calc(${params.R} * -1))`,
                opacity: isActive ? 1 : 0,
                transition: reducedMotion
                  ? 'opacity 200ms ease-out'
                  : isActive
                  ? 'opacity 300ms ease-out'
                  : 'opacity 400ms ease-in 450ms',
                zIndex: isActive ? 20 : 10,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  transform: reducedMotion
                    ? 'none'
                    : `rotate(${(selectedIndex - i) * params.spin}deg)`,
                  transition: reducedMotion
                    ? 'none'
                    : `transform ${DURATION}ms ${EASE}`,
                }}
              >
                {renderItemVisual(item, false)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="relative w-full overflow-hidden select-none min-h-[560px] lg:min-h-[max(640px,calc(100svh-11rem))] flex flex-col justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* DESKTOP LAYOUT (lg+) */}
      {isDesktop ? (
        <>
          {/* Subtle Decorative Left-Bottom Sage Accent Circle */}
          {leftAccent && (
            <div
              className="absolute rounded-full bg-sage/14 pointer-events-none z-0"
              style={{
                width: 'clamp(360px, 38vw, 760px)',
                height: 'clamp(360px, 38vw, 760px)',
                left: '-12vw',
                bottom: '-14vw',
              }}
            />
          )}

          {/* Static Sage Background Circle (contained at top, bleeds off right & bottom edges) */}
          <div
            key={`sage-desktop-${pulseKey}`}
            className="absolute rounded-full bg-sage/35 pointer-events-none z-0 motion-safe:animate-showcase-pulse"
            style={{
              width: 'clamp(680px, 58vw, 1150px)',
              height: 'clamp(680px, 58vw, 1150px)',
              top: 'max(1.5rem, 3%)',
              right: '-8vw',
            }}
          />

          {/* Rotating Wheel Layer (Section Stage) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {renderWheel(DESKTOP)}
          </div>

          {/* Left Text Block & Thumbnails (aligned with Container heading edge via padding) */}
          <div
            className="relative z-30 w-full py-6 flex flex-col justify-center"
            style={{
              paddingLeft: 'max(2rem, calc((100% - 80rem) / 2 + 2rem))',
              paddingRight: 'max(2rem, calc((100% - 80rem) / 2 + 2rem))',
            }}
          >
            <div className="max-w-[520px] flex flex-col justify-center">
              <div
                key={`info-${currentItem.id}`}
                role="tabpanel"
                id={`signature-panel-${selectedIndex}`}
                aria-labelledby={`signature-tab-${selectedIndex}`}
                className="motion-safe:animate-showcase-text motion-reduce:transition-opacity motion-reduce:duration-300 space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-pill bg-sage/20 border border-sage/40 text-forest text-xs font-semibold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-coffee" />
                  Chef's Special Selection
                </div>

                <h3 className="font-serif text-4xl sm:text-5xl font-medium text-forest leading-tight">
                  {currentItem.name}
                </h3>

                <p className="text-sm sm:text-base text-charcoal/75 line-clamp-3 leading-relaxed font-sans max-w-lg">
                  {currentItem.description ||
                    'Artisanal chef recipe prepared fresh with slow-roasted beans and conscious local ingredients.'}
                </p>

                <div className="pt-2 flex items-center gap-6">
                  <div>
                    <span className="block text-[11px] text-charcoal/60 uppercase font-semibold tracking-wider">
                      Price
                    </span>
                    <p className="font-serif text-2xl sm:text-3xl font-bold text-coffee">
                      &#8377;{currentItem.price}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(currentItem)}
                    variant="primary"
                    size="md"
                    disabled={!currentItem.isAvailable}
                    className="shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {currentItem.isAvailable ? 'Add to Cart' : 'Sold Out'}
                  </Button>
                </div>
              </div>

              {renderThumbnails()}
            </div>
          </div>
        </>
      ) : (
        /* MOBILE & TABLET LAYOUT (<lg) */
        <Container className="relative z-20 w-full py-4 flex flex-col">
          {leftAccent && (
            <div
              className="absolute rounded-full bg-sage/12 pointer-events-none z-0"
              style={{
                width: '60vw',
                height: '60vw',
                left: '-15vw',
                bottom: '-10vw',
              }}
            />
          )}
          {/* 1. Text block first */}
          <div
            key={`info-mobile-${currentItem.id}`}
            role="tabpanel"
            id={`signature-panel-${selectedIndex}`}
            aria-labelledby={`signature-tab-${selectedIndex}`}
            className="motion-safe:animate-showcase-text motion-reduce:transition-opacity motion-reduce:duration-300 space-y-4 max-w-md"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-pill bg-sage/20 border border-sage/40 text-forest text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-coffee" />
              Chef's Special Selection
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl font-medium text-forest leading-tight">
              {currentItem.name}
            </h3>

            <p className="text-sm text-charcoal/75 line-clamp-3 leading-relaxed font-sans">
              {currentItem.description ||
                'Artisanal chef recipe prepared fresh with slow-roasted beans and conscious local ingredients.'}
            </p>

            <div className="pt-2 flex items-center gap-6">
              <div>
                <span className="block text-[11px] text-charcoal/60 uppercase font-semibold tracking-wider">
                  Price
                </span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-coffee">
                  &#8377;{currentItem.price}
                </p>
              </div>

              <Button
                onClick={() => handleAddToCart(currentItem)}
                variant="primary"
                size="md"
                disabled={!currentItem.isAvailable}
                className="shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {currentItem.isAvailable ? 'Add to Cart' : 'Sold Out'}
              </Button>
            </div>
          </div>

          {/* 2. Image stage below text */}
          <div
            className="relative w-full overflow-hidden my-4"
            style={{ height: 'clamp(300px, 95vw, 500px)' }}
          >
            {/* Sage circle behind wheel */}
            <div
              key={`sage-mobile-${pulseKey}`}
              className="absolute rounded-full bg-sage/35 pointer-events-none z-0 motion-safe:animate-showcase-pulse"
              style={{
                width: '85vw',
                height: '85vw',
                left: '75%',
                top: '75%',
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Mobile Wheel */}
            {renderWheel(MOBILE)}
          </div>

          {/* 3. Thumbnails below image stage */}
          {renderThumbnails()}
        </Container>
      )}
    </div>
  );
}
