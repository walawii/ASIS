/**
 * ASIS SELLER - Reverse Pricing Engine
 * (Harga Jual dari Target Bersih Akhir)
 * 
 * Menghitung HARGA AWAL / HARGA YANG HARUS DIPASANG DI SHOPEE secara numerik
 * (Binary Search Numerical Solver) sehingga setelah seluruh waterfall komponen biaya:
 * - Potongan Shopee (Admin Fee, Order Processing Fee Rp 1.250)
 * - Program Shopee (Gratis Ongkir XTRA, Promo XTRA, Promo XTRA+, Pre-Order, Affiliate)
 * - Shopee Ads
 * - Retur / Refund Allowance
 * - Pajak (PPh 22 / PPh Final UMKM)
 * - HPP (Modal Dasar)
 * - Packing & Biaya Operasional
 * 
 * Hasil akhirnya TEPAT mencapai TARGET AKHIR (Laba Bersih yang diinginkan seller).
 * 
 * True Profit Engine V1D tetap menjadi SINGLE SOURCE OF TRUTH untuk seluruh
 * kalkulasi biaya, cap, persentase, pajak, dan perlakuan khusus.
 */

import { TrueProfitInput, TrueProfitCalculation } from '../../types/profit.ts';
import { MarketplaceFeeRule, SellerProgramRule, TaxProfile } from '../../types/rules.ts';
import { calculateTrueProfit } from './index.ts';

export type ReversePricingTargetMode = 'NET_PROFIT' | 'NET_MARGIN_PERCENT';

export interface ReversePricingInput extends Partial<Omit<TrueProfitInput, 'originalProductPrice'>> {
  // Target yang ingin dicapai seller
  targetAmount: number; // e.g. Rp 55.000 (Target laba bersih)
  targetMode?: ReversePricingTargetMode; // 'NET_PROFIT' (nominal) atau 'NET_MARGIN_PERCENT' (%)
  targetMarginPercent?: number; // e.g. 20 (jika mode margin %)
  
  // Solver bounds & tuning (opsional)
  minListingPrice?: number;
  maxListingPrice?: number;
  maxIterations?: number;
  toleranceRupiah?: number;
}

export interface WaterfallSubDetail {
  label: string;
  amount: number;
  percentage?: number;
  notes?: string;
  source?: string;
}

export interface WaterfallStep {
  stepNumber: number;
  id: string;
  name: string;
  category:
    | 'START'
    | 'DISCOUNT'
    | 'SHOPEE_FEES'
    | 'PROGRAM_FEES'
    | 'ADS'
    | 'RETURN_ALLOWANCE'
    | 'TAX'
    | 'HPP'
    | 'PACKING'
    | 'OPERATIONAL'
    | 'PACKING_OPERATIONAL'
    | 'FINAL_TARGET';
  amount: number;
  percentageOfGross: number;
  percentageOfFeeBase: number;
  runningBalance: number;
  description: string;
  subDetails?: WaterfallSubDetail[];
  isDeduction: boolean;
}

export interface ReversePricingSummary {
  grossListingPrice: number;
  sellerDiscountAmount: number;
  actualBuyerPrice: number; // Fee Base
  marketplaceFees: number;
  programFees: number;
  adsCost: number;
  returnAllowance: number;
  taxes: number;
  cogsHpp: number;
  packingAndOps: number;
  totalAllDeductions: number;
  achievedNetProfit: number;
  achievedNetMarginPercent: number;
  targetAmount: number;
  differenceFromTarget: number;
}

export interface ReversePricingResult {
  isValid: boolean;
  errorMessage?: string;
  targetAmount: number;
  targetMode: ReversePricingTargetMode;

  // Harga yang harus dipasang di Shopee
  requiredListingPrice: number;
  sellerDiscountAmount: number;
  actualBuyerPrice: number;

  // Waterfall lengkap
  waterfall: WaterfallStep[];

  // Ringkasan biaya
  summary: ReversePricingSummary;

  // Single Source of Truth: hasil penuh True Profit Engine
  profitCalculation?: TrueProfitCalculation;

  // Solver diagnostics
  solverIterations: number;
  converged: boolean;
}

/**
 * Helper untuk membulatkan harga ke Rupiah penuh
 */
export function roundToRupiah(amount: number): number {
  return Math.round(amount);
}

/**
 * Menghitung Reverse Pricing dari Target Bersih Akhir menggunakan Numerical Solver (Binary Search)
 * Memanggil True Profit Engine V1D secara murni sebagai Single Source of Truth.
 */
