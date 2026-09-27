/**
 * ASIS SELLER - True Profit Engine
 * 
 * Standalone, authoritative calculation engine for Indonesian Shopee sellers.
 * Features:
 * - Single source of truth calculation pipeline
 * - Integrated Fee Engine (category & seller-status rules, versioning by transactionDate)
 * - Non-Star eligibility evaluation
 * - Fixed Order Processing Fee (Rp1.250)
 * - Free Shipping XTRA, Promo XTRA, Promo XTRA+, Pre-Order, and Affiliate
 * - Separation of PPN and PPh 22 Marketplace (PMK 37/2025)
 * - Detailed step-by-step audit trail
 */

import {
  TrueProfitInput,
  TrueProfitCalculation,
  CalculationAuditStep,
  VoucherConfig,
  AffiliateConfig,
  AdvertisingConfig,
  ShippingConfig,
  ReturnConfig,
  FulfillmentConfig,
  OperationalCostConfig,
} from '../../types/profit.ts';
import {
  MarketplaceFeeRule,
  SellerProgramRule,
  SellerType,
  TaxProfile,
  Pph22Result,
  TaxTreatment,
  TaxEligibilityState,
} from '../../types/rules.ts';
import {
  INITIAL_MARKETPLACE_FEE_RULES,
  INITIAL_PROGRAM_RULES,
  OFFICIAL_ORDER_PROCESSING_FEE_RULE,
} from './rulesData.ts';
import {
  findApplicableFeeRule,
  calculateOrderProcessingFee,
  calculateFreeShippingXtraFee,
  calculatePromoXtraFee,
  calculatePromoXtraPlusFee,
  calculatePreOrderFee,
  calculateAffiliateFee,
} from '../feeEngine/index.ts';
import {
  calculateTaxForTransaction,
  evaluatePph22Eligibility,
} from '../taxEngine/index.ts';

// 1. calculateGrossSales
export function calculateGrossSales(
  originalProductPrice: number,
  sellerDiscountAmount: number,
  platformVoucherContribution: number = 0
): number {
  const priceAfterDiscount = Math.max(0, originalProductPrice - sellerDiscountAmount);
  return priceAfterDiscount + platformVoucherContribution;
}

// 2. calculateSellerDiscount
export function calculateSellerDiscount(
  originalPrice: number,
  discountPercent: number
): number {
  if (discountPercent <= 0) return 0;
  return Math.round(originalPrice * (Math.min(100, Math.max(0, discountPercent)) / 100));
}

// 3. calculateMarketplaceFees
export function calculateMarketplaceFees(
  feeBase: number,
  sellerType: SellerType,
  category: string,
  rules: MarketplaceFeeRule[] = INITIAL_MARKETPLACE_FEE_RULES,
  processingRule: MarketplaceFeeRule = OFFICIAL_ORDER_PROCESSING_FEE_RULE,
  options?: {
    transactionDate?: string;
    productUploadDate?: string;
    sellerProfile?: {
      firstProductUploadDate?: string;
      sellerJoinDate?: string;
      completedOrderCount?: number;
    };
  }
): {
  adminFeeAmount: number;
  adminFeePercent: number;
  processingFeeAmount: number;
  totalMarketplaceFees: number;
  ruleApplied: MarketplaceFeeRule;
  processingRuleApplied: MarketplaceFeeRule;
} {
  const txDate = options?.transactionDate || '2026-09-25';

  const rule = findApplicableFeeRule(
    {
      sellerStatus: sellerType,
      category,
      transactionDate: txDate,
      productUploadDate: options?.productUploadDate,
      sellerProfile: options?.sellerProfile,
    },
    rules
  );

  const rawAdminFee = feeBase * (rule.percentage / 100);
  let adminFeeAmount = rawAdminFee;
  if (rule.maximumFee && adminFeeAmount > rule.maximumFee) {
    adminFeeAmount = rule.maximumFee;
  }
  if (rule.minimumFee && adminFeeAmount < rule.minimumFee) {
    adminFeeAmount = rule.minimumFee;
  }

  // Processing Fee: fixed Rp 1.250 flat
  const processingResult = calculateOrderProcessingFee({
    rule: processingRule,
    transactionDate: txDate,
  });
  const processingFeeAmount = processingResult.feeAmount;
  const totalMarketplaceFees = Math.round(adminFeeAmount + processingFeeAmount);

  return {
    adminFeeAmount: Math.round(adminFeeAmount),
    adminFeePercent: rule.percentage,
    processingFeeAmount,
    totalMarketplaceFees,
    ruleApplied: rule,
    processingRuleApplied: processingResult.ruleApplied,
  };
}

