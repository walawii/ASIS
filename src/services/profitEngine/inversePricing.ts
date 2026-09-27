/**
 * ASIS SELLER - Inverse Pricing Engine (Target Buyer Price)
 * 
 * Menghitung harga listing normal di Shopee yang dibutuhkan dari target harga yang
 * ingin dilihat/dibayar oleh pembeli setelah memperhitungkan diskon seller.
 * 
 * Menggunakan True Profit Engine sebagai single source of truth untuk perhitungan
 * fee, program, pajak, dan profit.
 */

import { TrueProfitInput, TrueProfitCalculation } from '../../types/profit.ts';
import { MarketplaceFeeRule, SellerProgramRule, TaxProfile } from '../../types/rules.ts';
import { calculateTrueProfit } from './index.ts';

export interface InversePricingInput extends Omit<TrueProfitInput, 'originalProductPrice'> {
  targetBuyerPrice: number;
  sellerDiscountPercent: number;
}

export interface InversePricingBreakdown {
  listingPrice: number;
  sellerDiscount: number;
  buyerPrice: number;
  marketplaceFees: number;
  programFees: number;
  affiliateFees: number;
  adsCost: number;
  returnReserve: number;
  taxes: number;
  cogsHpp: number;
  packingCost: number;
  operationalCost: number;
  netProfit: number;
  netMargin: number;
  profitStatus: 'PROFITABLE' | 'LOW_MARGIN' | 'BREAK_EVEN' | 'LOSS';
}

export interface InversePricingResult {
  isValid: boolean;
  errorMessage?: string;
  targetBuyerPrice: number;
  requiredListingPrice: number;
  sellerDiscountAmount: number;
  actualBuyerPrice: number;
  profitCalculation?: TrueProfitCalculation;
  profit: number;
  margin: number;
  breakdown: InversePricingBreakdown;
}

/**
 * Membulatkan harga listing ke Rupiah penuh sesuai konvensi Shopee
 */
export function roundListingPrice(price: number): number {
  return Math.round(price);
}

/**
 * Menghitung harga aktual yang dibayar pembeli setelah diskon seller dari harga listing
 */
export function calculateActualBuyerPrice(listingPrice: number, discountPercent: number): number {
  if (listingPrice <= 0) return 0;
  if (discountPercent <= 0) return listingPrice;
  const clampedDiscount = Math.min(100, Math.max(0, discountPercent));
  const discountAmount = Math.round(listingPrice * (clampedDiscount / 100));
  return Math.max(0, listingPrice - discountAmount);
}

/**
 * Menghitung harga listing yang harus dipasang di Shopee agar harga setelah diskon
 * sama dengan target buyer price.
 */
export function calculateRequiredListingPrice(targetBuyerPrice: number, discountPercent: number): number {
  if (targetBuyerPrice <= 0 || isNaN(targetBuyerPrice)) {
    return 0;
  }
  if (discountPercent < 0 || discountPercent >= 100 || isNaN(discountPercent)) {
    return 0;
  }
  if (discountPercent === 0) {
    return targetBuyerPrice;
  }

  const raw = targetBuyerPrice / (1 - discountPercent / 100);
  const rounded = roundListingPrice(raw);

  // Evaluasi kandidat integer terdekat untuk memastikan actualBuyerPrice sedekat mungkin / tepat
  const candidates = [rounded, Math.floor(raw), Math.ceil(raw)];
  for (const c of candidates) {
    if (calculateActualBuyerPrice(c, discountPercent) === targetBuyerPrice) {
      return c;
    }
  }

  return rounded;
}

function createEmptyBreakdown(): InversePricingBreakdown {
  return {
    listingPrice: 0,
    sellerDiscount: 0,
    buyerPrice: 0,
    marketplaceFees: 0,
    programFees: 0,
    affiliateFees: 0,
    adsCost: 0,
    returnReserve: 0,
    taxes: 0,
    cogsHpp: 0,
    packingCost: 0,
    operationalCost: 0,
    netProfit: 0,
    netMargin: 0,
    profitStatus: 'BREAK_EVEN',
  };
}

