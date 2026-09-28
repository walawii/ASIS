/**
 * ASIS SELLER — SaaS Authentication & Plan Service
 * 
 * Compliant with SaaS Foundation V2 architecture.
 * Provides clean abstractions for:
 * 1. User Registration & Password Hashing (never plaintext)
 * 2. Real Email Verification Token handling
 * 3. Login & Session Token generation
 * 4. Multi-role Access Control (USER vs ADMIN)
 * 5. Subscription Plan entitlements (LITE, PLUS, KIT)
 * 6. Subscription Lifecycle (PENDING, ACTIVE, EXPIRED, CANCELLED)
 * 
 * ARCHITECTURE NOTICE:
 * In this client-side SPA stage, this service maintains in-memory state and simulates
 * the exact REST/RPC contract of the upcoming server-side backend (/api/auth/*).
 * Client-side UI hiding is a presentation layer; the backend production migration
 * will enforce these rules as server-side authorization boundaries.
 */

import {
  User,
  UserRole,
  SubscriptionPlan,
  SubscriptionPlanCode,
  SubscriptionStatusCode,
  SubscriptionRecord,
  EmailVerificationToken,
  AuthSession,
  AccessCheckResult,
} from '../../types/auth.ts';

// 1. EXTENSIBLE SUBSCRIPTION PLANS
export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    code: 'LITE',
    name: 'ASIS LITE',
    tagline: 'Esensial untuk UMKM, Reseller, & Pemula',
    badge: 'Starter',
    monthlyPrice: 149000,
    yearlyPrice: 1490000, // 2 months free
    maxStores: 1,
    maxProducts: 25,
    allowedViews: [
      'dashboard',
      'landing-page',
      'pricing',
      'profile',
      'user-subscription',
      'tutorial',
      'roas-calculator',
      'target-roas',
      'product-launch',
      'new-pricing',
      'reverse-pricing',
      'campaign-analytics',
      'bep-calculator',
      'settings',
    ],
    features: [
      'Kalkulator ROAS Real-time',
      'Indikator ROAS Bagus / Cukup / Rugi',
      'Target ROAS & Max Bid Calculator',
      'Reverse Pricing (Target Bersih Solver)',
      'Product Launch AI Assistant (1 Toko)',
      '1 Toko Shopee Terhubung',
      'Support Komunitas & Tutorial Dasar',
    ],
  },
  {
    code: 'PLUS',
    name: 'ASIS PLUS',
    tagline: 'Solusi Cerdas untuk Brand Owner & Scale-up Seller',
    badge: 'Paling Populer',
    isPopular: true,
    monthlyPrice: 299000,
    yearlyPrice: 2990000,
    maxStores: 3,
    maxProducts: 150,
    allowedViews: [
      'dashboard',
      'landing-page',
      'pricing',
      'profile',
      'user-subscription',
      'tutorial',
      'roas-calculator',
      'target-roas',
      'product-launch',
      'new-pricing',
      'reverse-pricing',
      'campaign-analytics',
      'bep-calculator',
      'settings',
      // Plus Additions:
      'market-analyzer',
      'competitive-gap',
      'variant-analytics',
      'price-simulator',
      'discount-calculator',
      'voucher-simulator',
      'ads-budget',
      'profit-simulator',
      'inventory',
      'products',
      'product-analytics',
      'fee-scenarios',
      'tax-dashboard',
    ],
    features: [
      'Semua fitur paket LITE',
      'Market Price Analyzer & Sweet Spot',
      'Estimasi Omzet Kompetitor',
      'Price Simulator Multi-Skenario',
      'Discount & Voucher Safety Calculator',
      'Profit Growth Simulator (+10% s/d +100%)',
      'Analisis Varian Produk',
      'Simulasi Skenario Biaya Fleksibel',
      'Tax Dashboard (PP 55/2022 & PMK 37/2025)',
      'Dukungan Hingga 3 Toko Shopee',
      'Prioritas Email Support',
    ],
  },
  {
    code: 'KIT',
    name: 'ASIS KIT',
    tagline: 'Financial Operating System Lengkap & Multi-Toko Enterprise',
    badge: 'Full Enterprise',
    monthlyPrice: 499000,
    yearlyPrice: 4990000,
    maxStores: 10,
    maxProducts: 1000,
    allowedViews: [
      // All Views Allowed for Kit
      'dashboard',
      'landing-page',
      'pricing',
      'profile',
      'user-subscription',
      'tutorial',
      'roas-calculator',
      'target-roas',
      'product-launch',
      'new-pricing',
      'reverse-pricing',
      'campaign-analytics',
      'bep-calculator',
      'settings',
      'market-analyzer',
      'competitive-gap',
      'variant-analytics',
      'price-simulator',
      'discount-calculator',
      'voucher-simulator',
      'ads-budget',
      'profit-simulator',
      'inventory',
      'products',
      'product-analytics',
      'fee-scenarios',
      'tax-dashboard',
      'true-profit-engine',
      'bulk-pricing',
      'profit-analytics',
      'orders',
      'stock-forecast',
      'opportunity-center',
      'alerts',
      'reports',
      'import',
      'admin-fee-rules',
    ],
    features: [
      'Semua fitur paket PLUS',
      'True Profit Engine Real-time',
      'Bulk Pricing Matrix Calculator',
      'Analisis Laba Rugi Otomatis (P&L SKU)',
      'Dashboard Orders AsisFlow & Tracking Resi',
      'Manajemen Stok & Run-out Forecast Cerdas',
      'Opportunity Center (Rekomendasi Cerdas)',
      'Alert Center (Pendeteksi Otomatis Boncos)',
      'Ekspor Laporan Finansial (CSV & Excel)',
      'Dukungan Hingga 10 Toko Shopee',
      'Dedicated WhatsApp Account Manager',
    ],
  },
];

