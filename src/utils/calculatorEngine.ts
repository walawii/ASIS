/**
 * ASIS SELLER - Business Calculation Engine (Compatibility Wrapper)
 * 
 * Thin wrapper that delegates all core calculations to the authoritative True Profit Engine.
 * Ensures zero duplicate calculation paths across the application.
 */

import {
  calculateTrueProfit,
  calculateBreakEvenROAS as engineCalculateBreakEvenROAS,
  calculateMinimumPrice as engineCalculateMinimumPrice,
  calculateTargetPrice as engineCalculateTargetPrice,
  calculateMaximumDiscount as engineCalculateMaximumDiscount,
} from '../services/profitEngine/index.ts';
import {
  OFFICIAL_ORDER_PROCESSING_FEE_RULE,
  INITIAL_PROGRAM_RULES,
} from '../services/profitEngine/rulesData.ts';
import { TrueProfitInput } from '../types/profit.ts';
import { SellerType, MarketplaceFeeRule, SellerProgramRule } from '../types/rules.ts';

export interface ProfitCalculationInput {
  sellingPrice: number; // Harga jual normal (sebelum diskon)
  hpp: number; // Modal produk / Harga Pokok Penjualan
  discountPercent?: number; // Diskon seller dalam % (e.g., 10%)
  voucherSellerNominal?: number; // Voucher toko yang dipotong seller (Rp)
  adminFeePercent?: number; // Biaya admin marketplace Shopee (legacy)
  serviceFeePercent?: number; // Biaya layanan gratis ongkir xtra dll (legacy)
  transactionFeePercent?: number; // Biaya transaksi (DEPRECATED - now fixed Rp1.250)
  affiliateCommissionPercent?: number; // Komisi Shopee Affiliate jika ada
  packingCost: number; // Biaya packing
  operationalCostPerOrder: number; // Biaya operasional per order
  shippingSubsidySeller?: number; // Subsidi ongkir toko
  adsCostPerOrder: number; // Biaya iklan per produk terjual
  otherCost?: number; // Biaya tak terduga / retur buffer
  sellerType?: SellerType;
  category?: string;
  transactionDate?: string;
}

export interface ProfitCalculationResult {
  sellingPrice: number;
  discountAmount: number;
  effectivePrice: number; // Harga efektif dibayar pembeli
  grossRevenue: number;
  marketplaceFeeTotalPercent: number;
  marketplaceFeeNominal: number;
  affiliateFeeNominal: number;
  totalMarketplaceDeduction: number;
  operationalCostsTotal: number;
  totalCostExcludingAds: number;
  totalAllCosts: number;
  netProfit: number;
  profitMarginPercent: number;
  roas: number;
  bepRoas: number;
  maxAdsCost: number;
  status: 'UNTUNG' | 'TIPIS' | 'BREAK EVEN' | 'RUGI';
  statusExplanation: string;
}

/**
 * 1. Menghitung Profit Bersih & Margin (Delegates directly to True Profit Engine)
 */
