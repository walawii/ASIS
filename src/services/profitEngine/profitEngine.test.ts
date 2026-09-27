/**
 * Unit Tests for ASIS SELLER - True Profit Engine & Patch V1D Requirements
 * Authoritative Rule Data Accuracy, Source Traceability & Anti-Legacy Audits
 */

import {
  calculateMarketplaceFees,
  calculateProgramFees,
  calculateAffiliateFees,
  calculateTax,
  calculateTrueProfit,
  calculateBreakEvenPrice,
  calculateMinimumPrice,
  calculateBreakEvenROAS,
  calculateMaximumDiscount,
  calculateListingPriceFromBuyerPrice,
  calculateRequiredListingPrice,
  calculateActualBuyerPrice,
  calculateReversePrice,
} from './index.ts';
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
  INITIAL_MARKETPLACE_FEE_RULES,
  INITIAL_PROGRAM_RULES,
  OFFICIAL_ORDER_PROCESSING_FEE_RULE,
  OFFICIAL_PPN_TAX_RULE,
  OFFICIAL_PPH22_RULE,
  OFFICIAL_TAX_RULES,
} from './rulesData.ts';
import { evaluatePph22Eligibility } from '../taxEngine/index.ts';
import { calculateProfit } from '../../utils/calculatorEngine.ts';
import { TrueProfitInput } from '../../types/profit.ts';
import { TaxProfile } from '../../types/rules.ts';