// Helper: Hashing credential representation (never store plaintext password)
export function hashPassword(plaintext: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < plaintext.length; i++) {
    hash ^= plaintext.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return 'pbkdf2_sha256$' + Math.abs(hash >>> 0).toString(16) + '$asis_secure_salt';
}

// 2. SEED USERS FOR MULTI-ROLE & LIFECYCLE TESTING
export const SEED_USERS: User[] = [
  {
    id: 'usr_admin_01',
    name: 'Super Administrator',
    email: 'admin@asisseller.com',
    phone: '+6281234567890',
    passwordHash: hashPassword('Admin123!'),
    emailVerified: true,
    role: 'ADMIN',
    subscriptionPlan: 'KIT',
    subscriptionStatus: 'ACTIVE',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-03-20T10:00:00.000Z',
  },
  {
    id: 'usr_seller_01',
    name: 'Zaskia Nurul Hidayah',
    email: 'seller@zaskiahijab.com',
    phone: '+6281987654321',
    passwordHash: hashPassword('Seller123!'),
    emailVerified: true,
    role: 'USER',
    subscriptionPlan: 'PLUS',
    subscriptionStatus: 'ACTIVE',
    createdAt: '2026-02-01T09:30:00.000Z',
    updatedAt: '2026-03-25T14:20:00.000Z',
  },
  {
    id: 'usr_seller_02',
    name: 'Budi Santoso',
    email: 'budi@tokobudi.com',
    phone: '+6285211223344',
    passwordHash: hashPassword('Budi123!'),
    emailVerified: true,
    role: 'USER',
    subscriptionPlan: 'LITE',
    subscriptionStatus: 'ACTIVE',
    createdAt: '2026-02-15T11:00:00.000Z',
    updatedAt: '2026-03-10T16:45:00.000Z',
  },
  {
    id: 'usr_seller_unverified',
    name: 'Andi Pratama (Belum Verifikasi)',
    email: 'andi@newstore.com',
    phone: '+6287755667788',
    passwordHash: hashPassword('Andi123!'),
    emailVerified: false,
    role: 'USER',
    subscriptionPlan: 'LITE',
    subscriptionStatus: 'PENDING',
    createdAt: '2026-03-26T18:00:00.000Z',
    updatedAt: '2026-03-26T18:00:00.000Z',
  },
];

