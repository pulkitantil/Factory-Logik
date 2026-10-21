'use client';

import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  Navigation,
  PhoneCall,
  ShieldCheck,
  Instagram,
} from 'lucide-react';
import { fetchApi } from '../../lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetchApi('/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(res.message || 'Submission failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-voltrix-orange flex items-center justify-center">
          <Building2 className="w-4 h-4 mr-1.5" /> Corporate HQ &amp; Direct Support
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Get in Touch with Factorylogik and Controls
        </h1>
        <p className="text-xs text-gray-500">
          Have an inquiry, technical question, or support need? Our team is available 6 days a week from Jaipur, Rajasthan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Company & Owner Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b pb-3">
              Our Office
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-voltrix-orange flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900">Factorylogik and Controls</strong>
                  <p className="text-gray-600 mt-0.5">
                    Jaipur, Rajasthan, India
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900">Phone &amp; WhatsApp</strong>
                  <p className="text-gray-600">+91 97430 12001</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900">Email</strong>
                  <p className="text-gray-600">info3factorylogik@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Instagram className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900">Instagram</strong>
                  <a href="https://instagram.com/Factorylogik.controls" target="_blank" rel="noreferrer" className="text-pink-600 hover:underline font-medium">@Factorylogik.controls</a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900">Business Hours</strong>
                  <p className="text-gray-600">Monday to Saturday: 9:00 AM – 8:00 PM IST</p>
                  <span className="text-[11px] text-gray-400">Sunday: Closed (AI Assistant Active 24/7)</span>
                </div>
              </div>
            </div>

            {/* Quick Action CTA Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t">
              <a
                href="https://maps.google.com/?q=Jaipur+Rajasthan+India"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-center transition flex flex-col items-center justify-center space-y-1"
              >
                <Navigation className="w-4 h-4 text-voltrix-orange" />
                <span className="text-[10px] font-bold text-gray-900">Directions</span>
              </a>

              <a
                href="tel:+919743012001"
                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-center transition flex flex-col items-center justify-center space-y-1"
              >
                <PhoneCall className="w-4 h-4 text-emerald-700" />
                <span className="text-[10px] font-bold text-gray-900">Call Us</span>
              </a>

              <a
                href="https://wa.me/919743012001?text=Hi%20Factorylogik%20Team"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-center transition flex flex-col items-center justify-center space-y-1"
              >
                <MessageSquare className="w-4 h-4 text-emerald-800" />
                <span className="text-[10px] font-bold text-emerald-900">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Interactive Google Maps Embed */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-64">
            <iframe
              title="Factorylogik and Controls — Jaipur, Rajasthan"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227748.38256923784!2d75.65046970000001!3d26.8492541!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4adf4c57e281%3A0xce1c63a0cf22e09!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Right Column: Contact Message Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-black text-gray-900">Send an Inquiry</h2>
            <p className="text-xs text-gray-500 mt-1">
              Submit your message and a dedicated logistics or sales representative will respond within 4 business hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Pulkit Antil"
                  className="w-full text-xs border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-voltrix-orange"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full text-xs border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-voltrix-orange"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full text-xs border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-voltrix-orange"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Message / Inquiry *</label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your inquiry, order number, or product requirements..."
                className="w-full text-xs border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-voltrix-orange"
              />
            </div>

            {submitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Thank you! Your message has been received. Ticket reference generated.</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-voltrix-orange hover:bg-voltrix-orange-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center space-x-2 shadow-md disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