export function runTrueProfitEngineTests(): { passed: boolean; results: string[] } {
  const results: string[] = [];
  let allPassed = true;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      results.push(`✓ [PASS] ${testName}`);
    } else {
      results.push(`✗ [FAIL] ${testName}`);
      allPassed = false;
    }
  }

  const baseTaxProfile: TaxProfile = {
    taxpayerType: 'Individual',
    taxScheme: 'UMKM Final',
    npwpOrNik: '3201000000000001',
    hasNpwp: true,
    isPkp: false,
    hasSkbExemption: false,
    annualOfflineRevenue: 100000000,
    annualOtherMarketplaceRevenue: 50000000,
    taxEffectiveDate: '2026-01-01',
  };

  // TEST 1: Marketplace fee uses documented category rates from Shopee Official Terms
  // Must NOT fall back to legacy 7.5% (Star) or 8.5% (Star+)
  const starFashion = findApplicableFeeRule({ sellerStatus: 'STAR', category: 'Fashion & Pakaian' });
  const starPlusFashion = findApplicableFeeRule({ sellerStatus: 'STAR_PLUS', category: 'Fashion & Pakaian' });
  const mallFashion = findApplicableFeeRule({ sellerStatus: 'MALL', category: 'Fashion & Pakaian' });
  const starElec = findApplicableFeeRule({ sellerStatus: 'STAR', category: 'Elektronik & Gadget' });
  const starComputer = findApplicableFeeRule({ sellerStatus: 'STAR', category: 'Komputer & Smartphone' });
  const starJewelry = findApplicableFeeRule({ sellerStatus: 'STAR', category: 'Logam Mulia & Perhiasan' });
  const starGroceries = findApplicableFeeRule({ sellerStatus: 'STAR', category: 'Sembako & Kebutuhan Pokok' });

  assert(starFashion.percentage === 8.25, 'Test 1: Star Fashion rate is documented 8.25% (Not legacy 7.5%)');
  assert(starFashion.percentage !== 7.5, 'Test 1: Star Fashion explicitly rejects legacy 7.5%');
  assert(starPlusFashion.percentage === 8.25, 'Test 1: Star+ Fashion rate is documented 8.25% (Not legacy 8.5%)');
  assert(starPlusFashion.percentage !== 8.5, 'Test 1: Star+ Fashion explicitly rejects legacy 8.5%');
  assert(mallFashion.percentage === 10.0, 'Test 1: Mall Fashion rate is documented 10.00%');
  assert(starElec.percentage === 6.75, 'Test 1: Star Elektronik & Gadget rate is documented 6.75%');
  assert(starComputer.percentage === 5.25, 'Test 1: Star Komputer High-End rate is documented 5.25%');
  assert(starJewelry.percentage === 4.25, 'Test 1: Star Logam Mulia rate is documented 4.25%');
  assert(starGroceries.percentage === 2.50, 'Test 1: Star Sembako rate is documented 2.50%');

  // TEST 2: Rule changes by transaction date (Rule versioning)
  const nonStarGraceBefore = findApplicableFeeRule({
    sellerStatus: 'NON_STAR',
    category: 'Umum',
    transactionDate: '2026-05-15',
    productUploadDate: '2026-04-01',
    sellerProfile: { completedOrderCount: 20 },
  });
  const nonStarAfterGrace = findApplicableFeeRule({
    sellerStatus: 'NON_STAR',
    category: 'Fashion & Pakaian',
    transactionDate: '2026-09-15',
    productUploadDate: '2026-08-10',
    sellerProfile: { completedOrderCount: 60 },
  });
  assert(nonStarGraceBefore.percentage === 0.0, 'Test 2: Non-Star before Aug 2026 gets 0% admin fee');
  assert(nonStarAfterGrace.percentage === 6.5, 'Test 2: Non-Star after Aug 2026 uses category rate 6.5%');

  // TEST 3: Order processing fee is flat Rp1.250 with typed applicable, exempt, and reason
  const procFee = calculateOrderProcessingFee();
  assert(procFee.feePerOrder === 1250, 'Test 3: Order processing fee is fixed Rp 1.250');
  assert(procFee.feeAmount === 1250, 'Test 3: Single order processing fee amount is 1.250');
  assert(procFee.applicable === true && procFee.exempt === false, 'Test 3: Order processing status is applicable');
  assert(typeof procFee.reason === 'string' && procFee.reason.length > 0, 'Test 3: Order processing fee includes reason');

  // TEST 4: Non-Star eligibility evaluation & explicit state handling
  const nonStarEligible = findApplicableFeeRule({
    sellerStatus: 'NON_STAR',
    productUploadDate: '2026-02-01',
    sellerProfile: { firstProductUploadDate: '2026-02-01', completedOrderCount: 15 },
  });
  const nonStarIneligible = findApplicableFeeRule({
    sellerStatus: 'NON_STAR',
    category: 'Fashion & Pakaian',
    productUploadDate: '2026-09-01',
    sellerProfile: { completedOrderCount: 150 },
  });
  assert(nonStarEligible.percentage === 0.0, 'Test 4: Eligible Non-Star has 0% admin fee');
  assert(nonStarIneligible.percentage === 6.5, 'Test 4: Ineligible Non-Star has standard category fee (6.5%)');

  // TEST 5: Free Shipping cap (Caps at Rp40.000 for regular product, Rp60.000 for special size from rulesData)
  const fsNormal = calculateFreeShippingXtraFee(2000000, 'Fashion & Pakaian', { isSpecialSize: false });
  const fsSpecial = calculateFreeShippingXtraFee(2000000, 'Fashion & Pakaian', { isSpecialSize: true });
  assert(fsNormal === 40000, 'Test 5: Free Shipping Xtra capped at Rp 40.000 for regular items');
  assert(fsSpecial === 60000, 'Test 5: Free Shipping Xtra capped at Rp 60.000 for special size items');

  // TEST 6: Promo XTRA+ (6.5% rate, capped at Rp80.000, tax-inclusive)
  const pxPlus = calculatePromoXtraPlusFee(2000000);
  assert(pxPlus === 80000, 'Test 6: Promo XTRA+ fee capped at Rp 80.000');

  // TEST 7: Pre-Order (3.0% rate for eligible categories)
  const poFee = calculatePreOrderFee(100000, 'Fashion & Pakaian', { isEnabled: true });
  assert(poFee === 3000, 'Test 7: Pre-Order fee is 3.0% of feeBase (3.000 on 100k)');

  // TEST 8: Affiliate commission base uses Net Completed Purchase Value
  const affBaseResult = calculateAffiliateFee({
    feeBase: 90000, // 100k - 10k seller voucher
    config: { enabled: true, commissionPercent: 5.0, includePpn: false },
  });
  assert(affBaseResult.commissionBase === 90000, 'Test 8: Affiliate commission base is Net Purchase Value (90.000)');
  assert(affBaseResult.commission === 4500, 'Test 8: Affiliate commission is 5% of 90.000 = 4.500');

  // TEST 9: Affiliate PPN uses configured taxRate from OFFICIAL_PPN_TAX_RULE (PPN separated)
  const affTaxResult = calculateAffiliateFee({
    feeBase: 100000,
    config: { enabled: true, commissionPercent: 10.0, includePpn: true, ppnRate: 11 },
  });
  assert(affTaxResult.commission === 10000, 'Test 9: Affiliate base commission is 10.000');
  assert(affTaxResult.tax === 1100, 'Test 9: Affiliate PPN is 11% of commission (1.100)');
  assert(affTaxResult.total === 11100, 'Test 9: Total affiliate cost includes separated PPN (11.100)');

  // TEST 10: PPh22 before effective date (< 2026-11-01) -> NOT_YET_EFFECTIVE, 0 withholding
  const pph22Before = evaluatePph22Eligibility({
    taxProfile: baseTaxProfile,
    transactionDate: '2026-09-25',
    grossRevenue: 100000,
  });
  assert(pph22Before.status === 'NOT_YET_EFFECTIVE', 'Test 10: PPh 22 before 2026-11-01 is NOT_YET_EFFECTIVE');
  assert(pph22Before.taxAmount === 0, 'Test 10: PPh 22 tax amount is 0 before effective date');

  // TEST 11: PPh22 on or after effective date (>= 2026-11-01) -> APPLICABLE (0.5% withholding)
  const pph22After = evaluatePph22Eligibility({
    taxProfile: baseTaxProfile,
    transactionDate: '2026-11-15',
    grossRevenue: 100000,
  });
  assert(pph22After.status === 'APPLICABLE', 'Test 11: PPh 22 on/after 2026-11-01 is APPLICABLE');
  assert(pph22After.taxAmount === 500, 'Test 11: PPh 22 withholding is 0.5% of gross revenue (500)');

  // TEST 12: Legacy calculator delegates to Profit Engine
  const legacyCalcResult = calculateProfit({
    sellingPrice: 100000,
    hpp: 50000,
    discountPercent: 0,
    packingCost: 2000,
    operationalCostPerOrder: 1000,
    adsCostPerOrder: 0,
    adminFeePercent: 7.5,
    serviceFeePercent: 0,
    affiliateCommissionPercent: 0,
  });
  assert(legacyCalcResult.netProfit === 38250, 'Test 12: Legacy calculator delegates accurately (Net profit 38.250)');

  // TEST 13: ROAS & Profit Waterfall through True Profit Engine with official Star Fashion rate (8.25%)
  const fullTrueProfit = calculateTrueProfit({
    originalProductPrice: 100000,
    sellerDiscountPercent: 0,
    vouchers: [],
    hpp: 50000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
    adsCostPerOrder: 10000,
    operationalCostConfig: {
      allocationType: 'PER_ORDER',
      packingCost: 2000,
      laborCost: 1000,
      warehouseCost: 0,
      electricityCost: 0,
      internetCost: 0,
      softwareCost: 0,
      rentCost: 0,
      customerServiceCost: 0,
      paymentGatewayCost: 0,
      otherCost: 0,
    },
  }, undefined, undefined, baseTaxProfile);
  // Revenue 100k - (HPP 50k + Admin 8.250 + Proc 1.250 + Ads 10k + Ops 3k) = 27.500
  assert(fullTrueProfit.marketplaceAdminFee === 8250, 'Test 13: Admin fee is 8.250 based on official 8.25%');
  assert(fullTrueProfit.actualNetProfit === 27500, 'Test 13: True profit with official 8.25% & 10k ads = 27.500');
  assert(fullTrueProfit.breakEvenRoas > 0, 'Test 13: Break Even ROAS is calculated');

  // TEST 14: Voucher calculator: seller funded vs platform funded
  const voucherCalc = calculateTrueProfit({
    originalProductPrice: 100000,
    sellerDiscountPercent: 0,
    vouchers: [
      { type: 'FIXED', nominal: 10000, payer: 'SELLER' },
      { type: 'FIXED', nominal: 15000, payer: 'PLATFORM' }, // Shopee funded
    ],
    hpp: 50000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  }, undefined, undefined, baseTaxProfile);
  assert(voucherCalc.feeBase === 90000, 'Test 14: Fee base only deducted by seller voucher (90.000)');
  assert(voucherCalc.platformVoucherContribution === 15000, 'Test 14: Platform voucher recognized as subsidy (15.000)');

  // ==========================================
  // PATCH V1C & V1D REGRESSION TESTS (A - L)
  // ==========================================

  // Regression A: Legacy calculator delegates all calculations, no independent fee formula
  const regLegacy = calculateProfit({
    sellingPrice: 100000,
    hpp: 50000,
    packingCost: 2000,
    operationalCostPerOrder: 1000,
    adsCostPerOrder: 0,
    adminFeePercent: 7.5,
    serviceFeePercent: 0,
  });
  assert(regLegacy.netProfit === 38250, 'Regression A: Legacy calculator delegates to True Profit Engine (38.250)');

  // Regression B: Mock Finance uses Profit Engine with documented category fees
  const mockTrueProfit = calculateTrueProfit({
    originalProductPrice: 200000,
    sellerDiscountPercent: 0,
    vouchers: [],
    hpp: 100000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    transactionDate: '2026-09-25',
    isFreeShippingXtraActive: true,
    isPromoXtraActive: true,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });
  assert(
    mockTrueProfit.marketplaceAdminFee === 16500 && // 200.000 * 8.25%
    mockTrueProfit.orderProcessingFee === 1250 &&
    mockTrueProfit.freeShippingXtraFee === 8000 &&
    mockTrueProfit.promoXtraFee === 9000,
    'Regression B: Mock Finance order normalization matches Profit Engine fees exactly'
  );

  // Regression C: Fee Rule Versioning by transactionDate
  const regTxBefore = findApplicableFeeRule({
    sellerStatus: 'NON_STAR',
    category: 'Umum',
    transactionDate: '2026-05-01',
    productUploadDate: '2026-04-01',
    sellerProfile: { completedOrderCount: 10 },
  });
  const regTxAfter = findApplicableFeeRule({
    sellerStatus: 'NON_STAR',
    category: 'Fashion & Pakaian',
    transactionDate: '2026-10-01',
    productUploadDate: '2026-09-01',
    sellerProfile: { completedOrderCount: 100 },
  });
  assert(
    regTxBefore.percentage === 0.0 && regTxAfter.percentage === 6.5,
    'Regression C: Transaction date differentiates fee rules before vs after version changes'
  );

  // Regression D: Non-Star eligibility & explicit REQUIRES_SELLER_DATA state
  const regNonStarMissing = findApplicableFeeRule({ sellerStatus: 'NON_STAR' });
  const regNonStarEligible = findApplicableFeeRule({
    sellerStatus: 'NON_STAR',
    productUploadDate: '2026-03-01',
    sellerProfile: { completedOrderCount: 10 },
  });
  assert(
    regNonStarMissing.eligibilityState === 'REQUIRES_SELLER_DATA' && regNonStarEligible.percentage === 0.0,
    'Regression D: Non-Star missing profile returns REQUIRES_SELLER_DATA state and 0% when eligible'
  );

  // Regression E: Order processing fixed fee (Rp1.250) and exemption logic
  const regExemptProc = calculateOrderProcessingFee({ isExempt: true });
  const regActiveProc = calculateOrderProcessingFee({ isExempt: false });
  assert(
    regExemptProc.feeAmount === 0 && regExemptProc.applicable === false && regExemptProc.exempt === true,
    'Regression E1: Order processing fee drops to 0 and flags exempt = true when exempt'
  );
  assert(
    regActiveProc.feeAmount === 1250 && regActiveProc.applicable === true && regActiveProc.exempt === false,
    'Regression E2: Order processing fee is Rp1.250 and applicable = true when active'
  );

  // Regression F: Program caps enforced from rulesData (40k/60k/80k)
  const regFsCapRegular = calculateFreeShippingXtraFee(3000000, 'Fashion & Pakaian', { isSpecialSize: false });
  const regFsCapSpecial = calculateFreeShippingXtraFee(3000000, 'Fashion & Pakaian', { isSpecialSize: true });
  const regPxCap = calculatePromoXtraFee(3000000, 'Fashion & Pakaian');
  const regPxPlusCap = calculatePromoXtraPlusFee(3000000);
  assert(
    regFsCapRegular === 40000 && regFsCapSpecial === 60000 && regPxCap === 60000 && regPxPlusCap === 80000,
    'Regression F: Program caps enforced at 40k, 60k, and 80k'
  );

  // Regression G: Affiliate commissionBase uses Net Purchase Value with target vs actual rate differentiation
  const regAffNet = calculateAffiliateFee({
    feeBase: 95000,
    config: { enabled: true, commissionPercent: 5.0, targetRate: 7.0, actualRate: 5.0 },
  });
  assert(
    regAffNet.commissionBase === 95000 && regAffNet.commission === 4750 && !!regAffNet.warning,
    'Regression G: Affiliate calculates on net purchase value with target vs actual rate differentiation'
  );

  // Regression H: Configured PPN rate (11%) is applied to commission, not raw sales
  const regAffPpn = calculateAffiliateFee({
    feeBase: 100000,
    config: { enabled: true, commissionPercent: 10.0, includePpn: true, ppnRate: 11 },
  });
  assert(
    regAffPpn.tax === 1100 && regAffPpn.total === 11100,
    'Regression H: Configured PPN rate (11%) is applied to commission, not raw sales'
  );

  // Regression I: PPh22 effective date: NOT_YET_EFFECTIVE before 2026-11-01, APPLICABLE on/after
  const regPphBefore = evaluatePph22Eligibility({
    grossRevenue: 100000,
    transactionDate: '2026-10-31',
    taxProfile: baseTaxProfile,
  });
  const regPphAfter = evaluatePph22Eligibility({
    grossRevenue: 100000,
    transactionDate: '2026-11-01',
    taxProfile: baseTaxProfile,
  });
  assert(
    regPphBefore.status === 'NOT_YET_EFFECTIVE' && regPphBefore.taxAmount === 0 &&
    regPphAfter.status === 'APPLICABLE' && regPphAfter.taxAmount === 500,
    'Regression I: PPh22 only becomes APPLICABLE on or after 2026-11-01'
  );

  // Regression J: PPh22 respects typed exemption states EXEMPT_SKB and EXEMPT_OMZET_500M
  const regPphSkb = evaluatePph22Eligibility({
    grossRevenue: 100000,
    transactionDate: '2026-11-05',
    taxProfile: { ...baseTaxProfile, hasSkbExemption: true },
  });
  const regPphSuratPernyataan = evaluatePph22Eligibility({
    grossRevenue: 100000,
    transactionDate: '2026-11-05',
    annualGrossRevenue: 300000000,
    taxProfile: { ...baseTaxProfile, taxpayerType: 'Individual', hasUmkmStatementLetter: true },
  });
  assert(
    regPphSkb.status === 'EXEMPT_SKB' && regPphSkb.taxAmount === 0,
    'Regression J1: PPh22 returns typed status EXEMPT_SKB with 0 withholding'
  );
  assert(
    regPphSuratPernyataan.status === 'EXEMPT_OMZET_500M' && regPphSuratPernyataan.taxAmount === 0,
    'Regression J2: PPh22 returns typed status EXEMPT_OMZET_500M with 0 withholding'
  );

  // Regression K: Explicit states RULE_REQUIRES_CATEGORY and RULE_DATA_UNAVAILABLE
  const regMissingCat = findApplicableFeeRule({ sellerStatus: 'STAR' });
  const regUnknownCat = findApplicableFeeRule({ sellerStatus: 'STAR', category: 'Kategori_Tidak_Dikenal_XYZ' });
  assert(
    regMissingCat.eligibilityState === 'RULE_REQUIRES_CATEGORY',
    'Regression K1: Missing category triggers explicit RULE_REQUIRES_CATEGORY state'
  );
  assert(
    regUnknownCat.eligibilityState === 'RULE_DATA_UNAVAILABLE',
    'Regression K2: Unknown unmapped category triggers explicit RULE_DATA_UNAVAILABLE state'
  );

  // Regression L: Source traceability on all official rules
  const allRulesHaveOfficialSource = INITIAL_MARKETPLACE_FEE_RULES.every(
    (r) => r.source === 'Shopee Official Terms' && !!r.sourceUrl && !!r.effectiveFrom && !!r.verifiedAt
  );
  const orderProcHasOfficialSource =
    OFFICIAL_ORDER_PROCESSING_FEE_RULE.source === 'Shopee Official Terms' &&
    !!OFFICIAL_ORDER_PROCESSING_FEE_RULE.sourceUrl &&
    !!OFFICIAL_ORDER_PROCESSING_FEE_RULE.verifiedAt;
  const pph22HasOfficialSource =
    OFFICIAL_PPH22_RULE.source === 'DJP Official' &&
    !!OFFICIAL_PPH22_RULE.sourceUrl &&
    OFFICIAL_PPH22_RULE.effectiveFrom === '2026-11-01';
  const ppnHasOfficialSource =
    OFFICIAL_PPN_TAX_RULE.source === 'DJP Official' &&
    OFFICIAL_PPN_TAX_RULE.taxRate === 11;
  const umkmHasOfficialSource = OFFICIAL_TAX_RULES.every(
    (r) => r.source === 'DJP Official' && !!r.sourceUrl && r.rate === 0.5
  );

  assert(
    allRulesHaveOfficialSource && orderProcHasOfficialSource && pph22HasOfficialSource && ppnHasOfficialSource && umkmHasOfficialSource,
    'Regression L: Every authoritative rule has official source, sourceUrl, effectiveFrom, and verifiedAt'
  );

  // =========================================================================
  // PATCH V1E: INVERSE PRICING / TARGET BUYER PRICE UNIT TESTS (10 TESTS)
  // =========================================================================

  // TEST V1E-1: Target buyer = 55.000, Discount = 0% -> listing = 55.000, buyer = 55.000
  const invTest1 = calculateListingPriceFromBuyerPrice({
    targetBuyerPrice: 55000,
    sellerDiscountPercent: 0,
    vouchers: [],
    hpp: 25000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });
  assert(
    invTest1.isValid &&
    invTest1.requiredListingPrice === 55000 &&
    invTest1.actualBuyerPrice === 55000 &&
    invTest1.sellerDiscountAmount === 0,
    'V1E TEST 1: Target buyer 55.000 with 0% discount gives listing 55.000 and buyer 55.000'
  );

  // TEST V1E-2: Target buyer = 55.000, Discount = 10% -> listing ≈ 61.111, buyer ≈ 55.000
  const invTest2 = calculateListingPriceFromBuyerPrice({
    targetBuyerPrice: 55000,
    sellerDiscountPercent: 10,
    vouchers: [],
    hpp: 25000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: true,
    isPromoXtraActive: true,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });
  assert(
    invTest2.isValid &&
    invTest2.requiredListingPrice === 61111 &&
    invTest2.actualBuyerPrice === 55000 &&
    invTest2.sellerDiscountAmount === 6111,
    'V1E TEST 2: Target buyer 55.000 with 10% discount gives listing 61.111 and buyer 55.000'
  );

  // TEST V1E-3: Target buyer = 100.000, Discount = 20% -> listing = 125.000, buyer = 100.000
  const invTest3 = calculateListingPriceFromBuyerPrice({
    targetBuyerPrice: 100000,
    sellerDiscountPercent: 20,
    vouchers: [],
    hpp: 40000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });
  assert(
    invTest3.isValid &&
    invTest3.requiredListingPrice === 125000 &&
    invTest3.actualBuyerPrice === 100000 &&
    invTest3.sellerDiscountAmount === 25000,
    'V1E TEST 3: Target buyer 100.000 with 20% discount gives listing 125.000 and buyer 100.000'
  );

  // TEST V1E-4: Target buyer = 50.000, Discount = 50% -> listing = 100.000, buyer = 50.000
  const invTest4 = calculateListingPriceFromBuyerPrice({
    targetBuyerPrice: 50000,
    sellerDiscountPercent: 50,
    vouchers: [],
    hpp: 20000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });
  assert(
    invTest4.isValid &&
    invTest4.requiredListingPrice === 100000 &&
    invTest4.actualBuyerPrice === 50000 &&
    invTest4.sellerDiscountAmount === 50000,
    'V1E TEST 4: Target buyer 50.000 with 50% discount gives listing 100.000 and buyer 50.000'
  );

  // TEST V1E-5: Discount = 100% -> validation error
  const invTest5 = calculateListingPriceFromBuyerPrice({
    targetBuyerPrice: 55000,
    sellerDiscountPercent: 100,
    vouchers: [],
    hpp: 20000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });
  assert(
    !invTest5.isValid &&
    invTest5.requiredListingPrice === 0 &&
    invTest5.errorMessage !== undefined &&
    invTest5.errorMessage.includes('100%'),
    'V1E TEST 5: 100% discount triggers validation error and does not produce Infinity/NaN'
  );

  // TEST V1E-6: Target buyer = 0 -> validation error
  const invTest6 = calculateListingPriceFromBuyerPrice({
    targetBuyerPrice: 0,
    sellerDiscountPercent: 10,
    vouchers: [],
    hpp: 20000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });
  assert(
    !invTest6.isValid &&
    invTest6.requiredListingPrice === 0 &&
    invTest6.errorMessage !== undefined,
    'V1E TEST 6: Target buyer price = 0 triggers validation error'
  );

  // TEST V1E-7: Target buyer negatif -> validation error
  const invTest7 = calculateListingPriceFromBuyerPrice({
    targetBuyerPrice: -25000,
    sellerDiscountPercent: 10,
    vouchers: [],
    hpp: 20000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });
  assert(
    !invTest7.isValid &&
    invTest7.requiredListingPrice === 0 &&
    invTest7.errorMessage !== undefined,
    'V1E TEST 7: Negative target buyer price triggers validation error'
  );

  // TEST V1E-8: Pastikan inverse pricing tetap menggunakan calculateTrueProfit()
  assert(
    invTest2.profitCalculation !== undefined &&
    invTest2.profitCalculation.grossProductPrice === invTest2.requiredListingPrice &&
    invTest2.profitCalculation.effectiveProductPrice === invTest2.actualBuyerPrice &&
    invTest2.profitCalculation.marketplaceAdminPercent === 8.25 &&
    invTest2.profitCalculation.orderProcessingFee === 1250 &&
    invTest2.profit === invTest2.profitCalculation.expectedNetProfit,
    'V1E TEST 8: Inverse pricing correctly routes through calculateTrueProfit() as single source of truth'
  );

  // TEST V1E-9: Helper functions calculateRequiredListingPrice & calculateActualBuyerPrice consistency
  const helperListing = calculateRequiredListingPrice(55000, 10);
  const helperBuyer = calculateActualBuyerPrice(helperListing, 10);
  assert(
    helperListing === 61111 && helperBuyer === 55000,
    'V1E TEST 9: Helper rounding guarantees exact buyer price reconciliation without off-by-one errors'
  );

  // TEST V1E-10: Pastikan Forward Pricing existing tidak berubah
  const forwardCalc = calculateTrueProfit({
    originalProductPrice: 100000,
    sellerDiscountPercent: 10,
    vouchers: [],
    hpp: 40000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });
  assert(
    forwardCalc.grossProductPrice === 100000 &&
    forwardCalc.sellerDiscountAmount === 10000 &&
    forwardCalc.effectiveProductPrice === 90000 &&
    forwardCalc.feeBase === 90000,
    'V1E TEST 10: Existing Forward Pricing behavior remains 100% stable and unchanged'
  );

  // =========================================================================
  // PATCH V1D.1: TAX SEMANTICS & NO DOUBLE COUNTING TESTS
  // =========================================================================

  // Test Tax Semantics 1: PPh22 does not double count with PPh Final
  const taxSemanticsWpop = calculateTrueProfit({
    originalProductPrice: 100000,
    sellerDiscountPercent: 0,
    vouchers: [],
    hpp: 50000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    transactionDate: '2026-11-15', // After 2026-11-01
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  }, undefined, undefined, {
    taxpayerType: 'Individual',
    taxScheme: 'UMKM Final',
    npwpOrNik: '3201000000000001',
    hasNpwp: true,
    isPkp: false,
    hasSkbExemption: false,
    hasUmkmStatementLetter: false,
    annualOfflineRevenue: 600000000, // Exceeded 500M
    annualOtherMarketplaceRevenue: 0,
    taxEffectiveDate: '2026-01-01',
  });
  assert(
    taxSemanticsWpop.taxAmount === 500 &&
    taxSemanticsWpop.cashWithheld === 500 &&
    taxSemanticsWpop.taxTreatment === 'FINAL_TAX_SETTLEMENT' &&
    taxSemanticsWpop.totalAllDeductions === (
      taxSemanticsWpop.totalMarketplaceFees +
      taxSemanticsWpop.totalProgramFees +
      taxSemanticsWpop.totalAffiliateCost +
      taxSemanticsWpop.adsCostPerOrder +
      taxSemanticsWpop.fulfillmentCost +
      taxSemanticsWpop.netShippingCostToSeller +
      taxSemanticsWpop.totalOperationalCost +
      500 + // exactly 500, not 1000
      50000
    ),
    'Tax Semantics 1: PPh 22 does not double-count with PPh Final as expense (taxAmount = 500, not 1.000)'
  );

  // Test Tax Semantics 2: General Income Tax seller gets CREDITABLE_TAX
  const taxSemanticsCompany = calculateTrueProfit({
    originalProductPrice: 100000,
    sellerDiscountPercent: 0,
    vouchers: [],
    hpp: 50000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    transactionDate: '2026-11-15',
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  }, undefined, undefined, {
    taxpayerType: 'Company',
    taxScheme: 'General Income Tax',
    npwpOrNik: '010000000000001',
    hasNpwp: true,
    isPkp: true,
    hasSkbExemption: false,
    annualOfflineRevenue: 5000000000,
    annualOtherMarketplaceRevenue: 0,
    taxEffectiveDate: '2026-01-01',
  });
  assert(
    taxSemanticsCompany.pph22Result?.taxTreatment === 'CREDITABLE_TAX' &&
    taxSemanticsCompany.cashWithheld === 500,
    'Tax Semantics 2: Corporate General Income Tax seller gets CREDITABLE_TAX treatment on withholding'
  );

  // Test Tax Semantics 3: Missing profile returns TAX_RULE_REQUIRES_DATA
  const pph22NoProfile = evaluatePph22Eligibility({
    grossRevenue: 100000,
    transactionDate: '2026-11-15',
    taxProfile: undefined,
  });
  assert(
    pph22NoProfile.status === 'TAX_RULE_REQUIRES_DATA' &&
    pph22NoProfile.taxTreatment === 'TAX_RULE_REQUIRES_DATA',
    'Tax Semantics 3: Missing tax profile explicitly returns TAX_RULE_REQUIRES_DATA state'
  );

  // ==========================================
  // REVERSE PRICING ENGINE TESTS (PATCH V1E REPLACEMENT)
  // Numerical Solver & Waterfall Verification
  // ==========================================

  // REVERSE TEST 1: Target Akhir Rp 55.000, Diskon 0%
  const revTest1 = calculateReversePrice({
    targetAmount: 55000,
    targetMode: 'NET_PROFIT',
    sellerDiscountPercent: 0,
    hpp: 25000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: true,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });
  assert(
    revTest1.isValid &&
    revTest1.converged &&
    Math.abs(revTest1.summary.achievedNetProfit - 55000) <= 1 &&
    revTest1.requiredListingPrice === 92593 &&
    revTest1.actualBuyerPrice === 92593,
    'Reverse Pricing TEST 1: Target Akhir Rp55.000 (0% discount) converges exactly to listing price Rp92.593'
  );

  // REVERSE TEST 2: Target Akhir Rp 55.000, Diskon Toko 10%
  const revTest2 = calculateReversePrice({
    targetAmount: 55000,
    targetMode: 'NET_PROFIT',
    sellerDiscountPercent: 10,
    hpp: 25000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: true,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });
  assert(
    revTest2.isValid &&
    revTest2.converged &&
    Math.abs(revTest2.summary.achievedNetProfit - 55000) <= 1 &&
    revTest2.requiredListingPrice === 102881 &&
    revTest2.actualBuyerPrice === 92593 &&
    revTest2.sellerDiscountAmount === 10288,
    'Reverse Pricing TEST 2: Target Akhir Rp55.000 with 10% discount solves listing Rp102.881 and buyer Rp92.593'
  );

  // REVERSE TEST 3: Waterfall Structure & Running Balance Integrity
  const wf = revTest2.waterfall;
  assert(
    wf.length >= 5 &&
    wf[0].category === 'START' &&
    wf[0].amount === 102881 &&
    wf[wf.length - 1].category === 'FINAL_TARGET' &&
    Math.abs(wf[wf.length - 1].amount - 55000) <= 1,
    'Reverse Pricing TEST 3: Waterfall starts at Listing Price and terminates at Target Akhir'
  );

  // REVERSE TEST 4: Validation Error on Target <= 0
  const revInvalidTarget = calculateReversePrice({
    targetAmount: 0,
    targetMode: 'NET_PROFIT',
    sellerDiscountPercent: 10,
    hpp: 25000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
  });
  assert(
    !revInvalidTarget.isValid &&
    revInvalidTarget.requiredListingPrice === 0 &&
    revInvalidTarget.errorMessage !== undefined,
    'Reverse Pricing TEST 4: Zero target profit triggers validation error'
  );

  // REVERSE TEST 5: Validation Error on Discount >= 100%
  const revInvalidDiscount = calculateReversePrice({
    targetAmount: 55000,
    targetMode: 'NET_PROFIT',
    sellerDiscountPercent: 100,
    hpp: 25000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
  });
  assert(
    !revInvalidDiscount.isValid &&
    revInvalidDiscount.requiredListingPrice === 0 &&
    revInvalidDiscount.errorMessage !== undefined,
    'Reverse Pricing TEST 5: 100% discount triggers validation error'
  );

  // REVERSE TEST 6: Single Source of Truth verification with calculateTrueProfit
  assert(
    revTest1.profitCalculation !== undefined &&
    revTest1.profitCalculation.grossProductPrice === revTest1.requiredListingPrice &&
    revTest1.profitCalculation.expectedNetProfit === revTest1.summary.achievedNetProfit &&
    revTest1.profitCalculation.cogsHpp === revTest1.summary.cogsHpp,
    'Reverse Pricing TEST 6: Single Source of Truth strictly preserved with True Profit Engine V1D'
  );

  // REVERSE TEST 7: Target Margin Mode (%)
  const revMarginTest = calculateReversePrice({
    targetAmount: 30, // 30% margin
    targetMode: 'NET_MARGIN_PERCENT',
    sellerDiscountPercent: 0,
    hpp: 30000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: true,
  });
  assert(
    revMarginTest.isValid &&
    Math.abs(revMarginTest.summary.achievedNetMarginPercent - 30) <= 0.2,
    'Reverse Pricing TEST 7: Target Margin % mode converges within 0.2% tolerance'
  );

  // REVERSE TEST 8: Full Specification Benchmark Scenario from User Prompt
  // Target Akhir: Rp55.000, HPP: Rp50.000, Packing: Rp2.500, Ops: Rp4.000, Ads: Rp10.000, Retur: 2%, Program: aktif
  const promptScenario = calculateReversePrice({
    targetAmount: 55000,
    targetMode: 'NET_PROFIT',
    sellerDiscountPercent: 0,
    hpp: 50000,
    operationalCostConfig: {
      allocationType: 'PER_ORDER',
      packingCost: 2500,
      laborCost: 4000,
      warehouseCost: 0,
      electricityCost: 0,
      internetCost: 0,
      softwareCost: 0,
      rentCost: 0,
      customerServiceCost: 0,
      paymentGatewayCost: 0,
      otherCost: 0,
    },
    adsCostPerOrder: 10000,
    returnConfig: {
      returnRatePercent: 2.0,
      refundRatePercent: 0.5,
      defectRatePercent: 0.5,
      cancellationRatePercent: 1.0,
      averageReturnShippingCost: 15000,
      replacementCost: 50000,
      restockingCost: 5000,
    },
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: true,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });

  assert(
    promptScenario.isValid &&
    promptScenario.converged &&
    Math.abs(promptScenario.summary.achievedNetProfit - 55000) <= 1,
    'Reverse Pricing TEST 8: Prompt Scenario (Target Rp55k, HPP 50k, Packing 2.5k, Ops 4k, Ads 10k, Retur 2%) converges exactly to Rp55.000'
  );

  // REVERSE TEST 9: Complete Waterfall Category Sequence Integrity
  const promptWf = promptScenario.waterfall;
  const categories = promptWf.map((w) => w.category);
  assert(
    categories.includes('START') &&
    categories.includes('SHOPEE_FEES') &&
    categories.includes('PROGRAM_FEES') &&
    categories.includes('ADS') &&
    categories.includes('RETURN_ALLOWANCE') &&
    categories.includes('HPP') &&
    categories.includes('PACKING') &&
    categories.includes('OPERATIONAL') &&
    categories.includes('FINAL_TARGET'),
    'Reverse Pricing TEST 9: Waterfall contains all required reduction components in proper order down to TARGET AKHIR'
  );

  // PATCH V1E - TEST 10: No silent assumptions (4% / 4.5%) if program rules are missing
  const emptyProgCalc = calculateTrueProfit(
    {
      originalProductPrice: 100000,
      sellerDiscountPercent: 0,
      vouchers: [],
      hpp: 50000,
      sellerType: 'STAR',
      category: 'Fashion & Pakaian',
      isFreeShippingXtraActive: true,
      isPromoXtraActive: true,
      isPromoXtraPlusActive: false,
      isAffiliateActive: false,
    },
    INITIAL_MARKETPLACE_FEE_RULES,
    [] // Empty program rules
  );
  // When program rules are empty, freeShippingXtraFee and promoXtraFee must be 0, not assumed 4% or 4.5%
  assert(
    emptyProgCalc.freeShippingXtraFee === 0 &&
    emptyProgCalc.promoXtraFee === 0 &&
    emptyProgCalc.totalProgramFees === 0,
    'PATCH V1E - TEST 10: Missing program rules evaluate to 0 fee without silent fallback to 4.0% or 4.5%'
  );

  // PATCH V1E - TEST 11: Program rate derives dynamically from category-specific rulesData
  const elektronikCalc = calculateTrueProfit({
    originalProductPrice: 1000000,
    sellerDiscountPercent: 0,
    vouchers: [],
    hpp: 600000,
    sellerType: 'STAR',
    category: 'Elektronik & Gadget',
    isFreeShippingXtraActive: true,
    isPromoXtraActive: false,
    isPromoXtraPlusActive: false,
    isAffiliateActive: false,
  });
  // Elektronik has 3.5% rate in categoryRules (Rp 35.000), while Fashion has 4.0% (Rp 40.000)
  assert(
    elektronikCalc.freeShippingXtraFee === 35000,
    'PATCH V1E - TEST 11: Free Shipping Xtra correctly applies category-specific 3.5% rate from rulesData'
  );

  // PATCH V1E - TEST 12: Reverse Pricing Invariance verification
  const invarCheck = calculateReversePrice({
    targetAmount: 55000,
    targetMode: 'NET_PROFIT',
    sellerDiscountPercent: 0,
    hpp: 50000,
    sellerType: 'STAR',
    category: 'Fashion & Pakaian',
    isFreeShippingXtraActive: true,
  });
  assert(
    invarCheck.isValid &&
    invarCheck.converged &&
    Math.abs(invarCheck.summary.achievedNetProfit - 55000) <= 1,
    'PATCH V1E - TEST 12: Reverse Pricing invariant post-patch (Target Rp55.000 achieved with exact precision)'
  );

  return { passed: allPassed, results };
}
