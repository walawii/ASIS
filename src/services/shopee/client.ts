/**
 * ASIS SELLER — Shopee Open Platform Client Service
 * 
 * Secure client-side communication with server-side Shopee API endpoints.
 * ZERO SECRETS RULE:
 * This client never handles SHOPEE_PARTNER_KEY, access_token, or refresh_token.
 */

import {
  ClientStoreConnection,
  ShopeeOAuthInitResponse,
  ShopeeOAuthCallbackResponse,
  ShopeeSyncResponse,
} from './types.ts';
import {
  handleShopeeConnect,
  handleShopeeCallback,
  handleShopeeStatus,
  handleShopeeSync,
  handleShopeeDisconnect,
  handleShopeeRefresh,
} from '../../server/shopeeServer.ts';

export class ShopeeApiClient {
  /**
   * Initiate official OAuth flow.
   * Server generates authorization URL and state nonce.
   */
  public async initiateOAuth(userId: string, maxStores: number): Promise<ShopeeOAuthInitResponse> {
    const res = handleShopeeConnect(userId, maxStores);
    if (res.status !== 200) {
      const errBody = res.body as { error: string; message: string };
      throw new Error(errBody.message || errBody.error || 'Gagal memulai otorisasi Shopee.');
    }
    return res.body as ShopeeOAuthInitResponse;
  }

  /**
   * Complete OAuth callback with authorization code.
   * Server validates state nonce and exchanges code for tokens.
   */
  public async handleCallback(
    code: string,
    shopId: string,
    state: string
  ): Promise<ShopeeOAuthCallbackResponse> {
    const res = handleShopeeCallback({ code, shop_id: shopId, state });
    if (res.status !== 200) {
      const errBody = res.body as { error: string; message: string };
      throw new Error(errBody.message || errBody.error || 'Otorisasi Shopee gagal diverifikasi.');
    }
    return res.body as ShopeeOAuthCallbackResponse;
  }

  /**
   * Get store connections for authenticated user (WITHOUT tokens).
   */
  public async getConnections(userId: string): Promise<ClientStoreConnection[]> {
    const res = handleShopeeStatus(userId);
    return res.body;
  }

  /**
   * Trigger data sync for connected store.
   */
  public async syncStore(connectionId: string, userId: string): Promise<ShopeeSyncResponse> {
    const res = handleShopeeSync(connectionId, userId);
    if (res.status !== 200) {
      const errBody = res.body as { error: string };
      throw new Error(errBody.error || 'Gagal menyinkronkan data toko.');
    }
    return res.body as ShopeeSyncResponse;
  }

  /**
   * Disconnect store (revokes tokens, keeps history).
   */
  public async disconnectStore(
    connectionId: string,
    userId: string
  ): Promise<{ success: boolean; connection?: ClientStoreConnection }> {
    const res = handleShopeeDisconnect(connectionId, userId);
    return res.body;
  }

  /**
   * Refresh token server-side.
   */
  public async refreshToken(
    connectionId: string,
    userId: string
  ): Promise<{ success: boolean; connection?: ClientStoreConnection }> {
    const res = handleShopeeRefresh(connectionId, userId);
    return res.body;
  }
}

export const shopeeApiClient = new ShopeeApiClient();
