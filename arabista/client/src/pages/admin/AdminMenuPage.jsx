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
  Coffee,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Upload,
  Search,
  Filter,
  Layers,
  UtensilsCrossed,
} from 'lucide-react';

export default function AdminMenuPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('items'); // 'items', 'categories', 'subcategories'
  const [loading, setLoading] = useState(true);

  // Data states
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Search & Filters
  const [itemSearch, setItemSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    price: '',
    subCategoryId: '',
    isSignature: false,
    isAvailable: true,
    sortOrder: 0,
    imageUrl: '',
  });
  const [itemImageFile, setItemImageFile] = useState(null);
  const [submittingItem, setSubmittingItem] = useState(false);

  // Category Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', sortOrder: 0, imageUrl: '' });
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [submittingCategory, setSubmittingCategory] = useState(false);

  // SubCategory Modal
  const [subCategoryModalOpen, setSubCategoryModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [subCategoryFormData, setSubCategoryFormData] = useState({ name: '', categoryId: '', sortOrder: 0 });
  const [submittingSubCategory, setSubmittingSubCategory] = useState(false);

  // Fetch all necessary menu entities
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [itemsRes, catsRes, subsRes] = await Promise.all([
        api.get('/menu-items'),
        api.get('/categories'),
        api.get('/admin/subcategories'),
      ]);

      setItems(itemsRes.data || itemsRes || []);
      setCategories(catsRes.data || catsRes || []);
      setSubCategories(subsRes.data || subsRes || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load menu database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 1. Toggle Item Availability
  const handleToggleAvailability = async (id) => {
    try {
      const res = await api.patch(`/admin/menu-items/${id}/toggle-availability`);
      toast.success(res.message || 'Availability updated');
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isAvailable: !i.isAvailable } : i))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to toggle item availability');
    }
  };

  // 2. Open Item Modal for Create or Edit
  const handleOpenItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        subCategoryId: item.subCategoryId || (subCategories[0]?.id || ''),
        isSignature: Boolean(item.isSignature),
        isAvailable: item.isAvailable !== false,
        sortOrder: item.sortOrder || 0,
        imageUrl: item.imageUrl || '',
      });
    } else {
      setEditingItem(null);
      setItemFormData({
        name: '',
        description: '',
        price: '',
        subCategoryId: subCategories[0]?.id || '',
        isSignature: false,
        isAvailable: true,
        sortOrder: 0,
        imageUrl: '',
      });
    }
    setItemImageFile(null);
    setItemModalOpen(true);
  };

  // 3. Save Item
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemFormData.name.trim() || !itemFormData.price || !itemFormData.subCategoryId) {
      toast.error('Please fill in item name, price, and sub-category');
      return;
    }

    try {
      setSubmittingItem(true);
      const formData = new FormData();
      formData.append('name', itemFormData.name.trim());
      formData.append('description', itemFormData.description.trim());
      formData.append('price', Number(itemFormData.price));
      formData.append('subCategoryId', itemFormData.subCategoryId);
      formData.append('isSignature', itemFormData.isSignature);
      formData.append('isAvailable', itemFormData.isAvailable);
      formData.append('sortOrder', Number(itemFormData.sortOrder || 0));

      if (itemImageFile) {
        formData.append('image', itemImageFile);
      } else if (itemFormData.imageUrl) {
        formData.append('imageUrl', itemFormData.imageUrl.trim());
      }

      const headers = { 'Content-Type': 'multipart/form-data' };

      if (editingItem) {
        await api.put(`/admin/menu-items/${editingItem.id}`, formData, { headers });
        toast.success(`Updated '${itemFormData.name}'`);
      } else {
        await api.post('/admin/menu-items', formData, { headers });
        toast.success(`Created '${itemFormData.name}'`);
      }

      setItemModalOpen(false);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to save menu item');
    } finally {
      setSubmittingItem(false);
    }
  };

  // 4. Delete Item
  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${name}'?`)) return;
    try {
      await api.delete(`/admin/menu-items/${id}`);
      toast.success(`Deleted '${name}'`);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete menu item');
    }
  };

  // 5. Category Handlers
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryFormData({ name: cat.name || '', sortOrder: cat.sortOrder || 0, imageUrl: cat.imageUrl || '' });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ name: '', sortOrder: 0, imageUrl: '' });
    }
    setCategoryImageFile(null);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    try {
      setSubmittingCategory(true);
      const formData = new FormData();
      formData.append('name', categoryFormData.name.trim());
      formData.append('sortOrder', Number(categoryFormData.sortOrder || 0));
      if (categoryImageFile) {
        formData.append('image', categoryImageFile);
      } else if (categoryFormData.imageUrl) {
        formData.append('imageUrl', categoryFormData.imageUrl.trim());
      }

      const headers = { 'Content-Type': 'multipart/form-data' };
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, formData, { headers });
        toast.success('Category updated');
      } else {
        await api.post('/admin/categories', formData, { headers });
        toast.success('Category created');
      }
      setCategoryModalOpen(false);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category '${name}' and its relations?`)) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  // 6. SubCategory Handlers
  const handleOpenSubCategoryModal = (sub = null) => {
    if (sub) {
      setEditingSubCategory(sub);
      setSubCategoryFormData({
        name: sub.name || '',
        categoryId: sub.categoryId || (categories[0]?.id || ''),
        sortOrder: sub.sortOrder || 0,
      });
    } else {
      setEditingSubCategory(null);
      setSubCategoryFormData({
        name: '',
        categoryId: categories[0]?.id || '',
        sortOrder: 0,
      });
    }
    setSubCategoryModalOpen(true);
  };

  const handleSaveSubCategory = async (e) => {
    e.preventDefault();
    if (!subCategoryFormData.name.trim() || !subCategoryFormData.categoryId) return;

    try {
      setSubmittingSubCategory(true);
      const payload = {
        name: subCategoryFormData.name.trim(),
        categoryId: subCategoryFormData.categoryId,
        sortOrder: Number(subCategoryFormData.sortOrder || 0),
      };

      if (editingSubCategory) {
        await api.put(`/admin/subcategories/${editingSubCategory.id}`, payload);
        toast.success('Sub-category updated');
      } else {
        await api.post('/admin/subcategories', payload);
        toast.success('Sub-category created');
      }
      setSubCategoryModalOpen(false);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to save sub-category');
    } finally {
      setSubmittingSubCategory(false);
    }
  };

  const handleDeleteSubCategory = async (id, name) => {
    if (!window.confirm(`Delete sub-category '${name}'?`)) return;
    try {
      await api.delete(`/admin/subcategories/${id}`);
      toast.success('Sub-category deleted');
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete sub-category');
    }
  };

  // Filter Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !itemSearch ||
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.subCategory?.name.toLowerCase().includes(itemSearch.toLowerCase());
    const matchesCat =
      !categoryFilter ||
      item.subCategory?.categoryId === categoryFilter ||
      item.subCategory?.category?.name === categoryFilter;
    return matchesSearch && matchesCat;
  });

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
              Catalog Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest mt-0.5">
              Menu &amp; Recipe Manager
            </h1>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-pill bg-sage/20 border border-sage/30 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-1.5 rounded-pill text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'items' ? 'bg-forest text-ivory shadow-xs' : 'text-charcoal/70 hover:text-forest'
            }`}
          >
            Items ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-1.5 rounded-pill text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'categories' ? 'bg-forest text-ivory shadow-xs' : 'text-charcoal/70 hover:text-forest'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('subcategories')}
            className={`px-4 py-1.5 rounded-pill text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'subcategories' ? 'bg-forest text-ivory shadow-xs' : 'text-charcoal/70 hover:text-forest'
            }`}
          >
            Sub-categories ({subCategories.length})
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MENU ITEMS */}
      {/* ======================================================== */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          {/* Controls: Search, Category Filter, and Add Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Search item name or recipe..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-sage/40 bg-ivory text-xs text-charcoal focus:outline-none focus:border-forest"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-sage/40 bg-ivory text-xs font-semibold text-charcoal focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={() => handleOpenItemModal()} variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Menu Item
            </Button>
          </div>

          {/* Items Table */}
          {loading ? (
            <Loader text="Loading menu items..." />
          ) : filteredItems.length === 0 ? (
            <EmptyState
              icon={Coffee}
              title="No Menu Items Found"
              description="No menu items match your search or filter."
              actionLabel="+ Add New Item"
              onAction={() => handleOpenItemModal()}
            />
          ) : (
            <div className="rounded-3xl border border-sage/30 overflow-hidden bg-ivory shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-sage/15 border-b border-sage/25 text-charcoal/80 uppercase font-semibold tracking-wider">
                      <th className="py-4 px-6">Item</th>
                      <th className="py-4 px-4">Collection</th>
                      <th className="py-4 px-4">Price</th>
                      <th className="py-4 px-4">Availability</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage/15 text-charcoal font-sans">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-sage/10 transition-colors">
                        {/* Name + Image + Signature */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sage/20 border border-sage/40 overflow-hidden flex items-center justify-center shrink-0">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Coffee className="w-5 h-5 text-forest/40" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-serif font-bold text-sm text-forest">
                                  {item.name}
                                </span>
                                {item.isSignature && (
                                  <span className="text-[9px] font-bold bg-sage/25 text-forest px-1.5 py-0.5 rounded-pill flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5 text-coffee" />
                                    Signature
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-charcoal/60 line-clamp-1 max-w-sm mt-0.5">
                                {item.description || 'No description entered.'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category & SubCategory */}
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-forest block">
                            {item.subCategory?.name || 'General'}
                          </span>
                          <span className="text-[10px] text-coffee uppercase font-semibold">
                            {item.subCategory?.category?.name || 'Category'}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-serif font-bold text-coffee text-sm">
                          &#8377;{item.price}
                        </td>

                        {/* Availability Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleAvailability(item.id)}
                            className={`px-3 py-1 rounded-pill text-[11px] font-semibold flex items-center gap-1 transition-all ${
                              item.isAvailable
                                ? 'bg-forest/15 text-forest border border-forest/30 hover:bg-forest/25'
                                : 'bg-charcoal/10 text-charcoal/60 border border-charcoal/20 hover:bg-charcoal/20'
                            }`}
                          >
                            {item.isAvailable ? (
                              <>
                                <Check className="w-3 h-3" />
                                Available
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3" />
                                Sold Out
                              </>
                            )}
                          </button>
                        </td>

                        {/* Edit & Delete Actions */}
                        <td className="py-3.5 px-6 text-right space-x-1">
                          <button
                            onClick={() => handleOpenItemModal(item)}
                            className="p-1.5 rounded-full border border-sage/40 hover:bg-sage/20 text-forest transition-colors"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-1.5 rounded-full border border-sage/40 hover:bg-coffee hover:text-ivory text-charcoal/50 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CATEGORIES */}
      {/* ======================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-serif font-bold text-forest">Menu Categories</h2>
              <p className="text-xs text-charcoal/70">Top-level categories representing key menu pillars</p>
            </div>
            <Button onClick={() => handleOpenCategoryModal()} variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Card key={cat.id} className="p-5 flex flex-col justify-between bg-ivory border-sage/30 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-forest text-ivory font-serif font-bold flex items-center justify-center text-sm">
                      {cat.name[0]}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-charcoal/60">
                      Sort #{cat.sortOrder || 0}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-forest">{cat.name}</h3>
                  <p className="text-xs text-charcoal/70 mt-1">
                    Slug: <code className="font-mono text-coffee">{cat.slug || cat.name.toLowerCase()}</code>
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-sage/20 flex items-center justify-between">
                  <span className="text-xs font-semibold text-coffee">
                    {cat.subCategories?.length || 0} Sub-collections
                  </span>
                  <div className="space-x-1">
                    <button
                      onClick={() => handleOpenCategoryModal(cat)}
                      className="p-1.5 rounded-full border border-sage/40 hover:bg-sage/20 text-forest"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 rounded-full border border-sage/40 hover:bg-coffee hover:text-ivory text-charcoal/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SUB-CATEGORIES */}
      {/* ======================================================== */}
      {activeTab === 'subcategories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-serif font-bold text-forest">Sub-Categories</h2>
              <p className="text-xs text-charcoal/70">Curated collections nested under top categories</p>
            </div>
            <Button onClick={() => handleOpenSubCategoryModal()} variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Sub-Category
            </Button>
          </div>

          <div className="rounded-3xl border border-sage/30 overflow-hidden bg-ivory shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-sage/15 border-b border-sage/25 text-charcoal/80 uppercase font-semibold tracking-wider">
                  <th className="py-4 px-6">Sub-Category Name</th>
                  <th className="py-4 px-4">Parent Category</th>
                  <th className="py-4 px-4">Sort Order</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/15 text-charcoal font-sans">
                {subCategories.map((sub) => (
                  <tr key={sub.id} className="hover:bg-sage/10 transition-colors">
                    <td className="py-3.5 px-6 font-serif font-semibold text-sm text-forest">
                      {sub.name}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-coffee">
                      {sub.category?.name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-charcoal/70">
                      #{sub.sortOrder || 0}
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-1">
                      <button
                        onClick={() => handleOpenSubCategoryModal(sub)}
                        className="p-1.5 rounded-full border border-sage/40 hover:bg-sage/20 text-forest"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubCategory(sub.id, sub.name)}
                        className="p-1.5 rounded-full border border-sage/40 hover:bg-coffee hover:text-ivory text-charcoal/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ITEM CREATE / EDIT */}
      {/* ======================================================== */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-ivory rounded-3xl border border-sage/40 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-sage/20">
              <h3 className="font-serif text-2xl font-bold text-forest">
                {editingItem ? 'Edit Menu Item' : 'New Menu Item'}
              </h3>
              <button
                onClick={() => setItemModalOpen(false)}
                className="p-2 rounded-full hover:bg-sage/20 text-charcoal/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                  placeholder="e.g. Classic Signature Latte"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={itemFormData.price}
                    onChange={(e) => setItemFormData({ ...itemFormData, price: e.target.value })}
                    placeholder="270"
                    required
                    min="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm"
                  />
                </div>

                <div>
                  <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                    Sub-Category *
                  </label>
                  <select
                    value={itemFormData.subCategoryId}
                    onChange={(e) => setItemFormData({ ...itemFormData, subCategoryId: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm"
                  >
                    {subCategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category?.name || 'Cat'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Description
                </label>
                <textarea
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                  rows={2}
                  placeholder="Artisanal recipe details, tasting notes, allergens..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm resize-none"
                />
              </div>

              {/* Photo Upload or URL */}
              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Item Image (File Upload or URL)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setItemImageFile(e.target.files[0] || null)}
                    className="w-full text-xs text-charcoal/70 file:mr-3 file:py-2 file:px-4 file:rounded-pill file:border-0 file:text-xs file:font-semibold file:bg-forest file:text-ivory hover:file:bg-forest/90"
                  />
                  <input
                    type="url"
                    value={itemFormData.imageUrl}
                    onChange={(e) => setItemFormData({ ...itemFormData, imageUrl: e.target.value })}
                    placeholder="Or paste public image URL..."
                    className="w-full px-3.5 py-2 rounded-xl border border-sage/40 bg-ivory text-charcoal text-xs focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              {/* Flags: Signature & Availability */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemFormData.isSignature}
                    onChange={(e) => setItemFormData({ ...itemFormData, isSignature: e.target.checked })}
                    className="w-4 h-4 rounded text-forest focus:ring-forest"
                  />
                  <span className="font-semibold text-forest">Signature Special</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemFormData.isAvailable}
                    onChange={(e) => setItemFormData({ ...itemFormData, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-forest focus:ring-forest"
                  />
                  <span className="font-semibold text-forest">Currently Available</span>
                </label>
              </div>

              <div className="pt-4 border-t border-sage/20 flex justify-end gap-3">
                <Button onClick={() => setItemModalOpen(false)} variant="outline" size="sm" type="button">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={submittingItem}>
                  {editingItem ? 'Update Item' : 'Create Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CATEGORY CREATE / EDIT */}
      {/* ======================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-ivory rounded-3xl border border-sage/40 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-sage/20">
              <h3 className="font-serif text-2xl font-bold text-forest">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-2 rounded-full hover:bg-sage/20 text-charcoal/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="e.g. The Pour, Salad, Food"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={categoryFormData.sortOrder}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, sortOrder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Category Cover Image (Upload or URL)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCategoryImageFile(e.target.files[0] || null)}
                  className="w-full text-xs text-charcoal/70 file:mr-3 file:py-2 file:px-4 file:rounded-pill file:border-0 file:text-xs file:font-semibold file:bg-forest file:text-ivory"
                />
              </div>

              <div className="pt-4 border-t border-sage/20 flex justify-end gap-3">
                <Button onClick={() => setCategoryModalOpen(false)} variant="outline" size="sm" type="button">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={submittingCategory}>
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SUB-CATEGORY CREATE / EDIT */}
      {/* ======================================================== */}
      {subCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-ivory rounded-3xl border border-sage/40 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-sage/20">
              <h3 className="font-serif text-2xl font-bold text-forest">
                {editingSubCategory ? 'Edit Sub-Category' : 'New Sub-Category'}
              </h3>
              <button
                onClick={() => setSubCategoryModalOpen(false)}
                className="p-2 rounded-full hover:bg-sage/20 text-charcoal/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubCategory} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Sub-Category Name *
                </label>
                <input
                  type="text"
                  value={subCategoryFormData.name}
                  onChange={(e) => setSubCategoryFormData({ ...subCategoryFormData, name: e.target.value })}
                  placeholder="e.g. Crafted Warmth, Artisan Pizzas"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Parent Category *
                </label>
                <select
                  value={subCategoryFormData.categoryId}
                  onChange={(e) => setSubCategoryFormData({ ...subCategoryFormData, categoryId: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase font-semibold text-charcoal/80 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={subCategoryFormData.sortOrder}
                  onChange={(e) => setSubCategoryFormData({ ...subCategoryFormData, sortOrder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage/40 bg-ivory text-charcoal focus:outline-none focus:border-forest text-sm"
                />
              </div>

              <div className="pt-4 border-t border-sage/20 flex justify-end gap-3">
                <Button onClick={() => setSubCategoryModalOpen(false)} variant="outline" size="sm" type="button">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={submittingSubCategory}>
                  Save Sub-Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  );
}
