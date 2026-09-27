/**
 * ASIS SELLER - Shopee Provider Abstraction
 * 
 * Separates data transport from business logic.
 * Default is MockShopeeProvider for complete local simulation without network dependencies.
 * RealShopeeProvider connects exclusively via server-side proxy to protect Partner Keys.
 */

import {
  ShopeeRawShopInfo,
  ShopeeRawProduct,
  ShopeeRawOrder,
  ShopeeRawFinanceSummary,
  ShopeeConnectionStatus,
} from './types.ts';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_STORES } from '../../data/mockData.ts';
import { calculateTrueProfit } from '../profitEngine/index.ts';
import { SellerType } from '../../types/rules.ts';

export interface ShopeeProvider {
  getStatus(): ShopeeConnectionStatus;
  getShopInfo(): Promise<ShopeeRawShopInfo>;
  getProducts(): Promise<ShopeeRawProduct[]>;
  getOrders(status?: string): Promise<ShopeeRawOrder[]>;
  getOrderDetail(orderSn: string): Promise<ShopeeRawOrder | null>;
  getInventory(): Promise<Array<{ itemId: string; sku: string; stock: number }>>;
  getFinanceData(dateRange?: string): Promise<ShopeeRawFinanceSummary>;
}

/**
 * MockShopeeProvider:
 * Provides deterministic, offline data matching the local simulation mode.
 * Safe for offline development and testing.
 */
export class MockShopeeProvider implements ShopeeProvider {
  private currentStoreId: string;

  constructor(storeId: string = 'store_1') {
    this.currentStoreId = storeId;
  }

  getStatus(): ShopeeConnectionStatus {
    return 'SIMULATION';
  }

  async getShopInfo(): Promise<ShopeeRawShopInfo> {
    const store = INITIAL_STORES.find((s) => s.id === this.currentStoreId) || INITIAL_STORES[0];
    return {
      shop_id: 882049112,
      shop_name: store.name,
      region: 'ID',
      status: 'NORMAL',
      is_cb: false,
      is_official: store.category.includes('Mall'),
      auth_time: Date.now() - 30 * 86400000,
      expire_time: Date.now() + 335 * 86400000,
    };
  }

  async getProducts(): Promise<ShopeeRawProduct[]> {
    const prods = INITIAL_PRODUCTS[this.currentStoreId] || INITIAL_PRODUCTS['store_1'] || [];
    return prods.map((p) => ({
      item_id: p.id,
      item_name: p.name,
      item_sku: p.sku,
      category_id: 10023,
      category_name: p.category,
      price_info: {
        original_price: p.sellingPrice,
        current_price: p.effectivePrice,
        currency: 'IDR',
      },
      stock_info: {
        total_available_stock: p.stock,
        total_reserved_stock: Math.round(p.stock * 0.1),
      },
      rating: p.rating,
      sold_count: p.unitsSold,
      status: 'NORMAL',
    }));
  }

  async getOrders(status?: string): Promise<ShopeeRawOrder[]> {
    const orders = INITIAL_ORDERS[this.currentStoreId] || INITIAL_ORDERS['store_1'] || [];
    const filtered = status && status !== 'Semua'
      ? orders.filter((o) => o.status === status)
      : orders;

    return filtered.map((o) => ({
      order_sn: o.orderNumber,
      order_status:
        o.status === 'Selesai'
          ? 'COMPLETED'
          : o.status === 'Dikirim'
          ? 'SHIPPED'
          : o.status === 'Diproses'
          ? 'READY_TO_SHIP'
          : o.status === 'Dibatalkan'
          ? 'CANCELLED'
          : 'COMPLETED',
      create_time: new Date(o.date).getTime() || Date.now(),
      update_time: Date.now(),
      buyer_username: o.customerName,
      city: o.customerCity,
      total_amount: o.totalPrice,
      escrow_amount: o.totalPrice - o.marketplaceFee,
      estimated_shipping_fee: o.shippingCost,
      item_list: o.items.map((i) => ({
        item_id: i.productId,
        item_name: i.productName,
        item_sku: i.sku,
        model_name: i.variantName,
        model_quantity_purchased: i.qty,
        model_original_price: i.unitPrice,
        model_discounted_price: i.unitPrice,
      })),
      payment_method: o.paymentMethod,
    }));
  }

