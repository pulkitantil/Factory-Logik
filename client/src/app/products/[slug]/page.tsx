'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingCart,
  Zap,
  Check,
  ChevronRight,
  Package,
  Layers,
  ArrowRight,
  CheckCircle2,
  Info,
  Maximize2,
  Sparkles,
  User,
} from 'lucide-react';
import { Product } from '../../../types';
import { fetchApi } from '../../../lib/api';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [comparisonProduct, setComparisonProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Image Gallery
  const [activeImage, setActiveImage] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState(false);

  // Quantity selector
  const [quantity, setQuantity] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Pincode delivery check
  const [pincode, setPincode] = useState('110001');
  const [deliveryResult, setDeliveryResult] = useState<{
    speed: string;
    date: string;
    codAvailable: boolean;
  }>({
    speed: 'Factorylogik Express 24-Hour',
    date: 'Tomorrow, by 8:00 PM',
    codAvailable: true,
  });

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetchApi(`/products/${slug}`);
        if (res.success && res.product) {
          const prod: Product = res.product;
          setProduct(prod);
          setActiveImage(prod.primaryImage || prod.images?.[0]?.url || '');

          // Load other products for comparison dropdown
          const catalogRes = await fetchApi(`/products?limit=30`);
          if (catalogRes.success && catalogRes.products) {
            const others = catalogRes.products.filter((p: Product) => p.id !== prod.id);
            setAllProducts(others);
            // Default comparison candidate in same category or similar
            const candidate = others.find((p: Product) => p.category?.slug === prod.category?.slug) || others[0];
            if (candidate) setComparisonProduct(candidate);
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-gray-200 animate-pulse rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4" />
            <div className="h-16 bg-gray-200 animate-pulse rounded" />
            <div className="h-32 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-gray-900">Product Not Found</h2>
        <p className="text-xs text-gray-500">The product you requested might have been moved or is out of stock.</p>
        <Link href="/products" className="inline-block bg-voltrix-dark text-white text-xs font-bold px-4 py-2 rounded-lg">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  // Parse specifications and features
  const specs: { [key: string]: string } = product.specifications
    ? typeof product.specifications === 'string'
      ? JSON.parse(product.specifications)
      : product.specifications
    : {};

  const features: string[] = product.features
    ? typeof product.features === 'string'
      ? JSON.parse(product.features)
      : product.features
    : [];

  const handleAddToCart = async () => {
    setActionLoading(true);
    await addToCart(product.id, quantity);
    setActionLoading(false);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity);
    router.push('/checkout');
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length >= 6) {
      setDeliveryResult({
        speed: 'Factorylogik Guaranteed Priority',
        date: 'Within 24-48 Hours',
        codAvailable: true,
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    try {
      await fetchApi('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      setReviewSubmitted(true);
      setReviewComment('');
      setReviewTitle('');
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-voltrix-orange">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-voltrix-orange">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-voltrix-orange">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 flex items-center justify-center min-h-[420px] max-h-[500px] overflow-hidden group">
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-emerald-700 text-white text-xs font-black px-2.5 py-1 rounded shadow-sm">
                {product.discount}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-2 rounded-full border border-gray-200 bg-white/90 shadow-sm transition ${
                wishlisted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
            </button>

            <img
              src={activeImage || product.primaryImage}
              alt={product.name}
              className={`max-h-[380px] max-w-full object-contain transition-transform duration-300 ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105 cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />

            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-1.5 rounded-lg border text-gray-500 hover:text-gray-900 shadow-sm"
              title="Toggle Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-16 h-16 rounded-xl border-2 p-1.5 bg-white flex-shrink-0 flex items-center justify-center transition ${
                    activeImage === img.url ? 'border-voltrix-orange shadow-md' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img.url} alt={`Thumbnail ${idx}`} className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Purchase Actions (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black tracking-widest text-voltrix-orange uppercase">
                {product.brand}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Reviews */}
            <div className="flex items-center space-x-3 pt-1">
              <span className="inline-flex items-center bg-emerald-700 text-white text-xs font-bold px-2 py-0.5 rounded">
                {product.rating}
                <Star className="w-3.5 h-3.5 ml-1 fill-white" />
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {product.numReviews.toLocaleString('en-IN')} Verified Customer Ratings
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black text-gray-950">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.price && (
                <span className="text-sm text-gray-400 line-through">
                  MRP ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
              {product.discount > 0 && (
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Save ₹{(product.mrp - product.price).toLocaleString('en-IN')} ({product.discount}% OFF)
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500">
              Inclusive of all taxes. Free 24h express shipping available across Indian pincodes.
            </p>
          </div>

          {/* Stock Availability */}
          <div className="flex items-center space-x-2">
            {product.stock > 0 ? (
              <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <Check className="w-3.5 h-3.5 mr-1" /> In Stock ({product.stock} units ready for immediate dispatch)
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-l-xl"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3.5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-r-xl"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || actionLoading}
                className="flex-1 bg-voltrix-orange hover:bg-voltrix-orange-hover text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 bg-voltrix-dark hover:bg-black text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-voltrix-orange fill-voltrix-orange" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Pincode Check Delivery Estimator */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-900">
              <Truck className="w-4 h-4 text-voltrix-orange" />
              <span>Check Delivery &amp; Services</span>
            </div>
            <form onSubmit={handleCheckPincode} className="flex space-x-2">
              <input
                type="text"
                value={pincode}
                maxLength={6}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Indian Pincode"
                className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-voltrix-orange font-mono"
              />
              <button
                type="submit"
                className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                Check
              </button>
            </form>
            {deliveryResult && (
              <div className="text-[11px] text-gray-600 space-y-1 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                <div className="flex items-center text-emerald-800 font-bold">
                  <Check className="w-3.5 h-3.5 mr-1" /> Delivery to {pincode}: {deliveryResult.date}
                </div>
                <div>Shipping Method: <strong>{deliveryResult.speed}</strong> (Free)</div>
                <div>Cash on Delivery available on this pincode</div>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
            <div className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100">
              <ShieldCheck className="w-4 h-4 mx-auto text-emerald-700 mb-1" />
              <div className="text-[10px] font-bold text-gray-900">{product.warranty || '1 Year Warranty'}</div>
              <div className="text-[9px] text-gray-500">Official Brand Coverage</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100">
              <RotateCcw className="w-4 h-4 mx-auto text-voltrix-orange mb-1" />
              <div className="text-[10px] font-bold text-gray-900">7-Day Replacement</div>
              <div className="text-[9px] text-gray-500">Doorstep Pickup</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100">
              <Package className="w-4 h-4 mx-auto text-blue-700 mb-1" />
              <div className="text-[10px] font-bold text-gray-900">100% Genuine</div>
              <div className="text-[9px] text-gray-500">GST Invoice Provided</div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications, Features & Description Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-8 shadow-sm">
        {/* Description */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
            <Info className="w-4 h-4 text-voltrix-orange" />
            <span>Product Overview</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-4xl">
            {product.description}
          </p>
        </section>

        {/* Features Checklist */}
        {features.length > 0 && (
          <section className="space-y-3 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-voltrix-orange" />
              <span>Key Features &amp; Highlights</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {features.map((feat, i) => (
                <div key={i} className="flex items-start space-x-2.5 p-2 bg-gray-50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-800 font-medium leading-normal">{feat}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Specifications Table */}
        {Object.keys(specs).length > 0 && (
          <section className="space-y-3 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-voltrix-orange" />
              <span>Technical Specifications</span>
            </h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs">
                <tbody>
                  {Object.entries(specs).map(([key, val], idx) => (
                    <tr
                      key={key}
                      className={`border-b border-gray-200 last:border-0 ${
                        idx % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-bold text-gray-700 w-1/3 border-r border-gray-200">
                        {key}
                      </td>
                      <td className="py-2.5 px-4 text-gray-900 font-medium">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* What's In The Box */}
        {product.whatsInTheBox && (
          <section className="space-y-2 border-t border-gray-200 pt-6">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider text-gray-500">
              What&apos;s in the Box
            </h2>
            <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {product.whatsInTheBox}
            </p>
          </section>
        )}
      </div>

      {/* Interactive Product Comparison Feature */}
      <div className="bg-gradient-to-tr from-white to-gray-50 rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-voltrix-orange flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Side-by-Side Comparison
            </span>
            <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5">
              Compare with Another Device
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">Compare against:</span>
            <select
              value={comparisonProduct?.id || ''}
              onChange={(e) => {
                const target = allProducts.find((p) => p.id === e.target.value);
                if (target) setComparisonProduct(target);
              }}
              className="text-xs border border-gray-300 rounded-lg p-2 bg-white font-semibold focus:outline-none focus:border-voltrix-orange"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} — {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {comparisonProduct && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-gray-200 rounded-xl overflow-hidden bg-white">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-800">
                  <th className="p-3 w-1/4 font-black">Specification / Metric</th>
                  <th className="p-3 w-3/8 font-black text-voltrix-orange">
                    {product.name} (Current)
                  </th>
                  <th className="p-3 w-3/8 font-black text-gray-900">
                    {comparisonProduct.name}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-3 font-bold text-gray-600 bg-gray-50">Price</td>
                  <td className="p-3 font-extrabold text-sm text-voltrix-dark">
                    ₹{product.price.toLocaleString('en-IN')}
                    {product.discount > 0 && (
                      <span className="ml-2 text-xs text-emerald-600">({product.discount}% OFF)</span>
                    )}
                  </td>
                  <td className="p-3 font-extrabold text-sm text-gray-700">
                    ₹{comparisonProduct.price.toLocaleString('en-IN')}
                    {comparisonProduct.discount > 0 && (
                      <span className="ml-2 text-xs text-emerald-600">({comparisonProduct.discount}% OFF)</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-600 bg-gray-50">Brand &amp; Rating</td>
                  <td className="p-3">
                    {product.brand} • ⭐ {product.rating}/5 ({product.numReviews} reviews)
                  </td>
                  <td className="p-3">
                    {comparisonProduct.brand} • ⭐ {comparisonProduct.rating}/5 ({comparisonProduct.numReviews} reviews)
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-600 bg-gray-50">Stock Status</td>
                  <td className="p-3">
                    {product.stock > 0 ? (
                      <span className="text-emerald-700 font-semibold">Available ({product.stock} units)</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </td>
                  <td className="p-3">
                    {comparisonProduct.stock > 0 ? (
                      <span className="text-emerald-700 font-semibold">Available ({comparisonProduct.stock} units)</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-600 bg-gray-50">Warranty</td>
                  <td className="p-3">{product.warranty || '1 Year Manufacturer'}</td>
                  <td className="p-3">{comparisonProduct.warranty || '1 Year Manufacturer'}</td>
                </tr>
                {/* Dynamic Specs Keys */}
                {Object.keys(specs).slice(0, 6).map((k) => {
                  const otherSpecs = comparisonProduct.specifications
                    ? typeof comparisonProduct.specifications === 'string'
                      ? JSON.parse(comparisonProduct.specifications)
                      : comparisonProduct.specifications
                    : {};
                  return (
                    <tr key={k}>
                      <td className="p-3 font-bold text-gray-600 bg-gray-50">{k}</td>
                      <td className="p-3 text-gray-900">{specs[k] || 'N/A'}</td>
                      <td className="p-3 text-gray-700">{otherSpecs[k] || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verified Customer Reviews Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Customer Ratings &amp; Reviews
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl font-black text-gray-950">{product.rating}</span>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">Based on {product.numReviews} verified purchases</span>
            </div>
          </div>
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleReviewSubmit} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Write a Customer Review</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Your Rating:</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewRating(s)}
                  className="p-1 text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-4 h-4 ${s <= reviewRating ? 'fill-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)}
            placeholder="Review Headline (e.g., Outstanding display and thermals!)"
            className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:border-voltrix-orange focus:outline-none bg-white"
          />

          <textarea
            rows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your experience regarding performance, build quality, battery, or audio..."
            className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:border-voltrix-orange focus:outline-none bg-white"
          />

          <div className="flex justify-between items-center">
            {reviewSubmitted && (
              <span className="text-xs text-emerald-700 font-bold flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" /> Review submitted successfully!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto bg-voltrix-dark hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg transition"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
