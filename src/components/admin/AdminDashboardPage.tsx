import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { User, SubscriptionPlanCode, SubscriptionStatusCode } from '../../types/auth.ts';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  UserCheck,
  UserX,
  Mail,
  Sparkles,
  Settings,
  Filter,
  DollarSign,
  Crown,
  Zap,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const {
    currentUser,
    users,
    subscriptions,
    plans,
    updateUserRole,
    updateUserPlan,
    updateSubscriptionStatus,
    toggleUserEmailVerified,
    updatePlanPrice,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'subscriptions' | 'plans'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [planFilter, setPlanFilter] = useState<'ALL' | SubscriptionPlanCode>('ALL');

  // Guard: Admin only
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center space-y-4">
          <XCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Akses Ditolak (Admin Only)</h2>
          <p className="text-xs text-rose-300">
            Anda harus masuk sebagai akun Administrator untuk mengakses dashboard ini.
          </p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition"
          >
            Kembali ke Dashboard Seller
          </button>
        </div>
      </div>
    );
  }

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesPlan = planFilter === 'ALL' || u.subscriptionPlan === planFilter;
    return matchesSearch && matchesRole && matchesPlan;
  });

  // KPI Metrics
  const totalUsersCount = users.length;
  const activeSubsCount = users.filter((u) => u.subscriptionStatus === 'ACTIVE').length;
  const unverifiedCount = users.filter((u) => !u.emailVerified).length;
  const estimatedMrr = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .reduce((acc, s) => acc + (s.billingCycle === 'monthly' ? s.amount : Math.round(s.amount / 12)), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Distinct Admin Header Bar */}
      <div className="border-b border-indigo-950 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  ASIS SELLER — Admin Console
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold uppercase tracking-wider font-mono">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-indigo-300/70 mt-0.5">
                Kelola master user, penetapan plan berlangganan, subscription lifecycle, dan audit otorisasi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
            >
              Buka Seller Workspace
            </button>
            <button
              onClick={() => setCurrentView('admin-fee-rules')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition"
            >
              Master Fee Rules
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* KPI Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-indigo-950/80 bg-slate-900/90 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Pengguna</span>
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalUsersCount}</div>
            <span className="text-[10px] text-slate-400 mt-1 block">Akun terdaftar dalam database</span>
          </div>

          <div className="p-5 rounded-2xl border border-indigo-950/80 bg-slate-900/90 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Langganan Aktif</span>
              <CreditCard className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{activeSubsCount}</div>
            <span className="text-[10px] text-slate-400 mt-1 block">Status ACTIVE berbayar</span>
          </div>

          <div className="p-5 rounded-2xl border border-indigo-950/80 bg-slate-900/90 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Estimasi MRR</span>
              <DollarSign className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">
              Rp {(estimatedMrr / 1000).toLocaleString('id-ID')}k
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Monthly Recurring Revenue</span>
          </div>

          <div className="p-5 rounded-2xl border border-indigo-950/80 bg-slate-900/90 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Belum Terverifikasi</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{unverifiedCount}</div>
            <span className="text-[10px] text-slate-400 mt-1 block">Menunggu verifikasi email</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Manajemen Pengguna (User Management)</span>
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'subscriptions'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Manajemen Langganan (Subscriptions)</span>
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'plans'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Konfigurasi Paket (Plan Management)</span>
          </button>
        </div>

        {/* TAB 1: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari nama atau email pengguna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Semua Peran (Role)</option>
                  <option value="USER">USER Saja</option>
                  <option value="ADMIN">ADMIN Saja</option>
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Semua Paket</option>
                  <option value="LITE">LITE</option>
                  <option value="PLUS">PLUS</option>
                  <option value="KIT">KIT</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 pl-5">Nama & Kontak</th>
                      <th className="p-3.5">Peran (Role)</th>
                      <th className="p-3.5">Verifikasi Email</th>
                      <th className="p-3.5">Paket Aktif</th>
                      <th className="p-3.5">Status Langganan</th>
                      <th className="p-3.5 text-right pr-5">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 pl-5">
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{u.phone}</div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              u.role === 'ADMIN'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {u.role === 'ADMIN' && <Crown className="h-3 w-3 text-indigo-400" />}
                            {u.role}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {u.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span>Unverified</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <select
                            value={u.subscriptionPlan}
                            onChange={(e) =>
                              updateUserPlan(u.id, e.target.value as SubscriptionPlanCode)
                            }
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none font-bold"
                          >
                            <option value="LITE">LITE</option>
                            <option value="PLUS">PLUS</option>
                            <option value="KIT">KIT</option>
                          </select>
                        </td>

                        <td className="p-3.5">
                          <select
                            value={u.subscriptionStatus}
                            onChange={(e) =>
                              updateSubscriptionStatus(
                                u.id,
                                e.target.value as SubscriptionStatusCode
                              )
                            }
                            className={`rounded-lg px-2 py-1 text-xs font-bold border ${
                              u.subscriptionStatus === 'ACTIVE'
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                : u.subscriptionStatus === 'PENDING'
                                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            }`}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="PENDING">PENDING</option>
                            <option value="EXPIRED">EXPIRED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>

                        <td className="p-3.5 text-right pr-5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleUserEmailVerified(u.id)}
                              title="Toggle status verifikasi email"
                              className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                updateUserRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')
                              }
                              title="Toggle peran User / Admin"
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition border ${
                                u.role === 'ADMIN'
                                  ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {u.role === 'ADMIN' ? 'Jadikan USER' : 'Jadikan ADMIN'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 pl-5">User & Pelanggan</th>
                      <th className="p-3.5">Paket</th>
                      <th className="p-3.5">Siklus</th>
                      <th className="p-3.5">Nominal</th>
                      <th className="p-3.5">Periode Aktif</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {subscriptions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 pl-5">
                          <div className="font-bold text-white">{s.userName}</div>
                          <div className="text-[11px] text-slate-400">{s.userEmail}</div>
                          <div className="text-[10px] text-slate-500">{s.notes}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-black text-white">{s.planCode}</span>
                        </td>
                        <td className="p-3.5 capitalize text-slate-300">{s.billingCycle}</td>
                        <td className="p-3.5 font-mono text-emerald-400 font-bold">
                          Rp {s.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3.5 text-[11px] text-slate-400">
                          {new Date(s.currentPeriodStart).toLocaleDateString('id-ID')} s/d{' '}
                          {new Date(s.currentPeriodEnd).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : s.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PLANS CONFIGURATION */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.code}
                className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-black text-white">{p.name}</h3>
                    <span className="text-[11px] text-slate-400">{p.badge}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                    {p.code}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Harga Bulanan (Rp)
                    </label>
                    <input
                      type="number"
                      step={1000}
                      value={p.monthlyPrice}
                      onChange={(e) =>
                        updatePlanPrice(p.code, Number(e.target.value), p.yearlyPrice)
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Harga Tahunan (Rp)
                    </label>
                    <input
                      type="number"
                      step={10000}
                      value={p.yearlyPrice}
                      onChange={(e) =>
                        updatePlanPrice(p.code, p.monthlyPrice, Number(e.target.value))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Maks. Toko</span>
                      <span className="font-bold text-white">{p.maxStores} Toko</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Maks. SKU</span>
                      <span className="font-bold text-white">{p.maxProducts} SKU</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Jumlah Fitur Terdaftar:
                    </span>
                    <span className="text-xs text-indigo-400 font-bold">
                      {p.features.length} fitur disertakan
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
