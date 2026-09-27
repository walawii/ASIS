import { SellerType, CalculationBase, Pph22Result, TaxTreatment } from './rules.ts';

export type VoucherPayer = 'SELLER' | 'PLATFORM' | 'SHARED';

export interface VoucherConfig {
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING' | 'COINS' | 'CASHBACK' | 'OTHER';
  nominal: number;
  percentage?: number;
  payer: VoucherPayer;
  sellerContributionRatio?: number; // e.g. 1.0 (100% seller) or 0.5 (50% seller)
  description?: string;
}

export interface AffiliateConfig {
  enabled: boolean;
  commissionPercent: number; // e.g. 5%
  programType?: 'KOMISI_XTRA_PRODUK' | 'KOMISI_XTRA_PLUS' | 'KOMISI_XTRA_KHUSUS' | 'PAY_PER_POST' | 'STANDARD';
  targetRate?: number;
  actualRate?: number;
  commissionBase?: 'NET_COMPLETED_PURCHASE_VALUE' | 'GROSS_SALES';
  ppnRate?: number;
  affiliateType?: 'STANDARD' | 'KOL_PREMIUM' | 'LIVE_STREAMER';
  netTransactionBasis?: boolean; // dihitung setelah diskon toko
  includePpn?: boolean; // PPN atas komisi affiliate
  additionalFeeFixed?: number; // e.g. Rp 0
  postFee?: number; // biaya endorse post jika ada
  cap?: number;
}

export interface AdvertisingConfig {
  type: 'Shopee Ads' | 'External Ads' | 'Affiliate Ads' | 'Other Ads';
  dailyBudget: number;
  actualSpend: number;
  revenueAttributed: number;
  ordersAttributed: number;
  attributionWindowDays?: number; // e.g. 7 days
}

export interface ShippingConfig {
  actualShippingCost: number;
  buyerShippingPaid: number;
  sellerShippingContribution: number; // subsidi ongkir toko
  platformShippingSubsidy: number; // subsidi dari voucher shopee
  returnShippingCost: number;
}

export interface ReturnConfig {
  returnRatePercent: number; // e.g. 2.5%
  refundRatePercent: number; // e.g. 1.0%
  defectRatePercent: number; // e.g. 0.5%
  cancellationRatePercent: number; // e.g. 2.0%
  averageReturnShippingCost: number; // e.g. Rp 15.000
  replacementCost: number; // e.g. Rp 20.000
  restockingCost: number; // e.g. Rp 5.000
}

export interface FulfillmentConfig {
  enabled: boolean; // [x] Dikelola Shopee (Fulfillment by Shopee / FBS)
  packagingFee: number; // e.g. Rp 2.500
  storageFeePerCbmDay: number; // e.g. Rp 300
  additionalPackaging: number; // bubble wrap / special box
  bundlingFee: number;
  repackingFee: number;
  rtsReinboundFee: number; // Return To Seller Re-inbound
  multiWarehouseTransferFee: number;
}

export interface OperationalCostConfig {
  allocationType: 'PER_ORDER' | 'PER_PRODUCT' | 'PERCENTAGE_OF_REVENUE' | 'MONTHLY_FIXED';
  packingCost: number;
  laborCost: number;
  warehouseCost: number;
  electricityCost: number;
  internetCost: number;
  softwareCost: number;
  rentCost: number;
  customerServiceCost: number;
  paymentGatewayCost: number;
  otherCost: number;
}

