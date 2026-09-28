import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { GlobalSearchModal } from './components/common/GlobalSearchModal.tsx';
import { UpgradeModal } from './components/common/UpgradeModal.tsx';
import { FormulaExplanationModal } from './components/common/FormulaExplanationModal.tsx';
import { ShopeeConnectionCenterModal } from './components/common/ShopeeConnectionCenterModal.tsx';
import { TutorialDrawerModal } from './components/common/TutorialDrawerModal.tsx';
import { TutorialPage } from './components/tutorial/TutorialPage.tsx';

// Pages
import { DashboardPage } from './components/dashboard/DashboardPage.tsx';
import { LandingPageView } from './components/landing/LandingPageView.tsx';
import { ProfitAnalyticsPage } from './components/analytics/ProfitAnalyticsPage.tsx';
import { ProductAnalyticsPage } from './components/analytics/ProductAnalyticsPage.tsx';
import { VariantAnalyticsPage } from './components/analytics/VariantAnalyticsPage.tsx';
import { CampaignAnalyticsPage } from './components/analytics/CampaignAnalyticsPage.tsx';
import { MarketAnalyzerPage } from './components/analytics/MarketAnalyzerPage.tsx';
import { CompetitiveGapPage } from './components/analytics/CompetitiveGapPage.tsx';

// True Profit Engine & Advanced Tools
import { TrueProfitEngineCalculator } from './components/calculators/TrueProfitEngineCalculator.tsx';
import { FeeScenarioSimulator } from './components/calculators/FeeScenarioSimulator.tsx';
import { BulkPricingCalculator } from './components/calculators/BulkPricingCalculator.tsx';
import { TaxDashboardPage } from './components/tax/TaxDashboardPage.tsx';
import { FeeRulesAdminPage } from './components/admin/FeeRulesAdminPage.tsx';

// Calculators & Launch Tools
import { ProductLaunchPage } from './components/productLaunch/ProductLaunchPage.tsx';
import { RoasCalculator } from './components/calculators/RoasCalculator.tsx';
import { TargetRoasCalculator } from './components/calculators/TargetRoasCalculator.tsx';
import { NewProductPricingCalculator } from './components/calculators/NewProductPricingCalculator.tsx';
import { ReversePricingCalculator } from './components/calculators/ReversePricingCalculator.tsx';
import { PriceSimulator } from './components/calculators/PriceSimulator.tsx';
import { DiscountCalculator } from './components/calculators/DiscountCalculator.tsx';
import { VoucherSimulator } from './components/calculators/VoucherSimulator.tsx';
import { AdsBudgetCalculator } from './components/calculators/AdsBudgetCalculator.tsx';
import { BepCalculator } from './components/calculators/BepCalculator.tsx';
import { ProfitSimulator } from './components/calculators/ProfitSimulator.tsx';

// Operations
import { OrdersPage } from './components/operations/OrdersPage.tsx';
import { InventoryPage } from './components/operations/InventoryPage.tsx';
import { StockForecastPage } from './components/operations/StockForecastPage.tsx';

// Insights & Tools
import { OpportunityCenterPage } from './components/insights/OpportunityCenterPage.tsx';
import { AlertCenterPage } from './components/insights/AlertCenterPage.tsx';
import { ReportsExportPage } from './components/reports/ReportsExportPage.tsx';
import { ImportDataPage } from './components/import/ImportDataPage.tsx';
import { SettingsPage } from './components/settings/SettingsPage.tsx';
import { SubscriptionPage } from './components/settings/SubscriptionPage.tsx';

// SaaS Foundation V2 Pages
import { LoginPage } from './components/auth/LoginPage.tsx';
import { RegisterPage } from './components/auth/RegisterPage.tsx';
import { EmailVerificationPage } from './components/auth/EmailVerificationPage.tsx';
import { PricingPublicPage } from './components/auth/PricingPublicPage.tsx';
import { UserProfilePage } from './components/user/UserProfilePage.tsx';
import { AdminDashboardPage } from './components/admin/AdminDashboardPage.tsx';
import { SubscriptionGatePage } from './components/user/SubscriptionGatePage.tsx';

// Unit Test Runners
import { runCalculationEngineTests } from './utils/calculatorEngine.test.ts';
import { runTrueProfitEngineTests } from './services/profitEngine/profitEngine.test.ts';
import { runAuthServiceTests } from './services/auth/authService.test.ts';

