'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, Plus, Search, Edit2, Trash2, ArrowLeft, X, Upload,
  Image as ImageIcon, Images, Loader2, CheckCircle2,
} from 'lucide-react';
import { fetchApi, getAdminToken } from '../../../lib/api';
import { Product, Category } from '../../../types';

type MediaAsset = { url: string; publicId?: string; width?: number; height?: number; createdAt?: string };

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');

export default function AdminProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', brand: '', categoryId: '', sku: '', description: '', price: 0,
    mrp: 0, discount: 0, stock: 10, warranty: '1 Year Manufacturer Warranty',
    imageUrl: '', specifications: '{\n  "Specification 1": "Value 1"\n}',
    featured: false, active: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetchApi('/products?limit=100'),
        fetchApi('/categories'),
      ]);
      if (pRes.success) setProducts(pRes.products || []);
      if (cRes.success) setCategories(cRes.categories || []);
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getAdminToken()) {
      router.push('/admin/login');
      return;
    }
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const resetForm = (categoryId = categories[0]?.id || '') => {
    setFormData({
      name: '', brand: '', categoryId, sku: `FLC-${Math.floor(1000 + Math.random() * 9000)}`,
      description: '', price: 0, mrp: 0, discount: 0, stock: 10,
      warranty: '1 Year Manufacturer Warranty', imageUrl: '',
      specifications: '{\n  "Specification 1": "Value 1"\n}', featured: false, active: true,
    });
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name, brand: p.brand, categoryId: p.category?.id || '', sku: p.sku,
      description: p.description, price: p.price, mrp: p.mrp, discount: p.discount,
      stock: p.stock, warranty: p.warranty || '1 Year Manufacturer Warranty',
      imageUrl: p.primaryImage || '', specifications: p.specifications || '{}',
      featured: p.featured, active: p.active,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
      alert('Choose a JPEG, PNG, WebP, or AVIF image.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }
    const token = getAdminToken();
    if (!token) {
      alert('Admin session expired. Please log in again.');
      router.push('/admin/login');
      return;
    }
    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append('image', file);
      const response = await fetch(`${API_BASE}/admin/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.image?.url) {
        throw new Error(result.message || 'Image upload failed.');
      }
      setFormData((previous) => ({ ...previous, imageUrl: result.image.url }));
    } catch (error) {
      console.error('Image upload failed:', error);
      alert(error instanceof Error ? error.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const openMediaLibrary = async () => {
    setShowMediaLibrary(true);
    setMediaError('');
    setMediaLoading(true);
    try {
      const token = getAdminToken();
      // This endpoint must be implemented in the backend to list Cloudinary assets.
      const response = await fetch(`${API_BASE}/admin/media`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Media Library API is not available yet.');
      }
      const assets = result.assets || result.images || [];
      setMediaAssets(assets.map((asset: any) => ({
        url: asset.url || asset.secure_url,
        publicId: asset.publicId || asset.public_id,
        width: asset.width,
        height: asset.height,
        createdAt: asset.createdAt || asset.created_at,
      })).filter((asset: MediaAsset) => Boolean(asset.url)));
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Could not load Media Library.');
      setMediaAssets([]);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();

    if (!name) {
      alert('Please enter a category name.');
      return;
    }

    try {
      setCreatingCategory(true);

      const result = await fetchApi('/categories', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description: newCategoryDescription.trim() || undefined,
          displayOrder: categories.length + 1,
        }),
      }, true);

      const created = result.category || result.data?.category;

      // Refresh from the API so the dropdown uses the real database record.
      const response = await fetchApi('/categories');
      const updatedCategories = response.categories || response.data?.categories || [];

      if (!Array.isArray(updatedCategories)) {
        throw new Error('Category was created, but the refreshed category list was unexpected.');
      }

      setCategories(updatedCategories);

      const newCategory = created?.id
        ? updatedCategories.find((c: Category) => c.id === created.id)
        : updatedCategories.find((c: Category) =>
            c.name.toLowerCase() === name.toLowerCase()
          );

      if (!newCategory) {
        throw new Error('Category may have been created, but could not be selected. Refresh the page and check the category list.');
      }

      setFormData((previous) => ({
        ...previous,
        categoryId: newCategory.id,
      }));

      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowNewCategoryModal(false);
      alert(`Category "${newCategory.name}" created and selected successfully.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create category.');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      alert('Please upload an image or choose one from the Media Library.');
      return;
    }
    try {
      setSaving(true);
      // Validate specifications before sending to the API.
      try { JSON.parse(formData.specifications || '{}'); }
      catch { throw new Error('Specifications must be valid JSON.'); }
      if (editingProduct) {
        await fetchApi(`/admin/products/${editingProduct.id}`, {
          method: 'PUT', body: JSON.stringify(formData),
        }, true);
      } else {
        await fetchApi('/admin/products', {
          method: 'POST', body: JSON.stringify(formData),
        }, true);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await fetchApi(`/admin/products/${id}`, { method: 'DELETE' }, true);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const handleStockUpdate = async (id: string, delta: number) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    try {
      await fetchApi(`/admin/products/${id}/stock`, {
        method: 'PATCH', body: JSON.stringify({ stock: newStock }),
      }, true);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stock: newStock } : p));
    } catch (err) {
      console.error('Failed to adjust stock:', err);
      alert('Failed to update stock.');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-10 text-sm text-gray-500">Loading products…</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center space-x-3">
          <Link href="/admin" className="p-2 border rounded-xl hover:bg-gray-100 text-gray-600 transition"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">Product &amp; Inventory Management</h1>
            <p className="text-xs text-gray-500">Manage product listings, inventory, specifications, and pricing.</p>
          </div>
        </div>
        <button onClick={handleOpenAdd} className="bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md"><Plus className="w-4 h-4" /><span>Add New Product</span></button>
      </div>

      <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm max-w-md">
        <Search className="w-4 h-4 text-gray-400" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter by name, brand, or SKU..." className="text-xs flex-1 focus:outline-none" />
        {searchQuery && <button onClick={() => setSearchQuery('')} aria-label="Clear search"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead><tr className="bg-gray-50 border-b text-gray-600 font-bold"><th className="p-3">Product</th><th className="p-3">SKU &amp; Brand</th><th className="p-3">Price &amp; MRP</th><th className="p-3">Stock Units</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="p-3"><div className="flex items-center space-x-3"><img src={p.primaryImage || ''} alt={p.name} className="w-11 h-11 object-contain rounded border p-1 bg-white flex-shrink-0" /><div className="min-w-0 max-w-xs"><span className="font-bold text-gray-900 block truncate">{p.name}</span><span className="text-[10px] text-gray-400">{p.category?.name}</span></div></div></td>
                  <td className="p-3"><div className="font-mono font-bold text-gray-800">{p.sku}</div><div className="text-[11px] text-gray-500">{p.brand}</div></td>
                  <td className="p-3"><div className="font-black text-gray-950">₹{p.price.toLocaleString('en-IN')}</div><div className="text-[10px] text-gray-400 line-through">MRP ₹{p.mrp.toLocaleString('en-IN')}</div></td>
                  <td className="p-3"><div className="flex items-center space-x-2"><button onClick={() => handleStockUpdate(p.id, -1)} className="px-2 py-0.5 border rounded bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold" aria-label="Decrease stock">−</button><span className={`font-black ${p.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>{p.stock}</span><button onClick={() => handleStockUpdate(p.id, 1)} className="px-2 py-0.5 border rounded bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold" aria-label="Increase stock">+</button></div></td>
                  <td className="p-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>{p.active ? 'Active' : 'Inactive'}</span></td>
                  <td className="p-3 text-right"><div className="flex items-center justify-end space-x-2"><button onClick={() => handleOpenEdit(p)} className="p-1.5 text-gray-500 hover:text-voltrix-orange hover:bg-orange-50 rounded-lg transition" title="Edit Product"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Product"><Trash2 className="w-4 h-4" /></button></div></td>
                </tr>
              ))}
              {filteredProducts.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">{searchQuery ? 'No products match your search.' : 'No products yet. Add your first product to get started.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3"><h3 className="text-base font-black text-gray-900">{editingProduct ? 'Edit Product Details' : 'Add New Industrial Product'}</h3><button type="button" onClick={() => setShowModal(false)} aria-label="Close"><X className="w-5 h-5 text-gray-500" /></button></div>
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="font-bold text-gray-700 block mb-1">Product Title *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg p-2.5 focus:border-voltrix-orange focus:outline-none" placeholder="e.g. Siemens S7-1200 PLC CPU 1214C" /></div>
                <div><label className="font-bold text-gray-700 block mb-1">Brand *</label><input type="text" required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full border rounded-lg p-2.5 focus:border-voltrix-orange focus:outline-none" placeholder="e.g. Siemens, ABB, Delta, Schneider Electric" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="font-bold text-gray-700 block mb-1">Category *</label><select required value={formData.categoryId} onChange={(e) => {
                  if (e.target.value === '__add_new_category__') {
                    setShowNewCategoryModal(true);
                  } else {
                    setFormData((previous) => ({ ...previous, categoryId: e.target.value }));
                  }
                }} className="w-full border rounded-lg p-2.5">
                  <option value="" disabled>Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="__add_new_category__">+ Add New Category</option>
                </select></div>
                <div><label className="font-bold text-gray-700 block mb-1">SKU *</label><input type="text" required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full border rounded-lg p-2.5 font-mono" /></div>
                <div><label className="font-bold text-gray-700 block mb-1">Stock Quantity *</label><input type="number" min="0" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full border rounded-lg p-2.5" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="font-bold text-gray-700 block mb-1">Selling Price (₹) *</label><input type="number" min="0" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full border rounded-lg p-2.5 font-bold text-gray-900" /></div>
                <div><label className="font-bold text-gray-700 block mb-1">MRP (₹) *</label><input type="number" min="0" required value={formData.mrp} onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })} className="w-full border rounded-lg p-2.5 text-gray-500" /></div>
                <div><label className="font-bold text-gray-700 block mb-1">Discount (%)</label><input type="number" min="0" max="100" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })} className="w-full border rounded-lg p-2.5" /></div>
              </div>

              <div className="space-y-3 rounded-xl border border-dashed border-gray-300 p-4">
                <div><label className="font-bold text-gray-700 block mb-2">Product Image *</label><p className="text-[11px] text-gray-500">Upload JPEG, PNG, WebP, or AVIF (max 5 MB), or choose a previously uploaded image.</p></div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleImageUpload} className="hidden" />
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={uploadingImage} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-voltrix-orange px-3 py-2 font-bold text-white disabled:opacity-60">{uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}{uploadingImage ? 'Uploading…' : 'Upload Image'}</button>
                  <button type="button" onClick={openMediaLibrary} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-bold text-gray-700 hover:bg-gray-50"><Images className="w-4 h-4" />Add from Library</button>
                </div>
                <div><label className="font-bold text-gray-600 block mb-1">Or paste an image URL</label><input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." className="w-full border rounded-lg p-2.5 focus:border-voltrix-orange focus:outline-none" /></div>
                {formData.imageUrl && <div className="flex items-center gap-3 rounded-lg bg-gray-50 border p-3"><img src={formData.imageUrl} alt="Selected product" className="h-24 w-24 rounded-lg border bg-white object-contain p-1" /><div className="min-w-0 flex-1"><p className="flex items-center gap-1 font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Image selected</p><p className="mt-1 break-all text-[10px] text-gray-500">{formData.imageUrl}</p><button type="button" onClick={() => setFormData({ ...formData, imageUrl: '' })} className="mt-2 text-[11px] font-bold text-red-600">Remove image</button></div></div>}
              </div>

              <div><label className="font-bold text-gray-700 block mb-1">Description *</label><textarea rows={3} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg p-2.5" /></div>
              <div><label className="font-bold text-gray-700 block mb-1">Specifications (Valid JSON Format)</label><textarea rows={4} value={formData.specifications} onChange={(e) => setFormData({ ...formData, specifications: e.target.value })} className="w-full border rounded-lg p-2.5 font-mono text-[11px] bg-gray-50" /></div>
              <div className="flex flex-wrap items-center gap-6 pt-2"><label className="flex items-center gap-2 font-bold cursor-pointer"><input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="rounded text-voltrix-orange" /><span>Featured Product</span></label><label className="flex items-center gap-2 font-bold cursor-pointer"><input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="rounded text-voltrix-orange" /><span>Active for Purchase</span></label></div>
              <div className="flex justify-end gap-2 pt-4 border-t"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl font-bold text-gray-600">Cancel</button><button type="submit" disabled={saving || uploadingImage} className="px-6 py-2 bg-voltrix-orange text-white rounded-xl font-bold hover:bg-voltrix-orange-hover transition shadow disabled:opacity-60">{saving ? 'Saving…' : 'Save Product'}</button></div>
            </form>
          </div>
        </div>
      )}

      {showNewCategoryModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">Add New Category</h3>
              <button
                type="button"
                onClick={() => setShowNewCategoryModal(false)}
                aria-label="Close"
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-gray-700">Category Name *</label>
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Pneumatic Components"
                  className="w-full rounded-lg border p-3 focus:border-voltrix-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-gray-700">Description (optional)</label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Brief category description"
                  className="w-full rounded-lg border p-3 focus:border-voltrix-orange focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-gray-500">
                The category will be saved and selected in your product form.
              </p>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewCategoryModal(false)}
                  className="rounded-xl border px-4 py-2 font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="rounded-xl bg-voltrix-orange px-4 py-2 font-bold text-white disabled:opacity-60"
                >
                  {creatingCategory ? 'Creating…' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMediaLibrary && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3"><div><h3 className="text-base font-black text-gray-900">Media Library</h3><p className="mt-1 text-xs text-gray-500">Choose an image already stored in Cloudinary.</p></div><button type="button" onClick={() => setShowMediaLibrary(false)} aria-label="Close Media Library"><X className="h-5 w-5" /></button></div>
            {mediaLoading ? <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin" />Loading images…</div> : mediaError ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-bold">Could not load Media Library</p><p className="mt-1">{mediaError}</p><p className="mt-2 text-xs">The backend must provide <code>GET /api/admin/media</code> and return <code>{'{ success: true, assets: [{ url, publicId }] }'}</code>. Upload Image works through the existing upload route.</p><button type="button" onClick={openMediaLibrary} className="mt-3 rounded-lg border border-amber-300 px-3 py-1.5 font-bold">Try again</button></div> : mediaAssets.length === 0 ? <div className="py-12 text-center text-sm text-gray-500"><ImageIcon className="mx-auto mb-2 h-8 w-8" />No images found in the Media Library yet.</div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{mediaAssets.map((asset, index) => <button type="button" key={asset.publicId || asset.url || index} onClick={() => { setFormData((prev) => ({ ...prev, imageUrl: asset.url })); setShowMediaLibrary(false); }} className="rounded-xl border p-2 text-left transition hover:border-voltrix-orange hover:ring-2 hover:ring-orange-100"><img src={asset.url} alt="Cloudinary media asset" className="h-28 w-full rounded-lg bg-gray-50 object-contain" /><span className="mt-2 block truncate text-[10px] font-semibold text-gray-600">{asset.publicId || `Image ${index + 1}`}</span><span className="mt-1 block text-[10px] font-bold text-voltrix-orange">Use this image</span></button>)}</div>}
            <div className="mt-4 flex justify-end border-t pt-3"><button type="button" onClick={() => setShowMediaLibrary(false)} className="rounded-xl border px-4 py-2 font-bold text-gray-600">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
