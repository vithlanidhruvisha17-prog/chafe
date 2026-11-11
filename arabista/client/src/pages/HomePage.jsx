import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Coffee,
  Sparkles,
  ArrowRight,
  Plus,
  Compass,
  UtensilsCrossed,
  Clock,
  HeartHandshake,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import SectionHeading from '../components/common/SectionHeading';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function HomePage() {
  const { addItem } = useCart();
  const toast = useToast();

  // Live API States
  const [signatureItems, setSignatureItems] = useState([]);
  const [loadingSignatures, setLoadingSignatures] = useState(true);

  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  // Fetch Live Signature Items
  useEffect(() => {
    let isMounted = true;
    api
      .get('/menu-items/signature')
      .then((res) => {
        if (isMounted) {
          setSignatureItems(res.data || []);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch signature items:', err.message);
        if (isMounted) setSignatureItems([]);
      })
      .finally(() => {
        if (isMounted) setLoadingSignatures(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Live Space Gallery
  useEffect(() => {
    let isMounted = true;
    api
      .get('/gallery')
      .then((res) => {
        if (isMounted) {
          setGalleryImages(res.data || []);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch gallery images:', err.message);
        if (isMounted) setGalleryImages([]);
      })
      .finally(() => {
        if (isMounted) setLoadingGallery(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (item) => {
    addItem(item, 1);
    toast.success(`Added ${item.name} to order`);
  };

  return (
    <div className="flex flex-col gap-20 md:gap-28 pb-16 md:pb-24">
      {/* 1. HERO SECTION WITH ARCH-SHAPED IMAGE & 2 BUTTONS */}
      <section className="pt-8 md:pt-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Headline & Action Buttons */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-sage/20 border border-sage/40 text-forest text-xs font-semibold uppercase tracking-widest mb-6">
                <Sparkles className="w-3.5 h-3.5 text-coffee" />
                Artisan Café &bull; Surat, Gujarat
              </span>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium text-forest leading-[1.08] tracking-tight">
                Where Handcrafted Brews Meet Conscious Living
              </h1>

              <p className="mt-6 text-base sm:text-lg text-charcoal/80 max-w-xl leading-relaxed font-sans">
                Experience our single-origin pour-overs, slow-infused Vietnamese brews,
                sourdough artisan pizzas, and Italian pasta labs crafted fresh daily in Surat.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button to="/menu" variant="primary" size="lg">
                  <Coffee className="w-4 h-4 mr-2" />
                  Explore Visual Menu
                </Button>
                <Button to="/track" variant="outline" size="lg">
                  Order &amp; Track
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Verified Quality Badges */}
              <div className="mt-12 pt-8 border-t border-sage/25 w-full grid grid-cols-3 gap-6">
                <div>
                  <h4 className="font-serif text-2xl sm:text-3xl font-bold text-forest">100%</h4>
                  <p className="text-xs text-charcoal/70 mt-1 uppercase font-semibold tracking-wider">
                    Specialty Arabica
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-2xl sm:text-3xl font-bold text-forest">48-Hr</h4>
                  <p className="text-xs text-charcoal/70 mt-1 uppercase font-semibold tracking-wider">
                    Sourdough Proof
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-2xl sm:text-3xl font-bold text-forest">Surat</h4>
                  <p className="text-xs text-charcoal/70 mt-1 uppercase font-semibold tracking-wider">
                    Piplod &bull; Vesu
                  </p>
                </div>
              </div>
            </div>

            {/* Right Hero Arch Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md aspect-[3/4] arch-frame bg-sage/25 relative shadow-soft overflow-hidden flex flex-col justify-end p-8 border-4 border-sage/40 group">
                {/* Hero Ritual Photograph */}
                <img
                  src="https://qjwdudmbjqztbxfaugfi.supabase.co/storage/v1/object/public/arabista-images/banners/1794414322582-65588309-62ee-4d98-ab86-a35783d3e6c9.webp"
                  alt="The Arabista Ritual - Single Origin Manual Pour Over"
                  className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Decorative Atmospheric Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent z-10 pointer-events-none" />

                {/* Overlay Content */}
                <div className="relative z-20 text-ivory">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-ivory/15 backdrop-blur-sm text-[11px] font-semibold text-coffee mb-2">
                    <Sparkles className="w-3 h-3 text-coffee" />
                    Signature Brew Experience
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-semibold text-ivory">
                    The Arabista Ritual
                  </h3>
                  <p className="text-xs text-ivory/80 mt-2 leading-relaxed font-sans">
                    Slow manual brews pulled over carved crystal ice, cardamom infusions, and sourdough crusts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. WELCOME SECTION (GREEN BACKGROUND #173D32) */}
      <section className="bg-forest text-ivory py-20 md:py-28 relative overflow-hidden">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-ivory/10 border border-ivory/20 text-coffee text-xs font-semibold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-coffee" />
              Welcome to ARABISTA
            </span>

            <h2 className="text-3xl sm:text-5xl font-serif font-medium text-ivory leading-tight">
              A Warm Refuge for Coffee Lovers and Food Purists
            </h2>

            <p className="mt-6 text-base sm:text-lg text-ivory/80 leading-relaxed font-sans">
              Located on the peaceful stretch of Piplod-Vesu, ARABISTA was born out of
              an unapologetic love for slow rituals. We invite you to pause, sip mindfully,
              and taste food cooked with patience and honest integrity.
            </p>
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-forest-light/60 border border-ivory/10 backdrop-blur-sm flex flex-col items-start transition-all duration-300 hover:border-coffee/50">
              <div className="w-12 h-12 rounded-full bg-coffee text-ivory flex items-center justify-center mb-5">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-ivory mb-2">
                Conscious Sourcing
              </h3>
              <p className="text-sm text-ivory/75 leading-relaxed font-sans">
                Direct-trade single-estate Arabica harvested ethically from shaded hillsides,
                roasted locally in small batches to preserve natural tasting notes.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-forest-light/60 border border-ivory/10 backdrop-blur-sm flex flex-col items-start transition-all duration-300 hover:border-coffee/50">
              <div className="w-12 h-12 rounded-full bg-sage text-forest flex items-center justify-center mb-5">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-ivory mb-2">
                The Pasta &amp; Pizza Lab
              </h3>
              <p className="text-sm text-ivory/75 leading-relaxed font-sans">
                Handmade Italian pomodoro, authentic durum wheat pastas, and 48-hour cold
                fermented sourdough baked on hot stone decks.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-forest-light/60 border border-ivory/10 backdrop-blur-sm flex flex-col items-start transition-all duration-300 hover:border-coffee/50">
              <div className="w-12 h-12 rounded-full bg-coffee text-ivory flex items-center justify-center mb-5">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-ivory mb-2">
                Surat Community
              </h3>
              <p className="text-sm text-ivory/75 leading-relaxed font-sans">
                An inspiring environment created for creative minds, book readers,
                warm laughter, and calm afternoon conversations.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. SIGNATURE SPECIAL (FROM /api/menu-items/signature, WITH PRICES) */}
      <section>
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-pill bg-sage/20 border border-sage/40 text-forest text-xs font-semibold uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5 text-coffee" />
                Chef's Handpicked Selection
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-medium text-forest leading-tight">
                Signature Specials
              </h2>
            </div>

            <Button to="/menu?signature=true" variant="outline" size="md">
              View All Signatures
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {loadingSignatures ? (
            <Loader text="Loading freshly prepared signature specials..." />
          ) : signatureItems.length === 0 ? (
            <EmptyState
              icon={Coffee}
              title="No Signatures Available"
              description="Our seasonal signature specials are being updated. Explore our visual menu for today's brews."
              actionLabel="View Visual Menu"
              actionTo="/menu"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {signatureItems.map((item) => (
                <Card
                  key={item.id}
                  variant="hoverable"
                  className="flex flex-col justify-between h-full bg-ivory border-sage/40"
                >
                  <div>
                    {/* Item Image or Brand Monogram Frame */}
                    <div className="aspect-[4/3] rounded-xl bg-sage/20 mb-4 overflow-hidden relative flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-forest/40">
                          <Coffee className="w-10 h-10 mb-1" />
                          <span className="font-serif text-xs font-bold uppercase tracking-wider text-forest/60">
                            ARABISTA
                          </span>
                        </div>
                      )}

                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-pill bg-forest/90 text-ivory text-[10px] font-semibold tracking-wider uppercase">
                        Signature
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-serif text-xl font-semibold text-forest leading-snug">
                        {item.name}
                      </h3>
                    </div>

                    <p className="text-xs text-charcoal/70 line-clamp-2 leading-relaxed mb-4">
                      {item.description || 'Artisanal recipe prepared fresh in our kitchen.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-sage/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-charcoal/60 uppercase font-semibold">Price</span>
                      <p className="font-serif text-xl font-bold text-coffee">
                        &#8377;{item.price}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(item)}
                      variant="primary"
                      size="sm"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* 4. OUR SPACE GALLERY (FROM /api/gallery) */}
      <section className="bg-ivory/60 py-16 md:py-20 border-y border-sage/25">
        <Container>
          <SectionHeading
            eyebrow="Atmosphere &amp; Ambience"
            title="Our Space in Surat"
            subtitle="Sunlit archways, quiet reading nooks, and a bustling aromatic brew bar designed for comfort."
          />

          {loadingGallery ? (
            <Loader text="Opening the gallery doors..." />
          ) : galleryImages.length === 0 ? (
            /* Aesthetic Fallback Grid if no gallery uploaded yet */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'The Manual Brew Bar', desc: 'Precision V60 drip counters' },
                { title: 'Sunlit Arch Reading Nook', desc: 'Natural light & warm wood' },
                { title: 'Artisan Kitchen & Oven', desc: 'Stone baked sourdough aroma' },
              ].map((fallback, idx) => (
                <div
                  key={idx}
                  className="arch-frame aspect-[4/3] bg-sage/20 p-6 flex flex-col justify-end relative shadow-soft overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent" />
                  <div className="relative z-10 text-ivory">
                    <h4 className="font-serif text-lg font-bold text-ivory">
                      {fallback.title}
                    </h4>
                    <p className="text-xs text-ivory/80 mt-1">{fallback.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((img) => (
                <div
                  key={img.id}
                  className="arch-frame aspect-[4/3] bg-sage/20 relative shadow-soft overflow-hidden group"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.title || 'Arabista Space'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  {img.title && (
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <span className="text-xs font-serif font-semibold text-ivory tracking-wide">
                        {img.title}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* 5. MEET CHEF ARABITO SECTION WITH "SEE ORDER TRACKING" BUTTON */}
      <section>
        <Container>
          <div className="rounded-3xl bg-ivory border-2 border-sage/35 p-8 md:p-14 shadow-soft">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Arch Portrait Visual */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm aspect-[4/5] arch-frame bg-sage/30 relative overflow-hidden flex flex-col justify-end p-6 text-center shadow-soft border-4 border-sage/40 group">
                  {/* Chef Arabito Portrait Photograph */}
                  <img
                    src="https://qjwdudmbjqztbxfaugfi.supabase.co/storage/v1/object/public/arabista-images/gallery/1794414328316-46b547f7-5165-41e5-b293-c3955b2733b2.webp"
                    alt="Chef Arabito - Master Roaster & Culinary Lead"
                    className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Gradient Vignette Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/75 to-transparent z-10 pointer-events-none" />

                  {/* Chef Details Overlay */}
                  <div className="relative z-20 text-ivory">
                    <h3 className="font-serif text-2xl font-bold text-ivory">
                      Chef Arabito
                    </h3>
                    <p className="text-xs text-coffee font-semibold tracking-widest uppercase mt-1">
                      Master Roaster &bull; Culinary Lead
                    </p>
                    <div className="mt-3 pt-3 border-t border-ivory/20 text-[11px] text-ivory/80 italic font-serif">
                      &ldquo;We never rush the roast, we never rush the dough.&rdquo;
                    </div>
                  </div>
                </div>
              </div>

              {/* Biography Narrative */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-pill bg-sage/20 border border-sage/40 text-forest text-xs font-semibold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-coffee" />
                  The Culinary Soul
                </span>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-forest leading-tight">
                  Meet Chef Arabito
                </h2>

                <p className="text-base sm:text-lg text-charcoal/80 leading-relaxed font-sans">
                  From calibrating our Simonelli espresso extraction ratios each morning
                  to hand-kneading 48-hour fermented dough, Chef Arabito anchors every
                  flavor experience at ARABISTA.
                </p>

                <p className="text-sm text-charcoal/70 leading-relaxed font-sans">
                  Whether creating our signature green cardamom cold brews or rolling
                  durum wheat pastas for our Pasta Lab, the philosophy is simple:
                  respect the ingredient, honor the time it takes, and serve with warmth.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Button to="/track" variant="primary" size="lg">
                    <Clock className="w-4 h-4 mr-2" />
                    See Order Tracking
                  </Button>
                  <Button to="/story" variant="outline" size="lg">
                    Read Our Full Story
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