const AppContent: React.FC = () => {
  const { currentView, currentUser } = useApp();

  // Run calculation tests once on app boot
  useEffect(() => {
    const testResult = runCalculationEngineTests();
    if (testResult.passed) {
      console.log('✅ ASIS SELLER Calculation Engine: All Unit Tests Passed successfully!');
    } else {
      console.warn('⚠️ Some calculation engine tests failed:', testResult.results);
    }

    const trueProfitTests = runTrueProfitEngineTests();
    if (trueProfitTests.passed) {
      console.log('✅ ASIS SELLER True Profit Engine: All Business Rules & Tests Passed successfully!');
    } else {
      console.warn('⚠️ Some true profit engine tests failed:', trueProfitTests.results);
    }

    const authTests = runAuthServiceTests();
    if (authTests.passed) {
      console.log('✅ ASIS SELLER SaaS Foundation: Auth, Roles, Plans & Access Control Tests Passed!');
    } else {
      console.warn('⚠️ Some SaaS foundation tests failed:', authTests.results);
    }
  }, []);

  // Public standalone views
  if (currentView === 'landing-page') {
    return (
      <>
        <LandingPageView />
        <GlobalSearchModal />
        <UpgradeModal />
        <FormulaExplanationModal />
      </>
    );
  }

  if (currentView === 'login') {
    return <LoginPage />;
  }

  if (currentView === 'register') {
    return <RegisterPage />;
  }

  if (currentView === 'verify-email') {
    return <EmailVerificationPage />;
  }

  if (currentView === 'pricing') {
    return <PricingPublicPage />;
  }

  // Admin exclusive standalone dashboard
  if (
    currentView === 'admin-dashboard' ||
    currentView === 'admin-users' ||
    currentView === 'admin-plans' ||
    currentView === 'admin-subscriptions'
  ) {
    return <AdminDashboardPage />;
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'tutorial':
        return <TutorialPage />;
      // True Profit Engine & Advanced Tools
      case 'true-profit-engine':
        return <TrueProfitEngineCalculator />;
      case 'fee-scenarios':
        return <FeeScenarioSimulator />;
      case 'bulk-pricing':
        return <BulkPricingCalculator />;
      case 'tax-dashboard':
        return <TaxDashboardPage />;
      case 'admin-fee-rules':
        return <FeeRulesAdminPage />;
      // Analytics
      case 'profit-analytics':
        return <ProfitAnalyticsPage />;
      case 'product-analytics':
      case 'products':
        return <ProductAnalyticsPage />;
      case 'variant-analytics':
        return <VariantAnalyticsPage />;
      case 'campaign-analytics':
        return <CampaignAnalyticsPage />;
      case 'market-analyzer':
        return <MarketAnalyzerPage />;
      case 'competitive-gap':
        return <CompetitiveGapPage />;
      // Calculators & Launch Tools
      case 'product-launch':
        return <ProductLaunchPage />;
      case 'roas-calculator':
        return <RoasCalculator />;
      case 'target-roas':
        return <TargetRoasCalculator />;
      case 'new-pricing':
        return <NewProductPricingCalculator />;
      case 'reverse-pricing':
        return <ReversePricingCalculator />;
      case 'price-simulator':
        return <PriceSimulator />;
      case 'discount-calculator':
        return <DiscountCalculator />;
      case 'voucher-simulator':
        return <VoucherSimulator />;
      case 'ads-budget':
        return <AdsBudgetCalculator />;
      case 'bep-calculator':
        return <BepCalculator />;
      case 'profit-simulator':
        return <ProfitSimulator />;
      // Operations
      case 'orders':
        return <OrdersPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'stock-forecast':
        return <StockForecastPage />;
      // Insights & Tools
      case 'opportunity-center':
        return <OpportunityCenterPage />;
      case 'alerts':
        return <AlertCenterPage />;
      case 'reports':
        return <ReportsExportPage />;
      case 'import-data':
        return <ImportDataPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <UserProfilePage />;
      case 'user-subscription':
      case 'subscription':
        return <SubscriptionPage />;
      default:
        // Subscription Gate for non-admin users with inactive subscription
        if (currentUser && currentUser.role !== 'ADMIN' && currentUser.subscriptionStatus !== 'ACTIVE') {
          return <SubscriptionGatePage />;
        }
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 dark:bg-slate-950 dark:text-slate-100 light:bg-slate-100 light:text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950/60 pb-16 transition-colors dark:bg-slate-950/60 light:bg-slate-100">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals */}
      <GlobalSearchModal />
      <UpgradeModal />
      <FormulaExplanationModal />
      <ShopeeConnectionCenterModal />
      <TutorialDrawerModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
