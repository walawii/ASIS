/**
 * ASIS SELLER - Fee Rule Engine
 * 
 * Centralized marketplace fee calculation service for Shopee Indonesia.
 * Features:
 * - Single source of truth (reads rulesData.ts)
 * - Versioned fee rules with transactionDate evaluation
 * - Non-Star seller eligibility (upload date before 1 August 2026 + completed orders)
 * - Fixed Order Processing Fee (Rp1.250) with exemption handling
 * - Dedicated calculations for Free Shipping XTRA, Promo XTRA, Promo XTRA+, Pre-Order, and Affiliate
 */

import {
  SellerType,
  MarketplaceFeeRule,
  SellerProgramRule,
  ProgramType,
} from '../../types/rules.ts';
import { AffiliateConfig } from '../../types/profit.ts';
import {
  INITIAL_MARKETPLACE_FEE_RULES,
  INITIAL_PROGRAM_RULES,
  OFFICIAL_ORDER_PROCESSING_FEE_RULE,
  OFFICIAL_PPN_TAX_RULE,
} from '../profitEngine/rulesData.ts';

export * from '../profitEngine/rulesData.ts';

export interface FeeRuleLookupParams {
  sellerStatus: SellerType;
  category?: string;
  transactionDate?: string;
  productUploadDate?: string;
  sellerProfile?: {
    firstProductUploadDate?: string;
    sellerJoinDate?: string;
    completedOrderCount?: number;
  };
}

/**
 * Evaluasi apakah suatu rule aktif pada tanggal transaksi (Rule Versioning)
 */
export function isRuleActiveOnDate(
  rule: {
    effectiveFrom: string;
    effectiveUntil?: string;
    active: boolean;
    status?: string;
  },
  transactionDate: string = '2026-09-25'
): boolean {
  if (!rule.active) return false;
  if (rule.status === 'EXPIRED' || rule.status === 'UNVERIFIED') return false;

  const txTime = new Date(transactionDate).getTime();
  const fromTime = new Date(rule.effectiveFrom).getTime();

  if (isNaN(txTime) || isNaN(fromTime)) return rule.active;
  if (txTime < fromTime) return false;

  if (rule.effectiveUntil) {
    const untilTime = new Date(rule.effectiveUntil).getTime();
    if (!isNaN(untilTime) && txTime > untilTime) return false;
  }

  return true;
}

/**
 * Mencari rule administrasi marketplace yang sesuai dengan status seller, kategori, dan tanggal transaksi.
 * Memperhitungkan aturan khusus Non-Star: produk awal di-upload sebelum 1 Agustus 2026 dengan pesanan selesai <= 50.
 */
