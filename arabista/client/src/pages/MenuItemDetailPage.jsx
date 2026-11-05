import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Plus, Minus, ShoppingBag, Coffee, Check } from 'lucide-react';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function MenuItemDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const toast = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  const fallbackItem = {
    id: id || 'item-details',
    name: 'Arabista Special Cold Brew',
    price: 320,
    category: 'The Pour',
    subCategory: { name: 'Arabista Special' },
    description:
      'Slow-steeped for 18 hours in cold filtered water. Infused with freshly crushed green cardamom and gently sweetened with condensed milk. Served over crystalline ice spheres.',
    isSignature: true,
    isAvailable: true,
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .get(`/menu-items/${id}`)
      .then((res) => {
        if (isMounted) {
          setItem(res.data || fallbackItem);
        }
      })
      .catch(() => {
        if (isMounted) {
          setItem(fallbackItem);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const currentItem = item || fallbackItem;

  const handleAdd = () => {
    if (!currentItem.isAvailable) return;
    addItem(currentItem, quantity, note.trim());
    toast.success(`Added ${quantity}x ${currentItem.name} to order`);
  };

  if (loading) return <Loader text="Loading artisanal recipe details..." />;

  const subCategoryName = currentItem.subCategory?.name || currentItem.category || 'Specialty';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <Link
        to="/menu"
        className="inline-flex items-center gap-2 text-xs font-semibold text-coffee hover:text-forest transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Menu</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Arch Shaped Photo / Monogram */}
        <div className="aspect-[4/5] arch-frame bg-sage/20 border-2 border-sage/40 flex items-center justify-center p-8 text-center shadow-soft overflow-hidden relative">
          {currentItem.imageUrl ? (
            <img
              src={currentItem.imageUrl}
              alt={currentItem.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-forest">
              <Coffee className="w-16 h-16 mb-2 text-coffee" />
              <span className="font-serif text-3xl font-bold tracking-tight">
                ARABISTA
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-coffee mt-1">
                Surat &bull; Gujarat
              </span>
            </div>
          )}

          {currentItem.isSignature && (
            <span className="absolute top-4 right-4 px-3 py-1 rounded-pill bg-forest text-ivory text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-coffee" />
              Signature
            </span>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-sage/20 text-forest text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-coffee" />
              {subCategoryName}
            </span>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-forest leading-tight">
              {currentItem.name}
            </h1>

            <p className="text-3xl font-serif font-bold text-coffee mt-2">
              &#8377;{currentItem.price}
            </p>
          </div>

          <p className="text-sm md:text-base text-charcoal/80 leading-relaxed font-sans">
            {currentItem.description || 'Authentic specialty handcrafted fresh to order in our kitchen.'}
          </p>

          {/* Quantity Stepper & Notes */}
          <div className="space-y-4 pt-4 border-t border-sage/20">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase text-charcoal/70">Quantity:</span>
              <div className="flex items-center border border-sage/40 rounded-pill bg-ivory shadow-inner-soft">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-forest hover:text-coffee transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-forest">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 text-forest hover:text-coffee transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-charcoal/70 mb-1">
                Kitchen Instructions (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Oat milk, less ice, extra hot..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={handleAdd}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              disabled={!currentItem.isAvailable}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {currentItem.isAvailable ? `Add to Order (₹${currentItem.price * quantity})` : 'Currently Sold Out'}
            </Button>

            <Button to="/cart" variant="outline" size="lg" className="w-full sm:w-auto">
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              View Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
