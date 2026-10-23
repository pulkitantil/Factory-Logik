'use client';

import React from 'react';
import Link from 'next/link';
import {
  Cpu,
  Gauge,
  Activity,
  Boxes,
  Network,
  Wrench,
  Sliders,
  Lightbulb,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Wrench as ServiceIcon,
} from 'lucide-react';
import { INDUSTRIAL_SERVICES } from '../lib/constants';

const iconMap: { [key: string]: React.ElementType } = {
  Cpu,
  Gauge,
  Activity,
  Boxes,
  Network,
  Wrench,
  Sliders,
  Lightbulb,
};

export default function ServicesSection() {
  return (
    <section id="services" className="py-10 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-voltrix-orange flex items-center">
            <ServiceIcon className="w-3.5 h-3.5 mr-1.5" /> Engineering &amp; Field Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Industrial Automation &amp; Control Services
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            From single-drive commissioning to turnkey plant automation, Factorylogik delivers certified engineering expertise across Jaipur and North India.
          </p>
        </div>

        <Link
          href="/contact"
          className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow shrink-0 self-start md:self-auto"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Request Engineering Consultation</span>
        </Link>
      </div>

      {/* Services Grid (8 Services) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {INDUSTRIAL_SERVICES.map((service, index) => {
          const Icon = iconMap[service.iconName] || Cpu;
          return (
            <div
              key={service.id}
              className="group bg-white rounded-2xl border border-gray-200 hover:border-voltrix-orange p-5 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Service Header with Icon and Index */}
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#111111] to-[#0B3D2E] text-voltrix-orange flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-300">
                    0{index + 1}
                  </span>
                </div>

                {/* Title & Short Description */}
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-voltrix-orange transition leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    {service.shortDesc}
                  </p>
                </div>

                {/* Key Deliverables Bullet Points */}
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Scope of Work
                  </span>
                  {service.deliverables.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-start text-[11px] text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={`/contact?service=${encodeURIComponent(service.title)}`}
                  className="text-xs font-bold text-voltrix-orange hover:text-voltrix-orange-hover flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Book Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[10px] text-gray-400 font-medium">On-Site &amp; Remote</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