// 4. calculateProgramFees
export function calculateProgramFees(
  feeBase: number,
  isFreeShippingXtra: boolean,
  isPromoXtra: boolean,
  isPromoXtraPlus: boolean,
  category: string,
  programRules: SellerProgramRule[] = INITIAL_PROGRAM_RULES,
  options?: {
    isPreOrder?: boolean;
    isSpecialSize?: boolean;
    transactionDate?: string;
  }
): {
  freeShippingXtraFee: number;
  promoXtraFee: number;
  promoXtraPlusFee: number;
  preOrderFee: number;
  totalProgramFees: number;
} {
  const fsRule = programRules.find((r) => r.code === 'FREE_SHIPPING_XTRA');
  const pxRule = programRules.find((r) => r.code === 'PROMO_XTRA');
  const pxPlusRule = programRules.find((r) => r.code === 'PROMO_XTRA_PLUS');
  const poRule = programRules.find((r) => r.code === 'PRE_ORDER');

  const freeShippingXtraFee = calculateFreeShippingXtraFee(feeBase, category, {
    programRule: fsRule,
    isEnabled: isFreeShippingXtra,
    isSpecialSize: options?.isSpecialSize,
    transactionDate: options?.transactionDate,
  });

  const promoXtraFee = calculatePromoXtraFee(feeBase, category, {
    programRule: pxRule,
    isEnabled: isPromoXtra,
    transactionDate: options?.transactionDate,
  });

  const promoXtraPlusFee = calculatePromoXtraPlusFee(feeBase, {
    programRule: pxPlusRule,
    isEnabled: isPromoXtraPlus,
    transactionDate: options?.transactionDate,
  });

  const preOrderFee = calculatePreOrderFee(feeBase, category, {
    programRule: poRule,
    isEnabled: options?.isPreOrder,
  });

  const totalProgramFees = Math.round(
    freeShippingXtraFee + promoXtraFee + promoXtraPlusFee + preOrderFee
  );

  return {
    freeShippingXtraFee,
    promoXtraFee,
    promoXtraPlusFee,
    preOrderFee,
    totalProgramFees,
  };
}

// 5. calculateAffiliateFees
export function calculateAffiliateFees(
  baseAmount: number,
  config?: Partial<AffiliateConfig>
): {
  affiliateCommissionBase: number;
  affiliateCommission: number;
  affiliateTax: number;
  totalAffiliateCost: number;
  warning?: string;
} {
  const result = calculateAffiliateFee({
    feeBase: baseAmount,
    config,
    taxRate: config?.ppnRate ?? 11,
  });

  return {
    affiliateCommissionBase: result.commissionBase,
    affiliateCommission: result.commission,
    affiliateTax: result.tax,
    totalAffiliateCost: result.total,
    warning: result.warning,
  };
}

// 6. calculateAdvertisingCost
export function calculateAdvertisingCost(
  revenueAttributed: number,
  adsSpend: number,
  ordersAttributed: number = 1
): {
  adsCostPerOrder: number;
  roas: number;
  acos: number;
  tacos: number;
  breakEvenRoas: number;
} {
  const adsCostPerOrder = ordersAttributed > 0 ? adsSpend / ordersAttributed : adsSpend;
  const roas = adsSpend > 0 ? revenueAttributed / adsSpend : 0;
  const acos = revenueAttributed > 0 ? (adsSpend / revenueAttributed) * 100 : 0;
  const tacos = acos;

  return {
    adsCostPerOrder: Math.round(adsCostPerOrder),
    roas: Number(roas.toFixed(2)),
    acos: Number(acos.toFixed(1)),
    tacos: Number(tacos.toFixed(1)),
    breakEvenRoas: 0,
  };
}

// 7. calculateFulfillmentCost
export function calculateFulfillmentCost(config?: Partial<FulfillmentConfig>): number {
  if (!config?.enabled) return 0;
  const packaging = config.packagingFee || 0;
  const storage = config.storageFeePerCbmDay || 0;
  const addPackaging = config.additionalPackaging || 0;
  const bundling = config.bundlingFee || 0;
  const repacking = config.repackingFee || 0;
  const rts = config.rtsReinboundFee || 0;
  const transfer = config.multiWarehouseTransferFee || 0;

  return packaging + storage + addPackaging + bundling + repacking + rts + transfer;
}

