/**
 * ASIS SELLER - Shopee Integration Architecture Types
 * 
 * Formal interfaces for Shopee Open Platform integration.
 * Secure client-side architecture with zero credentials leak.
 */

export type ShopeeConnectionStatus =
  | 'SIMULATION'
  | 'NOT_CONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'TOKEN_EXPIRED'
  | 'REAUTH_REQUIRED'
  | 'ERROR';

export interface StoreConnection {
  id: string;
  userId: string;
  platform: 'SHOPEE';
  shopId: string;
  shopName: string;
  region: string;
  status: ShopeeConnectionStatus;
  /** Server-side only encrypted tokens (never sent to client) */
  accessTokenEncrypted?: string;
  refreshTokenEncrypted?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  connectedAt?: string;
  updatedAt: string;
  lastSyncAt?: string;
}

export interface ClientStoreConnection {
  id: string;
  userId: string;
  platform: 'SHOPEE';
  shopId: string;
  shopName: string;
  region: string;
  status: ShopeeConnectionStatus;
  connectedAt?: string;
  updatedAt: string;
  lastSyncAt?: string;
}

export interface ShopeeOAuthInitResponse {
  authUrl: string;
  state: string;
  expiresInSeconds: number;
}

export interface ShopeeOAuthCallbackResponse {
  success: boolean;
  connection: ClientStoreConnection;
  message?: string;
}

export interface ShopeeSyncResponse {
  success: boolean;
  syncedAt: string;
  productsSynced: number;
  ordersSynced: number;
  shopName: string;
}

export interface ShopeeCredentialsConfig {
  partnerId?: string;
  shopId?: string;
  hasServerProxy: boolean;
  environment: 'sandbox' | 'production';
}

export interface ShopeeRawShopInfo {
  shop_id: number | string;
  shop_name: string;
  region: string;
  status: string;
  is_cb: boolean;
  is_official: boolean;
  auth_time?: number;
  expire_time?: number;
}

export interface ShopeeRawProduct {
  item_id: number | string;
  item_name: string;
  item_sku: string;
  category_id: number;
  category_name?: string;
  price_info: {
    original_price: number;
    current_price: number;
    currency: string;
  };
  stock_info: {
    total_available_stock: number;
    total_reserved_stock: number;
  };
  rating?: number;
  sold_count?: number;
  status: 'NORMAL' | 'BANNED' | 'UNLIST';
}

export interface ShopeeRawOrder {
  order_sn: string;
  order_status: string; // UNPAID, READY_TO_SHIP, SHIPPED, COMPLETED, CANCELLED, TO_CONFIRM_RECEIVE
  create_time: number;
  update_time: number;
  buyer_username: string;
  city: string;
  total_amount: number;
  escrow_amount?: number;
  estimated_shipping_fee?: number;
  item_list: Array<{
    item_id: number | string;
    item_name: string;
    item_sku: string;
    model_name?: string;
    model_quantity_purchased: number;
    model_original_price: number;
    model_discounted_price: number;
  }>;
  payment_method: string;
}

export interface ShopeeRawFinanceSummary {
  period_start: string;
  period_end: string;
  buyer_paid: number;
  shopee_discount: number;
  seller_discount: number;
  service_fee: number;
  commission_fee: number;
  transaction_fee: number;
  shipping_fee_rebate: number;
  net_payout: number;
}

export interface ShopeeConnectionState {
  status: ShopeeConnectionStatus;
  isSimulationMode: boolean;
  shopName: string;
  shopId: string;
  lastSyncTime?: string;
  errorMessage?: string;
}
