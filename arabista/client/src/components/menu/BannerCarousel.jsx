import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Coffee } from 'lucide-react';
import Button from '../common/Button';
import api from '../../services/api';

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fallback banners if none seeded in Supabase database yet
  const defaultBanners = [
    {
      id: 'default-1',
      title: 'Monsoon Pour-Over Series',
      subtitle: 'Single-origin washed beans extracted slowly over ice & sparkling tonic water.',
      linkUrl: '/menu/category/the-pour',
      tag: 'Crafted Chills',
    },
    {
      id: 'default-2',
      title: 'The Pasta Lab & Sourdough',
      subtitle: '48-hour slow cold fermentation paired with freshly simmered San Marzano sauces.',
      linkUrl: '/menu/category/pastas',
      tag: 'Kitchen Special',
    },
    {
      id: 'default-3',
      title: 'Cardamom Infused Brews',
      subtitle: 'The Arabista Special pulled chilled with roasted green cardamom & sweet milk.',
      linkUrl: '/menu/category/the-pour',
      tag: 'Arabista Ritual',
    },
  ];

  useEffect(() => {
    let isMounted = true;
    api
      .get('/banners')
      .then((res) => {
        if (isMounted) {
          if (res.data && res.data.length > 0) {
            setBanners(res.data);
          } else {
            setBanners(defaultBanners);
          }
        }
      })
      .catch(() => {
        if (isMounted) setBanners(defaultBanners);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeList = banners.length > 0 ? banners : defaultBanners;

  // Auto-slide effect every 5 seconds
  useEffect(() => {
    if (isPaused || activeList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, activeList.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeList.length) % activeList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeList.length);
  };

  const current = activeList[currentIndex] || activeList[0];

  return (
    <div
      className="relative rounded-3xl bg-forest text-ivory overflow-hidden shadow-soft border-2 border-forest-light"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Graphic & Texture */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/90 to-forest-dark/80 z-0" />
      <div className="absolute -right-12 -bottom-12 opacity-10 text-ivory z-0 pointer-events-none">
        <Coffee className="w-80 h-80" />
      </div>

      {/* Slide Content */}
      <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 min-h-[220px] sm:min-h-[260px] flex flex-col justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-ivory/10 border border-ivory/20 text-coffee text-[11px] font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-coffee" />
            {current.tag || 'Special Feature'}
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-ivory tracking-tight leading-tight">
            {current.title}
          </h2>

          <p className="mt-2.5 text-sm sm:text-base text-ivory/80 leading-relaxed font-sans max-w-xl">
            {current.subtitle}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          {current.linkUrl ? (
            <Button to={current.linkUrl} variant="secondary" size="sm">
              Explore Collection &rarr;
            </Button>
          ) : (
            <Button to="/menu" variant="secondary" size="sm">
              Explore Collection &rarr;
            </Button>
          )}

          {/* Controls: Prev / Next & Dots */}
          <div className="flex items-center gap-4">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {activeList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-6 bg-coffee'
                      : 'w-2 bg-ivory/30 hover:bg-ivory/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-full bg-ivory/10 hover:bg-ivory/20 text-ivory transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-full bg-ivory/10 hover:bg-ivory/20 text-ivory transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
