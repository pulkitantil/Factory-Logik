'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  ShoppingCart,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'GREETING' | 'PRODUCT_LIST' | 'PRODUCT_COMPARISON' | 'ORDER_TRACKING' | 'INFO';
  products?: any[];
  orderData?: any;
  toolCalls?: any[];
  timestamp: Date;
}

export default function AIAssistantWidget() {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<{ [id: string]: boolean }>({});

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm **Voltrix AI**, your intelligent tech concierge. 🚀\n\nAsk me anything about electronics, specs, or your orders!`,
      type: 'GREETING',
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSend = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetchApi('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ query, conversationId }),
      });

      if (res.success) {
        if (res.conversationId) setConversationId(res.conversationId);

        const aiMessage: Message = {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          content: res.reply,
          type: res.type,
          products: res.products,
          orderData: res.orderData,
          toolCalls: res.toolCalls,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(res.message || 'Could not get response');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `⚠️ Sorry, I could not complete that query. Please make sure the server is running or try again.`,
          type: 'INFO',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
    setAddedItemIds((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [productId]: false }));
    }, 2000);
  };

  const quickPrompts = [
    'Bhai 60k ke andar best laptop dikha aur HP vs Lenovo compare kar',
    'Where is my order?',
    'Top noise cancelling headphones',
    'Gaming monitors with 144Hz+',
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center group">
          <div className="mr-3 hidden md:block bg-white text-gray-800 text-xs font-semibold py-1.5 px-3 rounded-full shadow-lg border border-gray-200 group-hover:scale-105 transition">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-voltrix-orange animate-spin" style={{ animationDuration: '4s' }} />
              <span>Ask <strong>Voltrix AI</strong></span>
            </span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Assistant"
            className="relative bg-gradient-to-tr from-[#111111] via-[#0B3D2E] to-voltrix-orange text-white p-3.5 rounded-full shadow-elevation hover:scale-110 active:scale-95 transition-all duration-300 ring-2 ring-white/50 hover:ring-voltrix-orange"
          >
            <Bot className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-voltrix-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-voltrix-orange border-2 border-white"></span>
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          className={`fixed bottom-5 right-5 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'w-[95vw] md:w-[680px] h-[85vh] max-w-2xl'
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#111111] text-white p-3.5 px-4 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0B3D2E] to-voltrix-orange flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold tracking-tight text-white">Voltrix AI</h3>
                  <span className="bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                    Live Tools
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">Specs • Recommendations • Order Tracking</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-gray-400">
              <Link
                href="/ai-assistant"
                target="_blank"
                title="Open Dedicated Full Page"
                className="p-1.5 hover:text-white rounded-md hover:bg-gray-800 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:text-white rounded-md hover:bg-gray-800 transition hidden sm:block"
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white rounded-md hover:bg-gray-800 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Pill */}
          <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-gray-600">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {user ? `Connected to ${user.name}'s Account` : 'Guest Session (Login to track personal orders)'}
              </span>
            </div>
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome-' + Date.now(),
                    role: 'assistant',
                    content: `Session refreshed. How can I help you find or compare tech gear today?`,
                    timestamp: new Date(),
                  },
                ]);
              }}
              title="Reset Chat"
              className="text-gray-400 hover:text-gray-700 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[10px]">Reset</span>
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F7]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-voltrix-dark text-white rounded-br-xs'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line break-words font-sans">{m.content}</div>

                  {/* Render Product Cards if Returned by Tool */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Matched Products from Catalog:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.products.map((p) => (
                          <div
                            key={p.id}
                            className="bg-gray-50 rounded-lg p-2 border border-gray-200 flex flex-col justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              {p.image && (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-11 h-11 object-contain bg-white rounded p-0.5 border"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/products/${p.slug}`}
                                  className="text-[11px] font-bold text-gray-900 hover:text-voltrix-orange truncate block"
                                >
                                  {p.name}
                                </Link>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                  <span className="text-[11px] font-extrabold text-voltrix-dark">
                                    ₹{p.price?.toLocaleString('en-IN')}
                                  </span>
                                  {p.discount > 0 && (
                                    <span className="text-[9px] text-emerald-600 font-bold">
                                      {p.discount}% OFF
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 mt-2 pt-1.5 border-t border-gray-200">
                              <Link
                                href={`/products/${p.slug}`}
                                className="flex-1 text-center py-1 px-2 text-[10px] font-semibold bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                              >
                                View Specs
                              </Link>
                              <button
                                onClick={() => handleAddToCart(p.id)}
                                className={`py-1 px-2.5 rounded text-[10px] font-bold flex items-center justify-center transition ${
                                  addedItemIds[p.id]
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-voltrix-orange text-white hover:bg-voltrix-orange-hover'
                                }`}
                              >
                                {addedItemIds[p.id] ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <ShoppingCart className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Live Order Tracking Card */}
                  {m.orderData && (
                    <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase font-extrabold text-emerald-800 tracking-wider flex items-center">
                          <Package className="w-3 h-3 mr-1" />
                          Live Tracking Card
                        </span>
                        <span className="bg-emerald-700 text-white font-bold text-[9px] px-2 py-0.5 rounded-full">
                          {m.orderData.status?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="text-[11px] space-y-1 text-gray-700">
                        <div>
                          <strong>Order:</strong> {m.orderData.orderNumber}
                        </div>
                        {m.orderData.trackingNumber && (
                          <div>
                            <strong>Tracking ID:</strong>{' '}
                            <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 font-mono text-[10px]">
                              {m.orderData.trackingNumber}
                            </code>
                          </div>
                        )}
                        <div>
                          <strong>Carrier:</strong> {m.orderData.carrier || 'Voltrix Express Logistics'}
                        </div>
                        <div>
                          <strong>Fulfillment Hub:</strong> {m.orderData.currentCity || 'Gurugram Hub'}
                        </div>
                        {m.orderData.estimatedDelivery && (
                          <div className="text-emerald-900 font-bold">
                            <strong>Expected Arrival:</strong>{' '}
                            {new Date(m.orderData.estimatedDelivery).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex justify-end">
                        <Link
                          href={`/track-order?q=${m.orderData.trackingNumber || m.orderData.orderNumber}`}
                          className="inline-flex items-center text-[10px] font-bold text-emerald-800 hover:text-emerald-950 underline"
                        >
                          Open Full Visual Timeline <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-gray-500 bg-white border border-gray-200 rounded-xl p-2.5 max-w-[200px] shadow-sm">
                <div className="w-2 h-2 rounded-full bg-voltrix-orange animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-voltrix-orange animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-voltrix-orange animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium text-gray-600">Checking catalog...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (Horizontal Scroll) */}
          <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-gray-400 whitespace-nowrap font-bold flex items-center">
              <Sparkles className="w-2.5 h-2.5 mr-1 text-voltrix-orange" /> Try:
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="whitespace-nowrap text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 transition"
              >
                {qp.length > 32 ? qp.slice(0, 32) + '...' : qp}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="p-3 bg-white border-t border-gray-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about laptops, compare specs, or check order..."
                className="flex-1 text-xs border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-voltrix-orange focus:ring-1 focus:ring-voltrix-orange bg-gray-50/50"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                className="bg-voltrix-orange hover:bg-voltrix-orange-hover disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-sm"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
