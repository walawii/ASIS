import React, { useState, useMemo } from 'react';
import { useApp, AppView } from '../../context/AppContext.tsx';
import {
  Search,
  X,
  Package,
  ShoppingCart,
  Megaphone,
  Calculator,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    searchModalOpen,
    setSearchModalOpen,
    products,
    orders,
    campaigns,
    attemptNavigate,
  } = useApp();

  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return {
        products: products.slice(0, 3),
        orders: orders.slice(0, 2),
        campaigns: campaigns.slice(0, 2),
        calculators: [
          { id: 'tutorial' as AppView, name: 'Tutorial Center ASIS (Panduan & Cara Pakai Fitur)' },
          { id: 'product-launch' as AppView, name: 'Product Launch Assistant (Buat Produk Baru)' },
          { id: 'true-profit-engine' as AppView, name: 'True Profit Engine Shopee' },
          { id: 'new-pricing' as AppView, name: 'Reverse Pricing (Target Bersih Solver)' },
          { id: 'fee-scenarios' as AppView, name: 'Fee Scenario Simulator' },
          { id: 'bulk-pricing' as AppView, name: 'Bulk Pricing Calculator' },
          { id: 'tax-dashboard' as AppView, name: 'Pajak & Tax Dashboard (PPh/PPN)' },
          { id: 'admin-fee-rules' as AppView, name: 'Aturan Fee Shopee Admin' },
          { id: 'roas-calculator' as AppView, name: 'Kalkulator ROAS Real-time' },
          { id: 'target-roas' as AppView, name: 'Kalkulator Target ROAS' },
        ],
      };
    }

    const q = query.toLowerCase();

    return {
      products: products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      ),
      orders: orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerCity.toLowerCase().includes(q)
      ),
      campaigns: campaigns.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.productName.toLowerCase().includes(q)
      ),
      calculators: [
        { id: 'tutorial' as AppView, name: 'Tutorial Center ASIS (Panduan & Cara Pakai Fitur)' },
        { id: 'product-launch' as AppView, name: 'Product Launch Assistant (Buat Produk Baru)' },
        { id: 'true-profit-engine' as AppView, name: 'True Profit Engine Shopee' },
        { id: 'fee-scenarios' as AppView, name: 'Fee Scenario Simulator' },
        { id: 'bulk-pricing' as AppView, name: 'Bulk Pricing Calculator' },
        { id: 'tax-dashboard' as AppView, name: 'Pajak & Tax Dashboard (PPh/PPN)' },
        { id: 'admin-fee-rules' as AppView, name: 'Aturan Fee Shopee Admin' },
        { id: 'new-pricing' as AppView, name: 'Reverse Pricing (Target Bersih Solver)' },
        { id: 'roas-calculator' as AppView, name: 'Kalkulator ROAS Real-time' },
        { id: 'target-roas' as AppView, name: 'Kalkulator Target ROAS' },
        { id: 'price-simulator' as AppView, name: 'Price Simulator (A/B/C)' },
        { id: 'discount-calculator' as AppView, name: 'Discount Safety Calculator' },
        { id: 'voucher-simulator' as AppView, name: 'Voucher Simulator' },
        { id: 'bep-calculator' as AppView, name: 'BEP Calculator' },
        { id: 'profit-simulator' as AppView, name: 'Profit Simulator' },
      ].filter((calc) => calc.name.toLowerCase().includes(q)),
    };
  }, [query, products, orders, campaigns]);

  if (!searchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-800 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Cari SKU, nama produk, nomor order, campaign, atau alat kalkulator..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white mr-2 text-xs"
            >
              Hapus
            </button>
          )}
          <button
            onClick={() => setSearchModalOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Quick Calculators */}
          {searchResults.calculators.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-orange-400" />
                <span>Kalkulator & Simulator</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.calculators.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      attemptNavigate(c.id);
                      setSearchModalOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 hover:border-orange-500/50 hover:bg-slate-800 text-left text-xs transition"
                  >
                    <span className="font-medium text-slate-200">{c.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {searchResults.products.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-blue-400" />
                <span>Produk & SKU ({searchResults.products.length})</span>
              </div>
              <div className="space-y-1.5">
                {searchResults.products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      attemptNavigate('product-analytics');
                      setSearchModalOpen(false);
                    }}
                    className="cursor-pointer flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>{p.name}</span>
                        <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300 font-mono">
                          {p.sku}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Harga: Rp {p.sellingPrice.toLocaleString('id-ID')} | Margin: {p.marginPercent.toFixed(1)}% | Stok: {p.stock} pcs
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        p.status === 'PROFITABLE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : p.status === 'LOSS'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {searchResults.orders.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5 text-purple-400" />
                <span>Order Shopee ({searchResults.orders.length})</span>
              </div>
              <div className="space-y-1.5">
                {searchResults.orders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      attemptNavigate('orders');
                      setSearchModalOpen(false);
                    }}
                    className="cursor-pointer flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {o.orderNumber} - {o.customerName} ({o.customerCity})
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {o.date} | Total: Rp {o.totalPrice.toLocaleString('id-ID')} | Profit: Rp {o.netProfit.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-200">
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaigns */}
          {searchResults.campaigns.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Megaphone className="h-3.5 w-3.5 text-amber-400" />
                <span>Iklan & Campaign ({searchResults.campaigns.length})</span>
              </div>
              <div className="space-y-1.5">
                {searchResults.campaigns.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      attemptNavigate('campaign-analytics');
                      setSearchModalOpen(false);
                    }}
                    className="cursor-pointer flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{c.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        ROAS: {c.actualRoas}x (Target {c.targetRoas}x) | Biaya: Rp {c.cost.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-2.5 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Ketik untuk menyaring hasil instan</span>
          <span>Tekan ESC untuk menutup</span>
        </div>
      </div>
    </div>
  );
};
