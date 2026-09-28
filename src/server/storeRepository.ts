/**
 * ASIS SELLER — Multi-Tenant Store & Data Repository (Server-Side)
 * 
 * Enforces strict tenant isolation:
 * - User A can ONLY see User A's StoreConnection, products, and orders.
 * - User B can ONLY see User B's StoreConnection, products, and orders.
 * - Raw access & refresh tokens are stored encrypted and NEVER exposed to frontend.
 * - Disconnecting a store invalidates tokens but preserves historical data.
 */

import { StoreConnection, ClientStoreConnection } from '../services/shopee/types.ts';
import { Product, Order, Campaign, InventoryItem } from '../types/index.ts';

// Server-side OAuth State Cache (state -> { userId, expiresAt })
interface StoredOAuthState {
  userId: string;
  expiresAt: number;
}

// In-Memory Secure Storage with Seed Multi-Tenant Data
class StoreRepository {
  private connections: Map<string, StoreConnection> = new Map();
  private oauthStates: Map<string, StoredOAuthState> = new Map();
  
  // Data scoped by "userId:storeId"
  private productsStore: Map<string, Product[]> = new Map();
  private ordersStore: Map<string, Order[]> = new Map();
  private campaignsStore: Map<string, Campaign[]> = new Map();
  private inventoryStore: Map<string, InventoryItem[]> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. User A (Zaskia - Fashion)
    const zaskiaConnId = 'conn_zaskia_01';
    const zaskiaStore: StoreConnection = {
      id: zaskiaConnId,
      userId: 'usr_seller_01',
      platform: 'SHOPEE',
      shopId: '882049112',
      shopName: 'Zaskia Hijab Official',
      region: 'ID',
      status: 'CONNECTED',
      accessTokenEncrypted: 'enc_sec_tok_zaskia_live_9921_aes256',
      refreshTokenEncrypted: 'enc_sec_ref_zaskia_live_8832_aes256',
      accessTokenExpiresAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      refreshTokenExpiresAt: new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
      connectedAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-03-25T14:20:00.000Z',
      lastSyncAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    };
    this.connections.set(zaskiaConnId, zaskiaStore);

    // Zaskia's products
    this.productsStore.set(`usr_seller_01:${zaskiaConnId}`, [
      {
        id: 'prod_z1',
        storeId: zaskiaConnId,
        sku: 'HJB-VOAL-01',
        name: 'Hijab Paris Premium Voal Laser Cut',
        category: 'Fashion Muslim',
        hpp: 18000,
        sellingPrice: 45000,
        discountPercent: 10,
        effectivePrice: 40500,
        packingCost: 2000,
        operationalCost: 1500,
        weightGrams: 120,
        adminFeePercent: 6.5,
        serviceFeePercent: 4.0,
        transactionFeePercent: 1.25,
        affiliatePercent: 5.0,
        voucherNominal: 2000,
        cashbackNominal: 0,
        shippingSubsidy: 0,
        currentAdsCost: 5000,
        targetRoas: 4.5,
        actualRoas: 5.2,
        stock: 350,
        safetyStock: 40,
        dailySalesVelocity: 15,
        rating: 4.9,
        reviewCount: 320,
        unitsSold: 1420,
        revenue: 1420 * 40500,
        netProfit: 1420 * 14000,
        marginPercent: 34.5,
        bepRoas: 2.1,
        status: 'PROFITABLE',
        score: {
          overall: 94,
          marginStatus: 'Good',
          roasStatus: 'Good',
          stockStatus: 'Good',
          salesVelocity: 'Strong',
        },
        variants: [],
      },
    ]);

    // 2. User B (Budi - Electronics)
    const budiConnId = 'conn_budi_01';
    const budiStore: StoreConnection = {
      id: budiConnId,
      userId: 'usr_seller_02',
      platform: 'SHOPEE',
      shopId: '773019283',
      shopName: 'Toko Budi Elektronik',
      region: 'ID',
      status: 'CONNECTED',
      accessTokenEncrypted: 'enc_sec_tok_budi_live_7712_aes256',
      refreshTokenEncrypted: 'enc_sec_ref_budi_live_6641_aes256',
      accessTokenExpiresAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      refreshTokenExpiresAt: new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
      connectedAt: '2026-02-15T11:00:00.000Z',
      updatedAt: '2026-03-10T16:45:00.000Z',
      lastSyncAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    };
    this.connections.set(budiConnId, budiStore);