  async getOrderDetail(orderSn: string): Promise<ShopeeRawOrder | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.order_sn === orderSn) || null;
  }

  async getInventory(): Promise<Array<{ itemId: string; sku: string; stock: number }>> {
    const products = await this.getProducts();
    return products.map((p) => ({
      itemId: String(p.item_id),
      sku: p.item_sku,
      stock: p.stock_info.total_available_stock,
    }));
  }

  async getFinanceData(_dateRange?: string): Promise<ShopeeRawFinanceSummary> {
    const orders = await this.getOrders();
    const store = INITIAL_STORES.find((s) => s.id === this.currentStoreId) || INITIAL_STORES[0];

    // Determine seller type from store profile
    const sellerType: SellerType =
      (store as any).sellerStatus ||
      (store.category.includes('Mall')
        ? 'MALL'
        : store.name.includes('Star+')
        ? 'STAR_PLUS'
        : 'STAR');

    let totalBuyerPaid = 0;
    let totalAdminFee = 0;
    let totalProgramFee = 0;
    let totalProcessingFee = 0;
    let totalSellerDiscount = 0;
    let totalPlatformSubsidy = 0;

    orders.forEach((o) => {
      const orderDate = new Date(o.create_time).toISOString().slice(0, 10);
      const profitCalc = calculateTrueProfit({
        originalProductPrice: o.total_amount,
        sellerDiscountPercent: 0,
        vouchers: [],
        hpp: o.total_amount * 0.5,
        sellerType,
        category: (store as any).category || 'Fashion & Pakaian',
        transactionDate: orderDate,
        isFreeShippingXtraActive: true,
        isPromoXtraActive: true,
        isPromoXtraPlusActive: false,
        isAffiliateActive: false,
      });

      totalBuyerPaid += o.total_amount;
      totalAdminFee += profitCalc.marketplaceAdminFee;
      totalProgramFee += profitCalc.totalProgramFees;
      totalProcessingFee += profitCalc.orderProcessingFee;
      totalSellerDiscount += profitCalc.sellerDiscountAmount;
      totalPlatformSubsidy += profitCalc.platformVoucherContribution;
    });

    const netPayout = totalBuyerPaid - (totalAdminFee + totalProgramFee + totalProcessingFee);

    return {
      period_start: '2026-09-01',
      period_end: '2026-09-25',
      buyer_paid: totalBuyerPaid,
      shopee_discount: totalPlatformSubsidy,
      seller_discount: totalSellerDiscount,
      service_fee: totalProgramFee,
      commission_fee: totalAdminFee,
      transaction_fee: totalProcessingFee,
      shipping_fee_rebate: 0,
      net_payout: netPayout,
    };
  }
}

/**
 * RealShopeeProvider:
 * Architecture-ready provider for official Shopee Open Platform integration.
 * In compliance with Phase 16 & 18:
 * - Does NOT perform fake live OAuth or fake integrations
 * - Never stores partner keys or client secrets in the frontend
 * - Safely returns NOT_CONNECTED until authenticated server-side credentials are configured.
 */
export class RealShopeeProvider implements ShopeeProvider {
  private apiEndpoint: string;
  private status: ShopeeConnectionStatus = 'NOT_CONNECTED';

  constructor(proxyUrl: string = '/api/shopee') {
    this.apiEndpoint = proxyUrl;
  }

  getStatus(): ShopeeConnectionStatus {
    return this.status;
  }

  async getShopInfo(): Promise<ShopeeRawShopInfo> {
    throw new Error(
      'Shopee Open API credentials belum dikonfigurasi pada server backend. Gunakan Mode Simulasi Lokal (MockShopeeProvider).'
    );
  }

  async getProducts(): Promise<ShopeeRawProduct[]> {
    throw new Error(
      'Shopee Open API credentials belum dikonfigurasi pada server backend. Gunakan Mode Simulasi Lokal (MockShopeeProvider).'
    );
  }

  async getOrders(): Promise<ShopeeRawOrder[]> {
    throw new Error(
      'Shopee Open API credentials belum dikonfigurasi pada server backend. Gunakan Mode Simulasi Lokal (MockShopeeProvider).'
    );
  }

  async getOrderDetail(): Promise<ShopeeRawOrder | null> {
    throw new Error('Shopee Open API credentials belum dikonfigurasi pada server backend.');
  }

  async getInventory(): Promise<Array<{ itemId: string; sku: string; stock: number }>> {
    throw new Error('Shopee Open API credentials belum dikonfigurasi pada server backend.');
  }

  async getFinanceData(): Promise<ShopeeRawFinanceSummary> {
    throw new Error('Shopee Open API credentials belum dikonfigurasi pada server backend.');
  }
}

// Active singleton instance (defaulting to MockShopeeProvider for local simulation mode)
export const currentShopeeProvider: ShopeeProvider = new MockShopeeProvider('store_1');
