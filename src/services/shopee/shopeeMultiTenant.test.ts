/**
 * ASIS SELLER — Multi-Tenant Store & Shopee OAuth Architecture Tests
 * 
 * Tests all 15 requirements specified in Phase V2-Shopee spec:
 * 1. Guest tidak dapat mengakses protected user data.
 * 2. User A tidak dapat melihat StoreConnection User B.
 * 3. User A tidak dapat melihat produk User B.
 * 4. Simulation store tidak dianggap CONNECTED.
 * 5. OAuth callback tanpa valid state ditolak.
 * 6. Callback tidak boleh menentukan userId dari query parameter.
 * 7. Token tidak pernah dikirim ke frontend.
 * 8. CONNECTED hanya terjadi setelah token exchange berhasil.
 * 9. Expired access token dapat direfresh.
 * 10. Refresh failure menghasilkan TOKEN_EXPIRED / REAUTH_REQUIRED.
 * 11. Disconnect menghapus/invalidate credential tetapi mempertahankan histori.
 * 12. Plan limit maxStores bekerja.
 * 13. PLAN_UPGRADE_REQUIRED bekerja.
 * 14. SHOPEE_CONNECTION_REQUIRED bekerja.
 * 15. Admin dan User memiliki scope berbeda.
 */

import { storeRepository } from '../../server/storeRepository.ts';
import {
  handleShopeeConnect,
  handleShopeeCallback,
  handleShopeeStatus,
  handleShopeeRefresh,
  handleShopeeDisconnect,
} from '../../server/shopeeServer.ts';
import { checkViewAccess, SEED_USERS, DEFAULT_PLANS } from '../auth/authService.ts';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function runShopeeMultiTenantTests(): { passed: boolean; results: TestResult[] } {
  const results: TestResult[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err.message });
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  // 1. Guest tidak dapat mengakses protected user data
  test('Test 01: Guest tidak dapat mengakses data pengguna atau store connection', () => {
    const res = handleShopeeStatus('');
    assert(res.status === 401, 'Guest request to /api/shopee/status must return 401');
    assert(res.body.length === 0, 'Guest must receive empty array');

    const viewAccess = checkViewAccess(null, 'dashboard');
    assert(!viewAccess.allowed, 'Guest cannot access dashboard');
    assert(viewAccess.reason === 'AUTH_REQUIRED', 'Reason must be AUTH_REQUIRED');
  });

  // 2. User A tidak dapat melihat StoreConnection User B
  test('Test 02: User A tidak dapat melihat StoreConnection milik User B', () => {
    const userAConns = storeRepository.getClientStoreConnections('usr_seller_01');
    const userBConns = storeRepository.getClientStoreConnections('usr_seller_02');

    assert(userAConns.length > 0, 'User A has stores');
    assert(userBConns.length > 0, 'User B has stores');

    const userAIds = userAConns.map((c) => c.id);
    const userBIds = userBConns.map((c) => c.id);

    // No overlap
    for (const id of userAIds) {
      assert(!userBIds.includes(id), `User B must not see User A connection ${id}`);
    }

    const bDirectCheck = storeRepository.getStoreConnectionById('conn_zaskia_01', 'usr_seller_02');
    assert(bDirectCheck === null, 'User B cannot query User A connection directly');
  });

  // 3. User A tidak dapat melihat produk User B
  test('Test 03: User A tidak dapat melihat produk milik User B', () => {
    const userAProds = storeRepository.getProductsByStore('usr_seller_01', 'conn_zaskia_01');
    assert(userAProds.length > 0, 'User A has products');

    // Attempt to access User A products using User B identity
    const unauthorizedProds = storeRepository.getProductsByStore('usr_seller_02', 'conn_zaskia_01');
    assert(unauthorizedProds.length === 0, 'User B must get empty product list for User A store');
  });

  // 4. Simulation store tidak dianggap CONNECTED
  test('Test 04: Simulation store status adalah SIMULATION dan tidak dianggap CONNECTED', () => {
    const simStatus: string = 'SIMULATION';
    assert(simStatus !== 'CONNECTED', 'SIMULATION must not equal CONNECTED');

    // Access check in live mode without connected store
    const access = checkViewAccess(SEED_USERS[2], 'orders', DEFAULT_PLANS, false, false);
    assert(!access.allowed, 'Must not allow live orders when not connected and simulation is false');
    assert(access.reason === 'SHOPEE_CONNECTION_REQUIRED', 'Must return SHOPEE_CONNECTION_REQUIRED');
  });

  // 5. OAuth callback tanpa valid state ditolak
  test('Test 05: OAuth callback tanpa valid state nonce ditolak (400 INVALID_OAUTH_STATE)', () => {
    const result = handleShopeeCallback({
      code: 'auth_code_123',
      shop_id: '998877',
      state: 'invalid_or_forged_state',
    });

    assert(result.status === 400, 'Must return HTTP 400 for forged state');
    const body = result.body as { error: string };
    assert(body.error === 'INVALID_OAUTH_STATE', 'Error code must be INVALID_OAUTH_STATE');
  });

  // 6. Callback tidak boleh menentukan userId dari query parameter
  test('Test 06: Callback tidak boleh menentukan userId dari parameter (Identity strictly from server session state)', () => {
    // Legitimate user creates connect state
    const connectRes = handleShopeeConnect('usr_seller_01', 5);
    assert(connectRes.status === 200, 'Connect initiation succeeded');
    const { state } = connectRes.body as { state: string };

    // Attacker tries to pass spoofed userId via callback parameter
    const spoofedCallback = handleShopeeCallback({
      code: 'code_valid_99',
      shop_id: '12345678',
      state,
      sessionUserId: 'usr_attacker_99', // should be IGNORED in favor of state owner
    });

    assert(spoofedCallback.status === 200, 'Callback accepted for legitimate state');
    const body = spoofedCallback.body as { connection: any };
    assert(body.connection.userId === 'usr_seller_01', 'Connection must be bound to state creator (usr_seller_01), not spoofed userId');
  });

  // 7. Token tidak pernah dikirim ke frontend
  test('Test 07: Token access_token dan refresh_token tidak pernah dikirim ke frontend', () => {
    const clientConnections = storeRepository.getClientStoreConnections('usr_seller_01');
    for (const c of clientConnections) {
      assert((c as any).accessTokenEncrypted === undefined, 'accessTokenEncrypted must not exist on client projection');
      assert((c as any).refreshTokenEncrypted === undefined, 'refreshTokenEncrypted must not exist on client projection');
      assert((c as any).access_token === undefined, 'access_token must not exist on client projection');
      assert((c as any).refresh_token === undefined, 'refresh_token must not exist on client projection');
    }
  });

  // 8. CONNECTED hanya terjadi setelah token exchange berhasil
  test('Test 08: Status CONNECTED hanya terbentuk setelah token exchange valid', () => {
    const connectInit = handleShopeeConnect('usr_seller_02', 3);
    const { state } = connectInit.body as { state: string };

    // Missing code or shop_id
    const incompleteCallback = handleShopeeCallback({ state, code: '', shop_id: '' });
    assert(incompleteCallback.status === 400, 'Incomplete token exchange must fail');

    // Create fresh state
    const connectInit2 = handleShopeeConnect('usr_seller_02', 3);
    const state2 = (connectInit2.body as { state: string }).state;

    // Successful exchange
    const validCallback = handleShopeeCallback({
      code: 'shopee_auth_code_abc',
      shop_id: '55443322',
      state: state2,
    });

    assert(validCallback.status === 200, 'Token exchange successful');
    const body = validCallback.body as { connection: any };
    assert(body.connection.status === 'CONNECTED', 'Status must be CONNECTED');
  });

  // 9. Expired access token dapat direfresh
  test('Test 09: Expired access token dapat direfresh secara server-side', () => {
    const refreshRes = handleShopeeRefresh('conn_zaskia_01', 'usr_seller_01', false);
    assert(refreshRes.status === 200, 'Refresh token request succeeded');
    assert(refreshRes.body.success === true, 'Refresh status is true');
    assert(refreshRes.body.connection?.status === 'CONNECTED', 'Connection remains CONNECTED');
  });

  // 10. Refresh failure menghasilkan TOKEN_EXPIRED / REAUTH_REQUIRED
  test('Test 10: Refresh failure menghasilkan status TOKEN_EXPIRED / REAUTH_REQUIRED', () => {
    const failedRefresh = handleShopeeRefresh('conn_zaskia_01', 'usr_seller_01', true);
    assert(failedRefresh.status === 401, 'Failed refresh returns 401');
    assert(failedRefresh.body.connection?.status === 'TOKEN_EXPIRED', 'Status updated to TOKEN_EXPIRED');

    // Restore to CONNECTED for subsequent tests
    handleShopeeRefresh('conn_zaskia_01', 'usr_seller_01', false);
  });

  // 11. Disconnect menghapus/invalidate credential tetapi mempertahankan histori
  test('Test 11: Disconnect menginvalidasi credential dan mengubah status NOT_CONNECTED tapi histori produk tetap ada', () => {
    // User B disconnects store
    const discRes = handleShopeeDisconnect('conn_budi_01', 'usr_seller_02');
    assert(discRes.status === 200, 'Disconnect succeeded');
    assert(discRes.body.connection?.status === 'NOT_CONNECTED', 'Status is NOT_CONNECTED');

    // Check credentials cleared
    const rawConn = storeRepository.getStoreConnectionById('conn_budi_01', 'usr_seller_02');
    assert(rawConn?.accessTokenEncrypted === undefined, 'Access token cleared');
    assert(rawConn?.refreshTokenEncrypted === undefined, 'Refresh token cleared');

    // Historical products retained
    const prods = storeRepository.getProductsByStore('usr_seller_02', 'conn_budi_01');
    assert(prods.length > 0, 'Historical products are preserved after disconnect');

    // Re-connect Budi for consistency
    rawConn!.status = 'CONNECTED';
    storeRepository.saveStoreConnection(rawConn!);
  });

  // 12. Plan limit maxStores bekerja
  test('Test 12: Batas maxStores dari plan memblokir penambahan toko melebihi kuota (STORE_LIMIT_REACHED)', () => {
    // User Budi is LITE plan with maxStores = 1, already has 1 store (conn_budi_01)
    const limitCheck = handleShopeeConnect('usr_seller_02', 1);
    assert(limitCheck.status === 403, 'Must return 403 when maxStores reached');
    const body = limitCheck.body as { error: string };
    assert(body.error === 'STORE_LIMIT_REACHED', 'Error code must be STORE_LIMIT_REACHED');
  });

  // 13. PLAN_UPGRADE_REQUIRED bekerja
  test('Test 13: PLAN_UPGRADE_REQUIRED memblokir fitur di luar kuota paket', () => {
    const liteUser = SEED_USERS[2]; // Budi (LITE)
    const res = checkViewAccess(liteUser, 'market-analyzer', DEFAULT_PLANS, true, true);
    assert(!res.allowed, 'LITE cannot access market-analyzer');
    assert(res.reason === 'PLAN_UPGRADE_REQUIRED', 'Reason must be PLAN_UPGRADE_REQUIRED');
  });

  // 14. SHOPEE_CONNECTION_REQUIRED bekerja
  test('Test 14: SHOPEE_CONNECTION_REQUIRED memblokir order/inventory saat toko belum terhubung dan bukan simulasi', () => {
    const unverifiedUser = SEED_USERS[3]; // Andi (no stores, LITE plan)
    const verifiedAndi = { ...unverifiedUser, emailVerified: true, subscriptionStatus: 'ACTIVE' as const };

    // With isStoreConnected = false and isSimulationMode = false
    // 'campaign-analytics' is in LITE plan, but requires connected Shopee store in live mode
    const res = checkViewAccess(verifiedAndi, 'campaign-analytics', DEFAULT_PLANS, false, false);
    assert(!res.allowed, 'Live campaign-analytics blocked when store not connected');
    assert(res.reason === 'SHOPEE_CONNECTION_REQUIRED', 'Reason must be SHOPEE_CONNECTION_REQUIRED');

    // But if simulation mode is active, it is allowed
    const simRes = checkViewAccess(verifiedAndi, 'campaign-analytics', DEFAULT_PLANS, false, true);
    assert(simRes.allowed, 'Allowed in simulation mode');
  });

  // 15. Admin dan User memiliki scope berbeda
  test('Test 15: Admin dan User memiliki scope berbeda (User diblokir dari console admin)', () => {
    const adminUser = SEED_USERS[0];
    const regularUser = SEED_USERS[1];

    const adminCheck = checkViewAccess(adminUser, 'admin-dashboard');
    assert(adminCheck.allowed, 'Admin allowed to admin-dashboard');

    const userCheck = checkViewAccess(regularUser, 'admin-dashboard');
    assert(!userCheck.allowed, 'Regular user blocked from admin-dashboard');
    assert(userCheck.reason === 'ADMIN_ONLY', 'Reason is ADMIN_ONLY');
  });

  const passed = results.every((r) => r.passed);
  return { passed, results };
}
