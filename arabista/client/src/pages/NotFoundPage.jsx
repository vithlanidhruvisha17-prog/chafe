import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import { Coffee, Compass, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <Container className="py-20 md:py-32 text-center max-w-2xl">
      <div className="w-20 h-20 rounded-full bg-forest text-ivory mx-auto flex items-center justify-center mb-6 shadow-soft">
        <Coffee className="w-10 h-10 text-coffee" />
      </div>

      <span className="text-xs font-semibold uppercase tracking-widest text-coffee block mb-2">
        Error 404 &bull; Page Not Found
      </span>

      <h1 className="text-4xl md:text-5xl font-serif font-bold text-forest mb-4 leading-tight">
        A Cup That Isn&rsquo;t Poured Yet
      </h1>

      <p className="text-sm md:text-base text-charcoal/75 max-w-md mx-auto mb-8 font-sans leading-relaxed">
        The destination or recipe you are seeking might have been moved, renamed, or enjoyed by another guest.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button to="/menu" variant="primary" size="lg">
          <Compass className="w-4 h-4 mr-1.5" />
          Explore Visual Menu
        </Button>

        <Button to="/track" variant="outline" size="lg">
          <Search className="w-4 h-4 mr-1.5" />
          Track Your Order
        </Button>

        <Button to="/" variant="secondary" size="lg">
          Return Home
        </Button>
      </div>

      <div className="mt-12 pt-8 border-t border-sage/20 text-xs text-charcoal/60">
        <span>ARABISTA &bull; Surat, Gujarat &bull; Artisanal Specialty Café</span>
      </div>
    </Container>
  );
}
