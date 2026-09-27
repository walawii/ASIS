/**
 * Unit Tests for ASIS SELLER Calculation Engine
 */

import {
  calculateProfit,
  calculateMargin,
  calculateROAS,
  calculateBreakEvenROAS,
  calculateMinimumPrice,
  calculateTargetPrice,
  calculateMaximumDiscount,
  calculateMaximumAdsSpend,
  calculateStockForecast,
  evaluateRoasIndicator,
} from './calculatorEngine.ts';

export function runCalculationEngineTests(): { passed: boolean; results: string[] } {
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

  // Test 1: calculateProfit standard
  // Selling: 99.000, 10% disc = 89.100 effective
  // HPP: 50.000, Fee: 6.5% + 4% + 1.5% = 12% -> 89.100 * 0.12 = 10.692
  // Ops: 2.500 packing + 1.500 ops = 4.000
  // Ads: 10.000
  // Total cost = 50.000 + 10.692 + 4.000 + 10.000 = 74.692
  // Net profit = 89.100 - 74.692 = 14.408
  const profitRes = calculateProfit({
    sellingPrice: 99000,
    discountPercent: 10,
    hpp: 50000,
    adminFeePercent: 6.5,
    serviceFeePercent: 4.0,
    transactionFeePercent: 1.5,
    packingCost: 2500,
    operationalCostPerOrder: 1500,
    adsCostPerOrder: 10000,
  });

  assert(Math.round(profitRes.effectivePrice) === 89100, 'Effective price calculation with 10% discount');
  assert(Math.round(profitRes.netProfit) === 14408, 'Net profit calculation is exact');
  assert(profitRes.status === 'UNTUNG', 'Status is UNTUNG for positive profit');

  // Test 2: calculateMargin
  const margin = calculateMargin(14408, 89100);
  assert(margin > 16.1 && margin < 16.2, 'Margin percentage calculation (~16.17%)');

  // Test 3: calculateROAS
  const roas = calculateROAS(89100, 10000);
  assert(roas === 8.91, 'ROAS calculation equals 8.91');

  // Test 4: calculateBreakEvenROAS
  // Selling: 100.000, HPP: 50.000, Fee: 12% (12.000), Ops: 4.000
  // Profit before ads = 100.000 - 66.000 = 34.000
  // BEP ROAS = 100.000 / 34.000 = ~2.941
  const bepRoas = calculateBreakEvenROAS(100000, 50000, 12, 4000);
  assert(Math.abs(bepRoas - 2.941) < 0.01, 'BEP ROAS calculation is accurate');

  // Test 5: calculateMinimumPrice
  // HPP: 50.000, Fixed: 14.000, Fee: 12% -> Min Price = 64.000 / 0.88 = 72.727
  const minPrice = calculateMinimumPrice(50000, 14000, 12);
  assert(Math.round(minPrice) === 72727, 'Minimum BEP Price calculation');

  // Test 6: calculateTargetPrice (15% target margin)
  // Denominator: 1 - 0.12 - 0.15 = 0.73
  // Target Price: 64.000 / 0.73 = 87.671
  const targetPrice = calculateTargetPrice(50000, 14000, 12, 15);
  assert(Math.round(targetPrice) === 87671, 'Target Price calculation for 15% margin');

  // Test 7: calculateMaximumDiscount
  const discRes = calculateMaximumDiscount(100000, 50000, 14000, 12, 0);
  assert(discRes.maxDiscountPercent > 27 && discRes.maxDiscountPercent < 28, 'Maximum discount calculation (~27.27%)');

  // Test 8: calculateMaximumAdsSpend
  const adsSpend = calculateMaximumAdsSpend(10000000, 5);
  assert(adsSpend === 2000000, 'Max Ads spend for 10M revenue & 5x ROAS is 2M');

  // Test 9: calculateStockForecast
  const stockForecast = calculateStockForecast(120, 10, 7, 5);
  assert(stockForecast.daysRemaining === 12, 'Days remaining is exactly 12');
  assert(stockForecast.status === 'WASPADA', '12 days triggers WASPADA status');

  // Test 10: evaluateRoasIndicator
  const evalGood = evaluateRoasIndicator(5.42, 4.0, 2.87);
  assert(evalGood.category === 'ROAS BAGUS', 'ROAS 5.42x vs target 4.0x is ROAS BAGUS');

  return { passed: allPassed, results };
}
