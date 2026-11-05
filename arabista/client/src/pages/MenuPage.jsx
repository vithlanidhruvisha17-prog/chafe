import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  Coffee,
  UtensilsCrossed,
  Salad,
  Cake,
  Sparkles,
  Plus,
  ArrowRight,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import BannerCarousel from '../components/menu/BannerCarousel';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get('filter') || 'All';

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const { addItem } = useCart();
  const toast = useToast();

  // Filter chips
  const filterChips = [
    { label: 'All', value: 'All' },
    { label: 'The Pour', value: 'the-pour', icon: Coffee },
    { label: 'Food', value: 'food', icon: UtensilsCrossed },
    { label: 'Pasta Lab', value: 'pastas', icon: UtensilsCrossed },
    { label: 'Dessert', value: 'dessert', icon: Cake },
    { label: 'Salad', value: 'salad', icon: Salad },
  ];

  // Default category blueprints matching Module 1 specs
  const fallbackCategories = [
    {
      id: 'cat-the-pour',
      name: 'The Pour',
      slug: 'the-pour',
      description: 'Crafted warmth, chilled tonics, manual V60 drips, and signature lattes.',
      subCount: 12,
      icon: Coffee,
      badge: '12 Collections',
    },
    {
      id: 'cat-food',
      name: 'Food',
      slug: 'food',
      description: 'Hand-tossed sourdough artisan pizzas, croissant melts, and rice bowls.',
      subCount: 6,
      icon: UtensilsCrossed,
      badge: '6 Collections',
    },
    {
      id: 'cat-pastas',
      name: 'Pasta Lab',
      slug: 'pastas',
      description: 'Handcrafted Italian pasta creations: Arrabbiata, Alfredo, Pesto & Pink Sauce.',
      subCount: 8,
      icon: UtensilsCrossed,
      badge: '8 Signature Sauces',
    },
    {
      id: 'cat-dessert',
      name: 'Dessert',
      slug: 'dessert',
      description: 'Tiramisu after dark, molten brownies, basque cheesecakes, and flaky nutella.',
      subCount: 6,
      icon: Cake,
      badge: '6 Sweet Endings',
    },
    {
      id: 'cat-salad',
      name: 'Salad',
      slug: 'salad',
      description: 'Crisp market greens, burrata bowls, and cold herb-tossed salads.',
      subCount: 1,
      icon: Salad,
      badge: 'Fresh Bowls',
    },
  ];

  // Fetch live categories from API
  useEffect(() => {
    let isMounted = true;
    api
      .get('/categories')
      .then((res) => {
        if (isMounted) {
          if (res.data && res.data.length > 0) {
            setCategories(res.data);
          } else {
            setCategories(fallbackCategories);
          }
        }
      })
      .catch(() => {
        if (isMounted) setCategories(fallbackCategories);
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Search effect across menu items
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const delayDebounce = setTimeout(() => {
      api
        .get(`/menu-items?search=${encodeURIComponent(searchQuery.trim())}`)
        .then((res) => {
          setSearchResults(res.data || []);
        })
        .catch(() => {
          setSearchResults([]);
        })
        .finally(() => {
          setSearching(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleFilterClick = (value) => {
    if (value === 'All') {
      searchParams.delete('filter');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ filter: value });
    }
  };

  const handleAddToCart = (item) => {
    addItem(item, 1);
    toast.success(`Added ${item.name} to order`);
  };

  // Filter category cards
  const displayedCategories = categories.filter((cat) => {
    if (activeFilter === 'All') return true;
    const catSlug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
    return catSlug === activeFilter || cat.name.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Search Bar */}
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-charcoal/40 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lattes, sourdough pizzas, pastas, desserts..."
            className="w-full pl-12 pr-10 py-3.5 rounded-full border border-sage/40 bg-ivory text-charcoal placeholder:text-charcoal/50 text-sm focus:outline-none focus:border-forest shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 p-1 text-charcoal/40 hover:text-charcoal transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Live Search Results View (Active while typing) */}
      {searchQuery.trim().length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sage/20">
            <h3 className="font-serif text-xl font-bold text-forest">
              Search Results for &ldquo;{searchQuery}&rdquo;
            </h3>
            <span className="text-xs text-charcoal/60">
              {searchResults.length} {searchResults.length === 1 ? 'item' : 'items'} found
            </span>
          </div>

          {searching ? (
            <Loader text="Searching Arabista kitchen..." />
          ) : searchResults.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Results Found"
              description={`We couldn't find any menu item matching "${searchQuery}". Try another keyword or browse our categories below.`}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((item) => (
                <Card key={item.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-lg font-semibold text-forest">
                        {item.name}
                      </h4>
                      {item.isSignature && (
                        <span className="text-[10px] bg-sage/25 text-forest font-bold px-2 py-0.5 rounded-pill">
                          Signature
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal/70 line-clamp-1 mt-0.5">
                      {item.description || item.subCategory?.name}
                    </p>
                    <p className="font-serif text-base font-bold text-coffee mt-1">
                      &#8377;{item.price}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(item)}
                    variant="primary"
                    size="sm"
                    disabled={!item.isAvailable}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {item.isAvailable ? 'Add' : 'Sold Out'}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Banner Carousel */}
      <section>
        <BannerCarousel />
      </section>

      {/* Filter Chips Bar */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filterChips.map((chip) => {
            const Icon = chip.icon;
            const isActive = activeFilter === chip.value;
            return (
              <button
                key={chip.value}
                onClick={() => handleFilterClick(chip.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-pill text-xs font-semibold uppercase tracking-wider transition-all duration-300 shrink-0 ${
                  isActive
                    ? 'bg-forest text-ivory shadow-soft'
                    : 'bg-ivory border border-sage/40 text-charcoal/80 hover:border-forest/50 hover:bg-sage/15'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {chip.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Category Cards Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-sage/20">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest">
              Menu Categories
            </h2>
            <p className="text-xs text-charcoal/70 mt-0.5">
              Select a category to explore its distinct sub-collections
            </p>
          </div>
        </div>

        {loadingCategories ? (
          <Loader text="Loading visual menu categories..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCategories.map((cat) => {
              const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
              const subCount = cat.subCategories ? cat.subCategories.length : (cat.subCount || 0);

              return (
                <Link
                  key={cat.id || slug}
                  to={`/menu/category/${slug}`}
                  className="group block"
                >
                  <Card
                    variant="hoverable"
                    className="h-full flex flex-col justify-between p-7 bg-ivory border-sage/40 group-hover:border-forest/60 transition-all duration-300"
                  >
                    <div>
                      {/* Top Header & Icon Frame */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-forest text-ivory flex items-center justify-center font-serif text-lg font-bold shadow-sm group-hover:scale-105 transition-transform">
                          {cat.name === 'The Pour' && <Coffee className="w-6 h-6" />}
                          {(cat.name === 'Food' || cat.name === 'Pastas' || cat.name === 'Pasta Lab') && (
                            <UtensilsCrossed className="w-6 h-6" />
                          )}
                          {cat.name === 'Dessert' && <Cake className="w-6 h-6" />}
                          {cat.name === 'Salad' && <Salad className="w-6 h-6" />}
                        </div>

                        <span className="text-[11px] font-semibold text-coffee bg-sage/20 px-3 py-1 rounded-pill">
                          {subCount} {subCount === 1 ? 'Collection' : 'Collections'}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl font-bold text-forest group-hover:text-forest-dark transition-colors">
                        {cat.name}
                      </h3>

                      <p className="text-sm text-charcoal/75 leading-relaxed mt-2 font-sans">
                        {cat.description ||
                          `Explore all curated ${cat.name} collections prepared fresh to order.`}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-sage/20 flex items-center justify-between text-xs font-semibold text-forest group-hover:text-coffee transition-colors">
                      <span>Explore Subcategories</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
