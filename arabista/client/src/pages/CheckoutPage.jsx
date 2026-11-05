import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UtensilsCrossed,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  User,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import SectionHeading from '../components/common/SectionHeading';
import api from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const {
    items,
    subtotal,
    totalItems,
    clearCart,
    hasUnavailableItems,
    removeUnavailableItems,
    tableNumber: contextTable,
    setTableNumber: setContextTable,
    refreshAvailability,
  } = useCart();

  // Form states
  const [orderType, setOrderType] = useState('DINE_IN');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [diningNotes, setDiningNotes] = useState('');

  // UI status states
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Success modal states
  const [placedOrder, setPlacedOrder] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isQrScanned, setIsQrScanned] = useState(false);

  // Sync latest menu item availability from DB on mount
  useEffect(() => {
    refreshAvailability();
  }, []);

  // Check URL param ?table=5 and context table on mount
  useEffect(() => {
    const urlTable = searchParams.get('table');
    if (urlTable && urlTable.trim().length > 0) {
      const clean = urlTable.trim();
      setTableNumber(clean);
      setContextTable(clean);
      setOrderType('DINE_IN');
      setIsQrScanned(true);
    } else if (contextTable && contextTable.trim().length > 0) {
      setTableNumber(contextTable.trim());
      setOrderType('DINE_IN');
    }
  }, [searchParams, contextTable]);

  // Countdown timer for auto-redirect upon success
  useEffect(() => {
    if (!placedOrder) return;

    if (countdown <= 0) {
      navigate(`/track/${placedOrder.orderNumber}`);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [placedOrder, countdown, navigate]);

  // Redirect to cart if user has no items and hasn't placed order
  useEffect(() => {
    if (items.length === 0 && !placedOrder) {
      navigate('/cart');
    }
  }, [items.length, placedOrder, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (orderType === 'DINE_IN') {
      if (!tableNumber.trim()) {
        newErrors.tableNumber = 'Table number is required for dine-in orders';
      }
    }

    if (!customerName.trim()) {
      newErrors.customerName = 'Please enter your name';
    } else if (customerName.trim().length < 2) {
      newErrors.customerName = 'Name must be at least 2 characters';
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      newErrors.phone = 'Please enter your contact phone number';
    } else if (!/^[0-9+\s\-]{7,15}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid phone number (7 to 15 digits)';
    }

    if (items.length === 0) {
      newErrors.cart = 'Your cart is empty';
    }

    if (hasUnavailableItems) {
      newErrors.availability = 'Please remove sold-out items before placing your order';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      toast.error('Please resolve the errors highlighted below.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        type: orderType,
        tableNumber: orderType === 'DINE_IN' ? tableNumber.trim() : undefined,
        customerName: customerName.trim(),
        phone: phone.trim(),
        items: items.map((i) => ({
          menuItemId: i.id,
          quantity: i.quantity,
        })),
      };

      const res = await api.post('/orders', payload);
      const createdOrder = res.data || res;

      // Clear the cart on successful placement
      clearCart();
      toast.success(`Order ${createdOrder.orderNumber} placed successfully!`);

      // Store in recent orders for quick tracking
      try {
        const recentStr = localStorage.getItem('arabista_recent_orders');
        const recent = recentStr ? JSON.parse(recentStr) : [];
        const filtered = recent.filter((r) => r.orderNumber !== createdOrder.orderNumber);
        const updated = [
          {
            orderNumber: createdOrder.orderNumber,
            customerName: createdOrder.customerName,
            type: createdOrder.type,
            tableNumber: createdOrder.tableNumber,
            total: createdOrder.total,
            createdAt: createdOrder.createdAt || new Date().toISOString(),
          },
          ...filtered,
        ].slice(0, 5);
        localStorage.setItem('arabista_recent_orders', JSON.stringify(updated));
      } catch (e) {
        // Ignore localStorage error
      }

      // Store table number for future orders if Dine-In
      if (orderType === 'DINE_IN') {
        setContextTable(tableNumber.trim());
      }

      setPlacedOrder(createdOrder);
    } catch (err) {
      const errMsg = err.message || 'Failed to submit order. Please check item availability.';
      setServerError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyOrderNumber = () => {
    if (!placedOrder?.orderNumber) return;
    navigator.clipboard.writeText(placedOrder.orderNumber);
    setCopiedCode(true);
    toast.success('Order number copied to clipboard');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // SUCCESS CONFIRMATION VIEW / MODAL
  if (placedOrder) {
    return (
      <Container className="py-12 md:py-20 max-w-2xl">
        <Card className="p-8 md:p-12 text-center bg-ivory border-forest/30 shadow-soft space-y-6">
          <div className="w-20 h-20 rounded-full bg-forest text-ivory flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-coffee" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-coffee bg-sage/20 px-3 py-1 rounded-pill">
              <Sparkles className="w-3.5 h-3.5 text-coffee" />
              Kitchen Confirmed
            </span>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-forest">
              Order Received!
            </h1>

            <p className="text-sm text-charcoal/75 max-w-md mx-auto font-sans leading-relaxed">
              Chef Arabito and the team have received your artisanal ticket. Your order is being freshly prepared.
            </p>
          </div>

          {/* Order Code Box */}
          <div className="p-6 rounded-3xl bg-sage/15 border border-sage/40 max-w-sm mx-auto">
            <span className="text-xs uppercase tracking-widest text-charcoal/60 font-semibold block mb-1">
              Your Order Code
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-forest tracking-wider">
                {placedOrder.orderNumber}
              </span>
              <button
                onClick={handleCopyOrderNumber}
                className="p-2 rounded-full bg-ivory hover:bg-forest hover:text-ivory text-charcoal/70 transition-colors shadow-sm"
                title="Copy order code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-forest" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Summary Details */}
          <div className="p-4 rounded-2xl bg-ivory border border-sage/30 text-left text-xs sm:text-sm space-y-2 max-w-md mx-auto">
            <div className="flex justify-between text-charcoal/80">
              <span>Dining Mode:</span>
              <span className="font-semibold text-forest">
                {placedOrder.type === 'DINE_IN' ? `Dine-In (Table ${placedOrder.tableNumber})` : 'Takeaway (Counter)'}
              </span>
            </div>
            <div className="flex justify-between text-charcoal/80">
              <span>Guest Name:</span>
              <span className="font-medium text-charcoal">{placedOrder.customerName}</span>
            </div>
            <div className="flex justify-between text-charcoal/80">
              <span>Total Amount:</span>
              <span className="font-serif font-bold text-coffee text-base">&#8377;{placedOrder.total}</span>
            </div>
          </div>

          {/* Redirect Notice & Button */}
          <div className="pt-4 space-y-3">
            <p className="text-xs text-charcoal/60 font-sans">
              Redirecting to live order tracking in <span className="font-bold text-forest">{countdown}s</span>...
            </p>

            <Button
              to={`/track/${placedOrder.orderNumber}`}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Track Order Live &rarr;
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-16 max-w-5xl">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-coffee hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Order Bag</span>
        </Link>
      </div>

      <SectionHeading
        eyebrow="Dining Checkout"
        title="Complete Your Order"
        subtitle="Specify your dining preference and contact details for live kitchen tracking."
        align="left"
      />

      {/* Global Server Error Banner */}
      {serverError && (
        <div className="mb-8 p-4 rounded-2xl bg-coffee/15 border border-coffee/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-coffee shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm text-charcoal">
            <span className="font-bold text-coffee block">Order Submission Error</span>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      {/* Unavailable Items Warning */}
      {hasUnavailableItems && (
        <div className="mb-8 p-4 rounded-2xl bg-coffee/15 border border-coffee/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-charcoal">
            <AlertCircle className="w-5 h-5 text-coffee shrink-0" />
            <span>Some items in your order are sold out. Remove them to place your order.</span>
          </div>
          <button
            onClick={removeUnavailableItems}
            className="px-4 py-2 rounded-pill bg-coffee text-ivory text-xs font-semibold hover:bg-coffee/90 transition-all shadow-sm shrink-0"
          >
            Remove Sold Out Items
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs (7 Columns) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Card 1: Dining Preference */}
          <Card className="p-6 md:p-8 bg-ivory border-sage/30 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-forest">
                1. Dining Preference
              </h2>
              {isQrScanned && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-pill bg-sage/20 text-forest text-xs font-semibold">
                  <MapPin className="w-3 h-3 text-coffee" />
                  QR Scan Detected
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOrderType('DINE_IN')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  orderType === 'DINE_IN'
                    ? 'border-forest bg-forest text-ivory shadow-soft'
                    : 'border-sage/40 bg-ivory text-charcoal hover:border-forest/50'
                }`}
              >
                <UtensilsCrossed className="w-5 h-5" />
                <span className="text-sm font-semibold">Dine-In</span>
                <span className="text-[11px] opacity-80 font-sans">Served at your table</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('TAKEAWAY')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  orderType === 'TAKEAWAY'
                    ? 'border-forest bg-forest text-ivory shadow-soft'
                    : 'border-sage/40 bg-ivory text-charcoal hover:border-forest/50'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm font-semibold">Takeaway</span>
                <span className="text-[11px] opacity-80 font-sans">Pickup from counter</span>
              </button>
            </div>

            {/* Table Number Input for Dine-In */}
            {orderType === 'DINE_IN' ? (
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
                  Table Number <span className="text-coffee">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => {
                      setTableNumber(e.target.value);
                      if (errors.tableNumber) {
                        setErrors((prev) => ({ ...prev, tableNumber: null }));
                      }
                    }}
                    placeholder="e.g. 04, Table 5, or Patio 2"
                    disabled={submitting}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-ivory text-charcoal focus:outline-none ${
                      errors.tableNumber
                        ? 'border-coffee focus:border-coffee'
                        : 'border-sage/40 focus:border-forest'
                    }`}
                  />
                </div>
                {errors.tableNumber && (
                  <p className="text-xs text-coffee mt-1 font-medium">{errors.tableNumber}</p>
                )}
                {isQrScanned && (
                  <p className="text-[11px] text-charcoal/60 mt-1">
                    Pre-filled from your scanned table QR code. You can update this if you changed tables.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-sage/15 border border-sage/30 text-xs text-charcoal/80">
                <p className="font-semibold text-forest">Takeaway Counter Pickup</p>
                <p className="mt-0.5">
                  Your drinks and bakes will be boxed and held ready at the Arabista front counter.
                </p>
              </div>
            )}
          </Card>

          {/* Card 2: Guest Information */}
          <Card className="p-6 md:p-8 bg-ivory border-sage/30 space-y-5">
            <h2 className="font-serif text-xl font-bold text-forest">
              2. Guest Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
                  Full Name <span className="text-coffee">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) {
                        setErrors((prev) => ({ ...prev, customerName: null }));
                      }
                    }}
                    placeholder="e.g. Aarav Patel"
                    disabled={submitting}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-ivory text-charcoal focus:outline-none ${
                      errors.customerName
                        ? 'border-coffee focus:border-coffee'
                        : 'border-sage/40 focus:border-forest'
                    }`}
                  />
                </div>
                {errors.customerName && (
                  <p className="text-xs text-coffee mt-1 font-medium">{errors.customerName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
                  Phone Number <span className="text-coffee">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) {
                        setErrors((prev) => ({ ...prev, phone: null }));
                      }
                    }}
                    placeholder="+91 98765 43210"
                    disabled={submitting}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-ivory text-charcoal focus:outline-none ${
                      errors.phone
                        ? 'border-coffee focus:border-coffee'
                        : 'border-sage/40 focus:border-forest'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-coffee mt-1 font-medium">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Special Instructions / Notes */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
                Special Dining Request (Optional)
              </label>
              <textarea
                value={diningNotes}
                onChange={(e) => setDiningNotes(e.target.value)}
                placeholder="Any special kitchen notes or requests (e.g., anniversary celebration, bring dessert together)..."
                rows={2}
                disabled={submitting}
                className="w-full px-4 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal text-xs placeholder:text-charcoal/40 focus:outline-none focus:border-forest resize-none"
              />
            </div>
          </Card>
        </div>

        {/* Order Review & Payment Card (5 Columns) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-28 space-y-4">
          <Card className="p-6 md:p-8 bg-ivory border-sage/40 space-y-6">
            <h3 className="font-serif text-xl font-bold text-forest pb-3 border-b border-sage/20">
              Order Review
            </h3>

            {/* Items summary */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex-1">
                    <span className="font-semibold text-forest">
                      {item.quantity}x {item.name}
                    </span>
                    {item.notes && (
                      <p className="text-[11px] text-charcoal/60 italic mt-0.5">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                    {item.isAvailable === false && (
                      <span className="text-[10px] text-coffee font-semibold block mt-0.5">
                        Sold Out
                      </span>
                    )}
                  </div>
                  <span className="font-serif font-bold text-coffee shrink-0">
                    &#8377;{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="pt-4 border-t border-sage/20 space-y-2 text-xs">
              <div className="flex justify-between text-charcoal/80">
                <span>Items Subtotal</span>
                <span>&#8377;{subtotal}</span>
              </div>
              <div className="flex justify-between text-charcoal/80">
                <span>Taxes &amp; Service</span>
                <span className="text-forest font-semibold">Included</span>
              </div>
              <div className="pt-3 border-t border-sage/20 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-semibold text-charcoal/70 block">
                    Total Due
                  </span>
                  <p className="text-3xl font-serif font-bold text-coffee mt-0.5">
                    &#8377;{subtotal}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={submitting}
              disabled={submitting || hasUnavailableItems || items.length === 0}
            >
              {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
              {!submitting && <ArrowRight className="w-4 h-4 ml-1.5" />}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal/60 text-center font-sans">
              <Clock className="w-3.5 h-3.5 text-coffee shrink-0" />
              <span>Direct kitchen push with real-time status updates</span>
            </div>
          </Card>
        </div>
      </form>
    </Container>
  );
}
