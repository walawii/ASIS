/**
 * ASIS SELLER — SaaS Foundation Unit Tests
 * 
 * Tests authentication, hashing, email verification, roles, plans, and access control rules.
 */

import {
  hashPassword,
  checkViewAccess,
  DEFAULT_PLANS,
  SEED_USERS,
} from './authService.ts';
import { User } from '../../types/auth.ts';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function runAuthServiceTests(): { passed: boolean; results: TestResult[] } {
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

  // 1. Password Hashing (Never plaintext)
  test('SaaS 01: Password is properly hashed and never plaintext', () => {
    const raw = 'PasswordRahasia123!';
    const hashed = hashPassword(raw);
    assert(hashed !== raw, 'Password must not match plaintext');
    assert(hashed.startsWith('pbkdf2_sha256$'), 'Must use pbkdf2 signature prefix');
    assert(hashed.includes('asis_secure_salt'), 'Must include salt');
  });

  // 2. Public view access
  test('SaaS 02: Public views are accessible without authentication', () => {
    assert(checkViewAccess(null, 'landing-page').allowed, 'Landing page must be accessible by guest');
    assert(checkViewAccess(null, 'pricing').allowed, 'Pricing must be accessible by guest');
    assert(checkViewAccess(null, 'login').allowed, 'Login must be accessible by guest');
    assert(checkViewAccess(null, 'register').allowed, 'Register must be accessible by guest');
    assert(checkViewAccess(null, 'verify-email').allowed, 'Verify email must be accessible by guest');
  });

  // 3. Protected view requires authentication
  test('SaaS 03: Protected view blocks unauthenticated guest', () => {
    const res = checkViewAccess(null, 'dashboard');
    assert(!res.allowed, 'Dashboard must be blocked for unauthenticated guest');
    assert(res.reason === 'AUTH_REQUIRED', 'Reason must be AUTH_REQUIRED');
  });

  // 4. Email verification required for protected view
  test('SaaS 04: Unverified user is blocked with EMAIL_NOT_VERIFIED', () => {
    const unverifiedUser: User = {
      ...SEED_USERS[3], // andi@newstore.com
      emailVerified: false,
    };
    const res = checkViewAccess(unverifiedUser, 'dashboard');
    assert(!res.allowed, 'Unverified user cannot access dashboard');
    assert(res.reason === 'EMAIL_NOT_VERIFIED', 'Reason must be EMAIL_NOT_VERIFIED');
  });

  // 5. Admin role access
  test('SaaS 05: ADMIN user can access admin console, regular USER cannot', () => {
    const adminUser = SEED_USERS[0]; // admin
    const regularUser = SEED_USERS[1]; // seller

    const adminCheck = checkViewAccess(adminUser, 'admin-dashboard');
    assert(adminCheck.allowed, 'Admin must be allowed to access admin-dashboard');

    const userCheck = checkViewAccess(regularUser, 'admin-dashboard');
    assert(!userCheck.allowed, 'Regular user must be blocked from admin-dashboard');
    assert(userCheck.reason === 'ADMIN_ONLY', 'Reason must be ADMIN_ONLY');
  });

  // 6. Subscription status check
  test('SaaS 06: Inactive/expired subscription is blocked with SUBSCRIPTION_INACTIVE', () => {
    const expiredUser: User = {
      ...SEED_USERS[1],
      subscriptionStatus: 'EXPIRED',
    };
    const res = checkViewAccess(expiredUser, 'dashboard');
    assert(!res.allowed, 'Expired subscription cannot access tools');
    assert(res.reason === 'SUBSCRIPTION_INACTIVE', 'Reason must be SUBSCRIPTION_INACTIVE');
  });

  // 7. Plan entitlement check: LITE vs PLUS vs KIT
  test('SaaS 07: LITE user has access to ROAS and Reverse Pricing, but not Market Analyzer', () => {
    const liteUser = SEED_USERS[2]; // budi@tokobudi.com (LITE)
    assert(checkViewAccess(liteUser, 'roas-calculator').allowed, 'LITE has roas-calculator');
    assert(checkViewAccess(liteUser, 'reverse-pricing').allowed, 'LITE has reverse-pricing');

    const marketRes = checkViewAccess(liteUser, 'market-analyzer');
    assert(!marketRes.allowed, 'LITE does not have market-analyzer');
    assert(marketRes.reason === 'PLAN_UPGRADE_REQUIRED', 'Reason must be PLAN_UPGRADE_REQUIRED');
  });

  test('SaaS 08: PLUS user has access to Market Analyzer, but not True Profit Engine', () => {
    const plusUser = SEED_USERS[1]; // zaskia (PLUS)
    assert(checkViewAccess(plusUser, 'market-analyzer').allowed, 'PLUS has market-analyzer');
    assert(checkViewAccess(plusUser, 'variant-analytics').allowed, 'PLUS has variant-analytics');

    const tpRes = checkViewAccess(plusUser, 'true-profit-engine');
    assert(!tpRes.allowed, 'PLUS does not have true-profit-engine');
    assert(tpRes.reason === 'PLAN_UPGRADE_REQUIRED', 'Reason must be PLAN_UPGRADE_REQUIRED');
  });

  test('SaaS 09: KIT user has access to all enterprise features', () => {
    const kitUser: User = {
      ...SEED_USERS[1],
      subscriptionPlan: 'KIT',
    };
    assert(checkViewAccess(kitUser, 'true-profit-engine').allowed, 'KIT has true-profit-engine');
    assert(checkViewAccess(kitUser, 'bulk-pricing').allowed, 'KIT has bulk-pricing');
    assert(checkViewAccess(kitUser, 'orders').allowed, 'KIT has orders');
    assert(checkViewAccess(kitUser, 'reports').allowed, 'KIT has reports');
  });

  test('SaaS 10: ADMIN user has bypass access to all calculators and tools', () => {
    const adminUser = SEED_USERS[0];
    assert(checkViewAccess(adminUser, 'true-profit-engine').allowed, 'ADMIN can open true-profit-engine');
    assert(checkViewAccess(adminUser, 'bulk-pricing').allowed, 'ADMIN can open bulk-pricing');
  });

  const passed = results.every((r) => r.passed);
  return { passed, results };
}
