import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../../components/common/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  ShoppingBag,
  Clock,
  UtensilsCrossed,
  Layers,
  Image,
  RefreshCw,
  Flame,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/orders?limit=6'),
      ]);

      setStats(statsRes.data || statsRes);
      setRecentOrders(ordersRes.data?.orders || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      toast.success(`Ticket updated to ${newStatus}`);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.message || 'Status transition rejected');
    }
  };

  if (loading) return <Loader fullScreen text="Loading operational dashboard..." />;

  return (
    <Container className="py-10 max-w-7xl space-y-10">
      {/* Top Welcome & Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage/20">
        <div>
          <span className="text-xs uppercase font-semibold tracking-widest text-coffee">
            Surat Kitchen Station &bull; Arabista
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest mt-0.5">
            Operational Overview
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-0.5 font-sans">
            Live metrics, incoming kitchen queues, and station controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-sage/40 bg-ivory hover:bg-sage/20 text-xs font-semibold text-forest transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>

          <Button to="/admin/orders" variant="primary" size="sm">
            Open Orders Queue &rarr;
          </Button>
        </div>
      </div>

      {/* 1. Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Today's Orders */}
        <Card className="p-6 bg-ivory border-sage/30 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-charcoal/70">
              Today&rsquo;s Orders
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-forest mt-1">
              {stats?.todayOrders ?? 0}
            </h3>
            <span className="text-[11px] text-charcoal/60 mt-0.5 block">
              Cumulative dine-in &amp; takeaway
            </span>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-forest text-ivory flex items-center justify-center shadow-soft">
            <ShoppingBag className="w-7 h-7 text-coffee" />
          </div>
        </Card>

        {/* Today's Revenue */}
        <Card className="p-6 bg-ivory border-sage/30 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-charcoal/70">
              Today&rsquo;s Revenue
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-coffee mt-1">
              &#8377;{stats?.todayRevenue ?? 0}
            </h3>
            <span className="text-[11px] text-charcoal/60 mt-0.5 block flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-forest" />
              Verified server-side totals
            </span>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-coffee text-ivory flex items-center justify-center shadow-soft">
            <span className="font-serif text-2xl font-bold">&#8377;</span>
          </div>
        </Card>

        {/* Pending In Kitchen */}
        <Card className="p-6 bg-ivory border-sage/30 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-charcoal/70">
              Pending in Kitchen
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-forest mt-1">
              {stats?.pendingOrders ?? 0}
            </h3>
            <span className="text-[11px] text-charcoal/60 mt-0.5 block">
              Awaiting Placed &amp; Preparing
            </span>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-sage-dark text-ivory flex items-center justify-center shadow-soft">
            <Clock className="w-7 h-7 text-ivory" />
          </div>
        </Card>
      </div>

      {/* 2. Live Incoming Orders Queue Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-sage/20">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest">
              Live Station Queue
            </h2>
            <p className="text-xs text-charcoal/70 mt-0.5">
              Incoming tickets needing kitchen action
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-coffee hover:text-forest transition-colors flex items-center gap-1"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Kitchen Queue Clear"
            description="No active customer tickets at this moment."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentOrders.map((ord) => {
              const isPlaced = ord.status === 'PLACED';
              const isPreparing = ord.status === 'PREPARING';
              const isReady = ord.status === 'READY';

              return (
                <Card
                  key={ord.id}
                  className="p-5 flex flex-col justify-between bg-ivory border-sage/30 shadow-sm"
                >
                  <div>
                    {/* Header: Code + Dining Type */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-forest">
                        #{ord.orderNumber}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-pill uppercase tracking-wider ${
                          isPlaced
                            ? 'bg-coffee/20 text-coffee border border-coffee/30'
                            : isPreparing
                            ? 'bg-sage/25 text-forest border border-sage/40'
                            : isReady
                            ? 'bg-forest text-ivory'
                            : 'bg-charcoal/10 text-charcoal/60'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <h4 className="font-serif text-base font-semibold text-forest leading-snug">
                      {ord.customerName}
                    </h4>

                    <p className="text-xs text-charcoal/70 font-sans mt-0.5">
                      {ord.type === 'DINE_IN' ? `Table ${ord.tableNumber || 'Dine-In'}` : 'Takeaway'} &bull;{' '}
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    {/* Order Items */}
                    <div className="mt-3 pt-3 border-t border-sage/15 space-y-1 text-xs">
                      {ord.items?.map((it) => (
                        <div key={it.id} className="flex justify-between text-charcoal/80">
                          <span>
                            {it.quantity}x {it.name}
                          </span>
                          <span className="font-mono">&#8377;{it.itemTotal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-3 border-t border-sage/20 flex items-center justify-between gap-2">
                    <span className="font-serif text-lg font-bold text-coffee">
                      &#8377;{ord.total}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isPlaced && (
                        <Button
                          onClick={() => handleStatusUpdate(ord.id, 'PREPARING')}
                          size="sm"
                          variant="primary"
                        >
                          <Flame className="w-3 h-3 mr-1" />
                          Start Prep
                        </Button>
                      )}
                      {isPreparing && (
                        <Button
                          onClick={() => handleStatusUpdate(ord.id, 'READY')}
                          size="sm"
                          variant="secondary"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Mark Ready
                        </Button>
                      )}
                      {isReady && (
                        <Button
                          onClick={() => handleStatusUpdate(ord.id, 'COMPLETED')}
                          size="sm"
                          variant="primary"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Quick Administrative Modules Navigation */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest pb-3 border-b border-sage/20">
          Management Portals
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Orders */}
          <Link to="/admin/orders" className="group block">
            <Card
              variant="hoverable"
              className="h-full p-6 bg-ivory border-sage/40 group-hover:border-forest/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-forest text-ivory flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-6 h-6 text-coffee" />
                </div>
                <h3 className="font-serif text-xl font-bold text-forest">Order Queue</h3>
                <p className="text-xs text-charcoal/70 mt-1 font-sans leading-relaxed">
                  Filter by status, search tickets, inspect customer requests, and advance kitchen flow.
                </p>
              </div>
              <span className="text-xs font-semibold text-coffee mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Orders &rarr;
              </span>
            </Card>
          </Link>

          {/* Menu Catalog */}
          <Link to="/admin/menu" className="group block">
            <Card
              variant="hoverable"
              className="h-full p-6 bg-ivory border-sage/40 group-hover:border-forest/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-forest text-ivory flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-6 h-6 text-coffee" />
                </div>
                <h3 className="font-serif text-xl font-bold text-forest">Menu Catalog</h3>
                <p className="text-xs text-charcoal/70 mt-1 font-sans leading-relaxed">
                  Full CRUD for categories, subcategories, items, prices, and daily stock availability.
                </p>
              </div>
              <span className="text-xs font-semibold text-coffee mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Manage Menu &rarr;
              </span>
            </Card>
          </Link>

          {/* Banners */}
          <Link to="/admin/banners" className="group block">
            <Card
              variant="hoverable"
              className="h-full p-6 bg-ivory border-sage/40 group-hover:border-forest/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-forest text-ivory flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6 text-coffee" />
                </div>
                <h3 className="font-serif text-xl font-bold text-forest">Hero Banners</h3>
                <p className="text-xs text-charcoal/70 mt-1 font-sans leading-relaxed">
                  Upload promotional carousel slides, edit subtitles, set destination links, and reorder.
                </p>
              </div>
              <span className="text-xs font-semibold text-coffee mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Manage Banners &rarr;
              </span>
            </Card>
          </Link>

          {/* Gallery */}
          <Link to="/admin/gallery" className="group block">
            <Card
              variant="hoverable"
              className="h-full p-6 bg-ivory border-sage/40 group-hover:border-forest/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-forest text-ivory flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Image className="w-6 h-6 text-coffee" />
                </div>
                <h3 className="font-serif text-xl font-bold text-forest">Café Gallery</h3>
                <p className="text-xs text-charcoal/70 mt-1 font-sans leading-relaxed">
                  Curate the homepage &ldquo;Our Space&rdquo; photo grid with live Supabase Storage uploads.
                </p>
              </div>
              <span className="text-xs font-semibold text-coffee mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Manage Gallery &rarr;
              </span>
            </Card>
          </Link>
        </div>
      </section>
    </Container>
  );
}
