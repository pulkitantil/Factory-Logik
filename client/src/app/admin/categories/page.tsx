
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi, getAdminToken } from '../../../lib/api';

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  featured: boolean;
  displayOrder: number;
  productCount: number;
};

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  image: '',
  icon: '',
  featured: true,
  displayOrder: '0',
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCategories = async () => {
    try {
      const result = await fetchApi('/categories');
      setCategories(result.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace('/admin/login');
      return;
    }
    void loadCategories();
  }, [router]);

  const updateField = (field: keyof typeof emptyForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Category name is required.');
      return;
    }

    const displayOrder = Number(form.displayOrder);
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      setError('Display order must be a non-negative integer.');
      return;
    }

    try {
      setSaving(true);
      const result = await fetchApi('/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          description: form.description.trim(),
          image: form.image.trim(),
          icon: form.icon.trim(),
          featured: form.featured,
          displayOrder,
        }),
      }, true);

      setSuccess(result.message || 'Category created successfully.');
      setForm(emptyForm);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-4 rounded-2xl bg-[#111111] p-6 text-white sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
              Factorylogik & Controls
            </p>
            <h1 className="mt-2 text-2xl font-black">Category Management</h1>
            <p className="mt-1 text-sm text-gray-400">
              Create categories for your industrial product catalogue.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-white/20 px-4 py-2 text-center text-sm font-bold hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </header>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {success}
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">Add New Category</h2>
          <p className="mt-1 text-sm text-gray-500">
            The slug is generated from the category name if you leave it blank.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Category name *
              <input
                required
                maxLength={100}
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal"
                placeholder="e.g. Pneumatic Components"
              />
            </label>

            <label className="block text-sm font-semibold">
              Slug (optional)
              <input
                maxLength={120}
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal"
                placeholder="e.g. pneumatic-components"
              />
            </label>

            <label className="block text-sm font-semibold sm:col-span-2">
              Description
              <textarea
                maxLength={1000}
                rows={3}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal"
                placeholder="What products belong in this category?"
              />
            </label>

            <label className="block text-sm font-semibold sm:col-span-2">
              Image URL (optional)
              <input
                type="url"
                value={form.image}
                onChange={(e) => updateField('image', e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal"
                placeholder="https://..."
              />
            </label>

            <label className="block text-sm font-semibold">
              Icon name (optional)
              <input
                value={form.icon}
                onChange={(e) => updateField('icon', e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal"
                placeholder="e.g. Cpu"
              />
              <span className="mt-1 block text-xs font-normal text-gray-500">
                Use an icon supported by your existing category-card component.
              </span>
            </label>

            <label className="block text-sm font-semibold">
              Display order
              <input
                type="number"
                min={0}
                step={1}
                required
                value={form.displayOrder}
                onChange={(e) => updateField('displayOrder', e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-normal"
              />
            </label>

            <label className="flex items-center gap-3 text-sm font-semibold sm:col-span-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateField('featured', e.target.checked)}
                className="h-4 w-4"
              />
              Feature this category
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Creating…' : 'Create Category'}
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-black">Existing Categories</h2>
            <p className="mt-1 text-sm text-gray-500">
              {categories.length} categories currently available.
            </p>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-gray-500">Loading categories…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="p-4">Category</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Products</th>
                    <th className="p-4">Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="p-4 font-semibold">{category.name}</td>
                      <td className="p-4 text-gray-500">{category.slug}</td>
                      <td className="p-4">{category.productCount}</td>
                      <td className="p-4">{category.displayOrder}</td>
                    </tr>
                  ))}
                  {!categories.length && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
