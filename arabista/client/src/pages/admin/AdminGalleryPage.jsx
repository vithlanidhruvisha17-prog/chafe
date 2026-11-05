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
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Upload,
} from 'lucide-react';

export default function AdminGalleryPage() {
  const toast = useToast();

  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    sortOrder: 0,
    isActive: true,
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/gallery');
      setGallery(res.data || res || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load café gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingImage(item);
      setFormData({
        title: item.title || '',
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive !== false,
        imageUrl: item.imageUrl || '',
      });
    } else {
      setEditingImage(null);
      setFormData({
        title: '',
        sortOrder: gallery.length,
        isActive: true,
        imageUrl: '',
      });
    }
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSaveGalleryItem = async (e) => {
    e.preventDefault();

    if (!imageFile && !formData.imageUrl) {
      toast.error('Please select an image file or provide an image URL');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('sortOrder', Number(formData.sortOrder || 0));
      data.append('isActive', formData.isActive);

      if (imageFile) {
        data.append('image', imageFile);
      } else if (formData.imageUrl) {
        data.append('imageUrl', formData.imageUrl.trim());
      }

      const headers = { 'Content-Type': 'multipart/form-data' };

      if (editingImage) {
        await api.put(`/admin/gallery/${editingImage.id}`, data, { headers });
        toast.success('Gallery photo updated');
      } else {
        await api.post('/admin/gallery', data, { headers });
        toast.success('Gallery photo uploaded');
      }

      setModalOpen(false);
      fetchGallery();
    } catch (err) {
      toast.error(err.message || 'Failed to save gallery photo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGallery = async (id, title) => {
    if (!window.confirm(`Delete photo '${title || 'this image'}'?`)) return;
    try {
      await api.delete(`/admin/gallery/${id}`);
      toast.success('Photo removed from gallery');
      fetchGallery();
    } catch (err) {
      toast.error(err.message || 'Failed to delete photo');
    }
  };

  const handleReorder = async (item, direction) => {
    const newOrder = direction === 'up' ? item.sortOrder - 1 : item.sortOrder + 1;
    try {
      await api.put(`/admin/gallery/${item.id}`, { sortOrder: newOrder });
      fetchGallery();
    } catch (err) {
      toast.error(err.message || 'Failed to reorder image');
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
              Our Space Photography
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest mt-0.5">
              Café Gallery Manager
            </h1>
          </div>
        </div>

        <Button onClick={() => handleOpenModal()} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Upload Photo
        </Button>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <Loader text="Loading gallery photos..." />
      ) : gallery.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No Photos in Gallery"
          description="Upload architectural and ambient photos of Arabista café for the homepage."
          actionLabel="+ Upload First Photo"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gallery.map((img) => (
            <Card
              key={img.id}
              className="p-3 bg-ivory border-sage/30 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-soft transition-all"
            >
              {/* Photo Frame */}
              <div className="aspect-[4/3] rounded-2xl bg-sage/20 overflow-hidden relative border border-sage/20">
                <img
                  src={img.imageUrl}
                  alt={img.title || 'Arabista Space'}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />

                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-pill bg-charcoal/70 text-ivory text-[10px] font-mono font-bold backdrop-blur-sm">
                  #{img.sortOrder ?? 0}
                </span>
              </div>

              {/* Title & Controls */}
              <div className="pt-3 flex items-center justify-between gap-2">
                <span className="font-serif text-xs font-semibold text-forest truncate flex-1">
                  {img.title || 'Atmospheric Space'}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleReorder(img, 'up')}
                    className="p-1 rounded-full hover:bg-sage/20 text-forest"
                    title="Move Order Earlier"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(img, 'down')}
                    className="p-1 rounded-full hover:bg-sage/20 text-forest"
                    title="Move Order Later"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenModal(img)}
                    className="p-1 rounded-full hover:bg-sage/20 text-forest"
                    title="Edit Title"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGallery(img.id, img.title)}
                    className="p-1 rounded-full hover:bg-coffee hover:text-ivory text-charcoal/50"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Gallery Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-ivory rounded-3xl border border-sage/40 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-sage/20">
              <h3 className="font-serif text-2xl font-bold text-forest">
                {editingImage ? 'Edit Photo Details' : 'Upload Gallery Photo'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-sage/20 text-charcoal/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Caption / Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. The Espresso Bar &amp; Archways"
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

              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Photo File (Supabase Storage) or URL
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

              <div className="pt-4 border-t border-sage/20 flex justify-end gap-3">
                <Button onClick={() => setModalOpen(false)} variant="outline" size="sm" type="button">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={submitting}>
                  Save to Gallery
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  );
}