// 8. calculateShippingCost
export function calculateShippingCost(config?: Partial<ShippingConfig>): number {
  if (!config) return 0;
  return Math.max(0, config.sellerShippingContribution || 0);
}

// 9. calculateReturnCost
export function calculateReturnCost(
  hpp: number,
  config?: Partial<ReturnConfig>
): {
  expectedReturnCost: number;
  returnProbability: number;
  averageSingleReturnCost: number;
} {
  if (!config) {
    return { expectedReturnCost: 0, returnProbability: 0, averageSingleReturnCost: 0 };
  }

  const returnRate = (config.returnRatePercent || 0) / 100;
  const returnShipping = config.averageReturnShippingCost || 0;
  const restocking = config.restockingCost || 0;
  const replacement = config.replacementCost || 0;
  const averageSingleReturnCost = returnShipping + restocking + (replacement > 0 ? replacement : hpp * 0.2);
  const expectedReturnCost = Math.round(returnRate * averageSingleReturnCost);

  return {
    expectedReturnCost,
    returnProbability: returnRate,
    averageSingleReturnCost,
  };
}

// 10. calculateOperationalCost
export function calculateOperationalCost(
  grossSales: number,
  config?: Partial<OperationalCostConfig>
): number {
  if (!config) return 0;
  if (config.allocationType === 'PERCENTAGE_OF_REVENUE') {
    return Math.round(grossSales * 0.03);
  }
  return (
    (config.packingCost || 0) +
    (config.laborCost || 0) +
    (config.warehouseCost || 0) +
    (config.electricityCost || 0) +
    (config.internetCost || 0) +
    (config.softwareCost || 0) +
    (config.rentCost || 0) +
    (config.customerServiceCost || 0) +
    (config.paymentGatewayCost || 0) +
    (config.otherCost || 0)
  );
}

// 11. calculateTax
export function calculateTax(
  grossRevenue: number,
  taxProfile?: TaxProfile
): {
  taxableRevenue: number;
  taxAmount: number;
  taxRatePercent: number;
  isTaxExempt: boolean;
  exemptionReason: string;
  taxTreatment: TaxTreatment;
  cashWithheld: number;
  eligibilityState: TaxEligibilityState;
} {
  if (!taxProfile) {
    return {
      taxableRevenue: 0,
      taxAmount: 0,
      taxRatePercent: 0,
      isTaxExempt: true,
      exemptionReason: 'Profil pajak belum dikonfigurasi (TAX_RULE_REQUIRES_DATA).',
      taxTreatment: 'TAX_RULE_REQUIRES_DATA',
      cashWithheld: 0,
      eligibilityState: 'TAX_RULE_REQUIRES_DATA',
    };
  }

  const res = calculateTaxForTransaction(grossRevenue, taxProfile);
  return {
    taxableRevenue: res.taxableRevenue,
    taxAmount: res.taxAmount,
    taxRatePercent: res.effectiveRatePercent,
    isTaxExempt: res.isTaxExempt,
    exemptionReason: res.exemptionReason,
    taxTreatment: res.taxTreatment,
    cashWithheld: res.cashWithheld,
    eligibilityState: res.eligibilityState,
  };
}

// 12. calculateBreakEvenROAS
export function calculateBreakEvenROAS(
  sellingPrice: number,
  hpp: number,
  totalFeesAndCostsWithoutAds: number
): number {
  const marginBeforeAds = sellingPrice - (hpp + totalFeesAndCostsWithoutAds);
  if (marginBeforeAds <= 0) return 0;
  return Number((sellingPrice / marginBeforeAds).toFixed(2));
}

// 13. calculateNetMargin
export function calculateNetMargin(netProfit: number, revenue: number): number {
  if (revenue <= 0) return 0;
  return Number(((netProfit / revenue) * 100).toFixed(2));
}

// 14. calculateBreakEvenPrice / calculateMinimumPrice
export function calculateBreakEvenPrice(
  hpp: number,
  fixedCostsPerOrder: number,
  totalVariableRatePercent: number
): number {
  const variableRate = totalVariableRatePercent / 100;
  if (variableRate >= 0.95) {
    return Math.round((hpp + fixedCostsPerOrder) / 0.05);
  }
  return Math.round((hpp + fixedCostsPerOrder) / (1 - variableRate));
}

export const calculateMinimumPrice = calculateBreakEvenPrice;

