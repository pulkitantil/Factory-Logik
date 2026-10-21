'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  Send,
  User,
  RotateCcw,
  CheckCircle2,
  ShoppingCart,
  ArrowRight,
  Package,
  Layers,
  Search,
  Check,
  Zap,
} from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

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

function AIAssistantContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const { user } = useAuth();
  const { addToCart } = useCart();

  const [inputQuery, setInputQuery] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<{ [id: string]: boolean }>({});

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-welcome',
      role: 'assistant',
      content: `👋 **Welcome to Voltrix AI!** I am your hardware intelligence concierge.\n\nI have direct access to our live inventory database and real-time transit telemetry.\n\nYou can ask questions in English or Hinglish like:\n• *"Which laptop is best for coding under ₹70,000?"*\n• *"Compare Sony WH-1000XM5 and Apple AirPods Pro."*\n• *"Mera order kaha pahucha?"*\n• *"Is the LG 27-inch 4K monitor in stock?"*`,
      type: 'GREETING',
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

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
        throw new Error(res.message || 'AI request failed');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `⚠️ Sorry, I could not complete that query. Please make sure the Voltrix REST API is running.`,
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

  const starterChips = [
    'Which laptop is better for programming under ₹70,000?',
    'Compare Sony WH-1000XM5 and Apple AirPods Pro',
    'Show me gaming laptops under ₹1.5 lakh',
    'Where is my order?',
    'Which phone has the best camera under ₹50k?',
    'Check stock for MacBook Pro M3',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#111111] via-[#0B3D2E] to-[#111111] rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0B3D2E] to-voltrix-orange flex items-center justify-center shadow-md">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight">Voltrix AI Shopping Assistant</h1>
              <span className="bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                DATABASE CONNECTED
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Natural Language Tech Specs • Factual Comparisons • Real-Time Order Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="text-right hidden sm:block">
            <div className="text-gray-300">Active User:</div>
            <div className="font-bold text-white">{user ? user.name : 'Guest User'}</div>
          </div>
          <button
            onClick={() => {
              setMessages([
                {
                  id: 'reset-' + Date.now(),
                  role: 'assistant',
                  content: `Session refreshed. How can I help you choose or compare electronics today?`,
                  timestamp: new Date(),
                },
              ]);
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 hover:text-white transition flex items-center space-x-1"
            title="Reset Chat History"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[11px] hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Chat Frame */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAF9F7]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start space-x-2.5 max-w-[90%] sm:max-w-[80%]">
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0B3D2E] to-voltrix-orange text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-voltrix-dark text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans break-words">{m.content}</div>

                  {/* Tool Execution Badges */}
                  {m.toolCalls && m.toolCalls.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                      {m.toolCalls.map((tc, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-600 text-[10px] font-mono px-2 py-0.5 rounded border border-gray-200 flex items-center space-x-1"
                        >
                          <Zap className="w-3 h-3 text-voltrix-orange" />
                          <span>executed: {tc.name}()</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Render Product Cards Grid */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200 space-y-3">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Matched Products from Catalog:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {m.products.map((p) => (
                          <div
                            key={p.id}
                            className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex flex-col justify-between hover:border-gray-300 transition shadow-sm"
                          >
                            <div className="flex items-start space-x-3">
                              {p.image && (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-16 h-16 object-contain bg-white rounded-lg p-1 border flex-shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-voltrix-orange uppercase">
                                  {p.brand}
                                </span>
                                <Link
                                  href={`/products/${p.slug}`}
                                  className="text-xs font-bold text-gray-900 hover:text-voltrix-orange block truncate"
                                >
                                  {p.name}
                                </Link>
                                <div className="flex items-center space-x-2 mt-1 text-xs">
                                  <span className="font-extrabold text-gray-950">
                                    ₹{p.price?.toLocaleString('en-IN')}
                                  </span>
                                  {p.discount > 0 && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                      {p.discount}% OFF
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-gray-500 mt-0.5">
                                  ⭐ {p.rating}/5 • In Stock ({p.stock})
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-200">
                              <Link
                                href={`/products/${p.slug}`}
                                className="flex-1 text-center py-1.5 px-2 text-[11px] font-bold bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                              >
                                View Specs
                              </Link>
                              <button
                                onClick={() => handleAddToCart(p.id)}
                                className={`py-1.5 px-3 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1 transition ${
                                  addedItemIds[p.id]
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-voltrix-orange text-white hover:bg-voltrix-orange-hover'
                                }`}
                              >
                                {addedItemIds[p.id] ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    <span>Add</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Live Order Tracking Result Card */}
                  {m.orderData && (
                    <div className="mt-4 p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center">
                          <Package className="w-4 h-4 mr-1.5 text-emerald-700" />
                          Live Transit Telemetry
                        </span>
                        <span className="bg-emerald-700 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full">
                          {m.orderData.status?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-800 bg-white p-3 rounded-lg border border-emerald-100">
                        <div>
                          <span className="text-gray-500 block text-[10px]">Order Reference:</span>
                          <strong>{m.orderData.orderNumber}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">Tracking Number:</span>
                          <strong className="font-mono text-voltrix-orange">
                            {m.orderData.trackingNumber || 'Processing'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">Current Fulfillment City:</span>
                          <strong>{m.orderData.currentCity || 'Gurugram Hub'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">Expected Arrival:</span>
                          <strong className="text-emerald-800">
                            {new Date(m.orderData.estimatedDelivery).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </strong>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Link
                          href={`/track-order?q=${m.orderData.trackingNumber || m.orderData.orderNumber}`}
                          className="text-xs font-black text-emerald-900 hover:text-emerald-950 inline-flex items-center underline"
                        >
                          View Full Milestones &amp; History <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[10px] text-gray-400 mt-1 px-10">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-gray-500 bg-white border border-gray-200 rounded-2xl p-3 max-w-[240px] shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-voltrix-orange animate-bounce" />
              <div className="w-2.5 h-2.5 rounded-full bg-voltrix-orange animate-bounce [animation-delay:0.2s]" />
              <div className="w-2.5 h-2.5 rounded-full bg-voltrix-orange animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs font-semibold text-gray-700">Querying product database...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Starter Chips */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-xs text-gray-400 font-bold whitespace-nowrap flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-voltrix-orange" /> Suggested Queries:
          </span>
          {starterChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="whitespace-nowrap text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full border border-gray-200 transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form Bar */}
        <div className="p-4 bg-white border-t border-gray-200">
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
              placeholder="Ask anything (e.g. 'Compare Sony WH-1000XM5 vs AirPods Pro' or 'Where is my order?')"
              className="flex-1 text-xs sm:text-sm border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-voltrix-orange focus:ring-1 focus:ring-voltrix-orange bg-gray-50/50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="bg-voltrix-orange hover:bg-voltrix-orange-hover disabled:opacity-50 text-white p-3 rounded-xl transition shadow-md flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
        </div>
      }
    >
      <AIAssistantContent />
    </Suspense>
  );
}
