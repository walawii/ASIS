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
    currentUser,
    logout,
    syncShopee,
    isSimulationMode,
    userStoreConnections,
    plans,
  } = useApp();

  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [alertsPopoverOpen, setAlertsPopoverOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const activePlan = plans.find((p) => p.code === currentUser?.subscriptionPlan) || plans[0];

  const handleQuickSync = async () => {
    setIsSyncing(true);
    await syncShopee();
    setIsSyncing(false);
  };

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
            <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900 light:border-slate-200 light:bg-white z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Toko Anda ({stores.length}/{activePlan.maxStores})</span>
                <span className="text-[10px] font-mono text-orange-400">{currentUser?.subscriptionPlan}</span>
              </div>

              {stores.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  Belum ada toko Shopee terhubung.
                </div>
              ) : (
                <div className="space-y-1">
                  {stores.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setCurrentStoreId(s.id);
                        setStoreDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                        s.id === currentStoreId
                          ? 'bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/30'
                          : 'text-slate-300 hover:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 light:text-slate-700 light:hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-white">{s.name}</div>
                        <div className="text-[10px] text-slate-400">{s.category}</div>
                      </div>
                      {s.id === currentStoreId && (
                        <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Add Store Button (respecting maxStores) */}
              <div className="mt-2 border-t border-slate-800 pt-2">
                <button
                  onClick={() => {
                    setStoreDropdownOpen(false);
                    const activeConns = userStoreConnections.filter(
                      (c) => c.status === 'CONNECTED' || c.status === 'CONNECTING'
                    );
                    if (activeConns.length >= activePlan.maxStores) {
                      setUpgradeModalOpen(true);
                    } else {
                      setShopeeModalOpen(true);
                    }
                  }}
                  className="w-full py-1.5 px-3 rounded-xl border border-dashed border-orange-500/40 hover:bg-orange-500/10 text-orange-400 font-bold text-xs transition text-center flex items-center justify-center gap-1.5"
                >
                  <span>+ Tambah Toko Shopee</span>
                  <span className="text-[10px] text-slate-400 font-mono">(Maks {activePlan.maxStores})</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Shopee Connection Center Widget (Section 7 Spec) */}
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
              onClick={handleQuickSync}
              disabled={isSyncing}
              className="ml-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-200 transition border border-emerald-500/40 flex items-center gap-1"
            >
              {isSyncing ? (
                <span className="h-2.5 w-2.5 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
              ) : null}
              <span>[Sync Sekarang]</span>
            </button>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-bold text-[11px]">🟡 Belum terhubung ke Shopee</span>
              <span className="text-[10px] text-amber-400/80 border-l border-amber-500/30 pl-1.5">
                {isSimulationMode ? 'Mode Simulasi' : 'Toko Belum Terikat'}
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

        {/* User Account / Auth Dropdown */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 transition text-left"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 font-bold text-xs text-white shadow-sm">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                  <span className="truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                  {currentUser.role === 'ADMIN' && (
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 text-[9px] font-mono uppercase font-bold">
                      Admin
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-orange-400 font-medium leading-none mt-1">
                  {currentUser.subscriptionPlan}
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 text-xs">
                <div className="p-2 border-b border-slate-800 mb-1">
                  <div className="font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold text-[10px]">
                      {currentUser.subscriptionPlan}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        currentUser.subscriptionStatus === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {currentUser.subscriptionStatus}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCurrentView('profile');
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 transition"
                >
                  Profil Akun
                </button>

                <button
                  onClick={() => {
                    setCurrentView('pricing');
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 transition"
                >
                  Pilihan Paket & Upgrade
                </button>

                {currentUser.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      setCurrentView('admin-dashboard');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/60 font-semibold transition my-0.5"
                  >
                    Admin Console
                  </button>
                )}

                <div className="border-t border-slate-800 mt-1 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition font-semibold"
                  >
                    Keluar (Logout)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('login')}
              className="text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 transition"
            >
              Masuk
            </button>
            <button
              onClick={() => setCurrentView('register')}
              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition"
            >
              Daftar
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