export function calculateReversePrice(
  input: ReversePricingInput,
  marketplaceRules?: MarketplaceFeeRule[],
  programRules?: SellerProgramRule[],
  taxProfile?: TaxProfile
): ReversePricingResult {
  const targetMode = input.targetMode || 'NET_PROFIT';
  const targetAmount = Math.max(0, input.targetAmount || 0);
  const rawDiscount = input.sellerDiscountPercent ?? 0;

  // Validasi input
  if (targetAmount <= 0) {
    return createErrorResult(
      targetAmount,
      targetMode,
      'Target akhir harus lebih besar dari Rp 0.'
    );
  }

  if (rawDiscount < 0 || rawDiscount >= 100) {
    return createErrorResult(
      targetAmount,
      targetMode,
      'Diskon seller harus antara 0% dan 99.9%.'
    );
  }

  const discountPercent = rawDiscount;

  const hpp = Math.max(0, input.hpp || 0);
  const adsCost = Math.max(0, input.adsCostPerOrder ?? input.advertisingConfig?.actualSpend ?? 0);
  const packingAndOps =
    (input.operationalCostConfig?.laborCost || 0) +
    (input.operationalCostConfig?.packingCost || 0) +
    (input.fulfillmentConfig?.packagingFee || 0);

  // Fungsi evaluasi True Profit Engine untuk kandidat harga
  const evaluateCandidate = (candidatePrice: number): TrueProfitCalculation => {
    return calculateTrueProfit(
      {
        vouchers: input.vouchers || [],
        hpp: input.hpp || 0,
        sellerType: input.sellerType || 'STAR',
        category: input.category || 'Fashion & Pakaian',
        isFreeShippingXtraActive: input.isFreeShippingXtraActive ?? false,
        isPromoXtraActive: input.isPromoXtraActive ?? false,
        isPromoXtraPlusActive: input.isPromoXtraPlusActive ?? false,
        isAffiliateActive: input.isAffiliateActive ?? false,
        ...input,
        originalProductPrice: candidatePrice,
        sellerDiscountPercent: discountPercent,
      },
      marketplaceRules,
      programRules,
      taxProfile
    );
  };

  // Menentukan metric target berdasarkan targetMode
  const getEvaluatedMetric = (calc: TrueProfitCalculation): number => {
    if (targetMode === 'NET_MARGIN_PERCENT') {
      return calc.expectedNetMargin;
    }
    return calc.expectedNetProfit;
  };

  // 1. Tentukan batas bawah (low) dan cari batas atas (high) secara eksponensial (Bracketer)
  let low = Math.max(1, Math.round(targetAmount + hpp + adsCost + packingAndOps));
  let high = Math.max(low * 2, 200_000);

  // Expand high bracket jika kandidat awal belum mencapai target
  let maxBracketTries = 25;
  while (maxBracketTries > 0) {
    const highCalc = evaluateCandidate(high);
    const metric = getEvaluatedMetric(highCalc);
    if (metric >= targetAmount || high >= 1_000_000_000) {
      break;
    }
    high = high * 2;
    maxBracketTries--;
  }

  // 2. Numerical Solver: Binary Search
  const maxIterations = input.maxIterations || 50;
  const tolerance = input.toleranceRupiah || 1;

  let left = low;
  let right = high;
  let bestCandidate = right;
  let bestDiff = Infinity;
  let bestCalc: TrueProfitCalculation | undefined = undefined;
  let iterations = 0;

  for (let i = 0; i < maxIterations; i++) {
    iterations++;
    const mid = Math.floor((left + right) / 2);
    const calc = evaluateCandidate(mid);
    const metric = getEvaluatedMetric(calc);
    const diff = metric - targetAmount;

    if (Math.abs(diff) < bestDiff) {
      bestDiff = Math.abs(diff);
      bestCandidate = mid;
      bestCalc = calc;
    }

    if (Math.abs(diff) <= (targetMode === 'NET_MARGIN_PERCENT' ? 0.05 : tolerance)) {
      bestCandidate = mid;
      bestCalc = calc;
      break;
    }

    if (metric < targetAmount) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // 3. Integer Local Refinement (+- 3 Rupiah) untuk memastikan rounding paling presisi
  if (targetMode === 'NET_PROFIT') {
    const candidates = [
      bestCandidate - 3,
      bestCandidate - 2,
      bestCandidate - 1,
      bestCandidate,
      bestCandidate + 1,
      bestCandidate + 2,
      bestCandidate + 3,
    ].filter((c) => c > 0);

    let refinedCandidate = bestCandidate;
    let refinedDiff = Math.abs((bestCalc?.expectedNetProfit ?? 0) - targetAmount);
    let refinedCalc = bestCalc;

    for (const c of candidates) {
      const calc = evaluateCandidate(c);
      const diff = Math.abs(calc.expectedNetProfit - targetAmount);
      // Preferensi: perbedaan 0, atau perbedaan minimal. Jika selisih sama, prioritaskan keuntungan >= target
      if (diff < refinedDiff || (diff === refinedDiff && calc.expectedNetProfit >= targetAmount)) {
        refinedDiff = diff;
        refinedCandidate = c;
        refinedCalc = calc;
      }
    }

    bestCandidate = refinedCandidate;
    bestCalc = refinedCalc;
  }

  if (!bestCalc) {
    bestCalc = evaluateCandidate(bestCandidate);
  }

  // 4. Bangun alur Waterfall terperinci
  const grossPrice = bestCalc.grossProductPrice;
  const sellerDiscount = bestCalc.sellerDiscountAmount;
  const feeBase = bestCalc.feeBase;

  const marketplaceFees = bestCalc.totalMarketplaceFees;
  const programFees = bestCalc.totalProgramFees + (bestCalc.totalAffiliateCost || 0);
  const ads = bestCalc.adsCostPerOrder;
  const returnAllowance = bestCalc.expectedReturnCost;
  const taxes = bestCalc.taxAmount;
  const cogs = bestCalc.cogsHpp;
  const operational = bestCalc.totalOperationalCost;

  let currentBalance = grossPrice;
  const waterfall: WaterfallStep[] = [];
  let step = 1;

  // Step 1: HARGA AWAL / HARGA JUAL SHOPEE
  waterfall.push({
    stepNumber: step++,
    id: 'listing_price',
    name: 'Harga Jual / Harga Awal Shopee',
    category: 'START',
    amount: grossPrice,
    percentageOfGross: 100,
    percentageOfFeeBase: feeBase > 0 ? (grossPrice / feeBase) * 100 : 100,
    runningBalance: currentBalance,
    description: 'Harga normal produk yang harus dipasang di seller center Shopee.',
    isDeduction: false,
  });

  // Step 1b: Diskon Seller (jika ada)
  if (sellerDiscount > 0) {
    currentBalance -= sellerDiscount;
    waterfall.push({
      stepNumber: step++,
      id: 'seller_discount',
      name: 'Diskon Toko / Diskon Coret',
      category: 'DISCOUNT',
      amount: sellerDiscount,
      percentageOfGross: (sellerDiscount / grossPrice) * 100,
      percentageOfFeeBase: (sellerDiscount / feeBase) * 100,
      runningBalance: currentBalance,
      description: `Diskon penjual ${discountPercent}%. Menghasilkan harga yang dilihat/dibayar pembeli: Rp ${currentBalance.toLocaleString('id-ID')}.`,
      isDeduction: true,
    });
  }

  // Step 2: Potongan Shopee (Admin Fee + Order Processing Fee)
  currentBalance -= marketplaceFees;
  waterfall.push({
    stepNumber: step++,
    id: 'shopee_fees',
    name: 'Potongan Shopee',
    category: 'SHOPEE_FEES',
    amount: marketplaceFees,
    percentageOfGross: (marketplaceFees / grossPrice) * 100,
    percentageOfFeeBase: (marketplaceFees / feeBase) * 100,
    runningBalance: currentBalance,
    description: 'Biaya Administrasi Marketplace dan Biaya Pemrosesan Pesanan resmi Shopee.',
    subDetails: [
      {
        label: `Biaya Administrasi Shopee (${bestCalc.marketplaceAdminPercent}%)`,
        amount: bestCalc.marketplaceAdminFee,
      },
      {
        label: 'Biaya Pemrosesan Pesanan (Flat Shopee)',
        amount: bestCalc.orderProcessingFee,
        notes: 'Rp 1.250 per pesanan selesai',
      },
    ],
    isDeduction: true,
  });

  // Step 3: Program Shopee (Gratis Ongkir Xtra, Promo Xtra, Promo Xtra+, PO, Affiliate)
  if (programFees > 0) {
    currentBalance -= programFees;
    const progSubDetails: WaterfallSubDetail[] = [];
    if (bestCalc.freeShippingXtraFee > 0) {
      progSubDetails.push({
        label: 'Gratis Ongkir XTRA',
        amount: bestCalc.freeShippingXtraFee,
      });
    }
    if (bestCalc.promoXtraFee > 0) {
      progSubDetails.push({
        label: 'Promo XTRA (Cashback)',
        amount: bestCalc.promoXtraFee,
      });
    }
    if (bestCalc.promoXtraPlusFee > 0) {
      progSubDetails.push({
        label: 'Promo XTRA+ (Double Boost)',
        amount: bestCalc.promoXtraPlusFee,
      });
    }
    if ((bestCalc.preOrderFee || 0) > 0) {
      progSubDetails.push({
        label: 'Biaya Layanan Pre-Order (PO)',
        amount: bestCalc.preOrderFee || 0,
      });
    }
    if ((bestCalc.totalAffiliateCost || 0) > 0) {
      progSubDetails.push({
        label: 'Shopee Affiliate Seller Commission & PPN',
        amount: bestCalc.totalAffiliateCost,
      });
    }

    waterfall.push({
      stepNumber: step++,
      id: 'program_fees',
      name: 'Program Shopee & Affiliate',
      category: 'PROGRAM_FEES',
      amount: programFees,
      percentageOfGross: (programFees / grossPrice) * 100,
      percentageOfFeeBase: (programFees / feeBase) * 100,
      runningBalance: currentBalance,
      description: 'Program partisipasi promo Shopee (Gratis Ongkir Xtra, Promo Xtra, Affiliate).',
      subDetails: progSubDetails,
      isDeduction: true,
    });
  }

  // Step 4: Shopee Ads
  if (ads > 0) {
    currentBalance -= ads;
    waterfall.push({
      stepNumber: step++,
      id: 'shopee_ads',
      name: 'Shopee Ads (Alokasi Iklan)',
      category: 'ADS',
      amount: ads,
      percentageOfGross: (ads / grossPrice) * 100,
      percentageOfFeeBase: (ads / feeBase) * 100,
      runningBalance: currentBalance,
      description: 'Alokasi biaya iklan Shopee Ads per unit terjual.',
      isDeduction: true,
    });
  }

  // Step 5: Retur / Refund Allowance
  if (returnAllowance > 0) {
    currentBalance -= returnAllowance;
    waterfall.push({
      stepNumber: step++,
      id: 'return_allowance',
      name: 'Retur / Refund Allowance',
      category: 'RETURN_ALLOWANCE',
      amount: returnAllowance,
      percentageOfGross: (returnAllowance / grossPrice) * 100,
      percentageOfFeeBase: (returnAllowance / feeBase) * 100,
      runningBalance: currentBalance,
      description: 'Cadangan resiko paket retur atau pengembalian dana pembeli.',
      isDeduction: true,
    });
  }

  // Step 6: Pajak (PPh 22 / PPh Final UMKM)
  if (taxes > 0) {
    currentBalance -= taxes;
    waterfall.push({
      stepNumber: step++,
      id: 'tax_deduction',
      name: 'Pajak (PPh 22 / PPh Final)',
      category: 'TAX',
      amount: taxes,
      percentageOfGross: (taxes / grossPrice) * 100,
      percentageOfFeeBase: (taxes / feeBase) * 100,
      runningBalance: currentBalance,
      description: bestCalc.cashWithheld && bestCalc.cashWithheld > 0
        ? `Withholding PPh 22 Marketplace 0.5% (PMK 37/2025: ${bestCalc.taxTreatment})`
        : `Estimasi Pajak Penghasilan UMKM PP 55/2022 (${bestCalc.taxRatePercent}%)`,
      isDeduction: true,
    });
  }

  // Step 7: HPP (Modal Produk)
  currentBalance -= cogs;
  waterfall.push({
    stepNumber: step++,
    id: 'cogs_hpp',
    name: 'HPP (Harga Pokok Penjualan)',
    category: 'HPP',
    amount: cogs,
    percentageOfGross: (cogs / grossPrice) * 100,
    percentageOfFeeBase: (cogs / feeBase) * 100,
    runningBalance: currentBalance,
    description: 'Modal pembelian atau biaya produksi barang.',
    isDeduction: true,
  });

  // Step 8 & 9: Packing & Operasional (Sesuai spesifikasi alur waterfall: HPP -> Packing -> Operasional)
  const packingCost = input.operationalCostConfig?.packingCost ?? 0;
  const operationalOther = Math.max(0, operational - packingCost);

  if (packingCost > 0) {
    currentBalance -= packingCost;
    waterfall.push({
      stepNumber: step++,
      id: 'packing',
      name: 'Packing',
      category: 'PACKING',
      amount: packingCost,
      percentageOfGross: (packingCost / grossPrice) * 100,
      percentageOfFeeBase: (packingCost / feeBase) * 100,
      runningBalance: currentBalance,
      description: 'Biaya kardus, lakban, bubble wrap, polymailer, dan perlengkapan packing.',
      isDeduction: true,
    });
  }

  if (operationalOther > 0) {
    currentBalance -= operationalOther;
    waterfall.push({
      stepNumber: step++,
      id: 'operational',
      name: 'Operasional',
      category: 'OPERATIONAL',
      amount: operationalOther,
      percentageOfGross: (operationalOther / grossPrice) * 100,
      percentageOfFeeBase: (operationalOther / feeBase) * 100,
      runningBalance: currentBalance,
      description: 'Biaya operasional tenaga kerja, gudang, listrik, dan overhead per order.',
      isDeduction: true,
    });
  } else if (packingCost === 0 && operational > 0) {
    currentBalance -= operational;
    waterfall.push({
      stepNumber: step++,
      id: 'packing_operational',
      name: 'Packing & Operasional',
      category: 'PACKING_OPERATIONAL',
      amount: operational,
      percentageOfGross: (operational / grossPrice) * 100,
      percentageOfFeeBase: (operational / feeBase) * 100,
      runningBalance: currentBalance,
      description: 'Kardus packaging, lakban, bubble wrap, gaji staf, dan overhead per order.',
      isDeduction: true,
    });
  }

  // Step Akhir: TARGET AKHIR
  const achievedNetProfit = bestCalc.expectedNetProfit;
  const achievedMargin = bestCalc.expectedNetMargin;
  waterfall.push({
    stepNumber: step++,
    id: 'final_target',
    name: 'TARGET AKHIR',
    category: 'FINAL_TARGET',
    amount: achievedNetProfit,
    percentageOfGross: (achievedNetProfit / grossPrice) * 100,
    percentageOfFeeBase: (achievedNetProfit / feeBase) * 100,
    runningBalance: achievedNetProfit,
    description: `Target bersih tercapai: Rp ${achievedNetProfit.toLocaleString('id-ID')} (Margin: ${achievedMargin.toFixed(2)}%). Selisih target: Rp ${(achievedNetProfit - targetAmount).toLocaleString('id-ID')}.`,
    isDeduction: false,
  });

  const totalAllDeductions =
    sellerDiscount +
    marketplaceFees +
    programFees +
    ads +
    returnAllowance +
    taxes +
    cogs +
    operational;

  return {
    isValid: true,
    targetAmount,
    targetMode,
    requiredListingPrice: grossPrice,
    sellerDiscountAmount: sellerDiscount,
    actualBuyerPrice: bestCalc.effectiveProductPrice,
    waterfall,
    summary: {
      grossListingPrice: grossPrice,
      sellerDiscountAmount: sellerDiscount,
      actualBuyerPrice: bestCalc.effectiveProductPrice,
      marketplaceFees,
      programFees,
      adsCost: ads,
      returnAllowance,
      taxes,
      cogsHpp: cogs,
      packingAndOps: operational,
      totalAllDeductions,
      achievedNetProfit,
      achievedNetMarginPercent: achievedMargin,
      targetAmount,
      differenceFromTarget: achievedNetProfit - targetAmount,
    },
    profitCalculation: bestCalc,
    solverIterations: iterations,
    converged: Math.abs(achievedNetProfit - targetAmount) <= tolerance,
  };
}

function createErrorResult(
  targetAmount: number,
  targetMode: ReversePricingTargetMode,
  errorMessage: string
): ReversePricingResult {
  return {
    isValid: false,
    errorMessage,
    targetAmount,
    targetMode,
    requiredListingPrice: 0,
    sellerDiscountAmount: 0,
    actualBuyerPrice: 0,
    waterfall: [],
    summary: {
      grossListingPrice: 0,
      sellerDiscountAmount: 0,
      actualBuyerPrice: 0,
      marketplaceFees: 0,
      programFees: 0,
      adsCost: 0,
      returnAllowance: 0,
      taxes: 0,
      cogsHpp: 0,
      packingAndOps: 0,
      totalAllDeductions: 0,
      achievedNetProfit: 0,
      achievedNetMarginPercent: 0,
      targetAmount,
      differenceFromTarget: 0,
    },
    solverIterations: 0,
    converged: false,
  };
}
