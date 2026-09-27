import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Store as StoreIcon,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    stores,
    currentStoreId,
    currentStore,
    setCurrentStoreId,
    subscriptionTier,
    setUpgradeModalOpen,
    setSearchModalOpen,
    unreadAlertCount,
    alerts,
    markAlertRead,
    setCurrentView,
    currentView,
    shopeeConnectionState,
    setShopeeModalOpen,
  } = useApp();

  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [alertsPopoverOpen, setAlertsPopoverOpen] = useState(false);

  const getTierLabel = () => {
    switch (subscriptionTier) {
      case 'lite':
        return { label: 'ASIS LITE', color: 'bg-slate-700 text-slate-200 border-slate-600' };
      case 'plus':
        return { label: 'ASIS PLUS', color: 'bg-blue-600/30 text-blue-300 border-blue-500/40' };
      case 'kit':
        return { label: 'ASIS KIT', color: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40' };
    }
  };

  const tierBadge = getTierLabel();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 light:border-slate-200 light:bg-white/95">
      {/* Left: Mobile branding & Store Selector */}
      <div className="flex items-center gap-3">
        {/* Store Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2 text-left text-sm font-medium text-slate-200 shadow-sm transition hover:border-slate-600 hover:bg-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 light:border-slate-300 light:bg-slate-100 light:text-slate-800"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
              <StoreIcon className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold leading-tight text-white dark:text-white light:text-slate-900">
                {currentStore.name}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500">
                {currentStore.category}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {storeDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900 light:border-slate-200 light:bg-white z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Pilih Toko Shopee (Multi-Store)
              </div>
              <div className="space-y-1">
                {stores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentStoreId(s.id);
                      setStoreDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                      s.id === currentStoreId
                        ? 'bg-orange-500/15 text-orange-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 light:text-slate-700 light:hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-[10px] text-slate-400">{s.category}</div>
                    </div>
                    {s.id === currentStoreId && (
                      <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 border-t border-slate-800 pt-2 text-[10px] text-slate-400 px-3 flex items-center justify-between">
                <span>Isolasi data aktif per toko</span>
                <span className="text-emerald-400">Tersinkron</span>
              </div>
            </div>
          )}
        </div>

        {/* Shopee Connection Center Widget (Phase 15 & 20) */}
        {shopeeConnectionState.status === 'CONNECTED' ? (
          <div className="hidden lg:flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="font-bold text-[11px]">🟢 Shopee Terhubung</span>
              <span className="text-[10px] text-emerald-400/80 border-l border-emerald-500/30 pl-1.5">
                {shopeeConnectionState.shopName}
              </span>
              {shopeeConnectionState.lastSyncTime && (
                <span className="text-[9px] text-slate-400">
                  (Sync: {shopeeConnectionState.lastSyncTime})
                </span>
              )}
            </div>
            <button
              onClick={() => setShopeeModalOpen(true)}
              className="ml-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-200 transition border border-emerald-500/40"
            >
              [Sync Sekarang]
            </button>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-bold text-[11px]">🟡 Belum terhubung ke Shopee</span>
              <span className="text-[10px] text-amber-400/80 border-l border-amber-500/30 pl-1.5">
                Mode Simulasi Lokal
              </span>
            </div>
            <button
              onClick={() => setShopeeModalOpen(true)}
              className="ml-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-200 transition border border-amber-500/40"
            >
              [Hubungkan Shopee]
            </button>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-400 transition hover:border-slate-600 hover:text-slate-200 dark:border-slate-700 dark:bg-slate-800 light:border-slate-300 light:bg-slate-100 light:text-slate-600"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Cari produk, order, kalkulator...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-slate-600 bg-slate-700/60 px-1.5 text-[10px] font-mono text-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Tutorial Center quick link */}
        <button
          onClick={() => setCurrentView('tutorial')}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
            currentView === 'tutorial'
              ? 'border-indigo-500 bg-indigo-500/25 text-indigo-300 shadow-sm'
              : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:text-white'
          }`}
          title="Buka Pusat Tutorial ASIS SELLER"
        >
          <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Tutorial</span>
        </button>

        {/* Landing Page SaaS view button */}
        <button
          onClick={() => setCurrentView(currentView === 'landing-page' ? 'dashboard' : 'landing-page')}
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-3 py-1.5 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/25"
          title="Lihat Landing Page promosi SaaS ASIS SELLER"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>{currentView === 'landing-page' ? 'Kembali ke App' : 'Landing Page'}</span>
        </button>

        {/* Plan / Subscription Badge */}
        <button
          onClick={() => setUpgradeModalOpen(true)}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold transition hover:opacity-90 ${tierBadge.color}`}
          title="Klik untuk ubah paket berlangganan"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{tierBadge.label}</span>
        </button>

        {/* Alerts & Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setAlertsPopoverOpen(!alertsPopoverOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 dark:border-slate-700 dark:bg-slate-800 light:border-slate-300 light:bg-slate-100 light:text-slate-700"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {alertsPopoverOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900 light:border-slate-200 light:bg-white z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="font-semibold text-sm text-white dark:text-white light:text-slate-900">
                  Notifikasi & Alert Seller ({alerts.length})
                </div>
                <button
                  onClick={() => {
                    setCurrentView('alerts');
                    setAlertsPopoverOpen(false);
                  }}
                  className="text-xs text-orange-400 hover:underline"
                >
                  Buka Alert Center
                </button>
              </div>

              <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">
                {alerts.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      markAlertRead(a.id);
                      if (a.actionTarget) {
                        setCurrentView(a.actionTarget as any);
                      }
                      setAlertsPopoverOpen(false);
                    }}
                    className={`cursor-pointer rounded-xl p-2.5 transition border ${
                      !a.read
                        ? 'border-slate-700 bg-slate-800/80'
                        : 'border-transparent bg-slate-800/30 opacity-75'
                    } hover:bg-slate-800`}
                  >
                    <div className="flex items-start gap-2">
                      {a.type === 'danger' && <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />}
                      {a.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />}
                      {a.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
                      {a.type === 'info' && <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />}
                      <div>
                        <div className="text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">
                          {a.title}
                        </div>
                        <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                          {a.message}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{a.timestamp}</span>
                          {a.actionText && (
                            <span className="text-orange-400 font-medium hover:underline">
                              {a.actionText} →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle tema"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 dark:border-slate-700 dark:bg-slate-800 light:border-slate-300 light:bg-slate-100 light:text-slate-700"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400" />
          )}
        </button>
      </div>
    </header>
  );
};
