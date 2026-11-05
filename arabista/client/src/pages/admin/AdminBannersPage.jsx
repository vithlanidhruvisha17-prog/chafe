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
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

export default function AdminBannersPage() {
  const toast = useToast();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    linkUrl: '',
    sortOrder: 0,
    isActive: true,
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/banners');
      setBanners(res.data || res || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load promotional banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        linkUrl: banner.linkUrl || '',
        sortOrder: banner.sortOrder || 0,
        isActive: banner.isActive !== false,
        imageUrl: banner.imageUrl || '',
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        linkUrl: '',
        sortOrder: banners.length,
        isActive: true,
        imageUrl: '',
      });
    }
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Banner title is required');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('subtitle', formData.subtitle.trim());
      data.append('linkUrl', formData.linkUrl.trim());
      data.append('sortOrder', Number(formData.sortOrder || 0));
      data.append('isActive', formData.isActive);

      if (imageFile) {
        data.append('image', imageFile);
      } else if (formData.imageUrl) {
        data.append('imageUrl', formData.imageUrl.trim());
      }

      const headers = { 'Content-Type': 'multipart/form-data' };

      if (editingBanner) {
        await api.put(`/admin/banners/${editingBanner.id}`, data, { headers });
        toast.success('Banner updated successfully');
      } else {
        await api.post('/admin/banners', data, { headers });
        toast.success('Banner created successfully');
      }

      setModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error(err.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id, title) => {
    if (!window.confirm(`Delete banner '${title}'?`)) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (err) {
      toast.error(err.message || 'Failed to delete banner');
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await api.put(`/admin/banners/${banner.id}`, {
        isActive: !banner.isActive,
      });
      toast.success(`Banner marked as ${!banner.isActive ? 'Active' : 'Inactive'}`);
      fetchBanners();
    } catch (err) {
      toast.error(err.message || 'Failed to update banner status');
    }
  };

  const handleReorder = async (banner, direction) => {
    const newOrder = direction === 'up' ? banner.sortOrder - 1 : banner.sortOrder + 1;
    try {
      await api.put(`/admin/banners/${banner.id}`, { sortOrder: newOrder });
      fetchBanners();
    } catch (err) {
      toast.error(err.message || 'Failed to reorder banner');
    }
  };

  return (
    <Container className="py-10 max-w-7xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage/20">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="p-2.5 rounded-full border border-sage/40 hover:bg-sage/20 text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs uppercase font-semibold tracking-widest text-coffee">
              Carousel &amp; Promotions
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest mt-0.5">
              Hero Banner Manager
            </h1>
          </div>
        </div>

        <Button onClick={() => handleOpenModal()} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Banner
        </Button>
      </div>

      {/* Banners List */}
      {loading ? (
        <Loader text="Loading promotional banners..." />
      ) : banners.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Banners Found"
          description="Create your first hero carousel banner to highlight seasonal specials."
          actionLabel="+ Add New Banner"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="space-y-4">
          {banners.map((b) => (
            <Card
              key={b.id}
              className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all ${
                b.isActive ? 'bg-ivory border-sage/30' : 'bg-charcoal/5 border-charcoal/20 opacity-75'
              }`}
            >
              {/* Thumbnail + Text Info */}
              <div className="flex items-start sm:items-center gap-4 flex-1">
                <div className="w-20 h-14 rounded-2xl bg-forest text-ivory flex items-center justify-center shrink-0 overflow-hidden border border-forest/30 shadow-xs">
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <Layers className="w-6 h-6 text-coffee" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-bold text-forest">
                      {b.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-pill uppercase tracking-wider ${
                        b.isActive ? 'bg-forest/15 text-forest' : 'bg-charcoal/10 text-charcoal/60'
                      }`}
                    >
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {b.subtitle && (
                    <p className="text-xs text-charcoal/70 line-clamp-1 font-sans">
                      {b.subtitle}
                    </p>
                  )}

                  {b.linkUrl && (
                    <span className="text-[11px] text-coffee flex items-center gap-1 font-mono">
                      <span>{b.linkUrl}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Controls: Reorder, Active toggle, Edit, Delete */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {/* Reorder Buttons */}
                <div className="flex items-center border border-sage/40 rounded-pill bg-ivory">
                  <button
                    onClick={() => handleReorder(b, 'up')}
                    className="p-1.5 hover:text-coffee text-forest transition-colors"
                    title="Move Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-[11px] font-mono font-bold text-forest">
                    #{b.sortOrder ?? 0}
                  </span>
                  <button
                    onClick={() => handleReorder(b, 'down')}
                    className="p-1.5 hover:text-coffee text-forest transition-colors"
                    title="Move Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Status Toggle */}
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-semibold flex items-center gap-1 transition-all ${
                    b.isActive
                      ? 'bg-forest/15 text-forest border border-forest/30'
                      : 'bg-charcoal/10 text-charcoal/60 border border-charcoal/20'
                  }`}
                >
                  {b.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>{b.isActive ? 'Visible' : 'Hidden'}</span>
                </button>

                {/* Edit & Delete */}
                <div className="space-x-1">
                  <button
                    onClick={() => handleOpenModal(b)}
                    className="p-1.5 rounded-full border border-sage/40 hover:bg-sage/20 text-forest transition-colors"
                    title="Edit Banner"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(b.id, b.title)}
                    className="p-1.5 rounded-full border border-sage/40 hover:bg-coffee hover:text-ivory text-charcoal/50 transition-colors"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Banner Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-ivory rounded-3xl border border-sage/40 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-sage/20">
              <h3 className="font-serif text-2xl font-bold text-forest">
                {editingBanner ? 'Edit Banner' : 'New Hero Banner'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-sage/20 text-charcoal/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Headline Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Monsoon Pour-Over Series"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Subtitle Description
                </label>
                <textarea
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  rows={2}
                  placeholder="Supporting text for seasonal promotion..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                    Destination Link URL
                  </label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="/menu/category/the-pour"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm"
                  />
                </div>

                <div>
                  <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Banner Image (File Upload or URL)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0] || null)}
                    className="w-full text-xs text-charcoal/70 file:mr-3 file:py-2 file:px-4 file:rounded-pill file:border-0 file:text-xs file:font-semibold file:bg-forest file:text-ivory"
                  />
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Or enter public image URL..."
                    className="w-full px-3.5 py-2 rounded-xl border border-sage/40 bg-ivory text-charcoal text-xs focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-forest focus:ring-forest"
                  />
                  <span className="font-semibold text-forest">Banner Active in Carousel</span>
                </label>
              </div>

              <div className="pt-4 border-t border-sage/20 flex justify-end gap-3">
                <Button onClick={() => setModalOpen(false)} variant="outline" size="sm" type="button">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={submitting}>
                  Save Banner
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  );
}