export function calculateProfit(input: ProfitCalculationInput): ProfitCalculationResult {
  const sellingPrice = Math.max(0, input.sellingPrice || 0);
  const discountPercent = Math.max(0, Math.min(100, input.discountPercent || 0));
  const voucherNominal = Math.max(0, input.voucherSellerNominal || 0);

  const engineInput: TrueProfitInput = {
    originalProductPrice: sellingPrice,
    sellerDiscountPercent: discountPercent,
    vouchers: voucherNominal > 0 ? [{ type: 'FIXED', nominal: voucherNominal, payer: 'SELLER' }] : [],
    hpp: Math.max(0, input.hpp || 0),
    sellerType: input.sellerType || 'STAR',
    category: input.category || 'Umum',
    transactionDate: input.transactionDate || '2026-09-25',
    isFreeShippingXtraActive: (input.serviceFeePercent || 0) > 0,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: (input.affiliateCommissionPercent || 0) > 0,
    affiliateConfig: {
      enabled: (input.affiliateCommissionPercent || 0) > 0,
      commissionPercent: input.affiliateCommissionPercent || 0,
      includePpn: true,
      ppnRate: 11,
    },
    adsCostPerOrder: Math.max(0, input.adsCostPerOrder || 0),
    shippingConfig: {
      actualShippingCost: 0,
      buyerShippingPaid: 0,
      sellerShippingContribution: Math.max(0, input.shippingSubsidySeller || 0),
      platformShippingSubsidy: 0,
      returnShippingCost: 0,
    },
    operationalCostConfig: {
      allocationType: 'PER_ORDER',
      packingCost: Math.max(0, input.packingCost || 0),
      laborCost: Math.max(0, input.operationalCostPerOrder || 0),
      warehouseCost: 0,
      electricityCost: 0,
      internetCost: 0,
      softwareCost: 0,
      rentCost: 0,
      customerServiceCost: 0,
      paymentGatewayCost: 0,
      otherCost: Math.max(0, input.otherCost || 0),
    },
  };

  let customMarketplaceRules: MarketplaceFeeRule[] | undefined = undefined;
  let customProcessingRule: MarketplaceFeeRule | undefined = undefined;
  let customProgramRules: SellerProgramRule[] | undefined = undefined;

  const hasLegacyFeeOverrides =
    input.adminFeePercent !== undefined ||
    input.serviceFeePercent !== undefined ||
    input.transactionFeePercent !== undefined;

  if (hasLegacyFeeOverrides) {
    const adminPct = input.adminFeePercent ?? 6.5;
    const trxPct = input.transactionFeePercent ?? 0;
    customMarketplaceRules = [
      {
        id: 'legacy_override_rule',
        marketplace: 'SHOPEE',
        sellerType: input.sellerType || 'STAR',
        category: input.category || 'Umum',
        feeType: 'ADMINISTRATION',
        percentage: adminPct + trxPct,
        fixedFee: 0,
        calculationBase: 'AFTER_SELLER_DISCOUNT_AND_VOUCHER',
        effectiveFrom: '2020-01-01',
        active: true,
        status: 'ACTIVE',
        source: 'Legacy Override',
        notes: 'Legacy fee input override',
        verifiedAt: '2026-09-25',
      },
    ];
    if (input.transactionFeePercent !== undefined) {
      customProcessingRule = {
        ...OFFICIAL_ORDER_PROCESSING_FEE_RULE,
        fixedFee: 0,
        percentage: 0,
        active: false,
      };
    }

    if (input.serviceFeePercent !== undefined) {
      customProgramRules = [
        {
          id: 'legacy_service_fee',
          code: 'FREE_SHIPPING_XTRA',
          name: 'Gratis Ongkir XTRA (Legacy)',
          description: 'Legacy custom service fee',
          enabled: input.serviceFeePercent > 0,
          rate: input.serviceFeePercent,
          cap: undefined,
          calculationBase: 'AFTER_SELLER_DISCOUNT_AND_VOUCHER',
          effectiveFrom: '2020-01-01',
          status: 'ACTIVE',
          source: 'Legacy Override',
          verifiedAt: '2026-09-25',
        },
        ...INITIAL_PROGRAM_RULES.filter((p) => p.code !== 'FREE_SHIPPING_XTRA'),
      ];
    }
  }

  const trueProfit = calculateTrueProfit(
    engineInput,
    customMarketplaceRules,
    customProgramRules,
    undefined,
    customProcessingRule
  );

  const effectivePrice = trueProfit.feeBase;
  const grossRevenue = effectivePrice;
  const marketplaceFeeNominal = trueProfit.totalMarketplaceFees + trueProfit.totalProgramFees;
  const affiliateFeeNominal = trueProfit.totalAffiliateCost;
  const totalMarketplaceDeduction = marketplaceFeeNominal + affiliateFeeNominal;
  const operationalCostsTotal =
    trueProfit.totalOperationalCost + trueProfit.netShippingCostToSeller;
  const totalCostExcludingAds =
    trueProfit.cogsHpp + totalMarketplaceDeduction + operationalCostsTotal;
  const totalAllCosts = totalCostExcludingAds + trueProfit.adsCostPerOrder;
  const netProfit = trueProfit.actualNetProfit;
  const profitMarginPercent = trueProfit.actualNetMargin;

  const profitBeforeAds = grossRevenue - totalCostExcludingAds;
  const maxAdsCost = Math.max(0, profitBeforeAds);

  let status: 'UNTUNG' | 'TIPIS' | 'BREAK EVEN' | 'RUGI' = 'UNTUNG';
  let statusExplanation = 'Produk menghasilkan laba yang sehat di atas target margin.';

  if (netProfit < -100) {
    status = 'RUGI';
    statusExplanation = 'Biaya (HPP + fee + iklan) melebihi harga jual. Anda rugi per transaksi!';
  } else if (Math.abs(netProfit) <= 100) {
    status = 'BREAK EVEN';
    statusExplanation = 'Titik impas (BEP). Anda tidak rugi namun tidak mendapatkan laba bersih.';
  } else if (profitMarginPercent < 8) {
    status = 'TIPIS';
    statusExplanation = 'Margin profit sangat tipis (< 8%). Berisiko tergerus jika ada retur atau biaya ads naik.';
  } else {
    status = 'UNTUNG';
    statusExplanation = `Laba bersih Rp ${Math.round(netProfit).toLocaleString('id-ID')} (${profitMarginPercent.toFixed(1)}%). Sesuai strategi sehat.`;
  }

  return {
    sellingPrice,
    discountAmount: trueProfit.sellerDiscountAmount,
    effectivePrice,
    grossRevenue,
    marketplaceFeeTotalPercent: Number(
      (
        trueProfit.marketplaceAdminPercent +
        (trueProfit.freeShippingXtraFee > 0 ? 4 : 0) +
        (input.affiliateCommissionPercent || 0)
      ).toFixed(2)
    ),
    marketplaceFeeNominal,
    affiliateFeeNominal,
    totalMarketplaceDeduction,
    operationalCostsTotal,
    totalCostExcludingAds,
    totalAllCosts,
    netProfit,
    profitMarginPercent,
    roas: trueProfit.roas,
    bepRoas: trueProfit.breakEvenRoas,
    maxAdsCost,
    status,
    statusExplanation,
  };
}