export function findApplicableFeeRule(
  params: FeeRuleLookupParams,
  rules: MarketplaceFeeRule[] = INITIAL_MARKETPLACE_FEE_RULES
): MarketplaceFeeRule {
  const txDate = params.transactionDate || '2026-09-25';
  const categoryProvided = !!params.category && params.category.trim().length > 0;
  const category = categoryProvided ? params.category!.trim() : 'Umum';

  // Filter rules yang aktif pada tanggal transaksi
  const dateActiveRules = rules.filter(
    (r) => r.feeType === 'ADMINISTRATION' && isRuleActiveOnDate(r, txDate)
  );

  let eligibilityState: 'ELIGIBLE' | 'REQUIRES_SELLER_DATA' | 'RULE_REQUIRES_CATEGORY' | 'RULE_DATA_UNAVAILABLE' = 'ELIGIBLE';

  if (!categoryProvided) {
    eligibilityState = 'RULE_REQUIRES_CATEGORY';
  }

  // 1. Cek Aturan Khusus Non-Star (0% Admin Fee)
  if (params.sellerStatus === 'NON_STAR') {
    const hasUploadDate = !!params.productUploadDate || !!params.sellerProfile?.firstProductUploadDate;
    const hasOrderCount = params.sellerProfile?.completedOrderCount !== undefined;

    if (!hasUploadDate && !hasOrderCount) {
      eligibilityState = 'REQUIRES_SELLER_DATA';
    } else {
      const uploadDate =
        params.productUploadDate ||
        params.sellerProfile?.firstProductUploadDate ||
        '2026-01-01';
      const completedOrders = params.sellerProfile?.completedOrderCount ?? 0;

      // Syarat resmi: diunggah sebelum 1 Agustus 2026 & pesanan selesai <= 50
      const isUploadedBeforeAug2026 = new Date(uploadDate) < new Date('2026-08-01');
      const isOrderEligible = completedOrders <= 50;

      if (isUploadedBeforeAug2026 && isOrderEligible) {
        const graceRule = dateActiveRules.find(
          (r) => r.sellerType === 'NON_STAR' && r.specialEligibility === 'FIRST_PRODUCTS_BEFORE_AUG_2026'
        );
        if (graceRule) {
          return {
            ...graceRule,
            eligibilityState: categoryProvided ? 'ELIGIBLE' : 'RULE_REQUIRES_CATEGORY',
          };
        }
      }
    }
  }

  // 2. Exact match: sellerStatus & category
  let match = dateActiveRules.find(
    (r) => r.sellerType === params.sellerStatus && r.category.toLowerCase() === category.toLowerCase()
  );

  // 3. Fallback: STAR seller kategori sama jika sellerType lain belum memiliki rate spesifik
  if (!match) {
    match = dateActiveRules.find(
      (r) => r.sellerType === 'STAR' && r.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Jika kategori spesifik diberikan tetapi tidak ditemukan di rules:
  if (categoryProvided && category.toLowerCase() !== 'umum' && !match) {
    eligibilityState = 'RULE_DATA_UNAVAILABLE';
  }

  // 4. Fallback: sellerStatus kategori 'Umum'
  if (!match) {
    match = dateActiveRules.find(
      (r) => r.sellerType === params.sellerStatus && r.category === 'Umum'
    );
  }

  // 5. Fallback terakhir: STAR seller Umum
  if (!match) {
    match =
      dateActiveRules.find((r) => r.sellerType === 'STAR' && r.category === 'Umum') ||
      rules[0] ||
      INITIAL_MARKETPLACE_FEE_RULES[0];
  }

  return {
    ...match,
    eligibilityState,
  };
}

/**
 * Menghitung Biaya Pemrosesan Pesanan (Order Processing Fee).
 * Menggunakan aturan tetap Rp1.250 per transaksi selesai (bukan 1.5%).
 * Membedakan status applicable, exempt, dan alasan pembebasan.
 */
export function calculateOrderProcessingFee(params?: {
  completedOrders?: number;
  isExempt?: boolean;
  exemptionReason?: string;
  rule?: MarketplaceFeeRule;
  transactionDate?: string;
}): {
  feeAmount: number;
  feePerOrder: number;
  isExempt: boolean;
  applicable: boolean;
  exempt: boolean;
  reason: string;
  ruleApplied: MarketplaceFeeRule;
} {
  const rule = params?.rule || OFFICIAL_ORDER_PROCESSING_FEE_RULE;
  const orders = Math.max(1, params?.completedOrders ?? 1);
  const isExempt = !!params?.isExempt;

  if (isExempt || !rule.active) {
    const reason = params?.exemptionReason || (!rule.active ? 'Aturan dinonaktifkan' : 'Pesanan memenuhi kriteria pembebasan');
    return {
      feeAmount: 0,
      feePerOrder: 0,
      isExempt: true,
      applicable: false,
      exempt: true,
      reason,
      ruleApplied: rule,
    };
  }

  const feePerOrder = rule.fixedFee; // Flat Rp 1.250 per pesanan selesai
  return {
    feeAmount: Math.round(feePerOrder * orders),
    feePerOrder,
    isExempt: false,
    applicable: true,
    exempt: false,
    reason: 'Dikenakan tarif flat Rp1.250 per pesanan selesai sesuai ketentuan Shopee Indonesia.',
    ruleApplied: rule,
  };
}

/**
 * Menghitung Biaya Layanan Gratis Ongkir XTRA
 * Base: (originalProductPrice - sellerDiscount - sellerVoucher)
 * Cap: Rp40.000 untuk barang reguler, Rp60.000 untuk barang ukuran khusus
 */
export function calculateFreeShippingXtraFee(
  feeBase: number,
  category: string,
  options?: {
    isSpecialSize?: boolean;
    programRule?: SellerProgramRule;
    isEnabled?: boolean;
    transactionDate?: string;
  }
): number {
  if (options?.isEnabled === false) return 0;

  const rule =
    options && 'programRule' in options
      ? options.programRule
      : INITIAL_PROGRAM_RULES.find((p) => p.code === 'FREE_SHIPPING_XTRA');
  if (!rule || !rule.enabled) return 0;

  const catRule = rule.categoryRules?.[category];
  const rate = catRule?.rate ?? rule.rate; // e.g. 4.0%
  const defaultCap = options?.isSpecialSize
    ? (catRule?.specialSizeCap ?? rule.specialSizeCap ?? 60000)
    : (catRule?.cap ?? rule.cap ?? 40000);

  const rawFee = feeBase * (rate / 100);
  return Math.round(Math.min(rawFee, defaultCap));
}

/**
 * Menghitung Biaya Layanan Promo XTRA (Cashback XTRA)
 * Rate resmi: 4.5% (Maksimal Rp60.000 per kuantitas)
 */
export function calculatePromoXtraFee(
  feeBase: number,
  category: string,
  options?: {
    programRule?: SellerProgramRule;
    isEnabled?: boolean;
    transactionDate?: string;
  }
): number {
  if (options?.isEnabled === false) return 0;

  const rule =
    options && 'programRule' in options
      ? options.programRule
      : INITIAL_PROGRAM_RULES.find((p) => p.code === 'PROMO_XTRA');
  if (!rule || !rule.enabled) return 0;

  const catRule = rule.categoryRules?.[category];
  const rate = catRule?.rate ?? rule.rate; // 4.5%
  const cap = catRule?.cap ?? rule.cap ?? 60000;

  const rawFee = feeBase * (rate / 100);
  return Math.round(Math.min(rawFee, cap));
}

/**
 * Menghitung Biaya Layanan Promo XTRA+ (Double Boost)
 * Rate resmi: 6.5% (Maksimal Rp80.000 per kuantitas), tarif sudah termasuk PPN.
 */
export function calculatePromoXtraPlusFee(
  feeBase: number,
  options?: {
    programRule?: SellerProgramRule;
    isEnabled?: boolean;
    transactionDate?: string;
  }
): number {
  if (options?.isEnabled === false) return 0;

  const rule =
    options && 'programRule' in options
      ? options.programRule
      : INITIAL_PROGRAM_RULES.find((p) => p.code === 'PROMO_XTRA_PLUS');
  if (!rule || !rule.enabled) return 0;

  const rate = rule.rate; // 6.5%
  const cap = rule.cap ?? 80000;

  const rawFee = feeBase * (rate / 100);
  return Math.round(Math.min(rawFee, cap));
}

/**
 * Menghitung Biaya Layanan Pre-Order
 * Rate resmi: 3.0% untuk produk pre-order dengan SLA > 7 hari pada kategori tertentu.
 */
export function calculatePreOrderFee(
  feeBase: number,
  category: string,
  options?: {
    programRule?: SellerProgramRule;
    isEnabled?: boolean;
    customRate?: number;
  }
): number {
  if (!options?.isEnabled) return 0;

  const rule =
    options && 'programRule' in options
      ? options.programRule
      : INITIAL_PROGRAM_RULES.find((p) => p.code === 'PRE_ORDER');
  if (!rule || !rule.enabled) return 0;

  const rate = options?.customRate ?? rule.rate; // 3.0%
  return Math.round(feeBase * (rate / 100));
}

/**
 * Menghitung Komisi dan PPN Shopee Affiliate
 * Basis komisi: Net Completed Purchase Value (Nilai Pembelian Selesai Bersih)
 * PPN dihitung terpisah sesuai tarif resmi (default 11%).
 */
export function calculateAffiliateFee(params: {
  feeBase: number;
  config?: Partial<AffiliateConfig>;
  taxRate?: number;
}): {
  commissionBase: number;
  commission: number;
  tax: number;
  total: number;
  warning?: string;
} {
  const config = params.config;
  if (!config?.enabled || !config.commissionPercent || config.commissionPercent <= 0) {
    return {
      commissionBase: 0,
      commission: 0,
      tax: 0,
      total: 0,
    };
  }

  // Basis komisi adalah Net Completed Purchase Value
  const commissionBase = params.feeBase;
  const rate = config.actualRate ?? config.commissionPercent;
  let commission = commissionBase * (rate / 100);

  if (config.cap && commission > config.cap) {
    commission = config.cap;
  }

  // PPN atas komisi affiliate (bukan atas nilai barang) sesuai aturan resmi UU HPP
  const ppnRate = config.ppnRate ?? params.taxRate ?? OFFICIAL_PPN_TAX_RULE.taxRate;
  const tax = config.includePpn ? commission * (ppnRate / 100) : 0;
  const postFee = config.postFee || 0;
  const additional = config.additionalFeeFixed || 0;

  return {
    commissionBase: Math.round(commissionBase),
    commission: Math.round(commission),
    tax: Math.round(tax),
    total: Math.round(commission + tax + postFee + additional),
    warning:
      (config.targetRate && config.actualRate && config.targetRate !== config.actualRate) ||
      (!config.actualRate && config.targetRate)
        ? 'Komisi aktual Shopee Affiliate dapat dioptimalkan Shopee berdasarkan kanal (Target != Actual).'
        : undefined,
  };
}

/**
 * Helper komprehensif untuk seluruh Marketplace Fees
 */
export function calculateAllMarketplaceFees(
  feeBase: number,
  sellerType: SellerType,
  category: string,
  rules: MarketplaceFeeRule[] = INITIAL_MARKETPLACE_FEE_RULES,
  transactionDate: string = '2026-09-25'
): {
  adminFeeAmount: number;
  adminFeePercent: number;
  processingFeeAmount: number;
  totalMarketplaceFees: number;
  adminRule: MarketplaceFeeRule;
  processingRule: MarketplaceFeeRule;
} {
  const adminRule = findApplicableFeeRule(
    { sellerStatus: sellerType, category, transactionDate },
    rules
  );
  const processingResult = calculateOrderProcessingFee({ transactionDate });

  let adminFee = feeBase * (adminRule.percentage / 100);
  if (adminRule.maximumFee && adminFee > adminRule.maximumFee) {
    adminFee = adminRule.maximumFee;
  }
  if (adminRule.minimumFee && adminFee < adminRule.minimumFee) {
    adminFee = adminRule.minimumFee;
  }

  const processingFee = processingResult.feeAmount;
  const total = Math.round(adminFee + processingFee);

  return {
    adminFeeAmount: Math.round(adminFee),
    adminFeePercent: adminRule.percentage,
    processingFeeAmount: processingFee,
    totalMarketplaceFees: total,
    adminRule,
    processingRule: processingResult.ruleApplied,
  };
}
