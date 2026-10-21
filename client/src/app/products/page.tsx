'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  SlidersHorizontal,
  X,
  Search,
  Check,
  Star,
  ChevronDown,
  ArrowUpDown,
  RotateCcw,
  PackageX,
} from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { Product, Category } from '../../types';
import { fetchApi } from '../../lib/api';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query Parameters
  const initialCategory = searchParams.get('category') || '';
  const initialBrand = searchParams.get('brand') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialFeatured = searchParams.get('featured') || '';
  const initialSort = searchParams.get('sort') || 'popularity';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Mobile Filter Drawer State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Load Categories & Filtered Products
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const catRes = await fetchApi('/categories');
        if (catRes.success) {
          setCategories(catRes.categories || []);
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadFilterOptions();
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedBrand) params.set('brand', selectedBrand);
        if (searchQuery) params.set('search', searchQuery);
        if (initialFeatured === 'true') params.set('featured', 'true');
        if (minPrice > 0) params.set('minPrice', minPrice.toString());
        if (maxPrice < 300000) params.set('maxPrice', maxPrice.toString());
        if (minRating > 0) params.set('rating', minRating.toString());
        if (sortBy) params.set('sort', sortBy);
        params.set('limit', '50');

        const res = await fetchApi(`/products?${params.toString()}`);
        if (res.success && res.products) {
          let list: Product[] = res.products;
          if (inStockOnly) {
            list = list.filter((p) => p.stock > 0);
          }
          setProducts(list);

          // Extract distinct brands
          const brands = Array.from(new Set(res.products.map((p: Product) => p.brand))).filter(
            Boolean
          ) as string[];
          setAvailableBrands(brands);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [
    selectedCategory,
    selectedBrand,
    searchQuery,
    sortBy,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    initialFeatured,
  ]);

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(300000);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('popularity');
    router.push('/products');
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minPrice > 0 || maxPrice < 300000 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Products'
              : selectedBrand
              ? `${selectedBrand} Store`
              : searchQuery
              ? `Search Results for "${searchQuery}"`
              : 'All Electronics'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Showing <strong className="text-gray-900">{products.length}</strong> items with manufacturer warranty &amp; 24H dispatch
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-voltrix-orange" />
            <span>Filters ({activeFilterCount})</span>
          </button>

          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold text-gray-900 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="popularity">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Additions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-gray-500 font-medium">Applied Filters:</span>
          {selectedCategory && (
            <span className="inline-flex items-center space-x-1 bg-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-full">
              <span>Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}</span>
              <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedBrand && (
            <span className="inline-flex items-center space-x-1 bg-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-full">
              <span>Brand: {selectedBrand}</span>
              <button onClick={() => setSelectedBrand('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center space-x-1 bg-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-full">
              <span>Query: {searchQuery}</span>
              <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {minRating > 0 && (
            <span className="inline-flex items-center space-x-1 bg-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-full">
              <span>{minRating}★ &amp; above</span>
              <button onClick={() => setMinRating(0)}><X className="w-3 h-3" /></button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full">
              <span>In Stock Only</span>
              <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-voltrix-orange hover:text-voltrix-orange-hover font-bold ml-2 flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Main Grid: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-sm font-black text-gray-900 flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-voltrix-orange" />
              <span>Filter Catalog</span>
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-gray-500 hover:text-voltrix-orange font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Categories</h4>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition flex items-center justify-between ${
                  !selectedCategory
                    ? 'bg-voltrix-orange/10 text-voltrix-orange font-bold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>All Categories</span>
                {!selectedCategory && <Check className="w-3.5 h-3.5" />}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? 'bg-voltrix-orange/10 text-voltrix-orange font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          {availableBrands.length > 0 && (
            <div className="space-y-2 border-t border-gray-200 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Brands</h4>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedBrand('')}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition flex items-center justify-between ${
                    !selectedBrand
                      ? 'bg-voltrix-orange/10 text-voltrix-orange font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>All Brands</span>
                  {!selectedBrand && <Check className="w-3.5 h-3.5" />}
                </button>
                {availableBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition flex items-center justify-between ${
                      selectedBrand === brand
                        ? 'bg-voltrix-orange/10 text-voltrix-orange font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{brand}</span>
                    {selectedBrand === brand && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Price (₹ INR)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Min (₹)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-1.5 focus:border-voltrix-orange focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Max (₹)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-1.5 focus:border-voltrix-orange focus:outline-none"
                  placeholder="300000"
                />
              </div>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Customer Rating</h4>
            <div className="space-y-1">
              {[4, 3, 0].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`w-full text-left text-xs py-1 px-2 rounded-md flex items-center justify-between ${
                    minRating === rating ? 'bg-gray-100 font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    {rating > 0 ? (
                      <>
                        <span className="flex items-center text-amber-500">
                          {[...Array(rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </span>
                        <span className="text-gray-600">&amp; above</span>
                      </>
                    ) : (
                      <span>All Ratings</span>
                    )}
                  </div>
                  {minRating === rating && <Check className="w-3.5 h-3.5 text-voltrix-orange" />}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Availability */}
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-gray-300 text-voltrix-orange focus:ring-voltrix-orange h-4 w-4"
              />
              <span className="font-semibold">In Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <PackageX className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-gray-900">No Electronics Found</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No products match your selected filters. Try broadening your price range, searching for another keyword, or resetting filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-voltrix-dark text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Modal Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-black text-gray-900">Filter Electronics</h3>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Category</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Brands */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Brand</h4>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2"
                >
                  <option value="">All Brands</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Max Price (₹)</h4>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full text-xs border rounded-lg p-2"
                />
              </div>

              {/* In Stock */}
              <div>
                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-voltrix-orange h-4 w-4"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t flex space-x-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2 text-xs font-bold border border-gray-300 rounded-lg text-gray-700"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2 text-xs font-bold bg-voltrix-orange text-white rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