/**
 * 2. Menghitung Margin Profit
 */
export function calculateMargin(netProfit: number, revenue: number): number {
  if (revenue <= 0) return 0;
  return Number(((netProfit / revenue) * 100).toFixed(2));
}

/**
 * 3. Menghitung ROAS
 */
export function calculateROAS(revenue: number, adsCost: number): number {
  if (adsCost <= 0) return 0;
  return Number((revenue / adsCost).toFixed(2));
}

/**
 * 4. Menghitung Break Even ROAS (BEP ROAS)
 */
export function calculateBreakEvenROAS(
  sellingPrice: number,
  hpp: number,
  totalFeeRatePercent: number,
  operationalCosts: number
): number {
  const totalFeesAndCosts = sellingPrice * (totalFeeRatePercent / 100) + operationalCosts;
  return engineCalculateBreakEvenROAS(sellingPrice, hpp, totalFeesAndCosts);
}

/**
 * 5. Menghitung Harga Minimum Jual (BEP Price)
 */
export function calculateMinimumPrice(
  hpp: number,
  fixedCostsPerOrder: number,
  totalFeeRatePercent: number
): number {
  return engineCalculateMinimumPrice(hpp, fixedCostsPerOrder, totalFeeRatePercent);
}

/**
 * 6. Menghitung Harga Target berdasarkan Target Profit Margin
 */
export function calculateTargetPrice(
  hpp: number,
  fixedCostsPerOrder: number,
  totalFeeRatePercent: number,
  targetMarginPercent: number
): number {
  return engineCalculateTargetPrice(
    hpp,
    fixedCostsPerOrder,
    totalFeeRatePercent,
    targetMarginPercent
  );
}

/**
 * 7. Menghitung Diskon Maksimal yang Masih Aman
 */
export function calculateMaximumDiscount(
  normalPrice: number,
  hpp: number,
  fixedCostsPerOrder: number,
  totalFeeRatePercent: number,
  minProfitRequired: number = 0
): { maxDiscountPercent: number; minAllowedEffectivePrice: number } {
  const minEffectivePrice = engineCalculateMinimumPrice(
    hpp,
    fixedCostsPerOrder + minProfitRequired,
    totalFeeRatePercent
  );

  const maxDiscountPercent = engineCalculateMaximumDiscount(normalPrice, minEffectivePrice);

  return {
    maxDiscountPercent,
    minAllowedEffectivePrice: Math.round(minEffectivePrice),
  };
}