    // Budi's products
    this.productsStore.set(`usr_seller_02:${budiConnId}`, [
      {
        id: 'prod_b1',
        storeId: budiConnId,
        sku: 'ELC-TWS-PRO',
        name: 'Wireless Bluetooth Earbuds TWS ANC',
        category: 'Elektronik & Audio',
        hpp: 65000,
        sellingPrice: 149000,
        discountPercent: 15,
        effectivePrice: 126650,
        packingCost: 3500,
        operationalCost: 2000,
        weightGrams: 250,
        adminFeePercent: 6.5,
        serviceFeePercent: 4.0,
        transactionFeePercent: 1.25,
        affiliatePercent: 3.0,
        voucherNominal: 5000,
        cashbackNominal: 0,
        shippingSubsidy: 0,
        currentAdsCost: 15000,
        targetRoas: 4.0,
        actualRoas: 4.8,
        stock: 120,
        safetyStock: 25,
        dailySalesVelocity: 8,
        rating: 4.8,
        reviewCount: 190,
        unitsSold: 480,
        revenue: 480 * 126650,
        netProfit: 480 * 32000,
        marginPercent: 25.2,
        bepRoas: 2.5,
        status: 'PROFITABLE',
        score: {
          overall: 88,
          marginStatus: 'Good',
          roasStatus: 'Good',
          stockStatus: 'Good',
          salesVelocity: 'Strong',
        },
        variants: [],
      },
    ]);
  }

  // Multi-Tenant Store Connection Queries
  public getStoreConnections(userId: string): StoreConnection[] {
    const results: StoreConnection[] = [];
    for (const conn of this.connections.values()) {
      if (conn.userId === userId) {
        results.push({ ...conn });
      }
    }
    return results;
  }

  // Safe Client Projection (WITHOUT access/refresh tokens)
  public getClientStoreConnections(userId: string): ClientStoreConnection[] {
    return this.getStoreConnections(userId).map((c) => ({
      id: c.id,
      userId: c.userId,
      platform: c.platform,
      shopId: c.shopId,
      shopName: c.shopName,
      region: c.region,
      status: c.status,
      connectedAt: c.connectedAt,
      updatedAt: c.updatedAt,
      lastSyncAt: c.lastSyncAt,
    }));
  }

  public getStoreConnectionById(connectionId: string, userId: string): StoreConnection | null {
    const conn = this.connections.get(connectionId);
    if (!conn || conn.userId !== userId) {
      return null;
    }
    return { ...conn };
  }

  public saveStoreConnection(conn: StoreConnection): void {
    this.connections.set(conn.id, { ...conn, updatedAt: new Date().toISOString() });
  }

  // Disconnect: Invalidate credentials, set NOT_CONNECTED, but KEEP historical data!
  public disconnectStore(connectionId: string, userId: string): { success: boolean; connection?: ClientStoreConnection } {
    const conn = this.connections.get(connectionId);
    if (!conn || conn.userId !== userId) {
      return { success: false };
    }

    const updated: StoreConnection = {
      ...conn,
      status: 'NOT_CONNECTED',
      accessTokenEncrypted: undefined,
      refreshTokenEncrypted: undefined,
      accessTokenExpiresAt: undefined,
      refreshTokenExpiresAt: undefined,
      updatedAt: new Date().toISOString(),
    };

    this.connections.set(connectionId, updated);

    return {
      success: true,
      connection: {
        id: updated.id,
        userId: updated.userId,
        platform: updated.platform,
        shopId: updated.shopId,
        shopName: updated.shopName,
        region: updated.region,
        status: updated.status,
        connectedAt: updated.connectedAt,
        updatedAt: updated.updatedAt,
        lastSyncAt: updated.lastSyncAt,
      },
    };
  }

  // Tenant-Scoped Data Access
  public getProductsByStore(userId: string, storeId: string): Product[] {
    const conn = this.getStoreConnectionById(storeId, userId);
    if (!conn) return [];
    return this.productsStore.get(`${userId}:${storeId}`) || [];
  }

  public setProductsForStore(userId: string, storeId: string, products: Product[]): void {
    const conn = this.getStoreConnectionById(storeId, userId);
    if (!conn) return;
    this.productsStore.set(`${userId}:${storeId}`, products);
  }

  public getOrdersByStore(userId: string, storeId: string): Order[] {
    const conn = this.getStoreConnectionById(storeId, userId);
    if (!conn) return [];
    return this.ordersStore.get(`${userId}:${storeId}`) || [];
  }

  // OAuth State Nonce Management (Server-Side)
  public saveOAuthState(state: string, userId: string, ttlMs: number = 600000): void {
    this.oauthStates.set(state, {
      userId,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public verifyAndConsumeOAuthState(state: string): string | null {
    const entry = this.oauthStates.get(state);
    if (!entry) return null;
    this.oauthStates.delete(state); // One-time use nonce
    if (Date.now() > entry.expiresAt) {
      return null; // Expired
    }
    return entry.userId;
  }
}

// Global Singleton Repository
export const storeRepository = new StoreRepository();
