/**
 * ASIS SELLER — SaaS Foundation Types
 * 
 * Defines core multi-tenant SaaS entities:
 * - User (Account & Profile)
 * - Role (USER | ADMIN)
 * - Plan (LITE | PLUS | KIT)
 * - Subscription Status (PENDING | ACTIVE | EXPIRED | CANCELLED)
 * - Email Verification & Auth Session
 */

export type UserRole = 'USER' | 'ADMIN';

export type SubscriptionPlanCode = 'LITE' | 'PLUS' | 'KIT';

export type SubscriptionStatusCode = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  /**
   * Password credential representation (PBKDF2/SHA-256 hash or token representation).
   * Plaintext passwords are NEVER stored.
   */
  passwordHash: string;
  emailVerified: boolean;
  role: UserRole;
  subscriptionPlan: SubscriptionPlanCode;
  subscriptionStatus: SubscriptionStatusCode;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeature {
  id: string;
  label: string;
  includedIn: SubscriptionPlanCode[];
}

export interface SubscriptionPlan {
  code: SubscriptionPlanCode;
  name: string;
  tagline: string;
  badge: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isPopular?: boolean;
  maxStores: number;
  maxProducts: number;
  allowedViews: string[];
  features: string[];
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planCode: SubscriptionPlanCode;
  status: SubscriptionStatusCode;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt?: string;
  notes?: string;
}

export interface EmailVerificationToken {
  id: string;
  userId: string;
  email: string;
  token: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  role: UserRole;
  expiresAt: string;
}

export type StoreConnectionStatus =
  | 'NOT_CONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'TOKEN_EXPIRED'
  | 'REAUTH_REQUIRED';

export interface StoreConnection {
  id: string;
  userId: string;
  platform: 'SHOPEE';
  shopId: string;
  shopName: string;
  region: string;
  status: StoreConnectionStatus;
  /** Server-side only encrypted token references (never sent to client) */
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
  shopId: string; // masked in public views if needed
  shopName: string;
  region: string;
  status: StoreConnectionStatus;
  connectedAt?: string;
  updatedAt: string;
  lastSyncAt?: string;
}

export interface AccessCheckResult {
  allowed: boolean;
  reason?:
    | 'AUTH_REQUIRED'
    | 'EMAIL_NOT_VERIFIED'
    | 'PLAN_UPGRADE_REQUIRED'
    | 'SUBSCRIPTION_INACTIVE'
    | 'ADMIN_ONLY'
    | 'SHOPEE_CONNECTION_REQUIRED'
    | 'STORE_LIMIT_REACHED';
  message?: string;
}