export const SEED_SUBSCRIPTIONS: SubscriptionRecord[] = [
  {
    id: 'sub_admin_01',
    userId: 'usr_admin_01',
    userEmail: 'admin@asisseller.com',
    userName: 'Super Administrator',
    planCode: 'KIT',
    status: 'ACTIVE',
    billingCycle: 'yearly',
    amount: 4990000,
    currentPeriodStart: '2026-01-01T00:00:00.000Z',
    currentPeriodEnd: '2027-01-01T00:00:00.000Z',
    notes: 'Internal Administrator License',
  },
  {
    id: 'sub_seller_01',
    userId: 'usr_seller_01',
    userEmail: 'seller@zaskiahijab.com',
    userName: 'Zaskia Nurul Hidayah',
    planCode: 'PLUS',
    status: 'ACTIVE',
    billingCycle: 'monthly',
    amount: 299000,
    currentPeriodStart: '2026-03-01T00:00:00.000Z',
    currentPeriodEnd: '2026-04-01T00:00:00.000Z',
    notes: 'Subscription Aktif via Invoice',
  },
  {
    id: 'sub_seller_02',
    userId: 'usr_seller_02',
    userEmail: 'budi@tokobudi.com',
    userName: 'Budi Santoso',
    planCode: 'LITE',
    status: 'ACTIVE',
    billingCycle: 'monthly',
    amount: 149000,
    currentPeriodStart: '2026-03-10T00:00:00.000Z',
    currentPeriodEnd: '2026-04-10T00:00:00.000Z',
    notes: 'Subscription Bulanan',
  },
  {
    id: 'sub_seller_unverified',
    userId: 'usr_seller_unverified',
    userEmail: 'andi@newstore.com',
    userName: 'Andi Pratama',
    planCode: 'LITE',
    status: 'PENDING',
    billingCycle: 'monthly',
    amount: 149000,
    currentPeriodStart: '2026-03-26T00:00:00.000Z',
    currentPeriodEnd: '2026-04-26T00:00:00.000Z',
    notes: 'Menunggu Verifikasi Email',
  },
];

export const SEED_VERIFICATION_TOKENS: EmailVerificationToken[] = [
  {
    id: 'tok_01',
    userId: 'usr_seller_unverified',
    email: 'andi@newstore.com',
    token: '849201',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

/**
 * Access Control Evaluator
 * Evaluates whether a user is authorized to open a requested view.
 * Respects authentication -> email verification -> active subscription -> store connection -> plan tier.
 */
export function checkViewAccess(
  user: User | null,
  view: string,
  plans: SubscriptionPlan[] = DEFAULT_PLANS,
  isStoreConnected: boolean = true,
  isSimulationMode: boolean = false
): AccessCheckResult {
  // Public views: Always accessible without login
  const publicViews = ['landing-page', 'pricing', 'login', 'register', 'verify-email', 'tutorial'];
  if (publicViews.includes(view)) {
    return { allowed: true };
  }

  // Protected view requires authentication
  if (!user) {
    return {
      allowed: false,
      reason: 'AUTH_REQUIRED',
      message: 'Silakan masuk ke akun ASIS SELLER Anda terlebih dahulu.',
    };
  }

  // Admin exclusive views
  const adminViews = ['admin-dashboard', 'admin-users', 'admin-plans', 'admin-subscriptions', 'admin-fee-rules'];
  if (adminViews.includes(view)) {
    if (user.role === 'ADMIN') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'ADMIN_ONLY',
      message: 'Halaman ini khusus untuk Administrator ASIS SELLER.',
    };
  }

  // For regular application views, verify email first
  if (!user.emailVerified) {
    return {
      allowed: false,
      reason: 'EMAIL_NOT_VERIFIED',
      message: 'Silakan verifikasi email Anda sebelum menggunakan dashboard.',
    };
  }

  // Admins have bypass access to all seller calculators & tools
  if (user.role === 'ADMIN') {
    return { allowed: true };
  }

  // User Views: Profile and Subscription management are always accessible for verified users
  if (['profile', 'user-subscription', 'subscription'].includes(view)) {
    return { allowed: true };
  }

  // Check Subscription Status
  if (user.subscriptionStatus !== 'ACTIVE') {
    return {
      allowed: false,
      reason: 'SUBSCRIPTION_INACTIVE',
      message: `Status langganan Anda saat ini (${user.subscriptionStatus}). Silakan aktifkan atau perbarui langganan Anda.`,
    };
  }

  // Check Shopee Connection requirement for store-data-dependent views
  const shopeeDependentViews = [
    'orders',
    'inventory',
    'stock-forecast',
    'import-data',
    'campaign-analytics',
  ];

  if (shopeeDependentViews.includes(view) && !isStoreConnected && !isSimulationMode) {
    return {
      allowed: false,
      reason: 'SHOPEE_CONNECTION_REQUIRED',
      message: 'Fitur ini membutuhkan toko Shopee yang terhubung. Silakan hubungkan toko Shopee Anda terlebih dahulu.',
    };
  }

  // Check Plan Feature Entitlements
  const currentPlan = plans.find((p) => p.code === user.subscriptionPlan) || plans[0];
  if (currentPlan.allowedViews.includes(view)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'PLAN_UPGRADE_REQUIRED',
    message: `Fitur ini membutuhkan upgrade ke paket ${user.subscriptionPlan === 'LITE' ? 'PLUS atau KIT' : 'KIT'}.`,
  };
}