/**
 * Single Entrypoint Inverse Pricing: Target Buyer Price -> Required Listing Price -> True Profit Engine
 */
export function calculateListingPriceFromBuyerPrice(
  input: InversePricingInput,
  marketplaceRules?: MarketplaceFeeRule[],
  programRules?: SellerProgramRule[],
  taxProfile?: TaxProfile,
  orderProcessingRule?: MarketplaceFeeRule
): InversePricingResult {
  const { targetBuyerPrice, sellerDiscountPercent } = input;

  // Validasi 1: Target Buyer Price harus > 0
  if (targetBuyerPrice === undefined || targetBuyerPrice === null || isNaN(targetBuyerPrice) || targetBuyerPrice <= 0) {
    return {
      isValid: false,
      errorMessage: 'Target harga pembeli harus lebih besar dari Rp 0.',
      targetBuyerPrice: targetBuyerPrice || 0,
      requiredListingPrice: 0,
      sellerDiscountAmount: 0,
      actualBuyerPrice: 0,
      profit: 0,
      margin: 0,
      breakdown: createEmptyBreakdown(),
    };
  }

  // Validasi 2: Diskon seller harus >= 0 dan < 100%
  if (
    sellerDiscountPercent === undefined ||
    sellerDiscountPercent === null ||
    isNaN(sellerDiscountPercent) ||
    sellerDiscountPercent < 0 ||
    sellerDiscountPercent >= 100
  ) {
    return {
      isValid: false,
      errorMessage: 'Diskon seller harus bernilai antara 0% dan kurang dari 100%.',
      targetBuyerPrice,
      requiredListingPrice: 0,
      sellerDiscountAmount: 0,
      actualBuyerPrice: 0,
      profit: 0,
      margin: 0,
      breakdown: createEmptyBreakdown(),
    };
  }

  const requiredListingPrice = calculateRequiredListingPrice(targetBuyerPrice, sellerDiscountPercent);
  const sellerDiscountAmount = Math.round(requiredListingPrice * (sellerDiscountPercent / 100));
  const actualBuyerPrice = Math.max(0, requiredListingPrice - sellerDiscountAmount);

  // Teruskan harga listing yang diperoleh ke True Profit Engine
  const profitInput: TrueProfitInput = {
    ...input,
    originalProductPrice: requiredListingPrice,
    sellerDiscountPercent,
  };

  const profitCalculation = calculateTrueProfit(
    profitInput,
    marketplaceRules,
    programRules,
    taxProfile,
    orderProcessingRule
  );

  const packingCost = input.operationalCostConfig?.packingCost || 0;

  const breakdown: InversePricingBreakdown = {
    listingPrice: requiredListingPrice,
    sellerDiscount: sellerDiscountAmount,
    buyerPrice: actualBuyerPrice,
    marketplaceFees: profitCalculation.totalMarketplaceFees,
    programFees: profitCalculation.totalProgramFees,
    affiliateFees: profitCalculation.totalAffiliateCost,
    adsCost: profitCalculation.adsCostPerOrder,
    returnReserve: profitCalculation.expectedReturnCost,
    taxes: profitCalculation.taxAmount,
    cogsHpp: profitCalculation.cogsHpp,
    packingCost,
    operationalCost: profitCalculation.totalOperationalCost,
    netProfit: profitCalculation.expectedNetProfit,
    netMargin: profitCalculation.expectedNetMargin,
    profitStatus: profitCalculation.profitStatus,
  };

  return {
    isValid: true,
    targetBuyerPrice,
    requiredListingPrice,
    sellerDiscountAmount,
    actualBuyerPrice,
    profitCalculation,
    profit: profitCalculation.expectedNetProfit,
    margin: profitCalculation.expectedNetMargin,
    breakdown,
  };
}
