import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  X,
  Copy,
  Check,
  Clock,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  ArrowRight,
  Printer,
  Share2,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import SectionHeading from '../components/common/SectionHeading';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ChefArabitoMascot from '../components/tracking/ChefArabitoMascot';
import LiveStatusStepper from '../components/tracking/LiveStatusStepper';
import { useToast } from '../context/ToastContext';
import api, { API_BASE_URL } from '../services/api';

export default function OrderTrackingPage() {
  const { orderNumber: paramOrderNumber } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [inputCode, setInputCode] = useState(paramOrderNumber || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(paramOrderNumber));
  const [error, setError] = useState(null);
  const [isLiveSSE, setIsLiveSSE] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);

  // Ref to hold eventSource instance
  const eventSourceRef = useRef(null);
  const pollingTimerRef = useRef(null);

  // Load recent orders from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('arabista_recent_orders');
      if (stored) {
        setRecentOrders(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Update inputCode when URL param changes
  useEffect(() => {
    if (paramOrderNumber) {
      setInputCode(paramOrderNumber.toUpperCase());
    }
  }, [paramOrderNumber]);

  // Main effect: Fetch initial order & establish live SSE feed when paramOrderNumber changes
  useEffect(() => {
    if (!paramOrderNumber) {
      setOrder(null);
      setLoading(false);
      setError(null);
      return;
    }

    const cleanCode = paramOrderNumber.trim().toUpperCase();
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Helper to start fallback polling if SSE disconnects or fails
    const startPolling = () => {
      if (pollingTimerRef.current) return;
      setIsLiveSSE(false);

      pollingTimerRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/orders/track/${cleanCode}`);
          if (isMounted && res.data) {
            setOrder((prev) => {
              if (prev && prev.status !== res.data.status) {
                toast.info(`Order status updated to ${res.data.status}`);
              }
              return res.data;
            });
          }
        } catch {
          // Keep current state on transient polling error
        }
      }, 6000);
    };

    // Helper to stop polling
    const stopPolling = () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };

    // 1. Initial REST fetch for instant rendering
    api
      .get(`/orders/track/${cleanCode}`)
      .then((res) => {
        if (isMounted) {
          setOrder(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || `Order '${cleanCode}' could not be located.`);
          setLoading(false);
        }
      });

    // 2. Establish Server-Sent Events (SSE) live stream
    try {
      const sseUrl = `${API_BASE_URL}/orders/track/${cleanCode}/live`;
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        if (isMounted) {
          setIsLiveSSE(true);
          stopPolling();
        }
      };

      // Handle initial state snapshot
      es.addEventListener('initial_state', (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          setOrder(data);
          setError(null);
          setLoading(false);
        } catch {
          // Ignore parse errors
        }
      });

      // Handle live status transitions broadcasted by admin
      es.addEventListener('status_update', (event) => {
        if (!isMounted) return;
        try {
          const updated = JSON.parse(event.data);
          setOrder((prev) => {
            if (prev && prev.status !== updated.status) {
              toast.success(`Kitchen update: Order is now ${updated.status}!`);
            }
            return updated;
          });
        } catch {
          // Ignore parse errors
        }
      });

      es.onmessage = (event) => {
        if (!isMounted || !event.data) return;
        try {
          const data = JSON.parse(event.data);
          setOrder(data);
        } catch {
          // Heartbeat or comment
        }
      };

      es.onerror = () => {
        // SSE connection dropped; initiate automatic polling fallback
        if (isMounted) {
          es.close();
          startPolling();
        }
      };
    } catch {
      startPolling();
    }

    return () => {
      isMounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      stopPolling();
    };
  }, [paramOrderNumber]);

  // Handle Search Submission
  const handleSearch = (e) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (clean) {
      navigate(`/track/${clean}`);
    }
  };

  const handleCopyOrderNumber = () => {
    if (!order?.orderNumber) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopiedCode(true);
    toast.success('Order number copied to clipboard');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Arabista Order #${order?.orderNumber}`,
        text: `Track my Arabista order #${order?.orderNumber} live!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Tracking link copied to clipboard');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Container className="py-10 md:py-16 max-w-4xl space-y-10">
      {/* Page Title & Search Bar */}
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Live Station Feed"
          title="Order Tracking"
          subtitle="Real-time preparation updates streaming directly from Chef Arabito's station."
        />

        {/* Order Code Search Form */}
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="w-5 h-5 text-charcoal/40 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Enter Order Code (e.g. ARB-7492)"
              className="w-full pl-12 pr-28 py-3.5 rounded-full border border-sage/40 bg-ivory text-charcoal font-mono uppercase placeholder:text-charcoal/40 text-sm focus:outline-none focus:border-forest shadow-sm tracking-wider"
            />
            {inputCode && (
              <button
                type="button"
                onClick={() => setInputCode('')}
                className="absolute right-24 p-1 text-charcoal/40 hover:text-charcoal transition-colors"
                aria-label="Clear order code"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="absolute right-1.5"
            >
              Track
            </Button>
          </form>

          {/* Quick-Click Recent Orders (if user placed orders in this browser) */}
          {recentOrders.length > 0 && !paramOrderNumber && (
            <div className="mt-4 text-center">
              <span className="text-[11px] uppercase font-semibold text-charcoal/60 tracking-wider block mb-2">
                Recent Orders On This Device
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {recentOrders.map((ro) => (
                  <button
                    key={ro.orderNumber}
                    onClick={() => navigate(`/track/${ro.orderNumber}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-sage/20 hover:bg-forest hover:text-ivory text-forest text-xs font-semibold transition-all border border-sage/30 shadow-sm"
                  >
                    <span className="font-mono">{ro.orderNumber}</span>
                    <span className="text-charcoal/40 group-hover:text-ivory/60">&bull;</span>
                    <span className="text-[10px]">
                      {ro.type === 'DINE_IN' ? `Table ${ro.tableNumber || ''}` : 'Takeaway'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: No Order Code Entered (Landing State) */}
      {!paramOrderNumber && (
        <div className="space-y-8 pt-4">
          <ChefArabitoMascot
            status="PLACED"
            orderType="DINE_IN"
            tableNumber="Your Table"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center space-y-2 bg-ivory border-sage/30">
              <div className="w-10 h-10 rounded-full bg-forest text-ivory flex items-center justify-center mx-auto mb-3 font-serif font-bold">
                1
              </div>
              <h4 className="font-serif text-lg font-bold text-forest">Order Online or at Table</h4>
              <p className="text-xs text-charcoal/70 leading-relaxed font-sans">
                Scan your table QR code or order online to generate an instant readable order number.
              </p>
            </Card>

            <Card className="p-6 text-center space-y-2 bg-ivory border-sage/30">
              <div className="w-10 h-10 rounded-full bg-coffee text-ivory flex items-center justify-center mx-auto mb-3 font-serif font-bold">
                2
              </div>
              <h4 className="font-serif text-lg font-bold text-forest">Real-Time Kitchen Feed</h4>
              <p className="text-xs text-charcoal/70 leading-relaxed font-sans">
                Watch status update live from Placed to Preparing and Ready with zero page reloads.
              </p>
            </Card>

            <Card className="p-6 text-center space-y-2 bg-ivory border-sage/30">
              <div className="w-10 h-10 rounded-full bg-forest text-ivory flex items-center justify-center mx-auto mb-3 font-serif font-bold">
                3
              </div>
              <h4 className="font-serif text-lg font-bold text-forest">Served Piping Fresh</h4>
              <p className="text-xs text-charcoal/70 leading-relaxed font-sans">
                Enjoy table-side delivery or prompt front counter pickup at peak freshness.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW 2: Loading State */}
      {loading && (
        <div className="py-16">
          <Loader text="Connecting to Arabista live kitchen feed..." />
        </div>
      )}

      {/* VIEW 3: Error State (Order Not Found) */}
      {error && !loading && (
        <div className="py-8 space-y-6">
          <div className="p-6 rounded-3xl bg-coffee/15 border border-coffee/30 text-center space-y-3 max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-coffee mx-auto" />
            <h3 className="font-serif text-xl font-bold text-forest">
              Order Not Found
            </h3>
            <p className="text-xs sm:text-sm text-charcoal/80 font-sans leading-relaxed">
              We couldn&rsquo;t find an order with the code <strong className="font-mono">{paramOrderNumber}</strong>. Please verify the code on your order confirmation ticket.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button to="/menu" variant="primary" size="sm">
                Explore Menu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Active Order Tracking Display */}
      {order && !loading && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header Ticket Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-semibold tracking-widest text-coffee">
                  Live Ticket
                </span>
                <span className="text-xs text-charcoal/40">&bull;</span>
                <span className="text-xs font-semibold text-forest bg-sage/20 px-2.5 py-0.5 rounded-pill">
                  {order.type === 'DINE_IN' ? `Table ${order.tableNumber || 'Dine-In'}` : 'Takeaway Counter'}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest font-mono tracking-wider">
                  {order.orderNumber}
                </h1>

                <button
                  onClick={handleCopyOrderNumber}
                  className="p-1.5 rounded-full bg-ivory hover:bg-forest hover:text-ivory text-charcoal/60 border border-sage/40 transition-colors shadow-sm"
                  title="Copy order code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-forest" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-pill border border-sage/40 hover:bg-sage/20 text-xs font-semibold text-forest transition-colors"
                title="Share tracking link"
              >
                <Share2 className="w-3.5 h-3.5 text-coffee" />
                <span>Share</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-pill border border-sage/40 hover:bg-sage/20 text-xs font-semibold text-forest transition-colors"
                title="Print ticket receipt"
              >
                <Printer className="w-3.5 h-3.5 text-coffee" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* 1. Live Status Stepper */}
          <LiveStatusStepper
            status={order.status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
            isLive={isLiveSSE}
          />

          {/* 2. Chef Arabito Mascot Section with Dynamic Speech */}
          <ChefArabitoMascot
            status={order.status}
            orderType={order.type}
            tableNumber={order.tableNumber}
          />

          {/* 3. Order Summary & Itemization Card */}
          <Card className="p-6 sm:p-8 bg-ivory border-sage/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sage/20">
              <div>
                <h3 className="font-serif text-2xl font-bold text-forest">
                  Order Summary
                </h3>
                <p className="text-xs text-charcoal/70 mt-0.5 font-sans">
                  Ticket placed on {formatTimestamp(order.createdAt)}
                </p>
              </div>

              {/* Guest Details */}
              <div className="flex items-center gap-4 text-xs text-charcoal/80">
                <span className="flex items-center gap-1 font-medium">
                  <User className="w-3.5 h-3.5 text-coffee" />
                  {order.customerName}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Phone className="w-3.5 h-3.5 text-coffee" />
                  {order.phone}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="divide-y divide-sage/15">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3.5 flex items-start justify-between gap-4 text-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-forest">
                        {item.quantity}x
                      </span>
                      <span className="font-medium text-charcoal">
                        {item.name}
                      </span>
                    </div>

                    <span className="text-xs text-charcoal/60 mt-0.5 block">
                      &#8377;{item.price} each
                    </span>
                  </div>

                  <span className="font-serif font-bold text-coffee text-base shrink-0">
                    &#8377;{item.itemTotal || item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="pt-4 border-t border-sage/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-charcoal/70 space-y-0.5">
                <p>Taxes &amp; Café Service Included</p>
                <p>Payment: Settled at table or counter</p>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase tracking-wider font-semibold text-charcoal/70 block">
                  Total Amount
                </span>
                <span className="text-3xl font-serif font-bold text-coffee">
                  &#8377;{order.total}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-xs font-semibold text-forest hover:text-coffee transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-coffee" />
              <span>Explore Visual Menu to Order More</span>
            </Link>

            <Button to="/" variant="secondary" size="sm">
              Return to Website &rarr;
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}
