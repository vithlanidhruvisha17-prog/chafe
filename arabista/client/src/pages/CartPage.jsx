import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileText,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    updateItemNotes,
    removeItem,
    clearCart,
    subtotal,
    totalItems,
    hasUnavailableItems,
    removeUnavailableItems,
    tableNumber,
    refreshAvailability,
  } = useCart();

  useEffect(() => {
    refreshAvailability();
  }, []);

  if (items.length === 0) {
    return (
      <Container className="py-16 md:py-24">
        <EmptyState
          icon={ShoppingBag}
          title="Your Order Bag is Empty"
          description="Explore our single-origin pour-overs, chilled tonics, sourdough artisan pizzas, and decadent desserts to curate your order."
          actionLabel="Explore Visual Menu"
          actionTo="/menu"
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-16 max-w-5xl">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage/20 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-coffee hover:text-forest transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Ordering</span>
            </Link>

            {tableNumber && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-sage/20 text-forest text-xs font-semibold">
                <MapPin className="w-3 h-3 text-coffee" />
                Table {tableNumber} (QR Scanned)
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-forest mt-1.5">
            Your Order Bag
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-0.5 font-sans">
            Review your artisanal selections and specify custom kitchen requests before checkout.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-charcoal/60 hover:text-coffee transition-colors self-start sm:self-auto"
        >
          Clear Entire Bag
        </button>
      </div>

      {/* Unavailable Items Warning Banner */}
      {hasUnavailableItems && (
        <div className="mb-8 p-4 rounded-2xl bg-coffee/15 border border-coffee/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-charcoal">
            <AlertCircle className="w-5 h-5 text-coffee shrink-0" />
            <span>
              Some items in your cart are currently marked sold out by the kitchen. Please remove them before proceeding.
            </span>
          </div>
          <button
            onClick={removeUnavailableItems}
            className="px-4 py-2 rounded-pill bg-coffee text-ivory text-xs font-semibold hover:bg-coffee/90 transition-all shrink-0 shadow-sm"
          >
            Remove Sold Out Items
          </button>
        </div>
      )}

      {/* Main Content: Left Items List + Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List (8 Columns) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {items.map((item) => {
            const isUnavailable = item.isAvailable === false;

            return (
              <Card
                key={item.id}
                className={`p-5 md:p-6 transition-all ${
                  isUnavailable
                    ? 'bg-charcoal/5 border-charcoal/20 opacity-80'
                    : 'bg-ivory border-sage/30 hover:border-sage/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg md:text-xl font-bold text-forest">
                        {item.name}
                      </h3>
                      {item.isSignature && (
                        <span className="text-[10px] bg-sage/25 text-forest font-bold px-2 py-0.5 rounded-pill flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-coffee" />
                          Signature
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-coffee">
                        &#8377;{item.price} each
                      </span>
                      {isUnavailable && (
                        <span className="text-[11px] font-semibold text-charcoal bg-charcoal/10 px-2.5 py-0.5 rounded-pill border border-charcoal/20">
                          Currently Sold Out
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-charcoal/70 line-clamp-2 mt-1.5 font-sans leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Quantity Stepper & Item Total */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
                    <div className="flex items-center border border-sage/40 rounded-pill bg-ivory shadow-inner-soft">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-forest hover:text-coffee transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3.5 text-xs font-bold text-forest">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isUnavailable}
                        className="p-2 text-forest hover:text-coffee disabled:text-charcoal/30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-serif text-lg md:text-xl font-bold text-forest">
                        &#8377;{item.price * item.quantity}
                      </span>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-charcoal/40 hover:text-coffee p-1 transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Kitchen Special Note Input */}
                <div className="mt-4 pt-3.5 border-t border-sage/20">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-coffee mt-1 shrink-0" />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => updateItemNotes(item.id, e.target.value)}
                        placeholder="Add kitchen instructions (e.g., oat milk, extra hot, less sugar, no ice)..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-sage/40 bg-ivory text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-forest"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Order Summary Card (4 Columns) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-28 space-y-4">
          <Card className="p-6 md:p-8 bg-ivory border-sage/40 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-forest pb-3 border-b border-sage/20">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-charcoal/80">
                <span>Items Subtotal ({totalItems})</span>
                <span className="font-semibold text-charcoal">&#8377;{subtotal}</span>
              </div>

              <div className="flex items-center justify-between text-charcoal/80">
                <span>Café Taxes &amp; GST</span>
                <span className="text-xs font-semibold text-forest bg-sage/20 px-2 py-0.5 rounded-pill">
                  Included
                </span>
              </div>

              <div className="flex items-center justify-between text-charcoal/80">
                <span>Estimated Prep Time</span>
                <span className="text-xs font-medium text-charcoal/70">10 &ndash; 15 mins</span>
              </div>

              <div className="pt-4 border-t border-sage/20 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-charcoal/70 block">
                    Total Payable
                  </span>
                  <p className="text-3xl font-serif font-bold text-coffee">
                    &#8377;{subtotal}
                  </p>
                </div>
              </div>
            </div>

            {hasUnavailableItems && (
              <p className="text-xs text-coffee font-medium">
                Please remove sold out items from your bag before checking out.
              </p>
            )}

            <Button
              onClick={() => navigate('/checkout')}
              variant="primary"
              size="lg"
              className="w-full"
              disabled={hasUnavailableItems}
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <p className="text-[11px] text-charcoal/60 text-center font-sans">
              Orders are prepared fresh. You can track your kitchen status live right after placing the order.
            </p>
          </Card>
        </div>
      </div>
    </Container>
  );
}
