import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Coffee,
  Plus,
  Sparkles,
  CheckCircle2,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function SubCategoryItemsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, items: cartItems } = useCart();
  const toast = useToast();

  const [subCategory, setSubCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper fallback items when testing before DB is populated
  const fallbackSubCategoryItems = {
    'signature-latte': {
      name: 'Signature Latte',
      parentCategory: 'The Pour',
      parentSlug: 'the-pour',
      menuItems: [
        {
          id: 'sig-latte-1',
          name: 'Classic Signature Latte',
          description: 'Velvety espresso harmonized with steamed whole milk and our signature slow-reduced secret syrup.',
          price: 270,
          isAvailable: true,
          isSignature: true,
        },
        {
          id: 'sig-latte-2',
          name: 'Vanilla Bean Signature Latte',
          description: 'Double ristretto infused with Madagascar bourbon vanilla bean infusion.',
          price: 290,
          isAvailable: true,
          isSignature: true,
        },
        {
          id: 'sig-latte-3',
          name: 'Roasted Hazelnut Latte',
          description: 'Steamed milk gently folded with slow-roasted Piedmont hazelnut puree and espresso.',
          price: 300,
          isAvailable: false,
          isSignature: false,
        },
      ],
    },
    'arabista-special': {
      name: 'Arabista Special',
      parentCategory: 'The Pour',
      parentSlug: 'the-pour',
      menuItems: [
        {
          id: 'arabista-sp-1',
          name: 'Arabista Special Iced Brew',
          description: 'Our crowned house brew pulled over crystal ice with roasted cardamom and sweet condensed milk.',
          price: 320,
          isAvailable: true,
          isSignature: true,
        },
      ],
    },
    'artisan-pizzas': {
      name: 'Artisan Pizzas',
      parentCategory: 'Food',
      parentSlug: 'food',
      menuItems: [
        {
          id: 'pizza-1',
          name: 'Margherita Fior di Latte',
          description: '48-hour fermented sourdough crust, San Marzano pomodoro, fresh fior di latte, and torn basil.',
          price: 650,
          isAvailable: true,
          isSignature: true,
        },
        {
          id: 'pizza-2',
          name: 'Truffle Mushroom & Burrata',
          description: 'Sourdough bianca base, roasted wild mushrooms, truffle oil, and creamy artisanal burrata.',
          price: 720,
          isAvailable: true,
          isSignature: false,
        },
      ],
    },
    '05-tiramisu-after-dark': {
      name: '05 Tiramisu After Dark',
      parentCategory: 'Dessert',
      parentSlug: 'dessert',
      menuItems: [
        {
          id: 'tiramisu-1',
          name: 'Tiramisu After Dark',
          description: 'Ladyfingers submerged in double espresso and aged coffee syrup, folded in velvety mascarpone cream.',
          price: 340,
          isAvailable: true,
          isSignature: true,
        },
      ],
    },
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .get(`/subcategories/${slug}`)
      .then((res) => {
        if (isMounted) {
          if (res.data) {
            setSubCategory(res.data);
          } else {
            setSubCategory(fallbackSubCategoryItems[slug] || null);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          const fallback = fallbackSubCategoryItems[slug];
          if (fallback) {
            setSubCategory(fallback);
          } else {
            setError(`Sub-category '${slug}' not found.`);
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

  const handleAddToCart = (item) => {
    if (!item.isAvailable) return;
    addItem(item, 1);
    toast.success(`Added ${item.name} to order`);
  };

  if (loading) return <Loader text="Loading menu items..." />;

  if (error || !subCategory) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={Coffee}
          title="Collection Not Found"
          description="The requested sub-category items could not be loaded."
          actionLabel="&larr; Back to Visual Menu"
          actionTo="/menu"
        />
      </div>
    );
  }

  const parentSlug = subCategory.category?.slug || subCategory.parentSlug || 'the-pour';
  const parentName = subCategory.category?.name || subCategory.parentCategory || 'Category';
  const menuItems = subCategory.menuItems || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage/20">
        <div className="flex items-center gap-4">
          <Button
            to={`/menu/category/${parentSlug}`}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            &larr; {parentName}
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-coffee">
                {parentName} Collection
              </span>
              <span className="text-xs text-charcoal/40">&bull;</span>
              <span className="text-xs font-medium text-forest bg-sage/20 px-2.5 py-0.5 rounded-pill">
                {menuItems.length} {menuItems.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest mt-0.5">
              {subCategory.name}
            </h1>
          </div>
        </div>

        <Link
          to="/cart"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-forest text-ivory text-xs font-medium shadow-soft hover:bg-forest/90 transition-all self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4 text-coffee" />
          <span>View Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
        </Link>
      </div>

      {/* Items Grid */}
      {menuItems.length === 0 ? (
        <EmptyState
          icon={Coffee}
          title="No Items Found"
          description="Currently no menu items are listed under this sub-category. Check back soon."
          actionLabel={`&larr; Return to ${parentName}`}
          actionTo={`/menu/category/${parentSlug}`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card
              key={item.id}
              className={`flex flex-col justify-between p-6 bg-ivory border transition-all duration-300 ${
                item.isAvailable
                  ? 'border-sage/40 hover:shadow-soft-hover hover:border-sage/70'
                  : 'border-sage/20 opacity-80'
              }`}
            >
              <div>
                {/* Header: Name + Availability Status Badge */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-serif text-xl font-bold text-forest leading-snug">
                    {item.name}
                  </h3>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-pill shrink-0 uppercase tracking-wider ${
                      item.isAvailable
                        ? 'bg-forest/15 text-forest border border-forest/20'
                        : 'bg-charcoal/10 text-charcoal/60 border border-charcoal/20'
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-forest" />
                        Available
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-charcoal/50" />
                        Sold Out
                      </>
                    )}
                  </span>
                </div>

                {item.isSignature && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-coffee bg-sage/20 px-2.5 py-0.5 rounded-pill mb-3">
                    <Sparkles className="w-3 h-3 text-coffee" />
                    Signature Creation
                  </div>
                )}

                <p className="text-xs text-charcoal/75 leading-relaxed font-sans mt-1">
                  {item.description || 'Authentic specialty prepared to order by our kitchen.'}
                </p>
              </div>

              {/* Price & Action Button */}
              <div className="mt-6 pt-4 border-t border-sage/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-charcoal/60 uppercase font-semibold">Price</span>
                  <p className="font-serif text-2xl font-bold text-coffee leading-tight">
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
                  {item.isAvailable ? 'Add to Cart' : 'Sold Out'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
