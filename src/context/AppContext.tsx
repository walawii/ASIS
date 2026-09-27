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
import { MarketplaceFeeRule, SellerProgramRule, TaxRule, TaxProfile } from '../types/rules.ts';
import {
  INITIAL_MARKETPLACE_FEE_RULES,
  INITIAL_PROGRAM_RULES,
  OFFICIAL_TAX_RULES,
} from '../services/profitEngine/rulesData.ts';
import { ShopeeConnectionState } from '../services/shopee/types.ts';

export type AppView =
  | 'dashboard'
  | 'landing-page'
  | 'tutorial' // 📚 Tutorial Center
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
  // Stores
  stores: Store[];
  currentStoreId: string;
  currentStore: Store;
  setCurrentStoreId: (storeId: string) => void;
  updateStoreSettings: (updated: Partial<Store>) => void;
  // Subscriptions & Gating
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
  // Shopee Integration State (Phase 15 & 16)
  shopeeConnectionState: ShopeeConnectionState;
  setShopeeConnectionState: React.Dispatch<React.SetStateAction<ShopeeConnectionState>>;
  shopeeModalOpen: boolean;
  setShopeeModalOpen: (open: boolean) => void;
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
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [currentStoreId, setCurrentStoreId] = useState<string>('store_1');
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('kit'); // Full features default
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [formulaModalOpen, setFormulaModalOpen] = useState<boolean>(false);
  const [formulaModalTopic, setFormulaModalTopic] = useState<string>('roas');
  const [tutorialDrawerOpen, setTutorialDrawerOpen] = useState<boolean>(false);
  const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);
  const [shopeeModalOpen, setShopeeModalOpen] = useState<boolean>(false);
  const [shopeeConnectionState, setShopeeConnectionState] = useState<ShopeeConnectionState>({
    status: 'SIMULATION',
    isSimulationMode: true,
    shopName: 'Zaskia Hijab & Fashion (Star+)',
    shopId: 'SIM-882049112',
    lastSyncTime: 'Hari ini 10:15 WIB',
  });

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

  const currentStore = stores.find((s) => s.id === currentStoreId) || stores[0];

  // Current store sliced data
  const products = allProducts[currentStoreId] || [];
  const orders = allOrders[currentStoreId] || [];
  const campaigns = allCampaigns[currentStoreId] || [];
  const inventory = allInventory[currentStoreId] || [];
  const competitors = allCompetitors[currentStoreId] || [];

  const unreadAlertCount = alerts.filter((a) => !a.read).length;

  /**
   * Feature Access Gating based on Subscription Tier
   * ASIS LITE:
   *  - Kalkulator ROAS, Indikator ROAS, Kalkulator Target ROAS, Campaign History, Reverse Pricing
   * ASIS PLUS:
   *  - Semua Lite + Market Analyzer, Competitor Gap, Variant Analytics, Price Simulator, Discount Calculator, Profit Simulator, Ads Budget, Voucher Simulator, Inventory
   * ASIS KIT / PREMIUM:
   *  - Semua Plus + Profit Analytics, Orders AsisFlow, Stock Forecast, Opportunity Center, Alert Center, Export Report, Multi Store, Settings
   */
  const isFeatureAccessible = (view: AppView): boolean => {
    if (view === 'tutorial') return true;
    if (subscriptionTier === 'kit') return true;

    const liteAllowed: AppView[] = [
      'dashboard',
      'landing-page',
      'roas-calculator',
      'target-roas',
      'product-launch',
      'new-pricing',
      'reverse-pricing',
      'campaign-analytics',
      'bep-calculator',
      'settings',
    ];

    if (subscriptionTier === 'lite') {
      return liteAllowed.includes(view);
    }

    if (subscriptionTier === 'plus') {
      const plusBlocked: AppView[] = [
        'profit-analytics',
        'orders',
        'stock-forecast',
        'opportunity-center',
        'reports',
      ];
      return !plusBlocked.includes(view);
    }

    return true;
  };

  const attemptNavigate = (view: AppView) => {
    if (isFeatureAccessible(view)) {
      setCurrentView(view);
    } else {
      setUpgradeModalOpen(true);
    }
  };

  const updateStoreSettings = (updated: Partial<Store>) => {
    setStores((prev) =>
      prev.map((s) => (s.id === currentStoreId ? { ...s, ...updated } : s))
    );
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
