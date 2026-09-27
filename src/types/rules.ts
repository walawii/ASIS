export type SellerType = 'NON_STAR' | 'STAR' | 'STAR_PLUS' | 'MALL';

export type CalculationBase =
  | 'ORIGINAL_PRICE'
  | 'AFTER_SELLER_DISCOUNT'
  | 'AFTER_SELLER_DISCOUNT_AND_VOUCHER'
  | 'NET_SALES'
  | 'NET_COMPLETED_PURCHASE_VALUE';

export type RuleStatus = 'ACTIVE' | 'EXPIRED' | 'DRAFT' | 'UNVERIFIED';

export type RuleEligibilityState =
  | 'ELIGIBLE'
  | 'REQUIRES_SELLER_DATA'
  | 'RULE_REQUIRES_CATEGORY'
  | 'RULE_DATA_UNAVAILABLE';

export interface SellerEligibilityProfile {
  sellerStatus: SellerType;
  firstProductUploadDate?: string; // YYYY-MM-DD
  sellerJoinDate?: string; // YYYY-MM-DD
  completedOrderCount?: number;
}

export interface MarketplaceFeeRule {
  id: string;
  marketplace: 'SHOPEE';
  sellerType: SellerType;
  category: string; // e.g. 'Fashion & Pakaian', 'Elektronik & Gadget', 'Kecantikan & Perawatan', 'Umum'
  feeType: 'ADMINISTRATION' | 'SERVICE' | 'TRANSACTION' | 'PROCESSING';
  percentage: number; // e.g. 8.25
  fixedFee: number; // e.g. 0 or 1250
  maximumFee?: number; // e.g. cap Rp 50.000 (jika ada)
  minimumFee?: number;
  calculationBase: CalculationBase;
  effectiveFrom: string; // YYYY-MM-DD
  effectiveUntil?: string; // YYYY-MM-DD
  active: boolean;
  status: RuleStatus;
  source: string; // 'Shopee Official Terms'
  sourceUrl?: string;
  notes: string;
  verifiedAt: string; // e.g. '2026-09-25'
  specialEligibility?: string;
  taxIncluded?: boolean;
  taxType?: 'PPN' | 'PPH22' | 'NONE';
  taxRate?: number;
  eligibilityState?: RuleEligibilityState;
}

export type ProgramType =
  | 'FREE_SHIPPING_XTRA'
  | 'PROMO_XTRA'
  | 'PROMO_XTRA_PLUS'
  | 'AFFILIATE'
  | 'PRE_ORDER'
  | 'OTHER';

export interface SellerProgramRule {
  id: string;
  code: ProgramType;
  name: string;
  description: string;
  enabled: boolean;
  rate: number; // percentage, e.g. 4.0%
  cap?: number; // maximum fee in IDR, e.g. Rp 40.000 (reguler)
  specialSizeCap?: number; // Rp 60.000 (special size)
  minimumFee?: number;
  calculationBase: CalculationBase;
  categoryRules?: Record<string, { rate: number; cap?: number; specialSizeCap?: number }>;
  sellerStatusRules?: Record<SellerType, { rate: number; cap?: number }>;
  effectiveFrom: string;
  effectiveUntil?: string;
  status: RuleStatus;
  source: string;
  sourceUrl?: string;
  verifiedAt: string;
  taxIncluded?: boolean;
  taxType?: 'PPN' | 'PPH22' | 'NONE';
  taxRate?: number;
  notes?: string;
}

// Tax Treatment Semantics (Mencegah Double Counting PPh Final vs PPh 22 vs Cash Withholding)
export type TaxTreatment =
  | 'NOT_APPLICABLE'
  | 'EXEMPT'
  | 'FINAL_TAX_SETTLEMENT'
  | 'CREDITABLE_TAX'
  | 'TAX_RULE_REQUIRES_DATA';

// Tax Eligibility State untuk PPh Final UMKM & Ketentuan PP 55/2022
export type TaxEligibilityState =
  | 'ELIGIBLE'
  | 'EXEMPT_SKB'
  | 'EXEMPT_OMZET_500M'
  | 'THRESHOLD_EXCEEDED_PKP'
  | 'PERIOD_EXPIRED'
  | 'NOT_ELIGIBLE_REGIME'
  | 'TAX_RULE_REQUIRES_DATA';

// PPh 22 Marketplace (PMK 37/2025) types
export type Pph22Status =
  | 'NOT_YET_EFFECTIVE'
  | 'NOT_APPLICABLE'
  | 'EXEMPT_SKB'
  | 'EXEMPT_OMZET_500M'
  | 'EXEMPT'
  | 'APPLICABLE'
  | 'TAX_RULE_REQUIRES_DATA'
  | 'ESTIMATED';

export interface Pph22Result {
  eligible: boolean;
  status: Pph22Status;
  rate: number;
  taxableBase: number;
  taxAmount: number;
  cashWithheld: number;
  taxTreatment: TaxTreatment;
  reason: string;
  effectiveFrom: string;
}

export interface Pph22Rule {
  id: string;
  name: string;
  rate: number; // 0.5%
  calculationBase: CalculationBase;
  effectiveFrom: string; // 2026-11-01
  effectiveUntil?: string;
  regulation: string; // PMK No. 37/2025
  source: string;
  sourceUrl: string;
  notes: string;
  verifiedAt: string;
  status: RuleStatus;
}

export interface TaxRule {
  id: string;
  name: string;
  taxpayerType: 'Individual' | 'Company';
  taxScheme: 'UMKM Final' | 'General Income Tax' | 'Other';
  taxType: 'PPH_FINAL_UMKM' | 'PPH22' | 'PPN';
  taxRate: number; // percentage, e.g. 0.5% or 11%
  headlineRate: number; // Statutory headline rate (e.g. 11% untuk PPN, 0.5% untuk PPh Final)
  effectiveRate: number; // Effective rate applied (e.g. 11% atau 0.5%)
  taxBase: CalculationBase;
  taxBaseType?: CalculationBase;
  taxIncluded: boolean;
  rate: number; // e.g. 0.5% (PPh Final UMKM PP 55/2022)
  annualNonTaxableThreshold: number; // Rp 500.000.000 for individual UMKM
  pkpThreshold: number; // Rp 4.800.000.000
  withholdingRate: number; // 0.5% marketplace withholding if applicable
  regulationNumber: string; // e.g. 'PP No. 55 Tahun 2022 & PMK No. 164/PMK.03/2023'
  source: string;
  sourceUrl: string;
  notes: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  status: RuleStatus;
  verifiedAt: string;
}

export interface TaxProfile {
  taxpayerType: 'Individual' | 'Company';
  taxScheme: 'UMKM Final' | 'General Income Tax' | 'Other';
  npwpOrNik: string;
  hasNpwp: boolean;
  isPkp: boolean;
  hasSkbExemption: boolean; // Surat Keterangan Bebas (SKB)
  skbCertificateNumber?: string;
  hasUmkmStatementLetter?: boolean; // Surat Pernyataan Omzet <= 500 Juta (PMK 37/2025)
  annualOfflineRevenue: number;
  annualOtherMarketplaceRevenue: number;
  taxEffectiveDate: string;
  establishmentYear?: number;
  regimeStartYear?: number;
}
