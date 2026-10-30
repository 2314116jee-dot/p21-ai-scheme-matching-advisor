import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sparkles,
  Compass,
  FileCheck2,
  Bookmark,
  Layers,
  LayoutDashboard,
  User,
  ShieldAlert,
  ExternalLink,
  ArrowRight,
  Command,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PaletteItem {
  id: string;
  title: string;
  description: string;
  category: 'Navigation' | 'Advisory Tools' | 'External Portals';
  icon: React.ReactNode;
  path?: string;
  externalUrl?: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // All palette commands
  const items: PaletteItem[] = [
    {
      id: 'explore-schemes',
      title: 'Explore Central Schemes',
      description: 'Search and filter all 111 catalogued Central Government assistance schemes',
      category: 'Navigation',
      icon: <Compass className="w-4 h-4 text-emerald-600" />,
      path: '/schemes',
    },
    {
      id: 'ai-assistant',
      title: 'AI Scheme-Matching Advisor',
      description: 'Natural language advisory with source-grounded Gazette citations',
      category: 'Advisory Tools',
      icon: <Sparkles className="w-4 h-4 text-amber-600" />,
      path: '/ai-assistant',
    },
    {
      id: 'compare-schemes',
      title: 'Side-by-Side Scheme Comparison',
      description: 'Matrix comparison of loan caps, subsidies, and sector coverage',
      category: 'Advisory Tools',
      icon: <Layers className="w-4 h-4 text-indigo-600" />,
      path: '/compare',
    },
    {
      id: 'document-checklist',
      title: 'Document Readiness Checklist',
      description: 'Track required certificates, ITR, and caste/ownership affidavits',
      category: 'Advisory Tools',
      icon: <FileCheck2 className="w-4 h-4 text-teal-600" />,
      path: '/checklist',
      requiresAuth: true,
    },
    {
      id: 'dashboard',
      title: 'Entrepreneur Dashboard',
      description: 'View multi-factor match scores and personalized scheme recommendations',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-slate-800" />,
      path: '/dashboard',
      requiresAuth: true,
    },
    {
      id: 'saved-schemes',
      title: 'Bookmarked Schemes',
      description: 'Access your saved schemes and track application deadlines',
      category: 'Navigation',
      icon: <Bookmark className="w-4 h-4 text-amber-600" />,
      path: '/saved-schemes',
      requiresAuth: true,
    },
    {
      id: 'profile',
      title: 'Business Profile & Udyam',
      description: 'Update annual turnover, investment, sector, and beneficiary criteria',
      category: 'Navigation',
      icon: <User className="w-4 h-4 text-slate-700" />,
      path: '/profile',
      requiresAuth: true,
    },
    {
      id: 'admin-portal',
      title: 'Administrator Control Center',
      description: 'Data pipeline coverage, scheme verification, and tamper logs',
      category: 'Navigation',
      icon: <ShieldAlert className="w-4 h-4 text-amber-700" />,
      path: '/admin',
      requiresAdmin: true,
    },
    {
      id: 'myscheme-portal',
      title: 'MyScheme National Portal',
      description: 'Government of India national scheme aggregation service',
      category: 'External Portals',
      icon: <ExternalLink className="w-4 h-4 text-stone-500" />,
      externalUrl: 'https://www.myscheme.gov.in/',
    },
    {
      id: 'udyam-portal',
      title: 'Udyam Registration Portal',
      description: 'Ministry of MSME official enterprise registration gateway',
      category: 'External Portals',
      icon: <ExternalLink className="w-4 h-4 text-stone-500" />,
      externalUrl: 'https://udyamregistration.gov.in/',
    },
  ];

  // Filter items based on query & user permissions
  const filteredItems = items.filter((item) => {
    if (item.requiresAuth && !user) return false;
    if (item.requiresAdmin && !isAdmin) return false;
    if (!query.trim()) return true;

    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Arrow key navigation inside palette
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelectItem(filteredItems[selectedIndex]);
      }
    }
  };

  const handleSelectItem = (item: PaletteItem) => {
    setIsOpen(false);
    if (item.path) {
      navigate(item.path);
    } else if (item.externalUrl) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Quick Command Palette"
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-10 flex flex-col max-h-[75vh]"
            >
              {/* Header Input */}
              <div className="flex items-center px-4 py-3.5 border-b border-stone-200 bg-stone-50/50">
                <Search className="w-4 h-4 text-stone-500 mr-2.5 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Type a scheme name, tool, or command... (e.g. AI, checklist, compare)"
                  className="w-full bg-transparent text-sm text-stone-900 placeholder-stone-500 focus:outline-none"
                />
                <span className="text-[10px] font-semibold text-stone-500 bg-stone-200/70 border border-stone-300 rounded px-1.5 py-0.5 ml-2 shrink-0">
                  ESC
                </span>
              </div>

              {/* Items List */}
              <div className="overflow-y-auto p-2 divide-y divide-stone-100 flex-1">
                {filteredItems.length === 0 ? (
                  <div className="py-10 text-center text-xs text-stone-500">
                    No matching commands or schemes found for "{query}".
                  </div>
                ) : (
                  filteredItems.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs ${
                          isSelected
                            ? 'bg-slate-900 text-white'
                            : 'text-stone-800 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                          <div
                            className={`p-1.5 rounded shrink-0 ${
                              isSelected ? 'bg-white/10 text-white' : 'bg-stone-100'
                            }`}
                          >
                            {item.icon}
                          </div>
                          <div className="min-w-0 truncate">
                            <span className="font-semibold block truncate">{item.title}</span>
                            <span
                              className={`text-[11px] truncate block ${
                                isSelected ? 'text-stone-300' : 'text-stone-500'
                              }`}
                            >
                              {item.description}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span
                            className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                            }`}
                          >
                            {item.category}
                          </span>
                          <ArrowRight
                            className={`w-3.5 h-3.5 transition-transform ${
                              isSelected
                                ? 'translate-x-0.5 text-white'
                                : 'opacity-0 text-stone-400'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Guide */}
              <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-600">
                <div className="flex items-center space-x-3">
                  <span>
                    <kbd className="font-mono bg-white border border-stone-300 rounded px-1 py-0.5 shadow-2xs mr-1">
                      ↑
                    </kbd>
                    <kbd className="font-mono bg-white border border-stone-300 rounded px-1 py-0.5 shadow-2xs mr-1">
                      ↓
                    </kbd>
                    Navigate
                  </span>
                  <span>
                    <kbd className="font-mono bg-white border border-stone-300 rounded px-1 py-0.5 shadow-2xs mr-1">
                      ↵
                    </kbd>
                    Select
                  </span>
                </div>
                <div className="flex items-center space-x-1 font-hud-mono">
                  <Command className="w-3 h-3" />
                  <span>P21 Telemetry HUD</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
