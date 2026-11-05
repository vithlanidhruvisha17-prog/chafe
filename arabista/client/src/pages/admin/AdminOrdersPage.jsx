import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/common/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  ArrowLeft,
  Clock,
  ShoppingBag,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  X,
  Phone,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selected Order for Modal inspection
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('page', page);
      params.append('limit', limit);

      const res = await api.get(`/admin/orders?${params.toString()}`);
      const data = res.data || res;
      setOrders(data.orders || []);
      setTotalCount(data.total || data.orders?.length || 0);
    } catch (err) {
      toast.error(err.message || 'Failed to load order queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, typeFilter, page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.message || 'Status transition rejected');
    }
  };

  const statusChips = [
    { label: 'All', value: '' },
    { label: 'Placed', value: 'PLACED' },
    { label: 'Preparing', value: 'PREPARING' },
    { label: 'Ready', value: 'READY' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <Container className="py-10 max-w-7xl space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage/20">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="p-2.5 rounded-full border border-sage/40 hover:bg-sage/20 text-forest transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <span className="text-xs uppercase font-semibold tracking-widest text-coffee">
              Kitchen Queue
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest mt-0.5">
              Live Orders Manager
            </h1>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill border border-sage/40 bg-ivory hover:bg-sage/20 text-xs font-semibold text-forest self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statusChips.map((chip) => (
            <button
              key={chip.value}
              onClick={() => {
                setStatusFilter(chip.value);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-pill text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                statusFilter === chip.value
                  ? 'bg-forest text-ivory shadow-soft'
                  : 'bg-ivory border border-sage/40 text-charcoal/70 hover:border-forest/50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Search & Dining Type Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, guest, phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-sage/40 bg-ivory text-xs text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-sage/40 bg-ivory text-xs font-semibold text-charcoal focus:outline-none"
          >
            <option value="">All Dining Types</option>
            <option value="DINE_IN">Dine-In</option>
            <option value="TAKEAWAY">Takeaway</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <Loader text="Fetching kitchen queue..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Found"
          description="There are currently no orders matching your query or filter."
        />
      ) : (
        <div className="rounded-3xl border border-sage/30 overflow-hidden bg-ivory shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-sage/15 border-b border-sage/25 text-charcoal/80 uppercase font-semibold tracking-wider">
                  <th className="py-4 px-6">Order Code</th>
                  <th className="py-4 px-4">Dining Mode</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Items</th>
                  <th className="py-4 px-4">Total</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/15 text-charcoal font-sans">
                {orders.map((ord) => {
                  const isPlaced = ord.status === 'PLACED';
                  const isPreparing = ord.status === 'PREPARING';
                  const isReady = ord.status === 'READY';
                  const isCompleted = ord.status === 'COMPLETED';
                  const isCancelled = ord.status === 'CANCELLED';

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-sage/10 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(ord)}
                    >
                      {/* Code + Timestamp */}
                      <td className="py-4 px-6 font-mono font-bold text-forest">
                        <div>
                          <span>#{ord.orderNumber}</span>
                          <span className="block font-sans text-[11px] font-normal text-charcoal/60 mt-0.5">
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Dining Mode */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-forest">
                          {ord.type === 'DINE_IN' ? (
                            <>
                              <MapPin className="w-3 h-3 text-coffee" />
                              Table {ord.tableNumber || 'Dine-In'}
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3 h-3 text-coffee" />
                              Takeaway
                            </>
                          )}
                        </span>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-4 px-4">
                        <span className="font-semibold block text-forest">
                          {ord.customerName}
                        </span>
                        <span className="text-[11px] text-charcoal/60 font-mono">
                          {ord.phone}
                        </span>
                      </td>

                      {/* Items Preview */}
                      <td className="py-4 px-4">
                        <span className="text-charcoal/80 font-medium">
                          {ord.items?.length || 0} {ord.items?.length === 1 ? 'item' : 'items'}
                        </span>
                        <p className="text-[11px] text-charcoal/60 truncate max-w-xs">
                          {ord.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4 font-serif font-bold text-coffee text-sm">
                        &#8377;{ord.total}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-pill uppercase tracking-wider ${
                            isPlaced
                              ? 'bg-coffee/20 text-coffee border border-coffee/30'
                              : isPreparing
                              ? 'bg-sage/25 text-forest border border-sage/40'
                              : isReady
                              ? 'bg-forest text-ivory shadow-xs'
                              : isCompleted
                              ? 'bg-forest/15 text-forest'
                              : 'bg-charcoal/10 text-charcoal/60'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>

                      {/* Status Transition Actions */}
                      <td
                        className="py-4 px-6 text-right space-x-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isPlaced && (
                          <>
                            <Button
                              onClick={() => handleStatusChange(ord.id, 'PREPARING')}
                              size="sm"
                              variant="primary"
                              title="Start Cooking / Brewing"
                            >
                              <Flame className="w-3 h-3 mr-1" />
                              Prep
                            </Button>
                            <Button
                              onClick={() => handleStatusChange(ord.id, 'CANCELLED')}
                              size="sm"
                              variant="outline"
                              title="Cancel Ticket"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        )}

                        {isPreparing && (
                          <>
                            <Button
                              onClick={() => handleStatusChange(ord.id, 'READY')}
                              size="sm"
                              variant="secondary"
                              title="Mark as Plated & Ready"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Ready
                            </Button>
                            <Button
                              onClick={() => handleStatusChange(ord.id, 'CANCELLED')}
                              size="sm"
                              variant="outline"
                              title="Cancel Ticket"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        )}

                        {isReady && (
                          <Button
                            onClick={() => handleStatusChange(ord.id, 'COMPLETED')}
                            size="sm"
                            variant="primary"
                            title="Complete Order Ticket"
                          >
                            Complete
                          </Button>
                        )}

                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 rounded-full border border-sage/40 hover:bg-sage/20 text-forest transition-colors ml-1"
                          title="View Ticket Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 bg-ivory border-t border-sage/20 flex items-center justify-between text-xs text-charcoal/70">
            <span>
              Showing {orders.length} of {totalCount} tickets
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-pill border border-sage/40 hover:bg-sage/20 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="font-semibold text-forest">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-pill border border-sage/40 hover:bg-sage/20 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-ivory rounded-3xl border border-sage/30 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-sage/20">
              <div>
                <span className="text-xs uppercase font-semibold text-coffee tracking-wider">
                  Ticket #{selectedOrder.orderNumber}
                </span>
                <h3 className="font-serif text-2xl font-bold text-forest">
                  Order Details
                </h3>
                <p className="text-xs text-charcoal/70 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-sage/20 text-charcoal/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest & Dining Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-sage/15 p-4 rounded-2xl border border-sage/30">
              <div>
                <span className="text-charcoal/60 block">Guest Name</span>
                <span className="font-bold text-forest text-sm">
                  {selectedOrder.customerName}
                </span>
              </div>
              <div>
                <span className="text-charcoal/60 block">Phone</span>
                <span className="font-mono text-sm">{selectedOrder.phone}</span>
              </div>
              <div>
                <span className="text-charcoal/60 block">Dining Mode</span>
                <span className="font-semibold text-forest">
                  {selectedOrder.type === 'DINE_IN' ? `Dine-In (Table ${selectedOrder.tableNumber})` : 'Takeaway Counter'}
                </span>
              </div>
              <div>
                <span className="text-charcoal/60 block">Current Status</span>
                <span className="font-bold text-coffee uppercase">
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Itemized breakdown */}
            <div className="space-y-3">
              <h4 className="font-serif text-base font-bold text-forest">Ordered Selections</h4>
              <div className="divide-y divide-sage/20 border-y border-sage/20 py-1">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="py-2.5 flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-forest">
                        {it.quantity}x {it.name}
                      </span>
                      <span className="text-charcoal/60 block mt-0.5">
                        &#8377;{it.price} each
                      </span>
                    </div>
                    <span className="font-serif font-bold text-coffee text-sm">
                      &#8377;{it.itemTotal}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs uppercase font-semibold text-charcoal/70">Grand Total</span>
                <span className="font-serif text-2xl font-bold text-coffee">
                  &#8377;{selectedOrder.total}
                </span>
              </div>
            </div>

            {/* Quick Status Control Inside Modal */}
            <div className="pt-4 border-t border-sage/20 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-charcoal/70">Change Status:</span>
              <div className="flex items-center gap-2">
                {selectedOrder.status === 'PLACED' && (
                  <Button
                    onClick={() => handleStatusChange(selectedOrder.id, 'PREPARING')}
                    size="sm"
                    variant="primary"
                  >
                    Start Prep
                  </Button>
                )}
                {selectedOrder.status === 'PREPARING' && (
                  <Button
                    onClick={() => handleStatusChange(selectedOrder.id, 'READY')}
                    size="sm"
                    variant="secondary"
                  >
                    Mark Ready
                  </Button>
                )}
                {selectedOrder.status === 'READY' && (
                  <Button
                    onClick={() => handleStatusChange(selectedOrder.id, 'COMPLETED')}
                    size="sm"
                    variant="primary"
                  >
                    Complete
                  </Button>
                )}
                {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
                  <Button
                    onClick={() => handleStatusChange(selectedOrder.id, 'CANCELLED')}
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
