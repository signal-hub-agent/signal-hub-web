// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  Search, 
  TrendingUp, 
  ShieldAlert, 
  Radio, 
  Bell, 
  ChevronDown, 
  ChevronUp, 
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

interface ListItem {
  id: string;
  type: 'token' | 'address' | 'zero-day' | 'subscription';
  name: string;
  tags: string[];
  timestamp?: string;
  isSubscribed: boolean;
  detailPreview: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'token' | 'address' | 'zero-day' | 'subscription'>('token');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Mock data representing state synchronized from Redis cache layer
  const [items, setItems] = useState<ListItem[]>([
    {
      id: '1',
      type: 'token',
      name: 'MNT (Mantle Network)',
      tags: ['Layer2', 'Ecosystem Native', 'High Vol'],
      isSubscribed: true,
      detailPreview: 'SFS Score: 84/100 | 24h Volume: $42.1M | Liquidity Pool Stability: High'
    },
    {
      id: '2',
      type: 'address',
      name: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      tags: ['Smart Money', 'Swing Trader', 'Whale'],
      timestamp: '2 mins ago',
      isSubscribed: false,
      detailPreview: 'Win Rate: 78% | Profit/Loss Ratio: 2.4 | Max Drawdown: 8.5% | Style: Mid-Frequency'
    },
    {
      id: '3',
      type: 'zero-day',
      name: '0xNewTokenDeployed...',
      tags: ['Just Deployed', 'High Risk', 'Low Liq'],
      timestamp: '34 secs ago',
      isSubscribed: false,
      detailPreview: 'Initial Liquidity: 15,000 MNT | Contract Verification: Passed | HoneyPot Test: Safe'
    }
  ]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubscribe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isSubscribed: !item.isSubscribed } : item
    ));
  };

  const filteredItems = items.filter(item => item.type === activeTab);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] antialiased">
      {/* Global Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#D2D2D7]/30 px-8 py-4 flex items-center justify-between">
        <span className="text-xl font-semibold tracking-tight">Signal-Hub</span>
        <div className="flex space-x-1 bg-[#E8E8ED] p-1 rounded-full">
          {[
            { id: 'token', label: 'Signal Consultant', icon: TrendingUp },
            { id: 'address', label: 'Address Detective', icon: ShieldAlert },
            { id: 'zero-day', label: 'Zero-Day Radar', icon: Radio },
            { id: 'subscription', label: 'My Subscriptions', icon: Bell }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab.id ? 'bg-white shadow-sm text-black' : 'text-[#86868B] hover:text-black'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="w-24 flex justify-end">
          <div className="w-2.5 h-2.5 bg-[#34C759] rounded-full animate-pulse" />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto pt-12 px-6 space-y-8">
        {/* Unified Search Bar */}
        <div className="relative w-full max-w-xl mx-auto bg-white rounded-2xl border border-[#D2D2D7]/50 shadow-sm focus-within:ring-2 focus-within:ring-black/5 transition-all">
          <Search className="absolute left-4 top-3.5 text-[#86868B]" size={18} />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'token' ? 'tokens' : activeTab === 'address' ? 'addresses' : 'assets'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent pl-12 pr-4 py-3 text-sm focus:outline-none text-black placeholder-[#86868B]"
          />
        </div>

        {/* Dynamic Scrolling List Container */}
        <div className="bg-white border border-[#D2D2D7]/40 rounded-3xl shadow-sm overflow-hidden divide-y divide-[#D2D2D7]/20">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => {
              const isExpanded = !!expandedItems[item.id];
              return (
                <div key={item.id} className="transition-colors hover:bg-[#F5F5F7]/40">
                  {/* Primary Grid Row */}
                  <div className="flex items-center justify-between px-6 py-4 cursor-pointer">
                    <div className="flex items-center space-x-4 flex-1">
                      <button 
                        onClick={() => toggleExpand(item.id)}
                        className="p-1 hover:bg-[#E8E8ED] rounded-lg transition-colors text-[#86868B] hover:text-black"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium tracking-tight hover:underline">
                          {item.name}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.map((tag, idx) => (
                            <span key={idx} className="bg-[#E8E8ED] text-[#1D1D1F] text-[10px] px-2 py-0.5 rounded-full font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {item.timestamp && (
                        <span className="text-xs text-[#86868B] font-mono">{item.timestamp}</span>
                      )}
                      <button
                        onClick={(e) => toggleSubscribe(item.id, e)}
                        className={`p-2 rounded-full transition-all ${
                          item.isSubscribed ? 'text-black' : 'text-[#86868B] hover:text-black'
                        }`}
                      >
                        {item.isSubscribed ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Collapsible Detailed Panel */}
                  {isExpanded && (
                    <div className="px-14 pb-5 pt-1 text-xs text-[#86868B] font-normal leading-relaxed bg-[#F5F5F7]/20">
                      <div className="p-4 bg-white border border-[#D2D2D7]/30 rounded-2xl shadow-inner">
                        {item.detailPreview}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center text-sm text-[#86868B]">
              No active metrics cached for this category.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}