// 15. calculateTargetPrice
export function calculateTargetPrice(
  hpp: number,
  fixedCostsPerOrder: number,
  totalVariableRatePercent: number,
  targetMarginPercent: number
): number {
  const variableRate = totalVariableRatePercent / 100;
  const marginRate = targetMarginPercent / 100;
  const denominator = 1 - variableRate - marginRate;

  if (denominator <= 0.05) {
    return Math.round((hpp + fixedCostsPerOrder) / 0.05);
  }
  return Math.round((hpp + fixedCostsPerOrder) / denominator);
}

// 16. calculateMaximumDiscount
export function calculateMaximumDiscount(
  normalPrice: number,
  breakEvenPrice: number
): number {
  if (normalPrice <= breakEvenPrice || normalPrice <= 0) return 0;
  const maxDiscountNominal = normalPrice - breakEvenPrice;
  return Number(((maxDiscountNominal / normalPrice) * 100).toFixed(1));
}

/**
 * TRUE PROFIT WATERFALL ENGINE (Single Source of Truth)
 */
export function calculateTrueProfit(
  input: TrueProfitInput,
  marketplaceRules: MarketplaceFeeRule[] = INITIAL_MARKETPLACE_FEE_RULES,
  programRules: SellerProgramRule[] = INITIAL_PROGRAM_RULES,
  taxProfile?: TaxProfile,
  orderProcessingRule: MarketplaceFeeRule = OFFICIAL_ORDER_PROCESSING_FEE_RULE
): TrueProfitCalculation {
  const auditSteps: CalculationAuditStep[] = [];
  let step = 1;

  const txDate = input.transactionDate || '2026-09-25';

  // 1. Gross Product Price & Discounts
  const grossProductPrice = Math.max(0, input.originalProductPrice || 0);
  const sellerDiscountAmount = calculateSellerDiscount(
    grossProductPrice,
    input.sellerDiscountPercent || 0
  );
  const effectiveProductPrice = Math.max(0, grossProductPrice - sellerDiscountAmount);

  auditSteps.push({
    stepNumber: step++,
    title: 'Harga Efektif Produk',
    formulaDescription: 'Harga Normal Produk - Diskon Penjual',
    calculationEquation: `Rp ${grossProductPrice.toLocaleString('id-ID')} - Rp ${sellerDiscountAmount.toLocaleString('id-ID')}`,
    resultValue: effectiveProductPrice,
  });

  // 2. Vouchers Breakdown
  let totalSellerVoucherDeduction = 0;
  let platformVoucherContribution = 0;

  if (input.vouchers && input.vouchers.length > 0) {
    input.vouchers.forEach((v) => {
      if (v.payer === 'SELLER') {
        totalSellerVoucherDeduction += v.nominal;
      } else if (v.payer === 'PLATFORM') {
        platformVoucherContribution += v.nominal;
      } else if (v.payer === 'SHARED') {
        const ratio = v.sellerContributionRatio || 0.5;
        totalSellerVoucherDeduction += v.nominal * ratio;
        platformVoucherContribution += v.nominal * (1 - ratio);
      }
    });
  }

  // Basis Perhitungan Biaya (Fee Base) = Harga Efektif - Voucher Seller
  const feeBase = Math.max(0, effectiveProductPrice - totalSellerVoucherDeduction);
  const grossSales = calculateGrossSales(
    grossProductPrice,
    sellerDiscountAmount,
    platformVoucherContribution
  );

  auditSteps.push({
    stepNumber: step++,
    title: 'Basis Perhitungan Biaya (Fee Base)',
    formulaDescription: 'Harga Efektif Produk - Potongan Voucher Seller',
    calculationEquation: `Rp ${effectiveProductPrice.toLocaleString('id-ID')} - Rp ${totalSellerVoucherDeduction.toLocaleString('id-ID')}`,
    resultValue: feeBase,
    notes:
      platformVoucherContribution > 0
        ? `Voucher Platform Rp ${platformVoucherContribution.toLocaleString('id-ID')} disubsidi 100% oleh Shopee (tidak memotong laba Anda).`
        : undefined,
  });

  // 3. Marketplace Administration & Processing Fee
  const mktResult = calculateMarketplaceFees(
    feeBase,
    input.sellerType,
    input.category,
    marketplaceRules,
    orderProcessingRule,
    {
      transactionDate: txDate,
      productUploadDate: input.productUploadDate,
      sellerProfile: {
        firstProductUploadDate: input.firstProductUploadDate,
        sellerJoinDate: input.sellerJoinDate,
        completedOrderCount: input.completedOrderCount,
      },
    }
  );

  auditSteps.push({
    stepNumber: step++,
    title: 'Biaya Administrasi Shopee',
    formulaDescription: `Fee Base × Tarif Admin (${mktResult.adminFeePercent}%)`,
    calculationEquation: `Rp ${feeBase.toLocaleString('id-ID')} × ${mktResult.adminFeePercent}%`,
    resultValue: mktResult.adminFeeAmount,
    ruleSource: mktResult.ruleApplied.source,
    ruleDate: mktResult.ruleApplied.effectiveFrom,
  });

  auditSteps.push({
    stepNumber: step++,
    title: 'Biaya Pemrosesan Pesanan (Order Processing Fee)',
    formulaDescription: 'Tarif flat Rp1.250 per pesanan selesai sesuai ketentuan Shopee (Bukan persentase)',
    calculationEquation: `Tarif Tetap: Rp ${mktResult.processingFeeAmount.toLocaleString('id-ID')}`,
    resultValue: mktResult.processingFeeAmount,
    ruleSource: OFFICIAL_ORDER_PROCESSING_FEE_RULE.source,
    ruleDate: OFFICIAL_ORDER_PROCESSING_FEE_RULE.effectiveFrom,
  });

  // 4. Program Fees
  const progResult = calculateProgramFees(
    feeBase,
    input.isFreeShippingXtraActive,
    input.isPromoXtraActive,
    input.isPromoXtraPlusActive,
    input.category,
    programRules,
    {
      isPreOrder: input.isPreOrderActive,
      transactionDate: txDate,
    }
  );

  if (input.isFreeShippingXtraActive) {
    auditSteps.push({
      stepNumber: step++,
      title: 'Biaya Program Gratis Ongkir XTRA',
      formulaDescription: 'Fee Base × Tarif Kategori (Cap Maks Rp40.000 / Rp60.000)',
      calculationEquation: `Fee terhitung: Rp ${progResult.freeShippingXtraFee.toLocaleString('id-ID')}`,
      resultValue: progResult.freeShippingXtraFee,
      ruleSource: 'Shopee Help Center - Ketentuan Program Gratis Ongkir XTRA',
    });
  }

  if (input.isPromoXtraActive) {
    auditSteps.push({
      stepNumber: step++,
      title: 'Biaya Program Promo XTRA (Cashback XTRA)',
      formulaDescription: 'Fee Base × Tarif 4.5% (Cap Maks Rp60.000)',
      calculationEquation: `Fee terhitung: Rp ${progResult.promoXtraFee.toLocaleString('id-ID')}`,
      resultValue: progResult.promoXtraFee,
      ruleSource: 'Shopee Help Center - Syarat & Ketentuan Cashback XTRA',
    });
  }

  if (input.isPromoXtraPlusActive) {
    auditSteps.push({
      stepNumber: step++,
      title: 'Biaya Program Promo XTRA+ (Double Boost)',
      formulaDescription: 'Fee Base × 6.5% (Cap Maks Rp80.000, Tarif Termasuk PPN)',
      calculationEquation: `Fee terhitung: Rp ${progResult.promoXtraPlusFee.toLocaleString('id-ID')}`,
      resultValue: progResult.promoXtraPlusFee,
    });
  }

  if (input.isPreOrderActive && progResult.preOrderFee > 0) {
    auditSteps.push({
      stepNumber: step++,
      title: 'Biaya Layanan Produk Pre-Order (PO)',
      formulaDescription: 'Fee Base × Tarif Pre-Order 3.0%',
      calculationEquation: `Fee terhitung: Rp ${progResult.preOrderFee.toLocaleString('id-ID')}`,
      resultValue: progResult.preOrderFee,
    });
  }

  // 5. Affiliate Fees
  const affResult = calculateAffiliateFees(feeBase, input.affiliateConfig);
  if (input.isAffiliateActive && affResult.totalAffiliateCost > 0) {
    auditSteps.push({
      stepNumber: step++,
      title: 'Biaya Komisi Shopee Affiliate',
      formulaDescription: `Komisi Net Purchase Value + PPN (${input.affiliateConfig?.ppnRate || 11}%) terpisah`,
      calculationEquation: `Komisi Rp ${affResult.affiliateCommission.toLocaleString('id-ID')} + PPN Rp ${affResult.affiliateTax.toLocaleString('id-ID')}`,
      resultValue: affResult.totalAffiliateCost,
      ruleSource: 'Shopee Affiliate Seller Program Terms',
    });
  }

  // 6. Advertising Cost
  const adsCostPerOrder = input.adsCostPerOrder ?? input.advertisingConfig?.actualSpend ?? 0;
  const adsMetrics = calculateAdvertisingCost(feeBase, adsCostPerOrder, 1);

  if (adsCostPerOrder > 0) {
    auditSteps.push({
      stepNumber: step++,
      title: 'Alokasi Biaya Iklan (Shopee Ads)',
      formulaDescription: 'Biaya iklan per order terjual',
      calculationEquation: `Alokasi Biaya Ads per Transaksi: Rp ${adsCostPerOrder.toLocaleString('id-ID')}`,
      resultValue: adsCostPerOrder,
    });
  }

  // 7. Fulfillment & Shipping
  const fulfillmentCost = calculateFulfillmentCost(input.fulfillmentConfig);
  const netShippingCostToSeller = calculateShippingCost(input.shippingConfig);

  if (fulfillmentCost > 0) {
    auditSteps.push({
      stepNumber: step++,
      title: 'Biaya Layanan Dikelola Shopee (Fulfillment FBS)',
      formulaDescription: 'Biaya packaging + storage + handling Shopee',
      calculationEquation: `Total Fulfillment Fee: Rp ${fulfillmentCost.toLocaleString('id-ID')}`,
      resultValue: fulfillmentCost,
      ruleSource: 'Shopee Fulfillment Services Official Rate',
    });
  }

  if (netShippingCostToSeller > 0) {
    auditSteps.push({
      stepNumber: step++,
      title: 'Beban Subsidi Ongkir Seller',
      formulaDescription: 'Partisipasi subsidi ongkir yang ditanggung toko',
      calculationEquation: `Subsidi Ongkir Toko: Rp ${netShippingCostToSeller.toLocaleString('id-ID')}`,
      resultValue: netShippingCostToSeller,
    });
  }

  // 8. Return Cost Reserve
  const returnMetrics = calculateReturnCost(input.hpp, input.returnConfig);
  if (returnMetrics.expectedReturnCost > 0) {
    auditSteps.push({
      stepNumber: step++,
      title: 'Cadangan Resiko Retur (Expected Return Cost)',
      formulaDescription: 'Probabilitas Retur (%) × Biaya Rata-rata Penanganan Retur',
      calculationEquation: `${(returnMetrics.returnProbability * 100).toFixed(1)}% × Rp ${returnMetrics.averageSingleReturnCost.toLocaleString('id-ID')}`,
      resultValue: returnMetrics.expectedReturnCost,
    });
  }

  // 9. Operational Cost
  const totalOperationalCost = calculateOperationalCost(
    grossSales,
    input.operationalCostConfig
  );

  auditSteps.push({
    stepNumber: step++,
    title: 'Biaya Operasional Toko & Packing Mandiri',
    formulaDescription: 'Alokasi kardus packing, lakban, tenaga kerja, dan overhead',
    calculationEquation: `Total Biaya Operasional per Order: Rp ${totalOperationalCost.toLocaleString('id-ID')}`,
    resultValue: totalOperationalCost,
  });

  // 10. Taxes (PP 55/2022 & PMK 37/2025 PPh 22)
  const taxMetrics = calculateTax(feeBase, taxProfile);
  const pph22Result = evaluatePph22Eligibility({
    taxProfile,
    transactionDate: txDate,
    grossRevenue: feeBase,
  });

  // Evaluasi perlakuan pajak agar True Profit dan Cash Settlement tidak melakukan double counting
  let appliedTaxAmount = 0;
  let effectiveCashWithheld = 0;
  let overallTaxTreatment: TaxTreatment = 'NOT_APPLICABLE';

  if (pph22Result.eligible && pph22Result.status === 'APPLICABLE') {
    effectiveCashWithheld = pph22Result.cashWithheld;
    overallTaxTreatment = pph22Result.taxTreatment;
    // Withholding PPh 22 (0.5%):
    // Jika FINAL_TAX_SETTLEMENT, ini melunasi PPh Final UMKM sehingga beban pajak transaksi tetap 0.5% (TIDAK DITAMBAH dengan PPh Final agar tidak double-count).
    // Jika CREDITABLE_TAX, ini kredit pajak penghasilan yang dapat dikreditkan pada SPT Tahunan.
    appliedTaxAmount = pph22Result.taxAmount;

    auditSteps.push({
      stepNumber: step++,
      title: 'Withholding PPh 22 Marketplace (PMK 37/2025)',
      formulaDescription: `Withholding platform (${pph22Result.rate}%) atas peredaran bruto tidak termasuk PPN/PPnBM`,
      calculationEquation: `Rp ${feeBase.toLocaleString('id-ID')} × ${pph22Result.rate}% = Rp ${pph22Result.taxAmount.toLocaleString('id-ID')} (${pph22Result.taxTreatment})`,
      resultValue: pph22Result.taxAmount,
      ruleSource: 'PMK No. 37 Tahun 2025',
      notes:
        pph22Result.taxTreatment === 'FINAL_TAX_SETTLEMENT'
          ? 'Withholding PPh 22 melunasi kewajiban PPh Final UMKM toko. Tidak terjadi pembebanan pajak ganda.'
          : 'Withholding PPh 22 merupakan kredit pajak yang dapat dikreditkan pada SPT Tahunan (tidak mendouble-count beban).',
    });
  } else {
    // PPh 22 belum berlaku atau bebas; beban pajak mengikuti evaluasi PPh UMKM
    appliedTaxAmount = taxMetrics.taxAmount;
    effectiveCashWithheld = 0;
    overallTaxTreatment = taxMetrics.isTaxExempt ? 'EXEMPT' : taxMetrics.taxTreatment;

    auditSteps.push({
      stepNumber: step++,
      title: 'Estimasi Pajak Penghasilan (PPh Final UMKM)',
      formulaDescription: taxMetrics.isTaxExempt
        ? taxMetrics.exemptionReason
        : `Peredaran Bruto × Tarif Pajak (${taxMetrics.taxRatePercent}%)`,
      calculationEquation: taxMetrics.isTaxExempt
        ? 'Bebas Pajak (Rp 0)'
        : `Rp ${feeBase.toLocaleString('id-ID')} × ${taxMetrics.taxRatePercent}% = Rp ${taxMetrics.taxAmount.toLocaleString('id-ID')}`,
      resultValue: taxMetrics.taxAmount,
      ruleSource: 'PP No. 55 Tahun 2022 & PMK No. 164/PMK.03/2023',
    });
  }

  // 11. HPP / Modal Dasar
  const cogsHpp = Math.max(0, input.hpp || 0);
  auditSteps.push({
    stepNumber: step++,
    title: 'HPP (Harga Pokok Penjualan / Modal Produk)',
    formulaDescription: 'Biaya pembelian atau produksi produk per unit',
    calculationEquation: `Modal Dasar: Rp ${cogsHpp.toLocaleString('id-ID')}`,
    resultValue: cogsHpp,
  });

  // 12. Final Deductions & Net Profit
  // Beban pajak yang diaplikasikan (tanpa double counting PPh Final + PPh 22)

  const totalDeductionsWithoutReturn =
    mktResult.totalMarketplaceFees +
    progResult.totalProgramFees +
    affResult.totalAffiliateCost +
    adsCostPerOrder +
    fulfillmentCost +
    netShippingCostToSeller +
    totalOperationalCost +
    appliedTaxAmount +
    cogsHpp;

  const actualNetProfit = feeBase - totalDeductionsWithoutReturn;
  const expectedNetProfit = actualNetProfit - returnMetrics.expectedReturnCost;

  const actualNetMargin = calculateNetMargin(actualNetProfit, feeBase);
  const expectedNetMargin = calculateNetMargin(expectedNetProfit, feeBase);

  // BEP ROAS calculation
  const totalFeesAndCostsWithoutAds =
    mktResult.totalMarketplaceFees +
    progResult.totalProgramFees +
    affResult.totalAffiliateCost +
    fulfillmentCost +
    netShippingCostToSeller +
    totalOperationalCost +
    appliedTaxAmount +
    returnMetrics.expectedReturnCost;

  const breakEvenRoas = calculateBreakEvenROAS(
    feeBase,
    cogsHpp,
    totalFeesAndCostsWithoutAds
  );

  // Pricing calculations
  const fsRule = programRules.find((r) => r.code === 'FREE_SHIPPING_XTRA');
  const pxRule = programRules.find((r) => r.code === 'PROMO_XTRA');
  const fsRate = input.isFreeShippingXtraActive
    ? (fsRule?.categoryRules?.[input.category]?.rate ?? fsRule?.rate ?? 0)
    : 0;
  const pxRate = input.isPromoXtraActive
    ? (pxRule?.categoryRules?.[input.category]?.rate ?? pxRule?.rate ?? 0)
    : 0;

  const totalVariableRatePercent =
    mktResult.adminFeePercent +
    fsRate +
    pxRate +
    (input.isAffiliateActive ? (input.affiliateConfig?.commissionPercent || 0) : 0) +
    taxMetrics.taxRatePercent;

  const fixedCosts =
    mktResult.processingFeeAmount +
    adsCostPerOrder +
    fulfillmentCost +
    netShippingCostToSeller +
    totalOperationalCost +
    returnMetrics.expectedReturnCost;

  const breakEvenPrice = calculateBreakEvenPrice(
    cogsHpp,
    fixedCosts,
    totalVariableRatePercent
  );

  const targetPrice5 = calculateTargetPrice(cogsHpp, fixedCosts, totalVariableRatePercent, 5);
  const targetPrice10 = calculateTargetPrice(cogsHpp, fixedCosts, totalVariableRatePercent, 10);
  const targetPrice15 = calculateTargetPrice(cogsHpp, fixedCosts, totalVariableRatePercent, 15);
  const targetPrice20 = calculateTargetPrice(cogsHpp, fixedCosts, totalVariableRatePercent, 20);
  const targetPriceCustom = calculateTargetPrice(cogsHpp, fixedCosts, totalVariableRatePercent, 18);
  const maximumDiscountPercent = calculateMaximumDiscount(grossProductPrice, breakEvenPrice);

  let profitStatus: 'PROFITABLE' | 'LOW_MARGIN' | 'BREAK_EVEN' | 'LOSS' = 'PROFITABLE';
  if (expectedNetProfit < -100) profitStatus = 'LOSS';
  else if (Math.abs(expectedNetProfit) <= 100) profitStatus = 'BREAK_EVEN';
  else if (expectedNetMargin < 8) profitStatus = 'LOW_MARGIN';

  return {
    grossProductPrice,
    sellerDiscountAmount,
    effectiveProductPrice,
    totalSellerVoucherDeduction,
    platformVoucherContribution,
    feeBase,
    grossSales,

    marketplaceAdminFee: mktResult.adminFeeAmount,
    marketplaceAdminPercent: mktResult.adminFeePercent,
    orderProcessingFee: mktResult.processingFeeAmount,
    totalMarketplaceFees: mktResult.totalMarketplaceFees,

    freeShippingXtraFee: progResult.freeShippingXtraFee,
    promoXtraFee: progResult.promoXtraFee,
    promoXtraPlusFee: progResult.promoXtraPlusFee,
    preOrderFee: progResult.preOrderFee,
    totalProgramFees: progResult.totalProgramFees,

    affiliateCommissionBase: affResult.affiliateCommissionBase,
    affiliateCommission: affResult.affiliateCommission,
    affiliateTax: affResult.affiliateTax,
    totalAffiliateCost: affResult.totalAffiliateCost,

    adsCostPerOrder,
    roas: adsMetrics.roas,
    acos: adsMetrics.acos,
    tacos: adsMetrics.tacos,
    profitAfterAds: actualNetProfit,
    breakEvenRoas,

    fulfillmentCost,
    netShippingCostToSeller,

    expectedReturnCost: returnMetrics.expectedReturnCost,
    actualReturnCostCurrent: 0,

    totalOperationalCost,

    taxRatePercent: pph22Result.eligible && pph22Result.status === 'APPLICABLE' ? pph22Result.rate : taxMetrics.taxRatePercent,
    taxableRevenue: pph22Result.eligible && pph22Result.status === 'APPLICABLE' ? pph22Result.taxableBase : taxMetrics.taxableRevenue,
    taxAmount: appliedTaxAmount,
    cashWithheld: effectiveCashWithheld,
    taxTreatment: overallTaxTreatment,
    isTaxExempt: pph22Result.eligible && pph22Result.status === 'APPLICABLE' ? false : taxMetrics.isTaxExempt,
    taxExemptionReason: pph22Result.eligible && pph22Result.status === 'APPLICABLE' ? pph22Result.reason : taxMetrics.exemptionReason,
    pph22Result,

    cogsHpp,
    totalAllDeductions: totalDeductionsWithoutReturn,
    actualNetProfit,
    expectedNetProfit,
    actualNetMargin,
    expectedNetMargin,

    breakEvenPrice,
    targetPrice5,
    targetPrice10,
    targetPrice15,
    targetPrice20,
    targetPriceCustom,
    maximumDiscountPercent,

    profitStatus,
    auditSteps,
  };
}

// Re-export Inverse Pricing Engine (Target Buyer Price)
export * from './inversePricing.ts';

// Re-export Reverse Pricing Engine (Numerical Solver & Waterfall)
export * from './reversePricing.ts';
