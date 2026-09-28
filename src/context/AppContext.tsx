import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Store,
  Product,
  Order,
  Campaign,
  InventoryItem,
  CompetitorComparison,
  AlertNotification,
  OpportunityItem,
  SubscriptionTier,
} from '../types/index.ts';
import {
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CAMPAIGNS,
  INITIAL_INVENTORY,
  INITIAL_COMPETITORS,
  INITIAL_OPPORTUNITIES,
  INITIAL_ALERTS,
} from '../data/mockData.ts';
import { MarketplaceFeeRule, SellerProgramRule, TaxRule, TaxProfile, SellerType } from '../types/rules.ts';
import {
  INITIAL_MARKETPLACE_FEE_RULES,
  INITIAL_PROGRAM_RULES,
  OFFICIAL_TAX_RULES,
} from '../services/profitEngine/rulesData.ts';
import { ShopeeConnectionState, ClientStoreConnection } from '../services/shopee/types.ts';
import { shopeeApiClient } from '../services/shopee/client.ts';
import { storeRepository } from '../server/storeRepository.ts';
import {
  User,
  UserRole,
  SubscriptionPlan,
  SubscriptionPlanCode,
  SubscriptionStatusCode,
  SubscriptionRecord,
  EmailVerificationToken,
} from '../types/auth.ts';
import {
  DEFAULT_PLANS,
  SEED_USERS,
  SEED_SUBSCRIPTIONS,
  SEED_VERIFICATION_TOKENS,
  checkViewAccess,
  hashPassword,
} from '../services/auth/authService.ts';

