import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Rocket,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Tag,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  ArrowDown,
  Shield,
  ShoppingBag,
  Sliders,
  FileText,
  Search,
  Target,
  Package,
  Award,
  ChevronDown,
  ChevronUp,
  Save,
  Info,
} from 'lucide-react';
import {
  ProductLaunchInput,
  ProductLaunchCategory,
  ProductLaunchSpecifications,
} from '../../types/productLaunch.ts';
import { processProductLaunch } from '../../services/productLaunch/index.ts';
import { SellerType } from '../../types/rules.ts';

export const ProductLaunchPage: React.FC = () => {
  const { currentStore, marketplaceRules, programRules, taxProfile, openFormulaModal, addProduct } = useApp();

  // Toast feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showScoreDetails, setShowScoreDetails] = useState<boolean>(false);
  const [showComplianceDetails, setShowComplianceDetails] = useState<boolean>(false);

  // SECTION A: INFORMASI PRODUK
  const [productName, setProductName] = useState<string>('Kemeja Linen Pria Oversize Lengan Panjang');
  const [brand, setBrand] = useState<string>('Kalasen');
  const [category, setCategory] = useState<ProductLaunchCategory>('Fashion & Pakaian');
  const [subCategory, setSubCategory] = useState<string>('Kemeja Casual Pria');
  const [productType, setProductType] = useState<string>('Kemeja Kasual');

  // SECTION B: SPESIFIKASI DINAMIS
  const [bahan, setBahan] = useState<string>('Katun Linen Rami Premium');
  const [warna, setWarna] = useState<string>('Sage Green, Broken White, Hitam');
  const [ukuran, setUkuran] = useState<string>('M, L, XL');
  const [lingkarDada, setLingkarDada] = useState<string>('108 - 116 cm');
  const [panjang, setPanjang] = useState<string>('74 cm');
  const [lebar, setLebar] = useState<string>('');
  const [tinggi, setTinggi] = useState<string>('');
  const [kapasitas, setKapasitas] = useState<string>('');
  const [beratGrams, setBeratGrams] = useState<number>(250);
  const [isiQuantity, setIsiQuantity] = useState<string>('1 pcs');
  const [model, setModel] = useState<string>('Relaxed Oversized Fit');
  const [motif, setMotif] = useState<string>('Polos Basic');
  const [varian, setVarian] = useState<string>('Pilihan Warna & Size');
  const [fiturInput, setFiturInput] = useState<string>('Bahan adem tidak gerah, Serat alami rami, Kancing batok kelapa');

  // SECTION C: SEO INPUT
  const [primaryKeyword, setPrimaryKeyword] = useState<string>('Kemeja Linen Pria');
  const [secondaryKeywordsText, setSecondaryKeywordsText] = useState<string>('Kemeja Kasual Santai, Atasan Pria Aesthetic, Baju Kemeja Polos');
  const [searchIntent, setSearchIntent] = useState<ProductLaunchInput['seo']['searchIntent']>('Transaksional (Siap Beli)');
  const [targetAudience, setTargetAudience] = useState<string>('Pria Dewasa & Mahasiswa');
  const [uspText, setUspText] = useState<string>(
    'Bahan 100% linen rami serat alami yang sejuk dan menyerap keringat\nFitting modern relaxed oversize yang stylish untuk nongkrong maupun semi-formal\nWarna pastel natural earthy tone yang mudah dipadukan'
  );

  // SECTION D: FINANSIAL & TARGET HARGA PEMBELI
  const [targetBuyerPrice, setTargetBuyerPrice] = useState<number>(55000);
  const [sellerDiscountPercent, setSellerDiscountPercent] = useState<number>(10);
  const [hpp, setHpp] = useState<number>(25000);
  const [packingCost, setPackingCost] = useState<number>(2500);
  const [operationalCost, setOperationalCost] = useState<number>(1500);
  const [adsCostPerOrder, setAdsCostPerOrder] = useState<number>(5000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(2.0);
  const [targetMargin, setTargetMargin] = useState<number>(18);
  const [sellerStatus, setSellerStatus] = useState<SellerType>('STAR');

  // Program marketplace
  const [isFreeShippingXtraActive, setIsFreeShippingXtraActive] = useState<boolean>(true);
  const [isPromoXtraActive, setIsPromoXtraActive] = useState<boolean>(true);
  const [isPromoXtraPlusActive, setIsPromoXtraPlusActive] = useState<boolean>(false);
  const [isAffiliateActive, setIsAffiliateActive] = useState<boolean>(false);
  const [affiliatePercent, setAffiliatePercent] = useState<number>(currentStore.defaultAffiliateFeePercent || 3);

  // Selected SEO Title index
  const [selectedTitleMode, setSelectedTitleMode] = useState<'seoUtama' | 'seoNatural' | 'seoConversion'>('seoUtama');

  // Parse specifications object
  const specifications: ProductLaunchSpecifications = useMemo(() => {
    const fiturUtama = fiturInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    return {
      bahan: bahan.trim() || undefined,
      warna: warna.trim() || undefined,
      ukuran: ukuran.trim() || undefined,
      lingkarDada: lingkarDada.trim() || undefined,
      panjang: panjang.trim() || undefined,
      lebar: lebar.trim() || undefined,
      tinggi: tinggi.trim() || undefined,
      kapasitas: kapasitas.trim() || undefined,
      beratGrams: beratGrams > 0 ? beratGrams : undefined,
      isiQuantity: isiQuantity.trim() || undefined,
      model: model.trim() || undefined,
      motif: motif.trim() || undefined,
      varian: varian.trim() || undefined,
      fiturUtama: fiturUtama.length > 0 ? fiturUtama : undefined,
    };
  }, [bahan, warna, ukuran, lingkarDada, panjang, lebar, tinggi, kapasitas, beratGrams, isiQuantity, model, motif, varian, fiturInput]);

  // Construct Launch Input
  const launchInput: ProductLaunchInput = useMemo(() => {
    const secondaryKeywords = secondaryKeywordsText
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const keySellingPoints = uspText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    return {
      productName,
      brand,
      category,
      subCategory,
      productType,
      specifications,
      seo: {
        primaryKeyword,
        secondaryKeywords,
        searchIntent,
        targetAudience,
        keySellingPoints,
      },
      financial: {
        targetBuyerPrice,
        sellerDiscountPercent,
        hpp,
        packingCost,
        operationalCost,
        adsCostPerOrder,
        expectedReturnRate,
        targetMargin,
        sellerStatus,
        category,
        isFreeShippingXtraActive,
        isPromoXtraActive,
        isPromoXtraPlusActive,
        isAffiliateActive,
        affiliatePercent,
      },
    };
  }, [
    productName,
    brand,
    category,
    subCategory,
    productType,
    specifications,
    primaryKeyword,
    secondaryKeywordsText,
    searchIntent,
    targetAudience,
    uspText,
    targetBuyerPrice,
    sellerDiscountPercent,
    hpp,
    packingCost,
    operationalCost,
    adsCostPerOrder,
    expectedReturnRate,
    targetMargin,
    sellerStatus,
    isFreeShippingXtraActive,
    isPromoXtraActive,
    isPromoXtraPlusActive,
    isAffiliateActive,
    affiliatePercent,
  ]);

  // Process through Product Launch Engine
  const result = useMemo(() => {
    return processProductLaunch(launchInput, marketplaceRules, programRules, taxProfile);
  }, [launchInput, marketplaceRules, programRules, taxProfile]);

  const activeTitle =
    selectedTitleMode === 'seoUtama'
      ? result.seoTitles.seoUtama
      : selectedTitleMode === 'seoNatural'
      ? result.seoTitles.seoNatural
      : result.seoTitles.seoConversion;

  // Clipboard copy handler
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Copy all bundle
  const handleCopyAll = () => {
    const allText = [
      `=== JUDUL PRODUK SHOPEE ===`,
      activeTitle,
      ``,
      `=== HARGA & DISKON SHOPEE ===`,
      `Harga Listing / Coret : Rp ${result.pricing.requiredListingPrice.toLocaleString('id-ID')}`,
      `Diskon Toko Seller   : ${sellerDiscountPercent}% (-Rp ${result.pricing.sellerDiscountAmount.toLocaleString('id-ID')})`,
      `Harga Dibayar Pembeli: Rp ${result.pricing.actualBuyerPrice.toLocaleString('id-ID')}`,
      ``,
      `=== KATA KUNCI UTAMA & REKOMENDASI ===`,
      `Primary Keyword : ${result.keywords.primaryKeyword}`,
      `Secondary       : ${result.keywords.secondaryKeywords.join(', ')}`,
      `Long-tail       : ${result.keywords.longTailKeywords.join(', ')}`,
      ``,
      `=== DESKRIPSI PRODUK LENGKAP ===`,
      result.productDescription,
    ].join('\n');

    handleCopy(allText, 'all');
  };

  // Save to Catalog Store
  const handleSaveToCatalog = () => {
    const newProd = {
      id: `prod_${Date.now()}`,
      storeId: currentStore.id,
      sku: `LAUNCH-${Date.now().toString().slice(-4)}`,
      name: activeTitle,
      category,
      hpp,
      sellingPrice: result.pricing.requiredListingPrice,
      discountPercent: sellerDiscountPercent,
      effectivePrice: result.pricing.actualBuyerPrice,
      packingCost,
      operationalCost,
      weightGrams: beratGrams || 250,
      adminFeePercent: result.pricing.profitCalculation?.marketplaceAdminPercent || 8.25,
      serviceFeePercent: (isFreeShippingXtraActive ? 4 : 0) + (isPromoXtraActive ? 4.5 : 0),
      transactionFeePercent: 1.5,
      affiliatePercent: isAffiliateActive ? affiliatePercent : 0,
      voucherNominal: 0,
      cashbackNominal: 0,
      shippingSubsidy: 0,
      currentAdsCost: adsCostPerOrder,
      targetRoas: 4.5,
      stock: 100,
      safetyStock: 20,
      dailySalesVelocity: 5,
      rating: 5.0,
      reviewCount: 0,
      unitsSold: 0,
      revenue: 0,
      netProfit: result.pricing.profit,
      marginPercent: result.pricing.margin,
      actualRoas: 0,
      bepRoas: result.pricing.profitCalculation?.breakEvenRoas || 1.5,
      status: result.pricing.breakdown.profitStatus,
      score: {
        overall: result.qualityScore,
        marginStatus: result.pricing.margin >= 15 ? 'Good' : result.pricing.margin >= 8 ? 'Fair' : 'Poor',
        roasStatus: 'Good',
        stockStatus: 'Good',
        salesVelocity: 'Moderate',
      },
      variants: [],
    };

    addProduct(newProd as any);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Rocket className="h-6 w-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Product Launch Assistant (Buat Produk Baru)
            </h1>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
              Single-Workflow Launch
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Bantu seller membuat listing produk Shopee baru dari satu alur terpadu: Info & Spesifikasi $\to$ SEO Judul $\to$ Riset Kata Kunci $\to$ Target Harga Pembeli $\to$ Deskripsi $\to$ Audit Kepatuhan Shopee.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openFormulaModal('pricing')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <HelpCircle className="h-4 w-4 text-orange-400" />
            <span>Formula True Profit</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================================== */}
        {/* LEFT COLUMN: INPUT WORKSPACE (7 Cols)                           */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card A: Informasi Produk */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-400" />
                <span>A. Informasi Produk & Kategori</span>
              </h2>
              <span className="text-[10px] text-slate-500">Wajib diisi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Nama Dasar Produk <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Kemeja Linen Pria Oversize Lengan Panjang"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Merek / Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Contoh: Kalasen (atau Tanpa Merek)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Kategori Shopee</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductLaunchCategory)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Fashion & Pakaian">Fashion & Pakaian</option>
                  <option value="Tas & Aksesoris">Tas & Aksesoris</option>
                  <option value="Elektronik & Gadget">Elektronik & Gadget</option>
                  <option value="Kecantikan & Perawatan">Kecantikan & Perawatan</option>
                  <option value="Rumah Tangga & Dapur">Rumah Tangga & Dapur</option>
                  <option value="Sembako & Kebutuhan Pokok">Sembako & Kebutuhan Pokok</option>
                  <option value="Umum / Lainnya">Umum / Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Subkategori</label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="Contoh: Atasan Pria / Kemeja"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Jenis Produk</label>
                <input
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="Contoh: Kemeja Kasual Santai"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Card B: Spesifikasi Produk Dinamis Sesuai Kategori */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-orange-400" />
                <span>B. Spesifikasi Produk ({category})</span>
              </h2>
              <span className="text-[10px] text-slate-500">Opsional sesuai produk</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Bahan / Material</label>
                <input
                  type="text"
                  value={bahan}
                  onChange={(e) => setBahan(e.target.value)}
                  placeholder="Katun Linen Rami"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Warna / Varian</label>
                <input
                  type="text"
                  value={warna}
                  onChange={(e) => setWarna(e.target.value)}
                  placeholder="Sage Green, Hitam"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Ukuran / Size</label>
                <input
                  type="text"
                  value={ukuran}
                  onChange={(e) => setUkuran(e.target.value)}
                  placeholder="M, L, XL"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {category === 'Fashion & Pakaian' && (
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Lingkar Dada (LD)</label>
                  <input
                    type="text"
                    value={lingkarDada}
                    onChange={(e) => setLingkarDada(e.target.value)}
                    placeholder="108 - 116 cm"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Panjang</label>
                <input
                  type="text"
                  value={panjang}
                  onChange={(e) => setPanjang(e.target.value)}
                  placeholder="74 cm"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {(category === 'Tas & Aksesoris' || category === 'Elektronik & Gadget' || category === 'Rumah Tangga & Dapur') && (
                <>
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Lebar</label>
                    <input
                      type="text"
                      value={lebar}
                      onChange={(e) => setLebar(e.target.value)}
                      placeholder="15 cm"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Tinggi</label>
                    <input
                      type="text"
                      value={tinggi}
                      onChange={(e) => setTinggi(e.target.value)}
                      placeholder="30 cm"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Kapasitas</label>
                    <input
                      type="text"
                      value={kapasitas}
                      onChange={(e) => setKapasitas(e.target.value)}
                      placeholder="20 Liter / 10.000 mAh"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Berat Produk (gram)</label>
                <input
                  type="number"
                  value={beratGrams || ''}
                  onChange={(e) => setBeratGrams(Number(e.target.value))}
                  placeholder="250"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Isi / Kemasan</label>
                <input
                  type="text"
                  value={isiQuantity}
                  onChange={(e) => setIsiQuantity(e.target.value)}
                  placeholder="1 pcs"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Model / Potongan</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Oversized Casual"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Fitur Utama (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={fiturInput}
                  onChange={(e) => setFiturInput(e.target.value)}
                  placeholder="Bahan adem, Jahitan rapi, Kancing batok kelapa"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Card C: SEO & Target Pembeli */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Search className="h-4 w-4 text-orange-400" />
                <span>C. Kata Kunci & Target Pembeli (SEO)</span>
              </h2>
              <span className="text-[10px] text-emerald-400 font-semibold">Bebas Kata Kunci Palsu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Kata Kunci Utama <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                  placeholder="Kemeja Linen Pria"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Target Pembeli</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Pria Dewasa & Mahasiswa"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Kata Kunci Tambahan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={secondaryKeywordsText}
                  onChange={(e) => setSecondaryKeywordsText(e.target.value)}
                  placeholder="Kemeja Kasual Santai, Atasan Pria Aesthetic, Baju Kemeja Polos"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Keunggulan Produk / Nilai Jual (Satu per baris)
                </label>
                <textarea
                  rows={3}
                  value={uspText}
                  onChange={(e) => setUspText(e.target.value)}
                  placeholder="Bahan 100% linen rami serat alami yang sejuk dan menyerap keringat&#10;Fitting modern relaxed oversize yang stylish&#10;Warna pastel natural earthy tone yang mudah dipadukan"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-sans"
                />
              </div>
            </div>
          </div>

          {/* Card D: HPP, Biaya Toko & Target Harga Pembeli */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-400" />
                <span>D. HPP, Biaya Toko & Target Harga Pembeli</span>
              </h2>
              <span className="text-[10px] text-orange-400 font-bold">True Profit Single Source</span>
            </div>

            {/* Target Buyer Price Hero Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-xl border border-orange-500/30 bg-orange-950/20">
              <div>
                <label className="text-xs text-orange-300 font-bold block mb-1 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-orange-400" />
                  <span>🎯 Harga yang Dilihat / Dibayar Pembeli</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-orange-400 font-bold">Rp</span>
                  <input
                    type="number"
                    value={targetBuyerPrice || ''}
                    onChange={(e) => setTargetBuyerPrice(Number(e.target.value))}
                    placeholder="55000"
                    className="w-full rounded-xl border border-orange-500/40 bg-slate-950 pl-9 pr-3 py-2 text-sm text-white font-mono font-black focus:outline-none focus:border-orange-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Harga final checkout yang dilihat pembeli. Bukan harga listing awal.
                </span>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  Diskon Promosi Seller (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={sellerDiscountPercent}
                    onChange={(e) => setSellerDiscountPercent(Number(e.target.value))}
                    placeholder="10"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pr-8 pl-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-500 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Diskon coret yang dipasang di Seller Center (0% s.d. 99%).
                </span>
              </div>
            </div>

            {/* HPP & Operating Costs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Modal Produk (HPP) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={hpp || ''}
                    onChange={(e) => setHpp(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Packing</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={packingCost || ''}
                    onChange={(e) => setPackingCost(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Operasional Order</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={operationalCost || ''}
                    onChange={(e) => setOperationalCost(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Iklan Ads/Order</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={adsCostPerOrder || ''}
                    onChange={(e) => setAdsCostPerOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Status Toko</label>
                <select
                  value={sellerStatus}
                  onChange={(e) => setSellerStatus(e.target.value as SellerType)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="NON_STAR">Non-Star Seller</option>
                  <option value="STAR">Star Seller</option>
                  <option value="STAR_PLUS">Star+ Seller</option>
                  <option value="MALL">Shopee Mall</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Target Margin Sehat</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-orange-400 w-8">{targetMargin}%</span>
                </div>
              </div>
            </div>

            {/* Programs Active */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-[11px] text-slate-400 block font-semibold">
                Program Penjual Aktif:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={isFreeShippingXtraActive}
                    onChange={(e) => setIsFreeShippingXtraActive(e.target.checked)}
                    className="rounded accent-orange-500 h-4 w-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Gratis Ongkir XTRA</div>
                    <div className="text-[10px] text-slate-400">Cap Rp40.000</div>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={isPromoXtraActive}
                    onChange={(e) => setIsPromoXtraActive(e.target.checked)}
                    className="rounded accent-orange-500 h-4 w-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Promo XTRA</div>
                    <div className="text-[10px] text-slate-400">4.5% (Maks. Rp60rb)</div>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={isAffiliateActive}
                    onChange={(e) => setIsAffiliateActive(e.target.checked)}
                    className="rounded accent-orange-500 h-4 w-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Affiliate Shopee</div>
                    <div className="text-[10px] text-slate-400">{affiliatePercent}% Komisi</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: LIVE OUTPUT & LAUNCH PREVIEW (5 Cols)             */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Listing Quality Score & Compliance Check */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-4">
            {/* Quality Score Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-bold text-white">Listing Quality Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-base font-black font-mono px-2.5 py-0.5 rounded-lg ${
                    result.qualityScore >= 80
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : result.qualityScore >= 60
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {result.qualityScore} / 100
                </span>
                <button
                  type="button"
                  onClick={() => setShowScoreDetails(!showScoreDetails)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  {showScoreDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Quality Bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  result.qualityScore >= 80
                    ? 'bg-emerald-500'
                    : result.qualityScore >= 60
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${result.qualityScore}%` }}
              />
            </div>

            {/* Quality Score Details Accordion */}
            {showScoreDetails && (
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                {result.qualityComponents.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-300 font-mono">
                    <span className="text-[11px] text-slate-400">{c.label}</span>
                    <span className="font-bold text-white">
                      {c.score}/{c.maxScore}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Shopee Compliance Check Badge & Toggle */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-400" />
                <span className="text-xs font-bold text-slate-300">Pemeriksaan Listing Shopee:</span>
              </div>
              <button
                type="button"
                onClick={() => setShowComplianceDetails(!showComplianceDetails)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  result.compliancePassed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {result.compliancePassed ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>🟢 Memenuhi Pemeriksaan</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>🔴 Perlu Diperbaiki</span>
                  </>
                )}
                {showComplianceDetails ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
              </button>
            </div>

            {/* Compliance Details List */}
            {showComplianceDetails && (
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                {result.complianceChecks.map((check) => (
                  <div key={check.id} className="flex items-start gap-2 py-1 border-b border-slate-900 last:border-none">
                    {check.passed ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className={`font-semibold ${check.passed ? 'text-slate-300' : 'text-rose-300'}`}>
                        {check.label}
                      </span>
                      <p className="text-[10px] text-slate-500">{check.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Harga Pasang di Shopee & True Profit Waterfall */}
          <div className="rounded-2xl border border-orange-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                <span>Hasil Inverse Pricing & Profit</span>
              </span>
              <span className="text-[10px] font-mono rounded bg-orange-500/20 px-2 py-0.5 text-orange-300 font-bold">
                Shopee Ready
              </span>
            </div>

            {/* Hero 1: Harga Listing / Coret */}
            <div className="rounded-2xl border-2 border-orange-500/50 bg-gradient-to-r from-orange-950/40 to-slate-900 p-4 space-y-1 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-orange-300 font-bold flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-orange-400" />
                  <span>💰 HARGA YANG HARUS DIPASANG DI SHOPEE</span>
                </span>
                <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-bold">
                  Harga Normal Coret
                </span>
              </div>
              <div className="text-3xl font-black text-white font-mono tracking-tight pt-1">
                Rp {result.pricing.requiredListingPrice.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-300 pt-0.5">
                Pasang harga listing ini di Seller Centre agar setelah diskon seller {sellerDiscountPercent}% pembeli membayar tepat target.
              </p>
            </div>

            {/* Flow Arrow & Seller Discount */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-orange-400 py-0.5">
              <ArrowDown className="h-4 w-4 animate-bounce" />
              <span>Diskon Seller {sellerDiscountPercent}% (-Rp {result.pricing.sellerDiscountAmount.toLocaleString('id-ID')})</span>
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </div>

            {/* Hero 2: Harga Dibayar Pembeli */}
            <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 to-slate-900 p-4 space-y-1 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  <span>🎯 HARGA YANG DIBAYAR PEMBELI</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  Target Checkout
                </span>
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight pt-1">
                Rp {result.pricing.actualBuyerPrice.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-300 pt-0.5">
                Harga checkout akhir yang dilihat dan dibayar oleh pembeli di Shopee.
              </p>
            </div>

            {/* Recommended Buyer Price Advisory (Section 14) */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Rekomendasi Harga Pembeli (Target {targetMargin}%)</span>
                <span className="font-bold font-mono text-emerald-400">
                  Rp {result.recommendedBuyerPrice.toLocaleString('id-ID')}
                </span>
              </div>
              {result.isBelowRecommended ? (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Target pembeli Rp {targetBuyerPrice.toLocaleString('id-ID')} berada di bawah rekomendasi margin {targetMargin}%.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Target harga pembeli memenuhi target margin sehat {targetMargin}%.</span>
                </div>
              )}
            </div>

            {/* True Profit Waterfall Breakdown (Section 8) */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-300 pb-1 border-b border-slate-800 font-bold">
                <span className="uppercase tracking-wider">True Profit Waterfall</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    result.pricing.breakdown.profitStatus === 'PROFITABLE'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : result.pricing.breakdown.profitStatus === 'LOW_MARGIN'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {result.pricing.breakdown.profitStatus === 'PROFITABLE'
                    ? '🟢 PROFIT'
                    : result.pricing.breakdown.profitStatus === 'LOW_MARGIN'
                    ? '🟡 MARGIN RENDAH'
                    : '🔴 LOSS'}
                </span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Harga pembeli</span>
                <span className="font-bold text-white">Rp {result.pricing.breakdown.buyerPrice.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-rose-400">
                <span>Potongan Shopee (Admin & Fee)</span>
                <span>-Rp {result.pricing.breakdown.marketplaceFees.toLocaleString('id-ID')}</span>
              </div>

              {result.pricing.breakdown.programFees > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Biaya program (XTRA)</span>
                  <span>-Rp {result.pricing.breakdown.programFees.toLocaleString('id-ID')}</span>
                </div>
              )}

              {result.pricing.breakdown.affiliateFees > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Affiliate Shopee</span>
                  <span>-Rp {result.pricing.breakdown.affiliateFees.toLocaleString('id-ID')}</span>
                </div>
              )}

              {result.pricing.breakdown.adsCost > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Biaya Iklan</span>
                  <span>-Rp {result.pricing.breakdown.adsCost.toLocaleString('id-ID')}</span>
                </div>
              )}

              {result.pricing.breakdown.returnReserve > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Cadangan retur / refund</span>
                  <span>-Rp {result.pricing.breakdown.returnReserve.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between text-rose-400">
                <span>Pajak (PPh / PPN)</span>
                <span>-Rp {result.pricing.breakdown.taxes.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-rose-400">
                <span>HPP (Modal Dasar)</span>
                <span>-Rp {result.pricing.breakdown.cogsHpp.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-rose-400">
                <span>Packing & Operasional</span>
                <span>
                  -Rp {(result.pricing.breakdown.packingCost + result.pricing.breakdown.operationalCost).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-sans font-bold text-sm">
                <span className="text-white">Estimasi Laba Bersih</span>
                <span className={result.pricing.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  Rp {result.pricing.profit.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Margin Bersih</span>
                <span className="font-bold text-white font-mono">{result.pricing.margin}%</span>
              </div>
            </div>
          </div>

          {/* Card 3: SEO Title Recommendations (Section 9) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-orange-400" />
                <span>Judul Produk Shopee yang Direkomendasikan</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activeTitle, 'title')}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-bold"
              >
                {copiedKey === 'title' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'title' ? 'Tersalin!' : 'Copy Judul'}</span>
              </button>
            </div>

            {/* 3 Tabs: SEO Utama, Natural, Conversion */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedTitleMode('seoUtama')}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  selectedTitleMode === 'seoUtama' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. SEO Utama
              </button>
              <button
                type="button"
                onClick={() => setSelectedTitleMode('seoNatural')}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  selectedTitleMode === 'seoNatural' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. SEO Natural
              </button>
              <button
                type="button"
                onClick={() => setSelectedTitleMode('seoConversion')}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  selectedTitleMode === 'seoConversion' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Conversion
              </button>
            </div>

            {/* Active Title Box */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <div className="text-xs font-bold text-white leading-relaxed font-sans">{activeTitle}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                <span>Panjang: {activeTitle.length} / 100 karakter</span>
                <span className="text-emerald-400 font-medium">Sesuai Kebijakan Shopee</span>
              </div>
            </div>
          </div>

          {/* Card 4: Keyword Recommendations (Section 10) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Search className="h-4 w-4 text-orange-400" />
                <span>Keyword Recommendation</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    [result.keywords.primaryKeyword, ...result.keywords.secondaryKeywords, ...result.keywords.longTailKeywords].join(', '),
                    'keywords'
                  )
                }
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-bold"
              >
                {copiedKey === 'keywords' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'keywords' ? 'Tersalin!' : 'Copy Keyword'}</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Kata Kunci Utama:</span>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                  {result.keywords.primaryKeyword}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Kata Kunci Sekunder:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords.secondaryKeywords.map((k, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-semibold mb-1">Long-tail & Intent:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords.longTailKeywords.slice(0, 3).map((k, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 text-[10px]">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Product Description Preview (Section 11) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-orange-400" />
                <span>Deskripsi Shopee Siap Pakai</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(result.productDescription, 'desc')}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-bold"
              >
                {copiedKey === 'desc' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'desc' ? 'Tersalin!' : 'Copy Deskripsi'}</span>
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300 whitespace-pre-line font-mono leading-relaxed">
              {result.productDescription}
            </div>
          </div>

          {/* Bottom Action Bar: Copy All & Save to Catalog */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 text-xs font-bold text-white transition active:scale-98"
            >
              {copiedKey === 'all' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copiedKey === 'all' ? 'Seluruh Output Listing Tersalin!' : 'Copy Semua Output Shopee'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToCatalog}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition active:scale-98"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Tersimpan di Katalog Toko!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Produk ke Katalog Toko</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
