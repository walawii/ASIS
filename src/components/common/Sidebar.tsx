import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext.tsx';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Layers,
  Megaphone,
  BarChart3,
  Scale,
  Calculator,
  Target,
  Rocket,
  Sparkles,
  SlidersHorizontal,
  Percent,
  Ticket,
  Coins,
  ShieldAlert,
  ArrowUpRight,
  ShoppingCart,
  Boxes,
  CalendarDays,
  Lightbulb,
  Bell,
  FileSpreadsheet,
  Upload,
  Settings,
  CreditCard,
  Lock,
  ChevronRight,
  Menu,
  X,
  Flame,
  FileText,
  ShieldCheck,
  ArrowDownToLine,
  BookOpen,
  UserCheck,
} from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    attemptNavigate,
    isFeatureAccessible,
    opportunities,
    unreadAlertCount,
    currentUser,
  } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);

  const sections: NavSection[] = [
    ...(currentUser?.role === 'ADMIN'
      ? [
          {
            title: 'ADMIN CONSOLE',
            items: [
              {
                id: 'admin-dashboard' as AppView,
                label: 'Admin Dashboard',
                icon: ShieldCheck,
                badge: 'ADMIN',
                badgeColor: 'bg-indigo-600 text-white font-bold',
              },
              {
                id: 'admin-fee-rules' as AppView,
                label: 'Master Fee Rules',
                icon: Settings,
              },
            ],
          },
        ]
      : []),
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
        {
          id: 'tutorial',
          label: 'Tutorial',
          icon: BookOpen,
          badge: 'PANDUAN',
          badgeColor: 'bg-indigo-600 text-white font-bold',
        },
      ],
    },
    {
      title: 'TRUE PROFIT ENGINE',
      items: [
        {
          id: 'true-profit-engine',
          label: 'True Profit Engine',
          icon: Flame,
          badge: 'CORE',
          badgeColor: 'bg-emerald-500 text-slate-950 font-bold',
        },
        {
          id: 'fee-scenarios',
          label: 'Fee Scenario Simulator',
          icon: SlidersHorizontal,
        },
        {
          id: 'bulk-pricing',
          label: 'Bulk Pricing Calculator',
          icon: FileSpreadsheet,
          badge: 'PRO',
          badgeColor: 'bg-blue-500 text-white',
        },
        {
          id: 'tax-dashboard',
          label: 'Pajak & Tax Dashboard',
          icon: FileText,
          badge: '0.5%',
          badgeColor: 'bg-amber-500 text-slate-950 font-semibold',
        },
        {
          id: 'admin-fee-rules',
          label: 'Aturan Fee Shopee',
          icon: ShieldCheck,
        },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { id: 'profit-analytics', label: 'Analisa Laba Rugi', icon: TrendingUp },
        { id: 'product-analytics', label: 'Analisis Produk', icon: Package },
        { id: 'variant-analytics', label: 'Analisis Varian', icon: Layers },
        { id: 'campaign-analytics', label: 'Histori Campaign', icon: Megaphone },
        { id: 'market-analyzer', label: 'Market Price Analyzer', icon: BarChart3 },
        { id: 'competitive-gap', label: 'Competitive Gap', icon: Scale },
      ],
    },
    {
      title: 'KALKULATOR & SIMULASI',
      items: [
        { id: 'roas-calculator', label: 'Kalkulator ROAS Real-time', icon: Calculator },
        { id: 'target-roas', label: 'Kalkulator Target ROAS', icon: Target },
        {
          id: 'product-launch',
          label: 'Buat Produk Baru (Launch)',
          icon: Rocket,
          badge: 'HOT',
          badgeColor: 'bg-emerald-500 text-white',
        },
        {
          id: 'new-pricing',
          label: 'Reverse Pricing',
          icon: ArrowDownToLine,
          badge: 'SOLVER',
          badgeColor: 'bg-emerald-600 text-white',
        },
        { id: 'price-simulator', label: 'Price Simulator (A/B/C)', icon: SlidersHorizontal },
        { id: 'discount-calculator', label: 'Discount Safety', icon: Percent },
        { id: 'voucher-simulator', label: 'Voucher Simulator', icon: Ticket },
        { id: 'ads-budget', label: 'Ads Budget Calculator', icon: Coins },
        { id: 'bep-calculator', label: 'BEP Calculator', icon: ShieldAlert },
        { id: 'profit-simulator', label: 'Profit Simulator (+100%)', icon: ArrowUpRight },
      ],
    },
    {
      title: 'OPERASIONAL',
      items: [
        { id: 'orders', label: 'AsisFlow Order', icon: ShoppingCart },
        { id: 'inventory', label: 'Manajemen Stok', icon: Boxes },
        { id: 'stock-forecast', label: 'Stock Forecast', icon: CalendarDays },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        {
          id: 'opportunity-center',
          label: 'Opportunity Center',
          icon: Lightbulb,
          badge: `${opportunities.length}`,
          badgeColor: 'bg-emerald-500 text-white',
        },
        {
          id: 'alerts',
          label: 'Alert Center',
          icon: Bell,
          badge: unreadAlertCount > 0 ? `${unreadAlertCount}` : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
      ],
    },
    {
      title: 'LAPORAN & DATA',
      items: [
        { id: 'reports', label: 'Laporan & Export', icon: FileSpreadsheet },
        { id: 'import-data', label: 'Import CSV / Data', icon: Upload },
      ],
    },
    {
      title: 'PENGATURAN',
      items: [
        { id: 'profile' as AppView, label: 'Profil Akun', icon: UserCheck },
        { id: 'settings', label: 'Pengaturan Toko & Fee', icon: Settings },
        { id: 'pricing' as AppView, label: 'Paket & Upgrade', icon: CreditCard },
      ],
    },
  ];

  const handleItemClick = (id: AppView) => {
    attemptNavigate(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-slate-950 px-3 py-4 text-slate-300 dark:bg-slate-950 dark:text-slate-300 light:bg-slate-50 light:text-slate-700">
      <div>
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 font-black text-white shadow-lg shadow-orange-500/20">
              AS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white dark:text-white light:text-slate-900 text-base">
                  ASIS SELLER
                </span>
                <span className="rounded bg-orange-500/20 px-1 py-0.2 text-[9px] font-bold text-orange-400">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">Shopee Profit OS</p>
            </div>
          </div>
          {/* Close for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  const isAccessible = isFeatureAccessible(item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/5 text-orange-400 font-semibold border-l-2 border-orange-500'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 dark:hover:bg-slate-900 light:text-slate-600 light:hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition ${
                            isActive
                              ? 'text-orange-400'
                              : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                              item.badgeColor || 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {!isAccessible && (
                          <Lock className="h-3 w-3 text-amber-500/70" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer info box */}
      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60 light:border-slate-200 light:bg-white">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">
          <span>Shopee Calculator Engine</span>
          <span className="text-emerald-400">v2.4 Ready</span>
        </div>
        <p className="mt-1 text-[10px] text-slate-400 leading-relaxed">
          Kalkulasi real-time biaya admin, gratis ongkir xtra & target ROAS.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button (Fixed at bottom right or top) */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-xl hover:bg-orange-600 active:scale-95 transition"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 transition-colors dark:border-slate-800 dark:bg-slate-950 light:border-slate-200 light:bg-slate-50">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85%] bg-slate-950 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