export interface TrueProfitInput {
  originalProductPrice: number;
  sellerDiscountPercent: number;
  vouchers: VoucherConfig[];
  hpp: number;
  sellerType: SellerType;
  category: string;
  // Transaction & Seller Eligibility Context
  transactionDate?: string; // YYYY-MM-DD
  productUploadDate?: string; // YYYY-MM-DD
  firstProductUploadDate?: string; // YYYY-MM-DD
  sellerJoinDate?: string; // YYYY-MM-DD
  completedOrderCount?: number;
  // Programs toggles
  isFreeShippingXtraActive: boolean;
  isPromoXtraActive: boolean;
  isPromoXtraPlusActive: boolean;
  isAffiliateActive: boolean;
  isPreOrderActive?: boolean;
  preOrderFeeRate?: number;
  // Specific configs
  affiliateConfig?: Partial<AffiliateConfig>;
  advertisingConfig?: Partial<AdvertisingConfig>;
  shippingConfig?: Partial<ShippingConfig>;
  returnConfig?: Partial<ReturnConfig>;
  fulfillmentConfig?: Partial<FulfillmentConfig>;
  operationalCostConfig?: Partial<OperationalCostConfig>;
  // Custom unit order ads
  adsCostPerOrder?: number;
}

export interface TrueProfitCalculation {
  grossProductPrice: number;
  sellerDiscountAmount: number;
  effectiveProductPrice: number; // Setelah diskon seller
  totalSellerVoucherDeduction: number; // Voucher yang dibayar seller
  platformVoucherContribution: number; // Voucher dibayar platform (tidak mengurangi profit)
  feeBase: number; // Basis perhitungan fee marketplace
  grossSales: number; // Uang yang diterima dari transaksi

  // Fee Marketplace
  marketplaceAdminFee: number;
  marketplaceAdminPercent: number;
  orderProcessingFee: number; // Rp 1.250 standard Shopee
  totalMarketplaceFees: number;

  // Program Fees
  freeShippingXtraFee: number;
  promoXtraFee: number;
  promoXtraPlusFee: number;
  preOrderFee?: number;
  totalProgramFees: number;

  // Affiliate
  affiliateCommissionBase: number;
  affiliateCommission: number;
  affiliateTax: number;
  totalAffiliateCost: number;

  // Advertising
  adsCostPerOrder: number;
  roas: number;
  acos: number; // (Ads / Revenue) * 100
  tacos: number; // (Ads / Total Gross Sales) * 100
  profitAfterAds: number;
  breakEvenRoas: number;

  // Fulfillment & Shipping
  fulfillmentCost: number;
  netShippingCostToSeller: number;

  // Return & Risk Reserve
  expectedReturnCost: number; // Return Probability * Average Cost
  actualReturnCostCurrent: number;

  // Internal Operational
  totalOperationalCost: number;

  // Taxes (PMK / PPh Final UMKM 0.5% & PPh 22 Withholding)
  taxRatePercent: number;
  taxableRevenue: number;
  taxAmount: number;
  isTaxExempt: boolean;
  taxExemptionReason: string;
  cashWithheld?: number; // Kas yang dipotong marketplace untuk withholding PPh 22
  taxTreatment?: TaxTreatment; // Perlakuan pajak: NOT_APPLICABLE | EXEMPT | FINAL_TAX_SETTLEMENT | CREDITABLE_TAX
  pph22Result?: Pph22Result;

  // Final Profit & Margins
  cogsHpp: number;
  totalAllDeductions: number;
  actualNetProfit: number; // Profit tanpa ekspektasi retur
  expectedNetProfit: number; // Profit setelah dipotong cadangan retur (true profit paling aman)
  actualNetMargin: number; // %
  expectedNetMargin: number; // %

  // Pricing recommendations
  breakEvenPrice: number;
  targetPrice5: number;
  targetPrice10: number;
  targetPrice15: number;
  targetPrice20: number;
  targetPriceCustom: number;
  maximumDiscountPercent: number;

  // Status & Audit Log
  profitStatus: 'PROFITABLE' | 'LOW_MARGIN' | 'BREAK_EVEN' | 'LOSS';
  auditSteps: CalculationAuditStep[];
}

export interface CalculationAuditStep {
  stepNumber: number;
  title: string;
  formulaDescription: string;
  calculationEquation: string;
  resultValue: number;
  notes?: string;
  ruleSource?: string;
  ruleDate?: string;
}
