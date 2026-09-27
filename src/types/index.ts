import { SellerType } from './rules.ts';

export type SubscriptionTier = 'lite' | 'plus' | 'kit';

export interface Store {
  id: string;
  name: string;
  category: string;
  shopeeStatus: 'disconnected' | 'connected';
  sellerStatus?: SellerType;
  firstProductUploadDate?: string;
  sellerJoinDate?: string;
  completedOrderCount?: number;
  /** @deprecated Legacy fallback only. Profit Engine uses rulesData.ts instead */
  defaultAdminFeePercent: number;
  /** @deprecated Legacy fallback only. Profit Engine uses rulesData.ts instead */
  defaultServiceFeePercent: number;
  /** @deprecated Legacy fallback only. Fee Engine uses fixed Rp1.250 instead */
  defaultPaymentFeePercent: number;
  /** @deprecated Legacy fallback only */
  defaultAffiliateFeePercent: number;
  defaultPackingCost: number; // e.g. Rp 2,500
  defaultOperationalCost: number; // e.g. Rp 1,500
  defaultTargetMargin: number; // e.g. 15%
  defaultTargetRoas: number; // e.g. 4.0
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string; // e.g. "Hitam - M"
  hpp: number;
  price: number;
  stock: number;
  soldCount: number;
  adsCost: number;
}

export interface Product {
  id: string;
  storeId: string;
  sku: string;
  name: string;
  category: string;
  hpp: number; // modal dasar
  sellingPrice: number;
  discountPercent: number;
  effectivePrice: number;
  packingCost: number;
  operationalCost: number;
  weightGrams: number;
  adminFeePercent: number;
  serviceFeePercent: number;
  transactionFeePercent: number;
  affiliatePercent: number;
  voucherNominal: number;
  cashbackNominal: number;
  shippingSubsidy: number;
  currentAdsCost: number;
  targetRoas: number;
  stock: number;
  safetyStock: number;
  dailySalesVelocity: number; // units sold per day
  rating: number;
  reviewCount: number;
  unitsSold: number;
  revenue: number;
  netProfit: number;
  marginPercent: number;
  actualRoas: number;
  bepRoas: number;
  status: 'PROFITABLE' | 'LOW_MARGIN' | 'BREAK_EVEN' | 'LOSS';
  score: {
    overall: number; // 0-100
    marginStatus: 'Good' | 'Fair' | 'Poor';
    roasStatus: 'Good' | 'Fair' | 'Poor';
    stockStatus: 'Good' | 'Warning' | 'Critical';
    salesVelocity: 'Strong' | 'Moderate' | 'Slow';
  };
  variants: ProductVariant[];
}

export type OrderStatus = 'Semua' | 'Baru' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan' | 'Retur';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  variantName?: string;
  qty: number;
  unitPrice: number;
  unitHpp: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "SP260925-8821"
  storeId: string;
  date: string;
  customerName: string;
  customerCity: string;
  items: OrderItem[];
  totalPrice: number;
  totalHpp: number;
  marketplaceFee: number;
  shippingCost: number;
  voucherDiscount: number;
  netProfit: number;
  status: OrderStatus;
  paymentMethod: string;
}

export interface Campaign {
  id: string;
  storeId: string;
  name: string;
  productId: string;
  productName: string;
  type: 'Iklan Pencarian' | 'Iklan Produk Serupa' | 'Iklan Toko' | 'Shopee Live';
  budgetDaily: number;
  targetRoas: number;
  actualRoas: number;
  cost: number;
  revenue: number;
  profit: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate: string;
  status: 'Aktif' | 'Dijeda' | 'Selesai' | 'Arsip';
  notes: string;
}

export interface InventoryItem {
  id: string;
  storeId: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  sold30Days: number;
  minimumStock: number;
  criticalThreshold: number;
  dailySales: number;
  daysRemaining: number;
  status: 'AMAN' | 'WASPADA' | 'KRITIS';
  reorderRecommendation: number;
  velocity: 'Fast Moving' | 'Medium Moving' | 'Slow Moving';
}

export interface CompetitorComparison {
  id: string;
  storeId: string;
  productName: string;
  ownPrice: number;
  ownRating: number;
  ownSold: number;
  ownEstimatedMargin: number;
  competitorStore: string;
  competitorPrice: number;
  competitorRating: number;
  competitorSold: number;
  competitorReviews: number;
  competitorVoucher: string;
  priceDiffPercent: number;
  estimatedCompetitorRevenue: number;
  positioning: 'Lebih Murah' | 'Seimbang' | 'Premium';
}

export interface AlertNotification {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actionText?: string;
  actionTarget?: string;
  timestamp: string;
  read: boolean;
}

export interface OpportunityItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  type: 'SCALE_ADS' | 'INCREASE_PRICE' | 'REDUCE_FEE' | 'RESTOCK_URGENT' | 'HIGH_VOLUME_LOW_MARGIN' | 'CUT_ADS';
  headline: string;
  description: string;
  estimatedPotentialImpact: string;
  recommendedAction: string;
  metricCurrent: string;
  metricTarget: string;
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
}
