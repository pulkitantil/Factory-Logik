import React from 'react';
import Link from 'next/link';
import { Category } from '../types';

const startingPrices: { [slug: string]: string } = {
  plc: '₹12,499',
  vfd: '₹8,990',
  hmi: '₹14,500',
  motors: '₹6,200',
  'servo-drives': '₹18,900',
  sensors: '₹1,450',
  'electrical-components': '₹450',
  'smps-power-supplies': '₹1,850',
  'electrical-control-panels': '₹25,000',
  'industrial-cables-accessories': '₹890',
  'cables-accessories': '₹890',
  // Legacy fallbacks
  smartphones: '₹29,999',
  laptops: '₹58,990',
  audio: '₹1,299',
  smartwatches: '₹1,499',
  gaming: '₹14,995',
  cameras: '₹37,990',
  monitors: '₹44,990',
  accessories: '₹1,699',
};

const categoryImages: { [slug: string]: string } = {
  plc: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
  vfd: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&q=80',
  hmi: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
  motors: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&q=80',
  'servo-drives': 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&q=80',
  sensors: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&q=80',
  'electrical-components': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
  'smps-power-supplies': 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=600&q=80',
  'electrical-control-panels': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80',
  'industrial-cables-accessories': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
  'cables-accessories': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
};

export default function CategoryCard({ category }: { category: Category | { id: string; name: string; slug: string; image?: string } }) {
  const startingPrice = startingPrices[category.slug] || '₹999';
  const displayImage = category.image || categoryImages[category.slug];

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-voltrix-orange hover:shadow-card-hover transition-all duration-300 p-3.5 flex flex-col items-center text-center relative overflow-hidden"
    >
      {/* Category Image Box */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-50 flex items-center justify-center p-2 mb-3 overflow-hidden group-hover:scale-105 transition-transform duration-300">
        {displayImage ? (
          <img
            src={displayImage}
            alt={category.name}
            className="max-h-full max-w-full object-cover rounded-lg drop-shadow-sm"
            loading="lazy"
          />
        ) : (
          <div className="text-gray-400 font-black text-xl">{category.name.charAt(0)}</div>
        )}
      </div>

      {/* Category Name */}
      <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-voltrix-orange transition">
        {category.name}
      </h3>

      {/* Starting from badge */}
      <div className="mt-1">
        <span className="text-[10px] text-emerald-700 font-bold block bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Starting {startingPrice}
        </span>
      </div>
    </Link>
  );
}