export type AppView =
  | 'dashboard'
  | 'landing-page'
  | 'tutorial' // 📚 Tutorial Center
  // Public SaaS Pages
  | 'login'
  | 'register'
  | 'verify-email'
  | 'pricing'
  // User SaaS Pages
  | 'profile'
  | 'user-subscription'
  // Admin SaaS Pages
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-plans'
  | 'admin-subscriptions'
  // True Profit Engine
  | 'true-profit-engine'
  | 'fee-scenarios'
  | 'bulk-pricing'
  | 'tax-dashboard'
  | 'admin-fee-rules'
  // Analytics
  | 'profit-analytics'
  | 'product-analytics'
  | 'variant-analytics'
  | 'campaign-analytics'
  | 'market-analyzer'
  | 'competitive-gap'
  // Calculators & Launch Tools
  | 'product-launch'
  | 'roas-calculator'
  | 'target-roas'
  | 'new-pricing'
  | 'reverse-pricing'
  | 'price-simulator'
  | 'discount-calculator'
  | 'voucher-simulator'
  | 'ads-budget'
  | 'bep-calculator'
  | 'profit-simulator'
  // Operations
  | 'orders'
  | 'products'
  | 'inventory'
  | 'stock-forecast'
  // Insights
  | 'opportunity-center'
  | 'alerts'
  // Reports & Tools
  | 'reports'
  | 'import-data'
  | 'settings'
  | 'subscription';

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  // SaaS Foundation V2 Auth & Subscriptions
  currentUser: User | null;
  users: User[];
  plans: SubscriptionPlan[];
  subscriptions: SubscriptionRecord[];
  verificationTokens: EmailVerificationToken[];
  authError: string | null;
  setAuthError: (err: string | null) => void;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    initialPlan: SubscriptionPlanCode;
  }) => { success: boolean; message?: string };
  verifyEmail: (email: string, token: string) => boolean;
  resendVerificationEmail: (email: string) => string;
  changeUserSubscription: (plan: SubscriptionPlanCode, status?: SubscriptionStatusCode) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  updateUserPlan: (userId: string, plan: SubscriptionPlanCode) => void;
  updateSubscriptionStatus: (userId: string, status: SubscriptionStatusCode) => void;
  toggleUserEmailVerified: (userId: string) => void;
  updatePlanPrice: (planCode: SubscriptionPlanCode, monthly: number, yearly: number) => void;
  // Stores
  stores: Store[];
  currentStoreId: string;
  currentStore: Store;
  setCurrentStoreId: (storeId: string) => void;
  updateStoreSettings: (updated: Partial<Store>) => void;
  // Subscriptions & Gating (Backward compatible)
  subscriptionTier: SubscriptionTier;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  isFeatureAccessible: (view: AppView) => boolean;
  upgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  attemptNavigate: (view: AppView) => void;
  // Data State
  products: Product[];
  orders: Order[];
  campaigns: Campaign[];
  inventory: InventoryItem[];
  competitors: CompetitorComparison[];
  opportunities: OpportunityItem[];
  alerts: AlertNotification[];
  unreadAlertCount: number;
  // Mutations
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updated: Partial<Campaign>) => void;
  duplicateCampaign: (id: string) => void;
  archiveCampaign: (id: string) => void;
  updateInventoryStock: (id: string, newStock: number) => void;
  addOrder: (order: Order) => void;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  importProductsFromCsv: (newProducts: Product[]) => void;
  // Search & Global Command
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  // Rule & Tax Engine State
  marketplaceRules: MarketplaceFeeRule[];
  setMarketplaceRules: React.Dispatch<React.SetStateAction<MarketplaceFeeRule[]>>;
  programRules: SellerProgramRule[];
  setProgramRules: React.Dispatch<React.SetStateAction<SellerProgramRule[]>>;
  taxRules: TaxRule[];
  setTaxRules: React.Dispatch<React.SetStateAction<TaxRule[]>>;
  taxProfile: TaxProfile;
  setTaxProfile: React.Dispatch<React.SetStateAction<TaxProfile>>;
  // Shopee Integration State (Real OAuth & Multi-Tenant Binding)
  shopeeConnectionState: ShopeeConnectionState;
  setShopeeConnectionState: React.Dispatch<React.SetStateAction<ShopeeConnectionState>>;
  shopeeModalOpen: boolean;
  setShopeeModalOpen: (open: boolean) => void;
  userStoreConnections: ClientStoreConnection[];
  isSimulationMode: boolean;
  setIsSimulationMode: (mode: boolean) => void;
  initiateShopeeConnect: () => Promise<string>;
  completeShopeeConnect: (code: string, shopId: string, state: string) => Promise<void>;
  syncShopee: () => Promise<void>;
  disconnectShopee: (connectionId?: string) => Promise<void>;
  // Formula modal
  formulaModalOpen: boolean;
  setFormulaModalOpen: (open: boolean) => void;
  formulaModalTopic: string;
  openFormulaModal: (topic: string) => void;
  // Tutorial Center & Drawer
  tutorialDrawerOpen: boolean;
  setTutorialDrawerOpen: (open: boolean) => void;
  activeTutorialId: string | null;
  openTutorial: (tutorialId: string) => void;
  closeTutorial: () => void;
  navigateToTutorial: (tutorialId?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // SaaS Foundation V2 State
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(SEED_USERS[1]); // Default logged-in as Zaskia (PLUS)
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>(SEED_SUBSCRIPTIONS);
  const [verificationTokens, setVerificationTokens] = useState<EmailVerificationToken[]>(SEED_VERIFICATION_TOKENS);
  const [authError, setAuthError] = useState<string | null>(null);

  // Shopee Multi-Tenant Store Connection State
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const [userStoreConnections, setUserStoreConnections] = useState<ClientStoreConnection[]>(
    currentUser ? storeRepository.getClientStoreConnections(currentUser.id) : []
  );

  const [currentStoreId, setCurrentStoreId] = useState<string>(() => {
    const initialConns = currentUser ? storeRepository.getClientStoreConnections(currentUser.id) : [];
    return initialConns.length > 0 ? initialConns[0].id : '';
  });

  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(
    (currentUser?.subscriptionPlan.toLowerCase() as SubscriptionTier) || 'plus'
  );
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [formulaModalOpen, setFormulaModalOpen] = useState<boolean>(false);
  const [formulaModalTopic, setFormulaModalTopic] = useState<string>('roas');
  const [tutorialDrawerOpen, setTutorialDrawerOpen] = useState<boolean>(false);
  const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);
  const [shopeeModalOpen, setShopeeModalOpen] = useState<boolean>(false);

  // Refresh user stores when currentUser or simulation mode changes
  const refreshUserStores = () => {
    if (!currentUser) {
      setUserStoreConnections([]);
      setCurrentStoreId('');
      return;
    }
    const conns = storeRepository.getClientStoreConnections(currentUser.id);
    setUserStoreConnections(conns);
    if (conns.length > 0) {
      if (!conns.some((c) => c.id === currentStoreId)) {
        setCurrentStoreId(conns[0].id);
      }
    } else {
      setCurrentStoreId('');
    }
  };

  useEffect(() => {
    refreshUserStores();
  }, [currentUser]);

  // Derived Stores based on Active User and Simulation Mode
  const SIMULATION_STORE: Store = {
    id: 'store_sim',
    name: 'Zaskia Hijab & Fashion (Star+)',
    category: 'Fashion Muslim (Mode Simulasi)',
    shopeeStatus: 'connected',
    sellerStatus: 'STAR',
    defaultAdminFeePercent: 6.5,
    defaultServiceFeePercent: 4.0,
    defaultPaymentFeePercent: 1.25,
    defaultAffiliateFeePercent: 3.0,
    defaultPackingCost: 2500,
    defaultOperationalCost: 1500,
    defaultTargetMargin: 15,
    defaultTargetRoas: 4.0,
  };

  const FALLBACK_STORE: Store = {
    id: 'no_store',
    name: 'Belum Terhubung ke Shopee',
    category: 'Hubungkan Toko Anda',
    shopeeStatus: 'disconnected',
    sellerStatus: 'NON_STAR',
    defaultAdminFeePercent: 6.5,
    defaultServiceFeePercent: 4.0,
    defaultPaymentFeePercent: 1.25,
    defaultAffiliateFeePercent: 0,
    defaultPackingCost: 2000,
    defaultOperationalCost: 1000,
    defaultTargetMargin: 15,
    defaultTargetRoas: 4.0,
  };

  const [customStoreSettings, setCustomStoreSettings] = useState<Record<string, Partial<Store>>>({});

  const stores: Store[] = isSimulationMode
    ? [{ ...SIMULATION_STORE, ...(customStoreSettings[SIMULATION_STORE.id] || {}) }]
    : userStoreConnections.map((c) => ({
        id: c.id,
        name: c.shopName,
        category: 'Shopee Official Store',
        shopeeStatus: (c.status === 'CONNECTED' ? 'connected' : 'disconnected') as 'connected' | 'disconnected',
        sellerStatus: 'STAR',
        defaultAdminFeePercent: 6.5,
        defaultServiceFeePercent: 4.0,
        defaultPaymentFeePercent: 1.25,
        defaultAffiliateFeePercent: 3.0,
        defaultPackingCost: 2500,
        defaultOperationalCost: 1500,
        defaultTargetMargin: 15,
        defaultTargetRoas: 4.0,
        ...(customStoreSettings[c.id] || {}),
      }));

  const currentStore: Store = isSimulationMode
    ? SIMULATION_STORE
    : stores.find((s) => s.id === currentStoreId) || stores[0] || FALLBACK_STORE;

  // Shopee Connection State calculation
  const activeConnection = userStoreConnections.find((c) => c.id === currentStoreId) || userStoreConnections[0];
  const [shopeeConnectionState, setShopeeConnectionState] = useState<ShopeeConnectionState>({
    status: 'NOT_CONNECTED',
    isSimulationMode: false,
    shopName: 'Belum Terhubung',
    shopId: '',
  });

  useEffect(() => {
    if (isSimulationMode) {
      setShopeeConnectionState({
        status: 'SIMULATION',
        isSimulationMode: true,
        shopName: 'Mode Simulasi Lokal',
        shopId: 'SIM-882049112',
        lastSyncTime: 'Offline Simulation',
      });
    } else if (activeConnection) {
      setShopeeConnectionState({
        status: activeConnection.status,
        isSimulationMode: false,
        shopName: activeConnection.shopName,
        shopId: activeConnection.shopId,
        lastSyncTime: activeConnection.lastSyncAt,
      });
    } else {
      setShopeeConnectionState({
        status: 'NOT_CONNECTED',
        isSimulationMode: false,
        shopName: 'Belum Terhubung',
        shopId: '',
      });
    }
  }, [isSimulationMode, activeConnection, userStoreConnections]);

  // Shopee OAuth Actions
  const initiateShopeeConnect = async (): Promise<string> => {
    if (!currentUser) throw new Error('Silakan login terlebih dahulu.');
    const userPlan = plans.find((p) => p.code === currentUser.subscriptionPlan) || plans[0];
    const connections = storeRepository.getClientStoreConnections(currentUser.id);
    const activeConns = connections.filter((c) => c.status === 'CONNECTED' || c.status === 'CONNECTING');

    if (activeConns.length >= userPlan.maxStores) {
      setUpgradeModalOpen(true);
      throw new Error(`STORE_LIMIT_REACHED: Paket ${userPlan.name} memiliki batas maksimal ${userPlan.maxStores} toko Shopee.`);
    }

    const res = await shopeeApiClient.initiateOAuth(currentUser.id, userPlan.maxStores);
    return res.authUrl;
  };

  const completeShopeeConnect = async (code: string, shopId: string, state: string): Promise<void> => {
    if (!currentUser) throw new Error('Silakan login terlebih dahulu.');
    await shopeeApiClient.handleCallback(code, shopId, state);
    setIsSimulationMode(false);
    refreshUserStores();
  };

  const syncShopee = async (): Promise<void> => {
    if (!currentUser) return;
    if (isSimulationMode) {
      setShopeeConnectionState((prev) => ({
        ...prev,
        lastSyncTime: new Date().toLocaleTimeString('id-ID') + ' WIB',
      }));
      return;
    }
    if (!currentStoreId) return;
    const res = await shopeeApiClient.syncStore(currentStoreId, currentUser.id);
    setShopeeConnectionState((prev) => ({
      ...prev,
      lastSyncTime: res.syncedAt,
    }));
    refreshUserStores();
  };

  const disconnectShopee = async (connectionId?: string): Promise<void> => {
    if (!currentUser) return;
    const targetId = connectionId || currentStoreId;
    if (!targetId) return;
    await shopeeApiClient.disconnectStore(targetId, currentUser.id);
    refreshUserStores();
  };

  // Sync tier when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setSubscriptionTier(currentUser.subscriptionPlan.toLowerCase() as SubscriptionTier);
    }
  }, [currentUser]);

  // Auth Methods
  const login = (email: string, pass: string): boolean => {
    setAuthError(null);
    const target = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!target) {
      setAuthError('Email tidak terdaftar dalam sistem.');
      return false;
    }

    const hashedInput = hashPassword(pass);
    if (target.passwordHash !== hashedInput) {
      setAuthError('Password salah. Silakan periksa kembali.');
      return false;
    }

    setCurrentUser(target);
    setSubscriptionTier(target.subscriptionPlan.toLowerCase() as SubscriptionTier);

    if (!target.emailVerified) {
      setCurrentView('verify-email');
      return true;
    }

    if (target.role === 'ADMIN') {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('dashboard');
    }
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthError(null);
    setCurrentView('landing-page');
  };

  const register = (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    initialPlan: SubscriptionPlanCode;
  }) => {
    setAuthError(null);
    const exists = users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase());
    if (exists) {
      setAuthError('Alamat email sudah terdaftar. Silakan login.');
      return { success: false, message: 'Email sudah terdaftar.' };
    }

    const newUserId = 'usr_' + Date.now();
    const newUser: User = {
      id: newUserId,
      name: input.name,
      email: input.email.trim().toLowerCase(),
      phone: input.phone,
      passwordHash: hashPassword(input.password),
      emailVerified: false,
      role: 'USER',
      subscriptionPlan: input.initialPlan,
      subscriptionStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Generate real email verification token
    const tokenCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newToken: EmailVerificationToken = {
      id: 'tok_' + Date.now(),
      userId: newUserId,
      email: newUser.email,
      token: tokenCode,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Create pending subscription record
    const planObj = plans.find((p) => p.code === input.initialPlan) || plans[0];
    const newSub: SubscriptionRecord = {
      id: 'sub_' + Date.now(),
      userId: newUserId,
      userEmail: newUser.email,
      userName: newUser.name,
      planCode: input.initialPlan,
      status: 'PENDING',
      billingCycle: 'monthly',
      amount: planObj.monthlyPrice,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      notes: 'Registrasi Baru (Menunggu Verifikasi & Pembayaran)',
    };

    setUsers((prev) => [...prev, newUser]);
    setVerificationTokens((prev) => [...prev, newToken]);
    setSubscriptions((prev) => [...prev, newSub]);
    setCurrentUser(newUser);

    setCurrentView('verify-email');
    return { success: true };
  };

  const verifyEmail = (email: string, token: string): boolean => {
    const validToken = verificationTokens.find(
      (t) =>
        t.email.toLowerCase() === email.trim().toLowerCase() &&
        t.token === token.trim() &&
        !t.usedAt &&
        new Date(t.expiresAt).getTime() > Date.now()
    );

    if (!validToken) {
      return false;
    }

    // Mark token used
    setVerificationTokens((prev) =>
      prev.map((t) => (t.id === validToken.id ? { ...t, usedAt: new Date().toISOString() } : t))
    );

    // Update user
    setUsers((prev) =>
      prev.map((u) =>
        u.email.toLowerCase() === email.trim().toLowerCase()
          ? { ...u, emailVerified: true, subscriptionStatus: 'ACTIVE', updatedAt: new Date().toISOString() }
          : u
      )
    );

    // Update current user
    if (currentUser && currentUser.email.toLowerCase() === email.trim().toLowerCase()) {
      setCurrentUser((prev) =>
        prev ? { ...prev, emailVerified: true, subscriptionStatus: 'ACTIVE' } : null
      );
    }

    // Update subscription
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.userEmail.toLowerCase() === email.trim().toLowerCase()
          ? { ...s, status: 'ACTIVE' }
          : s
      )
    );

    return true;
  };

  const resendVerificationEmail = (email: string): string => {
    const tokenCode = Math.floor(100000 + Math.random() * 900000).toString();
    const target = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    const newToken: EmailVerificationToken = {
      id: 'tok_' + Date.now(),
      userId: target ? target.id : 'usr_guest',
      email: email.trim().toLowerCase(),
      token: tokenCode,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    setVerificationTokens((prev) => [...prev, newToken]);
    return tokenCode;
  };

  const changeUserSubscription = (plan: SubscriptionPlanCode, status: SubscriptionStatusCode = 'ACTIVE') => {
    if (!currentUser) return;
    const planObj = plans.find((p) => p.code === plan) || plans[0];

    const updatedUser: User = {
      ...currentUser,
      subscriptionPlan: plan,
      subscriptionStatus: status,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
    setSubscriptionTier(plan.toLowerCase() as SubscriptionTier);

    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    // Record new subscription
    const newSub: SubscriptionRecord = {
      id: 'sub_' + Date.now(),
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      planCode: plan,
      status: status,
      billingCycle: 'monthly',
      amount: planObj.monthlyPrice,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      notes: `Perubahan paket ke ${plan}`,
    };
    setSubscriptions((prev) => [newSub, ...prev]);
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role, updatedAt: new Date().toISOString() } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role } : null));
    }
  };

  const updateUserPlan = (userId: string, plan: SubscriptionPlanCode) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, subscriptionPlan: plan, updatedAt: new Date().toISOString() }
          : u
      )
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, subscriptionPlan: plan } : null));
      setSubscriptionTier(plan.toLowerCase() as SubscriptionTier);
    }
  };

  const updateSubscriptionStatus = (userId: string, status: SubscriptionStatusCode) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, subscriptionStatus: status, updatedAt: new Date().toISOString() }
          : u
      )
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, subscriptionStatus: status } : null));
    }
    setSubscriptions((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, status } : s))
    );
  };

  const toggleUserEmailVerified = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, emailVerified: !u.emailVerified, updatedAt: new Date().toISOString() }
          : u
      )
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, emailVerified: !prev.emailVerified } : null));
    }
  };

  const updatePlanPrice = (planCode: SubscriptionPlanCode, monthly: number, yearly: number) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.code === planCode ? { ...p, monthlyPrice: monthly, yearlyPrice: yearly } : p
      )
    );
  };

  // Rule & Tax Engine State
  const [marketplaceRules, setMarketplaceRules] = useState<MarketplaceFeeRule[]>(INITIAL_MARKETPLACE_FEE_RULES);
  const [programRules, setProgramRules] = useState<SellerProgramRule[]>(INITIAL_PROGRAM_RULES);
  const [taxRules, setTaxRules] = useState<TaxRule[]>(OFFICIAL_TAX_RULES);
  const [taxProfile, setTaxProfile] = useState<TaxProfile>({
    taxpayerType: 'Individual',
    taxScheme: 'UMKM Final',
    npwpOrNik: '3201889900110002',
    hasNpwp: true,
    isPkp: false,
    hasSkbExemption: false,
    annualOfflineRevenue: 120000000,
    annualOtherMarketplaceRevenue: 60000000,
    taxEffectiveDate: '2026-01-01',
  });

  // Store-based Data State
  const [allProducts, setAllProducts] = useState(INITIAL_PRODUCTS);
  const [allOrders, setAllOrders] = useState(INITIAL_ORDERS);
  const [allCampaigns, setAllCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [allInventory, setAllInventory] = useState(INITIAL_INVENTORY);
  const [allCompetitors, setAllCompetitors] = useState(INITIAL_COMPETITORS);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(INITIAL_OPPORTUNITIES);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);

  // Sync theme with document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sliced Data scoped by User and Store (Tenant Isolation)
  const products: Product[] = isSimulationMode
    ? allProducts[currentStoreId] || allProducts['store_1'] || []
    : currentUser && currentStoreId
    ? storeRepository.getProductsByStore(currentUser.id, currentStoreId)
    : [];

  const orders: Order[] = isSimulationMode
    ? allOrders[currentStoreId] || allOrders['store_1'] || []
    : currentUser && currentStoreId
    ? storeRepository.getOrdersByStore(currentUser.id, currentStoreId)
    : [];

  const campaigns: Campaign[] = isSimulationMode
    ? allCampaigns[currentStoreId] || allCampaigns['store_1'] || []
    : [];

  const inventory: InventoryItem[] = isSimulationMode
    ? allInventory[currentStoreId] || allInventory['store_1'] || []
    : products.map((p) => {
        const sold = p.unitsSold || 0;
        const daily = p.dailySalesVelocity || Math.max(1, Math.round(sold / 30));
        const days = Math.round(p.stock / daily);
        return {
          id: 'inv_' + p.id,
          storeId: p.storeId,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          category: p.category,
          currentStock: p.stock,
          sold30Days: sold,
          minimumStock: p.safetyStock || 20,
          criticalThreshold: 10,
          dailySales: daily,
          daysRemaining: days,
          status: (p.stock === 0 ? 'KRITIS' : p.stock < 20 ? 'WASPADA' : 'AMAN') as 'AMAN' | 'WASPADA' | 'KRITIS',
          reorderRecommendation: p.stock < (p.safetyStock || 20) ? 50 : 0,
          velocity: (daily > 10 ? 'Fast Moving' : daily > 3 ? 'Medium Moving' : 'Slow Moving') as 'Fast Moving' | 'Medium Moving' | 'Slow Moving',
        };
      });

  const competitors: CompetitorComparison[] = isSimulationMode
    ? allCompetitors[currentStoreId] || allCompetitors['store_1'] || []
    : [];

  const unreadAlertCount = alerts.filter((a) => !a.read).length;

  const isFeatureAccessible = (view: AppView): boolean => {
    const isConnected = shopeeConnectionState.status === 'CONNECTED';
    return checkViewAccess(currentUser, view, plans, isConnected, isSimulationMode).allowed;
  };

  const attemptNavigate = (view: AppView) => {
    const isConnected = shopeeConnectionState.status === 'CONNECTED';
    const access = checkViewAccess(currentUser, view, plans, isConnected, isSimulationMode);
    if (access.allowed) {
      setCurrentView(view);
      return;
    }

    if (access.reason === 'AUTH_REQUIRED') {
      setAuthError('Silakan login terlebih dahulu untuk mengakses fitur ini.');
      setCurrentView('login');
      return;
    }

    if (access.reason === 'EMAIL_NOT_VERIFIED') {
      setCurrentView('verify-email');
      return;
    }

    if (access.reason === 'ADMIN_ONLY') {
      setAuthError('Halaman ini khusus untuk Administrator.');
      setCurrentView('dashboard');
      return;
    }

    if (access.reason === 'SUBSCRIPTION_INACTIVE') {
      setCurrentView('user-subscription');
      return;
    }

    if (access.reason === 'SHOPEE_CONNECTION_REQUIRED') {
      setShopeeModalOpen(true);
      return;
    }

    if (access.reason === 'STORE_LIMIT_REACHED' || access.reason === 'PLAN_UPGRADE_REQUIRED') {
      setUpgradeModalOpen(true);
      return;
    }

    setCurrentView(view);
  };

  const updateStoreSettings = (updated: Partial<Store>) => {
    if (!currentStoreId) return;
    setCustomStoreSettings((prev) => ({
      ...prev,
      [currentStoreId]: {
        ...(prev[currentStoreId] || {}),
        ...updated,
      },
    }));
  };

  const addProduct = (product: Product) => {
    setAllProducts((prev) => ({
      ...prev,
      [currentStoreId]: [product, ...(prev[currentStoreId] || [])],
    }));
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setAllProducts((prev) => ({
      ...prev,
      [currentStoreId]: (prev[currentStoreId] || []).map((p) =>
        p.id === id ? { ...p, ...updated } : p
      ),
    }));
  };

  const deleteProduct = (id: string) => {
    setAllProducts((prev) => ({
      ...prev,
      [currentStoreId]: (prev[currentStoreId] || []).filter((p) => p.id !== id),
    }));
  };

  const addCampaign = (campaign: Campaign) => {
    setAllCampaigns((prev) => ({
      ...prev,
      [currentStoreId]: [campaign, ...(prev[currentStoreId] || [])],
    }));
  };

  const updateCampaign = (id: string, updated: Partial<Campaign>) => {
    setAllCampaigns((prev) => ({
      ...prev,
      [currentStoreId]: (prev[currentStoreId] || []).map((c) =>
        c.id === id ? { ...c, ...updated } : c
      ),
    }));
  };

  const duplicateCampaign = (id: string) => {
    const original = campaigns.find((c) => c.id === id);
    if (!original) return;
    const duplicated: Campaign = {
      ...original,
      id: `cmp_${Date.now()}`,
      name: `${original.name} (Salinan)`,
      status: 'Dijeda',
      cost: 0,
      revenue: 0,
      profit: 0,
      clicks: 0,
      conversions: 0,
      startDate: new Date().toISOString().split('T')[0],
      notes: `Duplikat dari campaign ${original.name}`,
    };
    addCampaign(duplicated);
  };

  const archiveCampaign = (id: string) => {
    updateCampaign(id, { status: 'Arsip' });
  };

  const updateInventoryStock = (id: string, newStock: number) => {
    setAllInventory((prev) => ({
      ...prev,
      [currentStoreId]: (prev[currentStoreId] || []).map((item) => {
        if (item.id === id) {
          const velocity = item.dailySales || 1;
          const daysRemaining = Math.floor(newStock / velocity);
          let status: 'AMAN' | 'WASPADA' | 'KRITIS' = 'AMAN';
          if (daysRemaining <= 4 || newStock <= 5) status = 'KRITIS';
          else if (daysRemaining <= 10) status = 'WASPADA';

          return {
            ...item,
            currentStock: newStock,
            daysRemaining,
            status,
          };
        }
        return item;
      }),
    }));
  };

  const addOrder = (order: Order) => {
    setAllOrders((prev) => ({
      ...prev,
      [currentStoreId]: [order, ...(prev[currentStoreId] || [])],
    }));
  };

  const markAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
  };

  const markAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const importProductsFromCsv = (newProducts: Product[]) => {
    setAllProducts((prev) => ({
      ...prev,
      [currentStoreId]: [...newProducts, ...(prev[currentStoreId] || [])],
    }));
  };

  const openFormulaModal = (topic: string) => {
    setFormulaModalTopic(topic);
    setFormulaModalOpen(true);
  };

  const openTutorial = (tutorialId: string) => {
    setActiveTutorialId(tutorialId);
    setTutorialDrawerOpen(true);
  };

  const closeTutorial = () => {
    setTutorialDrawerOpen(false);
  };

  const navigateToTutorial = (tutorialId?: string) => {
    if (tutorialId) {
      setActiveTutorialId(tutorialId);
    }
    setTutorialDrawerOpen(false);
    setCurrentView('tutorial');
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentView,
        setCurrentView,
        // SaaS Foundation V2
        currentUser,
        users,
        plans,
        subscriptions,
        verificationTokens,
        authError,
        setAuthError,
        login,
        logout,
        register,
        verifyEmail,
        resendVerificationEmail,
        changeUserSubscription,
        updateUserRole,
        updateUserPlan,
        updateSubscriptionStatus,
        toggleUserEmailVerified,
        updatePlanPrice,
        stores,
        currentStoreId,
        currentStore,
        setCurrentStoreId,
        updateStoreSettings,
        subscriptionTier,
        setSubscriptionTier,
        isFeatureAccessible,
        upgradeModalOpen,
        setUpgradeModalOpen,
        attemptNavigate,
        products,
        orders,
        campaigns,
        inventory,
        competitors,
        opportunities,
        alerts,
        unreadAlertCount,
        addProduct,
        updateProduct,
        deleteProduct,
        addCampaign,
        updateCampaign,
        duplicateCampaign,
        archiveCampaign,
        updateInventoryStock,
        addOrder,
        markAlertRead,
        markAllAlertsRead,
        importProductsFromCsv,
        searchModalOpen,
        setSearchModalOpen,
        formulaModalOpen,
        setFormulaModalOpen,
        formulaModalTopic,
        openFormulaModal,
        tutorialDrawerOpen,
        setTutorialDrawerOpen,
        activeTutorialId,
        openTutorial,
        closeTutorial,
        navigateToTutorial,
        shopeeModalOpen,
        setShopeeModalOpen,
        shopeeConnectionState,
        setShopeeConnectionState,
        userStoreConnections,
        isSimulationMode,
        setIsSimulationMode,
        initiateShopeeConnect,
        completeShopeeConnect,
        syncShopee,
        disconnectShopee,
        marketplaceRules,
        setMarketplaceRules,
        programRules,
        setProgramRules,
        taxRules,
        setTaxRules,
        taxProfile,
        setTaxProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
