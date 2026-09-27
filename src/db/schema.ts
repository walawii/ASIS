/**
 * ASIS SELLER - Database Schema Definition (Production Hardened)
 * 
 * Compliant with Phase 24 of ASIS Architecture.
 * Contains all 25 core tables for multi-tenant Shopee Financial OS:
 * 
 *  1. users
 *  2. stores
 *  3. products
 *  4. product_variants
 *  5. orders
 *  6. order_items
 *  7. campaigns
 *  8. campaign_metrics
 *  9. inventory
 * 10. inventory_movements
 * 11. fee_rules
 * 12. fee_rule_versions
 * 13. seller_programs
 * 14. tax_rules
 * 15. tax_profiles
 * 16. tax_transactions
 * 17. affiliate_costs
 * 18. advertising_costs
 * 19. fulfillment_costs
 * 20. shipping_costs
 * 21. return_costs
 * 22. operational_costs
 * 23. profit_transactions
 * 24. price_simulations
 * 25. notifications & subscriptions
 */

export interface DbUser {
  id: string;
  email: string;
  fullName: string;
  role: 'owner' | 'finance' | 'operator' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface DbStore {
  id: string;
  userId: string;
  name: string;
  category: string;
  sellerType: 'NON_STAR' | 'STAR' | 'STAR_PLUS' | 'MALL';
  shopeeShopId?: string;
  connectionStatus: 'SIMULATION' | 'NOT_CONNECTED' | 'CONNECTING' | 'CONNECTED' | 'TOKEN_EXPIRED';
  createdAt: string;
  updatedAt: string;
}

export interface DbProduct {
  id: string;
  storeId: string;
  sku: string;
  name: string;
  category: string;
  hpp: number;
  sellingPrice: number;
  discountPercent: number;
  effectivePrice: number;
  packingCost: number;
  operationalCost: number;
  weightGrams: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbProductVariant {
  id: string;
  productId: string;
  sku: string;
  variantName: string;
  hpp: number;
  price: number;
  stock: number;
  soldCount: number;
}

export interface DbOrder {
  id: string;
  storeId: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerCity: string;
  totalGrossAmount: number;
  totalHpp: number;
  marketplaceAdminFee: number;
  orderProcessingFee: number;
  programFee: number;
  affiliateFee: number;
  voucherDiscount: number;
  netShippingCost: number;
  estimatedTax: number;
  netProfit: number;
  status: 'Baru' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan' | 'Retur';
  createdAt: string;
}

export interface DbOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  sku: string;
  quantity: number;
  unitSellingPrice: number;
  unitHpp: number;
}

export interface DbCampaign {
  id: string;
  storeId: string;
  productId?: string;
  campaignName: string;
  campaignType: 'Pencarian' | 'Produk Serupa' | 'Toko' | 'Live';
  dailyBudget: number;
  targetRoas: number;
  status: 'Aktif' | 'Dijeda' | 'Selesai';
  startDate: string;
  endDate?: string;
}

export interface DbCampaignMetric {
  id: string;
  campaignId: string;
  date: string;
  spendAmount: number;
  revenueGenerated: number;
  ordersAttributed: number;
  clicks: number;
  conversions: number;
  roas: number;
}

export interface DbInventory {
  id: string;
  storeId: string;
  productId: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  safetyStock: number;
  criticalThreshold: number;
  dailyVelocity: number;
  daysRemaining: number;
}

export interface DbInventoryMovement {
  id: string;
  inventoryId: string;
  orderId?: string;
  movementType: 'INBOUND' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGE';
  quantityDelta: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  timestamp: string;
}

export interface DbFeeRule {
  id: string;
  marketplace: string;
  sellerType: string;
  category: string;
  feeType: string;
  ratePercent: number;
  fixedAmount: number;
  maxAmountCap?: number;
  minAmountFloor?: number;
  calculationBase: string;
  source: string;
  sourceUrl?: string;
  verifiedAt: string;
  active: boolean;
}

export interface DbFeeRuleVersion {
  id: string;
  feeRuleId: string;
  versionNumber: number;
  ratePercent: number;
  fixedAmount: number;
  effectiveFrom: string;
  effectiveUntil?: string;
  changeSummary: string;
}

export interface DbSellerProgram {
  id: string;
  storeId: string;
  programCode: string;
  name: string;
  isActive: boolean;
  ratePercent: number;
  feeCap?: number;
}

export interface DbTaxRule {
  id: string;
  taxSchemeName: string;
  taxpayerType: 'Individual' | 'Company';
  ratePercent: number;
  annualThreshold: number;
  regulationReference: string;
  sourceUrl: string;
  effectiveFrom: string;
  effectiveUntil?: string;
}

export interface DbTaxProfile {
  id: string;
  userId: string;
  taxpayerType: 'Individual' | 'Company';
  taxScheme: 'UMKM Final' | 'General';
  npwpOrNik: string;
  hasNpwp: boolean;
  isPkp: boolean;
  hasSkbExemption: boolean;
  skbCertificateNumber?: string;
  annualAccumulatedRevenue: number;
}

export interface DbTaxTransaction {
  id: string;
  orderId: string;
  storeId: string;
  transactionDate: string;
  taxableRevenue: number;
  taxRatePercent: number;
  taxAmountCalculated: number;
  isExempt: boolean;
  exemptionReason?: string;
}

export interface DbAffiliateCost {
  id: string;
  orderId: string;
  affiliateId?: string;
  creatorName?: string;
  commissionBase: number;
  commissionRatePercent: number;
  commissionAmount: number;
  ppnAmount: number;
  totalCost: number;
}

export interface DbAdvertisingCost {
  id: string;
  storeId: string;
  orderId?: string;
  campaignId?: string;
  spendAmount: number;
  attributedRevenue: number;
  date: string;
}

export interface DbFulfillmentCost {
  id: string;
  orderId: string;
  isFbsDikelolaShopee: boolean;
  packagingFee: number;
  storageFee: number;
  handlingFee: number;
  totalFulfillmentCost: number;
}

export interface DbShippingCost {
  id: string;
  orderId: string;
  actualShippingFee: number;
  buyerPaidShipping: number;
  sellerSubsidy: number;
  platformSubsidy: number;
  netSellerCost: number;
}

export interface DbReturnCost {
  id: string;
  orderId: string;
  returnReason: string;
  returnShippingFee: number;
  replacementCost: number;
  packagingLossCost: number;
  totalReturnLoss: number;
  status: 'PENDING' | 'RESOLVED' | 'DISPUTED';
}

export interface DbOperationalCost {
  id: string;
  storeId: string;
  date: string;
  packingMaterialsCost: number;
  laborPackingCost: number;
  csSupportCost: number;
  softwareCost: number;
  rentAndUtilitiesCost: number;
  totalOperationalCost: number;
}

export interface DbProfitTransaction {
  id: string;
  orderId: string;
  storeId: string;
  grossSales: number;
  cogsHpp: number;
  totalMarketplaceFees: number;
  totalProgramFees: number;
  affiliateCost: number;
  adsCost: number;
  fulfillmentCost: number;
  shippingCost: number;
  returnCostReserve: number;
  operationalCost: number;
  taxAmount: number;
  trueNetProfit: number;
  trueNetMarginPercent: number;
  calculatedAt: string;
}

export interface DbPriceSimulation {
  id: string;
  userId: string;
  productName: string;
  hpp: number;
  priceA: number;
  priceB: number;
  priceC: number;
  marginA: number;
  marginB: number;
  marginC: number;
  createdAt: string;
}

export interface DbNotification {
  id: string;
  userId: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface DbSubscription {
  id: string;
  userId: string;
  tier: 'lite' | 'plus' | 'kit';
  status: 'active' | 'cancelled' | 'expired';
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
}
