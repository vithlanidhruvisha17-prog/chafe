import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Coffee,
  UtensilsCrossed,
  Cake,
  Salad,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

export default function CategorySubCategoriesPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback map matching Module 1 Seed data
  const fallbackCategoryData = {
    'the-pour': {
      name: 'The Pour',
      slug: 'the-pour',
      description: 'Handcrafted warm extractions, chilled tonics, manual drips, and signature lattes.',
      subCategories: [
        { name: 'Crafted Warmth', slug: 'crafted-warmth', itemCount: 4 },
        { name: 'Crafted Chills', slug: 'crafted-chills', itemCount: 4 },
        { name: 'Manual Brew', slug: 'manual-brew', itemCount: 3 },
        { name: 'Brew / Tonic Series', slug: 'brew-tonic-series', itemCount: 3 },
        { name: 'Signature Latte', slug: 'signature-latte', itemCount: 3 },
        { name: 'Vietnamese Collection', slug: 'vietnamese-collection', itemCount: 2 },
        { name: 'Indulgent Mocha', slug: 'indulgent-mocha', itemCount: 3 },
        { name: 'Beyond Coffee', slug: 'beyond-coffee', itemCount: 3 },
        { name: 'Ice Tea', slug: 'ice-tea', itemCount: 3 },
        { name: 'Matcha Rituals', slug: 'matcha-rituals', itemCount: 2 },
        { name: 'Shakes', slug: 'shakes', itemCount: 4 },
        { name: 'Arabista Special', slug: 'arabista-special', itemCount: 2 },
      ],
    },
    'food': {
      name: 'Food',
      slug: 'food',
      description: 'Freshly baked sourdough artisan pizzas, crisp croissants, nachos, and spice bowls.',
      subCategories: [
        { name: 'Fries', slug: 'fries', itemCount: 3 },
        { name: 'Nachos', slug: 'nachos', itemCount: 3 },
        { name: 'Croissant Sandwiches', slug: 'croissant-sandwiches', itemCount: 4 },
        { name: 'Breads & Bruschetta', slug: 'breads-bruschetta', itemCount: 3 },
        { name: 'Rice & Spice Bowls', slug: 'rice-spice-bowls', itemCount: 3 },
        { name: 'Artisan Pizzas', slug: 'artisan-pizzas', itemCount: 4 },
      ],
    },
    'pastas': {
      name: 'Pasta Lab',
      slug: 'pastas',
      description: 'Handcrafted pasta tossed in authentic made-to-order Italian reduction sauces.',
      subCategories: [
        { name: '01 Maggie, But Make It Italian', slug: '01-maggie-but-make-it-italian', itemCount: 2 },
        { name: '02 Veggie Main Character', slug: '02-veggie-main-character', itemCount: 2 },
        { name: '03 Arrabbiata Red Flag', slug: '03-arrabbiata-red-flag', itemCount: 2 },
        { name: '04 Garlic Girl Summer', slug: '04-garlic-girl-summer', itemCount: 2 },
        { name: '05 Chilly Got Personal', slug: '05-chilly-got-personal', itemCount: 2 },
        { name: '06 Alfredo\'s Comfort Zone', slug: '06-alfredo-s-comfort-zone', itemCount: 2 },
        { name: '07 Pink Sauce Problems', slug: '07-pink-sauce-problems', itemCount: 2 },
        { name: '08 Pesto Your Besto', slug: '08-pesto-your-besto', itemCount: 2 },
      ],
    },
    'dessert': {
      name: 'Dessert',
      slug: 'dessert',
      description: 'Decadent slow-baked basque cheesecakes, tiramisu after dark, and molten brownies.',
      subCategories: [
        { name: '01 Brownie', slug: '01-brownie', itemCount: 2 },
        { name: '02 Cheesecake', slug: '02-cheesecake', itemCount: 2 },
        { name: '03 Choco - Caramel Chemistry', slug: '03-choco-caramel-chemistry', itemCount: 2 },
        { name: '04 Little Miss Chocolate', slug: '04-little-miss-chocolate', itemCount: 2 },
        { name: '05 Tiramisu After Dark', slug: '05-tiramisu-after-dark', itemCount: 2 },
        { name: '06 Nutella In A Flaky Relationship', slug: '06-nutella-in-a-flaky-relationship', itemCount: 2 },
      ],
    },
    'salad': {
      name: 'Salad',
      slug: 'salad',
      description: 'Locally grown crisp greens, burrata bowls, and light citrus herb dressings.',
      subCategories: [
        { name: 'Signature Bowls & Greens', slug: 'signature-bowls-greens', itemCount: 3 },
      ],
    },
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .get(`/categories/${slug}`)
      .then((res) => {
        if (isMounted) {
          if (res.data) {
            setCategory(res.data);
          } else {
            setCategory(fallbackCategoryData[slug] || null);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          const fallback = fallbackCategoryData[slug];
          if (fallback) {
            setCategory(fallback);
          } else {
            setError(`Category '${slug}' not found.`);
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) return <Loader text="Loading sub-categories..." />;

  if (error || !category) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={Coffee}
          title="Category Not Found"
          description="The requested collection could not be loaded. Please return to the visual menu."
          actionLabel="&larr; Return to Menu"
          actionTo="/menu"
        />
      </div>
    );
  }

  // 3-column grid for Dessert as per PDF specs, 4-column grid for other categories
  const isDessert = category.name.toLowerCase().includes('dessert') || slug === 'dessert';
  const gridClasses = isDessert
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5';

  const subCategories = category.subCategories || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Navigation: ← Menu Button + Category Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage/20">
        <div className="flex items-center gap-4">
          <Button
            to="/menu"
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            &larr; Menu
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-coffee">
                Visual Menu Collection
              </span>
              <span className="text-xs text-charcoal/40">&bull;</span>
              <span className="text-xs font-medium text-forest bg-sage/20 px-2.5 py-0.5 rounded-pill">
                {subCategories.length} Sub-categories
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest mt-0.5">
              {category.name}
            </h1>
          </div>
        </div>

        {category.description && (
          <p className="text-xs sm:text-sm text-charcoal/70 max-w-sm font-sans leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Sub-Category Listing Grid (4-col / 3-col for Dessert) */}
      {subCategories.length === 0 ? (
        <EmptyState
          icon={Coffee}
          title="No Sub-categories"
          description="No sub-categories have been registered under this category yet."
          actionLabel="&larr; Return to Menu"
          actionTo="/menu"
        />
      ) : (
        <div className={gridClasses}>
          {subCategories.map((sub, idx) => {
            const subSlug = sub.slug || sub.name.toLowerCase().replace(/[\s\W-]+/g, '-');
            const itemCount = sub.menuItems ? sub.menuItems.length : (sub.itemCount || 0);

            return (
              <Link
                key={sub.id || subSlug || idx}
                to={`/menu/sub/${subSlug}`}
                className="group block"
              >
                <Card
                  variant="hoverable"
                  className="h-full flex flex-col justify-between p-6 bg-ivory border-sage/40 group-hover:border-forest/60 transition-all duration-300"
                >
                  <div>
                    {/* Index Stamp or Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-8 h-8 rounded-full bg-forest/10 text-forest text-xs font-serif font-bold flex items-center justify-center">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      <span className="text-[10px] font-semibold text-coffee bg-sage/20 px-2.5 py-0.5 rounded-pill">
                        {itemCount > 0 ? `${itemCount} Items` : 'Specialty'}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-semibold text-forest leading-snug group-hover:text-forest-dark transition-colors">
                      {sub.name}
                    </h3>

                    <p className="text-xs text-charcoal/70 mt-2 font-sans line-clamp-2">
                      Handcrafted creations prepared with custom recipes under {category.name}.
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-sage/20 flex items-center justify-between text-xs font-semibold text-forest group-hover:text-coffee transition-colors">
                    <span>View Items</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
