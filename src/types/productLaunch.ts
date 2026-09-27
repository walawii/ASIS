/**
 * ASIS SELLER - Product Launch Assistant Types
 * Single source of definitions for Product Creation, SEO Title Generation,
 * Keyword Recommendations, Structured Description, Compliance & Quality Score.
 */

import { SellerType } from './rules.ts';
import { InversePricingResult } from '../services/profitEngine/inversePricing.ts';

export type ProductLaunchCategory =
  | 'Fashion & Pakaian'
  | 'Tas & Aksesoris'
  | 'Elektronik & Gadget'
  | 'Kecantikan & Perawatan'
  | 'Rumah Tangga & Dapur'
  | 'Sembako & Kebutuhan Pokok'
  | 'Umum / Lainnya';

export interface ProductLaunchSpecifications {
  bahan?: string;
  warna?: string;
  ukuran?: string;
  panjang?: string;
  lebar?: string;
  tinggi?: string;
  lingkarDada?: string;
  beratGrams?: number;
  isiQuantity?: string;
  varian?: string;
  model?: string;
  motif?: string;
  kapasitas?: string;
  fiturUtama?: string[];
}

export interface ProductLaunchSeoInput {
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: 'Komersial (Mencari Pilihan)' | 'Transaksional (Siap Beli)' | 'Informasional (Mencari Info)';
  targetAudience: string;
  keySellingPoints: string[];
}

export interface ProductLaunchFinancialInput {
  targetBuyerPrice: number;
  sellerDiscountPercent: number;
  hpp: number;
  packingCost: number;
  operationalCost: number;
  adsCostPerOrder: number;
  expectedReturnRate: number;
  targetMargin: number;
  sellerStatus: SellerType;
  category: string;
  isFreeShippingXtraActive: boolean;
  isPromoXtraActive: boolean;
  isPromoXtraPlusActive: boolean;
  isAffiliateActive: boolean;
  affiliatePercent: number;
}

export interface ProductLaunchInput {
  productName: string;
  brand: string;
  category: ProductLaunchCategory;
  subCategory: string;
  productType: string;
  specifications: ProductLaunchSpecifications;
  seo: ProductLaunchSeoInput;
  financial: ProductLaunchFinancialInput;
}

export interface SeoTitleOptions {
  seoUtama: string;
  seoNatural: string;
  seoConversion: string;
  selectedTitle: string;
}

export interface KeywordRecommendations {
  primaryKeyword: string;
  secondaryKeywords: string[];
  longTailKeywords: string[];
  buyerIntentPhrases: string[];
  keywordSuggestions: string[];
}

export interface ComplianceCheckItem {
  id: string;
  label: string;
  passed: boolean;
  details: string;
}

export interface QualityScoreComponent {
  label: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface ProductLaunchResult {
  seoTitles: SeoTitleOptions;
  keywords: KeywordRecommendations;
  productDescription: string;
  specificationsFormatted: string;
  packageContents: string;
  targetAudienceText: string;
  complianceChecks: ComplianceCheckItem[];
  compliancePassed: boolean;
  qualityScore: number;
  qualityComponents: QualityScoreComponent[];
  pricing: InversePricingResult;
  recommendedBuyerPrice: number;
  isBelowRecommended: boolean;
}
