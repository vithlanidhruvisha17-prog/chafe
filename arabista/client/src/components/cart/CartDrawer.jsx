import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../common/Button';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    updateItemNotes,
    removeItem,
    clearCart,
    subtotal,
    totalItems,
    hasUnavailableItems,
    removeUnavailableItems,
  } = useCart();

  // Track which item has the note input open
  const [activeNoteItemId, setActiveNoteItemId] = useState(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleCheckoutClick = () => {
    if (hasUnavailableItems) return;
    closeDrawer();
    navigate('/checkout');
  };

  const handleViewBagClick = () => {
    closeDrawer();
    navigate('/cart');
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-ivory text-charcoal h-full shadow-2xl flex flex-col z-10 border-l border-sage/30 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-sage/20 flex items-center justify-between bg-ivory/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest text-ivory flex items-center justify-center font-serif text-lg font-bold">
              <ShoppingBag className="w-5 h-5 text-coffee" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-forest leading-none">
                Your Order Bag
              </h2>
              <span className="text-xs text-charcoal/60 mt-1 inline-block">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
              </span>
            </div>
          </div>

          <button
            onClick={closeDrawer}
            className="p-2 rounded-full text-charcoal/60 hover:text-charcoal hover:bg-sage/20 transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unavailable items alert banner */}
        {hasUnavailableItems && (
          <div className="px-6 py-3 bg-coffee/15 border-b border-coffee/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-charcoal">
              <AlertCircle className="w-4 h-4 text-coffee shrink-0" />
              <span>Some items in your bag are currently sold out.</span>
            </div>
            <button
              onClick={removeUnavailableItems}
              className="text-xs font-semibold text-coffee hover:underline shrink-0"
            >
              Remove
            </button>
          </div>
        )}

        {/* Drawer Body (Items List) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-sage/20 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-forest" />
              </div>
              <h3 className="font-serif text-lg font-bold text-forest">
                Your order bag is empty
              </h3>
              <p className="text-xs text-charcoal/70 max-w-xs mt-1.5 leading-relaxed font-sans">
                Explore our artisanal brews, cold tonics, hand-crafted pastas, and fresh bakes to fill it.
              </p>
              <Button
                to="/menu"
                onClick={closeDrawer}
                variant="primary"
                size="sm"
                className="mt-6"
              >
                Explore Menu
              </Button>
            </div>
          ) : (
            items.map((item) => {
              const isUnavailable = item.isAvailable === false;
              const hasNotes = Boolean(item.notes && item.notes.trim().length > 0);
              const isEditingNote = activeNoteItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUnavailable
                      ? 'bg-charcoal/5 border-charcoal/20 opacity-80'
                      : 'bg-ivory border-sage/30 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-base font-semibold text-forest leading-snug">
                          {item.name}
                        </h4>
                        {item.isSignature && (
                          <span className="text-[9px] bg-sage/25 text-forest font-bold px-1.5 py-0.5 rounded-pill">
                            Signature
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-coffee">
                          &#8377;{item.price} each
                        </span>
                        {isUnavailable && (
                          <span className="text-[10px] bg-charcoal/10 text-charcoal font-semibold px-2 py-0.5 rounded-pill">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-charcoal/40 hover:text-coffee p-1 transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="mt-3.5 pt-3 border-t border-sage/20 flex items-center justify-between">
                    <div className="flex items-center border border-sage/40 rounded-pill bg-ivory">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-forest hover:text-coffee transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-forest">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isUnavailable}
                        className="p-1.5 text-forest hover:text-coffee disabled:text-charcoal/30 disabled:hover:text-charcoal/30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-serif text-base font-bold text-forest">
                      &#8377;{item.price * item.quantity}
                    </span>
                  </div>

                  {/* Kitchen Special Note / Instruction */}
                  <div className="mt-3 pt-2">
                    {isEditingNote ? (
                      <div className="space-y-1.5">
                        <textarea
                          value={item.notes || ''}
                          onChange={(e) => updateItemNotes(item.id, e.target.value)}
                          placeholder="Kitchen request (e.g., less ice, oat milk, extra hot)..."
                          rows={2}
                          className="w-full text-xs p-2 rounded-xl border border-sage/50 bg-ivory text-charcoal focus:outline-none focus:border-forest resize-none"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => setActiveNoteItemId(null)}
                            className="text-[11px] font-semibold text-forest hover:underline"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveNoteItemId(item.id)}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-charcoal/70 hover:text-coffee transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-coffee" />
                        <span>
                          {hasNotes ? `Note: "${item.notes}"` : '+ Add kitchen note'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-sage/25 bg-ivory space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-charcoal/70 font-medium">
                <span>Subtotal ({totalItems} items)</span>
                <span>&#8377;{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-charcoal/70 font-medium">
                <span>Café Taxes &amp; Service</span>
                <span>Included</span>
              </div>
              <div className="flex items-center justify-between text-lg font-serif font-bold text-forest pt-2 border-t border-sage/20">
                <span>Total Payable</span>
                <span className="text-2xl text-coffee">&#8377;{subtotal}</span>
              </div>
            </div>

            {hasUnavailableItems && (
              <p className="text-[11px] text-coffee text-center font-medium">
                Please remove sold out items to proceed to checkout.
              </p>
            )}

            <div className="space-y-2">
              <Button
                onClick={handleCheckoutClick}
                variant="primary"
                size="lg"
                className="w-full"
                disabled={hasUnavailableItems}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleViewBagClick}
                  className="text-xs font-semibold text-forest hover:text-coffee transition-colors"
                >
                  View Full Cart Page &rarr;
                </button>
                <button
                  onClick={clearCart}
                  className="text-xs text-charcoal/50 hover:text-coffee transition-colors"
                >
                  Clear Bag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
