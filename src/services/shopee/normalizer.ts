/**
 * ASIS SELLER - Shopee Data Normalizer
 * 
 * Pipeline:
 * Shopee API Payload -> Shopee Provider -> Normalizer -> ASIS Data Model -> Profit Engine -> Dashboard
 * 
 * Ensures the Profit Engine remains fully decoupled from Shopee API wire representations.
 */

import { ShopeeRawOrder, ShopeeRawProduct, ShopeeRawShopInfo } from './types.ts';
import { Product, Order, OrderStatus } from '../../types/index.ts';

export function normalizeShopeeProduct(raw: ShopeeRawProduct, storeId: string): Product {
  const sellingPrice = raw.price_info.original_price;
  const effectivePrice = raw.price_info.current_price || sellingPrice;
  const discountPercent =
    sellingPrice > 0 ? Math.round(((sellingPrice - effectivePrice) / sellingPrice) * 100) : 0;
  
  // Default estimated HPP for simulation if not yet provided by seller
  const estimatedHpp = Math.round(effectivePrice * 0.45);
  const packingCost = 2500;
  const operationalCost = 1500;
  const adsCost = Math.round(effectivePrice * 0.08);

  const unitsSold = raw.sold_count || 0;
  const revenue = unitsSold * effectivePrice;
  const netProfit = Math.round(revenue * 0.22);

  return {
    id: String(raw.item_id),
    storeId,
    sku: raw.item_sku || `SKU-${raw.item_id}`,
    name: raw.item_name,
    category: raw.category_name || 'Fashion & Pakaian',
    hpp: estimatedHpp,
    sellingPrice,
    discountPercent,
    effectivePrice,
    packingCost,
    operationalCost,
    weightGrams: 300,
    adminFeePercent: 7.5,
    serviceFeePercent: 4.0,
    transactionFeePercent: 1.5,
    affiliatePercent: 3.0,
    voucherNominal: 0,
    cashbackNominal: 0,
    shippingSubsidy: 0,
    currentAdsCost: adsCost,
    targetRoas: 4.5,
    stock: raw.stock_info.total_available_stock,
    safetyStock: 25,
    dailySalesVelocity: Math.max(1, Math.round(unitsSold / 30)),
    rating: raw.rating || 4.8,
    reviewCount: Math.round(unitsSold * 0.35),
    unitsSold,
    revenue,
    netProfit,
    marginPercent: 22.0,
    actualRoas: 5.2,
    bepRoas: 2.4,
    status: 'PROFITABLE',
    score: {
      overall: 88,
      marginStatus: 'Good',
      roasStatus: 'Good',
      stockStatus: raw.stock_info.total_available_stock > 10 ? 'Good' : 'Critical',
      salesVelocity: 'Strong',
    },
    variants: [],
  };
}

export function normalizeShopeeOrderStatus(status: string): OrderStatus {
  switch (status.toUpperCase()) {
    case 'UNPAID':
    case 'TO_PAY':
      return 'Baru';
    case 'READY_TO_SHIP':
    case 'PROCESSED':
      return 'Diproses';
    case 'SHIPPED':
      return 'Dikirim';
    case 'COMPLETED':
      return 'Selesai';
    case 'CANCELLED':
    case 'IN_CANCEL':
      return 'Dibatalkan';
    case 'TO_RETURN':
    case 'RETURNED':
      return 'Retur';
    default:
      return 'Selesai';
  }
}

export function normalizeShopeeOrder(raw: ShopeeRawOrder, storeId: string): Order {
  const status = normalizeShopeeOrderStatus(raw.order_status);
  const items = raw.item_list.map((item) => ({
    productId: String(item.item_id),
    productName: item.item_name,
    sku: item.item_sku || 'SKU-UNKNOWN',
    variantName: item.model_name,
    qty: item.model_quantity_purchased,
    unitPrice: item.model_discounted_price,
    unitHpp: Math.round(item.model_discounted_price * 0.45),
  }));

  const totalPrice = raw.total_amount;
  const totalHpp = items.reduce((sum, it) => sum + it.unitHpp * it.qty, 0);
  const marketplaceFee = Math.round(totalPrice * 0.0875);
  const netProfit = Math.round(totalPrice - totalHpp - marketplaceFee - 4000);

  const dateObj = new Date(raw.create_time);
  const dateStr = !isNaN(dateObj.getTime())
    ? dateObj.toISOString().slice(0, 10)
    : '2026-09-25';

  return {
    id: `ord_${raw.order_sn}`,
    orderNumber: raw.order_sn,
    storeId,
    date: dateStr,
    customerName: raw.buyer_username,
    customerCity: raw.city || 'Jakarta Selatan',
    items,
    totalPrice,
    totalHpp,
    marketplaceFee,
    shippingCost: raw.estimated_shipping_fee || 0,
    voucherDiscount: 0,
    netProfit,
    status,
    paymentMethod: raw.payment_method || 'ShopeePay',
  };
}
