import React from 'react';
import Link from 'next/link';
import { Category } from '../types';

const startingPrices: { [slug: string]: string } = {
  smartphones: '₹29,999',
  laptops: '₹58,990',
  audio: '₹1,299',
  smartwatches: '₹1,499',
  gaming: '₹14,995',
  cameras: '₹37,990',
  monitors: '₹44,990',
  accessories: '₹1,699',
};

export default function CategoryCard({ category }: { category: Category }) {
  const startingPrice = startingPrices[category.slug] || '₹999';

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-card-hover transition-all duration-300 p-3.5 flex flex-col items-center text-center relative overflow-hidden"
    >
      {/* Category Image Box */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-50 flex items-center justify-center p-2 mb-3 overflow-hidden group-hover:scale-105 transition-transform duration-300">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="max-h-full max-w-full object-contain drop-shadow-sm"
            loading="lazy"
          />
        ) : (
          <div className="text-gray-300 font-black text-xl">{category.name.charAt(0)}</div>
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