/**
 * 8. Menghitung Anggaran Iklan Maksimal (Max Ads Budget)
 */
export function calculateMaximumAdsSpend(targetRevenue: number, targetRoas: number): number {
  if (targetRoas <= 0) return 0;
  return Math.round(targetRevenue / targetRoas);
}

/**
 * 9. Menghitung Perkiraan Stok & Run-out Forecast
 */
export interface StockForecastResult {
  currentStock: number;
  dailyVelocity: number;
  daysRemaining: number;
  estimatedRunOutDate: string;
  status: 'AMAN' | 'WASPADA' | 'KRITIS';
  reorderRecommendationUnits: number;
  statusMessage: string;
}

export function calculateStockForecast(
  currentStock: number,
  dailySalesVelocity: number,
  leadTimeDays: number = 7,
  safetyStockDays: number = 5
): StockForecastResult {
  const velocity = Math.max(0.1, dailySalesVelocity);
  const daysRemaining = Math.max(0, Math.floor(currentStock / velocity));

  const runOutDate = new Date();
  runOutDate.setDate(runOutDate.getDate() + daysRemaining);
  const estimatedRunOutDate = runOutDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const reorderPoint = Math.ceil((leadTimeDays + safetyStockDays) * velocity);
  const reorderRecommendationUnits = Math.max(0, reorderPoint * 2 - currentStock);

  let status: 'AMAN' | 'WASPADA' | 'KRITIS' = 'AMAN';
  let statusMessage = `Stok mencukupi untuk ${daysRemaining} hari ke depan.`;

  if (daysRemaining <= 4 || currentStock <= 5) {
    status = 'KRITIS';
    statusMessage = `PERINGATAN KRITIS: Stok diperkirakan habis dalam ${daysRemaining} hari! Segera restock ${Math.ceil(reorderRecommendationUnits)} unit.`;
  } else if (daysRemaining <= leadTimeDays + safetyStockDays) {
    status = 'WASPADA';
    statusMessage = `WASPADA: Stok tersisa ${daysRemaining} hari. Pertimbangkan PO sekarang (Lead time ${leadTimeDays} hari).`;
  }

  return {
    currentStock,
    dailyVelocity: velocity,
    daysRemaining,
    estimatedRunOutDate,
    status,
    reorderRecommendationUnits,
    statusMessage,
  };
}

/**
 * 10. Evaluasi Indikator ROAS dengan Ambang Batas Kustom
 */
export function evaluateRoasIndicator(
  actualRoas: number,
  targetRoas: number,
  bepRoas: number
): {
  category: 'ROAS BAGUS' | 'ROAS CUKUP' | 'ROAS RUGI';
  color: 'emerald' | 'amber' | 'rose';
  explanation: string;
} {
  if (actualRoas <= 0) {
    return {
      category: 'ROAS RUGI',
      color: 'rose',
      explanation: 'Iklan belum menghasilkan konversi atau biaya melebihi hasil.',
    };
  }

  if (actualRoas < bepRoas) {
    return {
      category: 'ROAS RUGI',
      color: 'rose',
      explanation: `ROAS (${actualRoas.toFixed(2)}x) berada di bawah BEP (${bepRoas.toFixed(2)}x). Anda rugi di biaya iklan!`,
    };
  }

  if (actualRoas >= targetRoas) {
    return {
      category: 'ROAS BAGUS',
      color: 'emerald',
      explanation: `ROAS (${actualRoas.toFixed(2)}x) melampaui target Anda (${targetRoas.toFixed(2)}x). Campaign sangat profitable & siap di-scale!`,
    };
  }

  return {
    category: 'ROAS CUKUP',
    color: 'amber',
    explanation: `ROAS (${actualRoas.toFixed(2)}x) di atas BEP (${bepRoas.toFixed(2)}x) tetapi masih di bawah target (${targetRoas.toFixed(2)}x). Optimasi kata kunci & gambar produk.`,
  };
}

// Re-export full True Profit Engine suite
export * from '../services/profitEngine/index.ts';
