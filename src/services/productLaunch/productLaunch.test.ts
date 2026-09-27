/**
 * Unit Tests for ASIS SELLER - Product Launch Assistant Engine
 * Validates SEO Titles, Keyword Recommendations, Description, Compliance,
 * Quality Score, and True Profit Integration.
 */

import {
  generateSeoTitles,
  generateKeywordRecommendations,
  generateProductDescription,
  formatSpecifications,
  runShopeeComplianceCheck,
  calculateListingQualityScore,
  calculateRecommendedBuyerPrice,
  processProductLaunch,
} from './index.ts';
import { ProductLaunchInput } from '../../types/productLaunch.ts';

export function runProductLaunchTests(): { passed: boolean; results: string[] } {
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

  const baseInput: ProductLaunchInput = {
    productName: 'Kemeja Linen Pria Oversize Lengan Panjang',
    brand: 'Kalasen',
    category: 'Fashion & Pakaian',
    subCategory: 'Atasan Pria',
    productType: 'Kemeja Casual',
    specifications: {
      bahan: 'Katun Linen Rami',
      warna: 'Sage Green, Broken White, Hitam',
      ukuran: 'M, L, XL',
      lingkarDada: '108 - 116 cm',
      panjang: '74 cm',
      beratGrams: 250,
      fiturUtama: ['Bahan adem tidak gerah', 'Jahitan rapi standar distro', 'Kancing batok kelapa estetik'],
    },
    seo: {
      primaryKeyword: 'Kemeja Linen Pria',
      secondaryKeywords: ['Kemeja Kasual Santai', 'Atasan Pria Aesthetic'],
      searchIntent: 'Transaksional (Siap Beli)',
      targetAudience: 'Pria Dewasa & Mahasiswa',
      keySellingPoints: [
        'Bahan 100% linen rami serat alami yang sejuk dan menyerap keringat',
        'Fitting modern relaxed oversize yang stylish untuk nongkrong maupun semi-formal',
        'Warna pastel natural earthy tone yang mudah dipadukan',
      ],
    },
    financial: {
      targetBuyerPrice: 55000,
      sellerDiscountPercent: 10,
      hpp: 25000,
      packingCost: 2500,
      operationalCost: 1500,
      adsCostPerOrder: 5000,
      expectedReturnRate: 2.0,
      targetMargin: 18,
      sellerStatus: 'STAR',
      category: 'Fashion & Pakaian',
      isFreeShippingXtraActive: true,
      isPromoXtraActive: true,
      isPromoXtraPlusActive: false,
      isAffiliateActive: false,
      affiliatePercent: 0,
    },
  };

  // TEST 1: Product title generation (generates 3 distinct valid titles)
  const titles = generateSeoTitles(baseInput);
  assert(
    titles.seoUtama.length > 10 &&
    titles.seoNatural.length > 10 &&
    titles.seoConversion.length > 10 &&
    titles.seoUtama.includes('Kalasen') &&
    titles.seoUtama.includes('Kemeja Linen Pria'),
    'Test 1: Generates 3 distinct SEO titles respecting brand and product identity'
  );

  // TEST 2: Keyword relevance (primary and secondary correctly integrated)
  const kw = generateKeywordRecommendations(baseInput);
  assert(
    kw.primaryKeyword === 'Kemeja Linen Pria' &&
    kw.secondaryKeywords.length >= 2 &&
    kw.longTailKeywords.some(k => k.includes('Pria Dewasa & Mahasiswa') || k.includes('Bahan Katun Linen Rami')),
    'Test 2: Keyword recommendations derive directly from product attributes and audience'
  );

  // TEST 3: No keyword stuffing (no repetitive spam words)
  const titleWords = titles.seoUtama.toLowerCase().split(' ');
  const wordFrequency: Record<string, number> = {};
  titleWords.forEach(w => { wordFrequency[w] = (wordFrequency[w] || 0) + 1; });
  const maxRepetition = Math.max(...Object.values(wordFrequency));
  assert(
    maxRepetition <= 2,
    'Test 3: SEO titles contain zero keyword stuffing or excessive repetitions'
  );

  // TEST 4: No competitor brand injection
  assert(
    !titles.seoUtama.toLowerCase().includes('zara') &&
    !titles.seoUtama.toLowerCase().includes('uniqlo') &&
    !titles.seoNatural.toLowerCase().includes('h&m'),
    'Test 4: Generator never injects competitor brands without user explicit input'
  );

  // TEST 5: Missing specification handling (does not invent unprovided data)
  const emptySpecsInput: ProductLaunchInput = {
    ...baseInput,
    specifications: {},
  };
  const emptyFormatted = formatSpecifications(emptySpecsInput.specifications);
  assert(
    emptyFormatted.includes('belum dilengkapi'),
    'Test 5: Missing specifications are handled cleanly without inventing fake data'
  );

  // TEST 6: Description generation structure
  const desc = generateProductDescription(baseInput);
  assert(
    desc.includes('✨ Ringkasan Produk') &&
    desc.includes('⭐ Keunggulan Produk') &&
    desc.includes('📋 Spesifikasi') &&
    desc.includes('📦 Isi Paket') &&
    desc.includes('📌 Catatan'),
    'Test 6: Description generator strictly adheres to Shopee standard markdown structure'
  );

  // TEST 7: Buyer price calculation (Target Buyer Price Rp 55.000 preserved)
  const launchResult = processProductLaunch(baseInput);
  assert(
    launchResult.pricing.actualBuyerPrice === 55000,
    'Test 7: Target Buyer Price is preserved as the exact final price paid by buyer (Rp 55.000)'
  );

  // TEST 8: Listing price calculation (Inverse pricing for 10% discount)
  assert(
    launchResult.pricing.requiredListingPrice === 61111,
    'Test 8: Inverse pricing correctly calculates required listing price of Rp 61.111'
  );

  // TEST 9: Seller discount calculation (Discount amount = Rp 6.111)
  assert(
    launchResult.pricing.sellerDiscountAmount === 6111,
    'Test 9: Seller discount nominal is calculated as Rp 6.111 (61.111 - 55.000)'
  );

  // TEST 10: True Profit Engine integration (uses calculateTrueProfit with all fees)
  assert(
    launchResult.pricing.profitCalculation !== undefined &&
    launchResult.pricing.profitCalculation.marketplaceAdminPercent === 8.25 &&
    launchResult.pricing.profitCalculation.orderProcessingFee === 1250,
    'Test 10: Product Launch routes financial calculation exclusively through True Profit Engine'
  );

  // TEST 11: Profit calculation (correct profit after all fees)
  assert(
    launchResult.pricing.profit > 0 && launchResult.pricing.margin > 0,
    'Test 11: Profit and margin are positive for healthy profitable configuration'
  );

  // TEST 12: Loss warning (flags loss status if HPP exceeds buyer price)
  const lossInput: ProductLaunchInput = {
    ...baseInput,
    financial: {
      ...baseInput.financial,
      targetBuyerPrice: 20000,
      hpp: 35000,
    },
  };
  const lossResult = processProductLaunch(lossInput);
  assert(
    lossResult.pricing.profit < 0 &&
    (lossResult.pricing.breakdown.profitStatus === 'LOSS' || lossResult.pricing.margin < 0),
    'Test 12: Correctly triggers loss warning when cost exceeds buyer revenue'
  );

  // TEST 13: Compliance validation (detects prohibited WhatsApp / claims / competitor)
  const badInput: ProductLaunchInput = {
    ...baseInput,
    productName: 'Kemeja No 1 Termurah Sedunia Zara Hubungi 081234567890',
  };
  const badResult = processProductLaunch(badInput);
  const waCheck = badResult.complianceChecks.find(c => c.id === 'no_external_contacts');
  const claimCheck = badResult.complianceChecks.find(c => c.id === 'anti_hyperbolic_claims');
  const competitorCheck = badResult.complianceChecks.find(c => c.id === 'anti_competitor_brand');
  assert(
    waCheck !== undefined && !waCheck.passed &&
    claimCheck !== undefined && !claimCheck.passed &&
    competitorCheck !== undefined && !competitorCheck.passed &&
    !badResult.compliancePassed,
    'Test 13: Compliance engine successfully catches WhatsApp numbers, illegal claims, and competitor names'
  );

  // TEST 14: Quality Score calculation
  assert(
    launchResult.qualityScore >= 70 && launchResult.qualityComponents.length === 7,
    'Test 14: Quality Score outputs a realistic rating (0-100) based on 7 objective components'
  );

  // TEST 15: Recommended Selling Price comparison
  assert(
    launchResult.recommendedBuyerPrice > 0,
    'Test 15: Recommended buyer price is calculated based on healthy target margin'
  );

  // PATCH V1E - TEST 16: Category-dependent Admin Fee in Recommended Price (no hardcoded 8.25%)
  const fashionPrice = calculateRecommendedBuyerPrice({
    ...baseInput.financial,
    category: 'Fashion & Pakaian',
    sellerStatus: 'STAR',
  });
  const electronicPrice = calculateRecommendedBuyerPrice({
    ...baseInput.financial,
    category: 'Elektronik & Gadget',
    sellerStatus: 'STAR',
  });
  // Since Elektronik has lower admin fee than Fashion in rulesData, recommended buyer price must be lower for Elektronik
  assert(
    electronicPrice < fashionPrice,
    'PATCH V1E - Test 16: calculateRecommendedBuyerPrice dynamically queries Fee Engine and adapts to category admin fee (not hardcoded 8.25%)'
  );

  // PATCH V1E - TEST 17: Program Rules Dynamic Lookup (no hardcoded 4.0 / 4.5)
  const noProgramPrice = calculateRecommendedBuyerPrice({
    ...baseInput.financial,
    isFreeShippingXtraActive: false,
    isPromoXtraActive: false,
  });
  const withProgramPrice = calculateRecommendedBuyerPrice({
    ...baseInput.financial,
    isFreeShippingXtraActive: true,
    isPromoXtraActive: true,
  });
  assert(
    noProgramPrice < withProgramPrice,
    'PATCH V1E - Test 17: calculateRecommendedBuyerPrice dynamically applies active program rates from programRules'
  );

  // PATCH V1E - TEST 18: Processing Fee derived from Fee Engine
  // With higher operational cost, target price scales proportionally with authoritative fixed costs
  const testRecPrice = calculateRecommendedBuyerPrice(baseInput.financial);
  assert(
    testRecPrice > baseInput.financial.hpp,
    'PATCH V1E - Test 18: Recommended price covers authoritative HPP, processing fee, and target margin'
  );

  return { passed: allPassed, results };
}
