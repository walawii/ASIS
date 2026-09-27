/**
 * ASIS SELLER - Product Launch Assistant Engine
 * 
 * Logic engine for Shopee Product Creation:
 * 1. SEO Title Generator (3 variations: SEO Utama, Natural, Conversion)
 * 2. Keyword Recommendations (Primary, Secondary, Long-tail, Intent)
 * 3. Structured Product Description Generator
 * 4. Shopee Compliance Check (Anti-Spam, Anti-Competitor, No WhatsApp/Links)
 * 5. Listing Quality Score (0 - 100 based on actual completeness)
 * 6. True Profit Engine Integration for Buyer Price & Inverse Pricing
 */

import {
  ProductLaunchInput,
  ProductLaunchResult,
  SeoTitleOptions,
  KeywordRecommendations,
  ComplianceCheckItem,
  QualityScoreComponent,
  ProductLaunchSpecifications,
} from '../../types/productLaunch.ts';
import { calculateListingPriceFromBuyerPrice } from '../profitEngine/index.ts';
import { calculateTargetPrice } from '../profitEngine/index.ts';
import { MarketplaceFeeRule, SellerProgramRule, TaxProfile } from '../../types/rules.ts';
import {
  findApplicableFeeRule,
  calculateOrderProcessingFee,
  INITIAL_PROGRAM_RULES,
} from '../feeEngine/index.ts';

// Known competitor brands list for compliance checking
const COMPETITOR_BRANDS = [
  'zara',
  'h&m',
  'uniqlo',
  'apple',
  'samsung',
  'xiaomi',
  'oppo',
  'vivo',
  'nike',
  'adidas',
  'erigo',
  'gucci',
  'louis vuitton',
  'chanel',
  'dior',
  'prada',
  'somethinc',
  'scarlett',
  'wardah',
  'skintific',
];

// Prohibited hyperbolic claims on Shopee
const PROHIBITED_CLAIMS = [
  'termurah',
  'terbaik',
  'no 1',
  'no.1',
  'nomor 1',
  'best seller',
  '100% terbaik',
  'paling murah',
  'termurah sedunia',
  'pasti sembuh',
  'garansi kaya',
  'original 1000%',
];

/**
 * Pembersih string dari karakter spesial berlebihan dan klaim terlarang
 */
function cleanText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Filter kata-kata terlarang dan tanda baca aneh dari judul
 */
function sanitizeForTitle(text: string): string {
  let cleaned = text;
  // Hapus hashtag (#) dan simbol berlebihan
  cleaned = cleaned.replace(/[#@$%^*+=_{}[\]|\\<>~`]/g, ' ');
  // Hapus indikator harga dan diskon
  cleaned = cleaned.replace(/\b(rp\s*\d+|\d+k|diskon\s*\d+%?|free\s*ongkir|murah)\b/gi, '');
  // Hapus klaim bombastis
  for (const claim of PROHIBITED_CLAIMS) {
    const reg = new RegExp(`\\b${claim}\\b`, 'gi');
    cleaned = cleaned.replace(reg, '');
  }
  return cleanText(cleaned);
}

/**
 * 1. SEO TITLE GENERATOR
 * Menghasilkan 3 varian judul Shopee yang relevan, natural, dan bebas spam.
 */
export function generateSeoTitles(input: ProductLaunchInput): SeoTitleOptions {
  const { productName, brand, specifications, seo } = input;

  const cleanBrand = brand && brand.toLowerCase() !== 'no brand' && brand.toLowerCase() !== 'tanpa merek'
    ? sanitizeForTitle(brand)
    : '';
  const cleanName = sanitizeForTitle(productName) || 'Produk Baru';
  const cleanKeyword = sanitizeForTitle(seo.primaryKeyword || '');

  // Ekstrak atribut spesifikasi penting
  const specParts: string[] = [];
  if (specifications.bahan) specParts.push(specifications.bahan);
  if (specifications.model) specParts.push(specifications.model);
  if (specifications.warna) specParts.push(specifications.warna);
  if (specifications.ukuran) specParts.push(specifications.ukuran);
  if (specifications.kapasitas) specParts.push(specifications.kapasitas);

  const cleanSpecs = specParts.map(s => sanitizeForTitle(s)).filter(Boolean).slice(0, 3).join(' ');

  // 1. SEO Utama (Struktur Algoritma Shopee: [Merek] [Nama Produk] [Spesifikasi Utama] [Keyword])
  let t1Parts: string[] = [];
  if (cleanBrand) t1Parts.push(cleanBrand);
  t1Parts.push(cleanName);
  if (cleanSpecs && !cleanName.toLowerCase().includes(cleanSpecs.toLowerCase())) {
    t1Parts.push(cleanSpecs);
  }
  if (cleanKeyword && !cleanName.toLowerCase().includes(cleanKeyword.toLowerCase())) {
    t1Parts.push(cleanKeyword);
  }
  let seoUtama = cleanText(t1Parts.join(' '));
  if (seoUtama.length > 100) seoUtama = seoUtama.substring(0, 97) + '...';

  // 2. SEO Natural (Alur Baca Manusia: [Nama Produk] [Bahan/Model] - [Fitur/Kenyamanan] [Ukuran])
  let t2Parts: string[] = [];
  t2Parts.push(cleanName);
  if (specifications.bahan && !cleanName.toLowerCase().includes(specifications.bahan.toLowerCase())) {
    t2Parts.push(`Bahan ${sanitizeForTitle(specifications.bahan)}`);
  }
  if (specifications.warna || specifications.ukuran) {
    const sizeColor = [specifications.ukuran, specifications.warna].filter(Boolean).join(' ');
    t2Parts.push(`- ${sizeColor}`);
  }
  if (cleanKeyword && !cleanName.toLowerCase().includes(cleanKeyword.toLowerCase())) {
    t2Parts.push(`| ${cleanKeyword}`);
  }
  let seoNatural = cleanText(t2Parts.join(' '));
  if (seoNatural.length > 100) seoNatural = seoNatural.substring(0, 97) + '...';

  // 3. SEO Conversion (Fokus Konversi & Manfaat: [Merek ? Merek + ' ' : ''][Nama Produk] [Fitur Utama] Cocok untuk [Target])
  let t3Parts: string[] = [];
  if (cleanBrand) t3Parts.push(cleanBrand);
  t3Parts.push(cleanName);
  if (specifications.fiturUtama && specifications.fiturUtama.length > 0) {
    t3Parts.push(sanitizeForTitle(specifications.fiturUtama[0]));
  }
  if (seo.targetAudience) {
    t3Parts.push(`Cocok untuk ${sanitizeForTitle(seo.targetAudience)}`);
  }
  let seoConversion = cleanText(t3Parts.join(' '));
  if (seoConversion.length > 100) seoConversion = seoConversion.substring(0, 97) + '...';

  return {
    seoUtama,
    seoNatural,
    seoConversion,
    selectedTitle: seoUtama,
  };
}

/**
 * 2. KEYWORD RECOMMENDATION
 * Mengorganisasikan kata kunci nyata tanpa mengarang volume pencarian palsu.
 */
export function generateKeywordRecommendations(input: ProductLaunchInput): KeywordRecommendations {
  const { productName, category, specifications, seo } = input;

  const primaryKeyword = cleanText(seo.primaryKeyword) || cleanText(productName);

  // Kata kunci sekunder yang valid dari input
  const secondaryKeywords: string[] = [];
  if (seo.secondaryKeywords && seo.secondaryKeywords.length > 0) {
    seo.secondaryKeywords.forEach(k => {
      const c = cleanText(k);
      if (c && !secondaryKeywords.includes(c)) secondaryKeywords.push(c);
    });
  }

  // Tambahkan atribut spesifikasi sebagai keyword sekunder pendukung
  if (specifications.bahan) secondaryKeywords.push(`${primaryKeyword} ${cleanText(specifications.bahan)}`);
  if (specifications.model) secondaryKeywords.push(`${cleanText(specifications.model)} ${primaryKeyword}`);
  if (specifications.warna) secondaryKeywords.push(`${primaryKeyword} warna ${cleanText(specifications.warna)}`);

  // Long-tail keywords (Kombinasi Spesifik)
  const longTailKeywords: string[] = [];
  if (specifications.bahan && specifications.ukuran) {
    longTailKeywords.push(`${primaryKeyword} bahan ${cleanText(specifications.bahan)} ukuran ${cleanText(specifications.ukuran)}`);
  }
  if (seo.targetAudience) {
    longTailKeywords.push(`${primaryKeyword} untuk ${cleanText(seo.targetAudience)}`);
  }
  if (specifications.fiturUtama && specifications.fiturUtama.length > 0) {
    longTailKeywords.push(`${primaryKeyword} ${cleanText(specifications.fiturUtama[0])}`);
  }
  longTailKeywords.push(`rekomendasi ${primaryKeyword} kualitas bagus`);

  // Buyer Intent Phrases (Frasa Niat Beli)
  const buyerIntentPhrases: string[] = [
    `Beli ${primaryKeyword} berkualitas`,
    `Toko jual ${primaryKeyword} ${category.toLowerCase()}`,
    `${primaryKeyword} harian awet dan nyaman`,
  ];
  if (seo.targetAudience) {
    buyerIntentPhrases.push(`Pilihan ${primaryKeyword} terbaik untuk ${cleanText(seo.targetAudience)}`);
  }

  // Keyword Suggestions untuk Optimasi Deskripsi
  const keywordSuggestions: string[] = [
    primaryKeyword,
    ...secondaryKeywords.slice(0, 3),
    ...longTailKeywords.slice(0, 2),
  ];

  return {
    primaryKeyword,
    secondaryKeywords: Array.from(new Set(secondaryKeywords)),
    longTailKeywords: Array.from(new Set(longTailKeywords)),
    buyerIntentPhrases,
    keywordSuggestions: Array.from(new Set(keywordSuggestions)),
  };
}

/**
 * 3. FORMAT SPESIFIKASI PRODUK
 * Mengompilasi spesifikasi yang benar-benar diisi tanpa mengarang.
 */
export function formatSpecifications(specs: ProductLaunchSpecifications): string {
  const lines: string[] = [];

  if (specs.bahan) lines.push(`- Bahan / Material: ${cleanText(specs.bahan)}`);
  if (specs.model) lines.push(`- Model / Desain: ${cleanText(specs.model)}`);
  if (specs.motif) lines.push(`- Motif / Pola: ${cleanText(specs.motif)}`);
  if (specs.warna) lines.push(`- Pilihan Warna: ${cleanText(specs.warna)}`);
  if (specs.ukuran) lines.push(`- Ukuran / Size: ${cleanText(specs.ukuran)}`);
  if (specs.lingkarDada) lines.push(`- Lingkar Dada (LD): ${cleanText(specs.lingkarDada)}`);
  if (specs.panjang) lines.push(`- Panjang: ${cleanText(specs.panjang)}`);
  if (specs.lebar) lines.push(`- Lebar: ${cleanText(specs.lebar)}`);
  if (specs.tinggi) lines.push(`- Tinggi: ${cleanText(specs.tinggi)}`);
  if (specs.kapasitas) lines.push(`- Kapasitas: ${cleanText(specs.kapasitas)}`);
  if (specs.beratGrams && specs.beratGrams > 0) lines.push(`- Berat Produk: ${specs.beratGrams} gram`);
  if (specs.isiQuantity) lines.push(`- Isi per Kemasan: ${cleanText(specs.isiQuantity)}`);
  if (specs.varian) lines.push(`- Varian: ${cleanText(specs.varian)}`);
  if (specs.fiturUtama && specs.fiturUtama.length > 0) {
    lines.push(`- Fitur Utama: ${specs.fiturUtama.map(f => cleanText(f)).join(', ')}`);
  }

  if (lines.length === 0) {
    return 'Spesifikasi detail belum dilengkapi oleh seller.';
  }

  return lines.join('\n');
}

/**
 * 4. PRODUCT DESCRIPTION GENERATOR
 * Menghasilkan deskripsi terstruktur sesuai standar e-commerce Shopee.
 */
export function generateProductDescription(input: ProductLaunchInput): string {
  const { productName, brand, category, specifications, seo } = input;

  const brandPrefix = brand && brand.toLowerCase() !== 'no brand' && brand.toLowerCase() !== 'tanpa merek'
    ? `${brand} - `
    : '';

  const titleHeader = `[${brandPrefix}${productName.toUpperCase()}]`;

  // Ringkasan Produk
  let summary = `${productName} dirancang khusus untuk memenuhi kebutuhan Anda pada kategori ${category}.`;
  if (specifications.bahan) {
    summary += ` Dibuat menggunakan bahan ${specifications.bahan} yang nyaman dan berkualitas untuk pemakaian optimal.`;
  }
  if (seo.targetAudience) {
    summary += ` Sangat cocok digunakan oleh ${seo.targetAudience}.`;
  }

  // Keunggulan Produk (USP)
  let uspSection = '⭐ Keunggulan Produk:\n';
  if (seo.keySellingPoints && seo.keySellingPoints.length > 0) {
    uspSection += seo.keySellingPoints
      .map(p => `- ${cleanText(p)}`)
      .join('\n');
  } else {
    uspSection += `- Material berkualitas pilihan yang nyaman digunakan sehari-hari\n`;
    uspSection += `- Desain fungsional dan rapi sesuai standar kualitas terpercaya\n`;
    uspSection += `- Produk ready stock siap dipacking aman dan dikirim cepat`;
  }

  // Spesifikasi Terformat
  const specSection = `📋 Spesifikasi Produk:\n${formatSpecifications(specifications)}`;

  // Isi Paket
  const packageContent = specifications.isiQuantity
    ? `1x ${productName} (${specifications.isiQuantity})`
    : `1x ${productName} (Sesuai varian & ukuran yang dipilih)`;

  // Cocok Untuk
  const audienceText = seo.targetAudience
    ? `${seo.targetAudience} yang menginginkan ${productName} berkualitas untuk kebutuhan sehari-hari maupun acara khusus.`
    : `Pengguna yang membutuhkan produk berkualitas dengan pemakaian praktis dan nyaman.`;

  // Catatan Toko & Kebijakan
  const notes = [
    '- Mohon pastikan varian, ukuran, dan alamat pengiriman sudah benar sebelum melakukan checkout.',
    '- Toleransi perbedaan ukuran 1-2 cm dapat terjadi karena proses pengukuran manual pabrikasi.',
    '- Warna asli produk mungkin sedikit berbeda akibat pencahayaan foto dan pengaturan layar monitor Anda.',
    '- Untuk klaim komplain kekurangan/kerusakan produk, WAJIB menyertakan video unboxing paket tanpa jeda sejak awal diterima.',
  ].join('\n');

  return [
    titleHeader,
    '',
    '✨ Ringkasan Produk',
    summary,
    '',
    uspSection,
    '',
    specSection,
    '',
    '📦 Isi Paket',
    packageContent,
    '',
    '👤 Cocok Untuk',
    audienceText,
    '',
    '📌 Catatan Penting',
    notes,
  ].join('\n');
}

/**
 * 5. SHOPEE COMPLIANCE CHECK
 * Memvalidasi apakah listing aman dari pelanggaran kebijakan Shopee.
 */
export function runShopeeComplianceCheck(
  input: ProductLaunchInput,
  titles: SeoTitleOptions,
  description: string
): ComplianceCheckItem[] {
  const { productName, brand, seo, financial } = input;
  const fullText = `${titles.selectedTitle} ${description} ${seo.primaryKeyword} ${(seo.secondaryKeywords || []).join(' ')}`.toLowerCase();

  const checks: ComplianceCheckItem[] = [];

  // 1. Nama produk relevan & tersedia
  checks.push({
    id: 'name_relevance',
    label: 'Nama produk relevan & terisi jelas',
    passed: productName.trim().length >= 5,
    details: productName.trim().length >= 5 ? 'Nama produk memenuhi syarat panjang minimum.' : 'Nama produk terlalu pendek (minimal 5 karakter).',
  });

  // 2. Keyword relevan
  checks.push({
    id: 'keyword_relevance',
    label: 'Kata kunci utama relevan dengan nama produk',
    passed: seo.primaryKeyword.trim().length > 0,
    details: seo.primaryKeyword.trim().length > 0 ? 'Kata kunci utama terisi dan siap dioptimalkan.' : 'Kata kunci utama belum diisi seller.',
  });

  // 3. Tidak ada keyword spam / stuffing
  const wordCounts: Record<string, number> = {};
  const words = titles.selectedTitle.toLowerCase().split(/\s+/);
  words.forEach(w => {
    if (w.length > 3) wordCounts[w] = (wordCounts[w] || 0) + 1;
  });
  const hasSpam = Object.values(wordCounts).some(count => count > 3);
  checks.push({
    id: 'anti_keyword_stuffing',
    label: 'Bebas dari penumpukan kata kunci (Keyword Stuffing)',
    passed: !hasSpam,
    details: !hasSpam ? 'Judul menggunakan susunan kata natural tanpa pengulangan berlebih.' : 'Judul mengandung kata yang berulang lebih dari 3 kali.',
  });

  // 4. Tidak ada merek pesaing yang tidak relevan
  const userBrandLower = (brand || '').toLowerCase();
  const detectedCompetitors = COMPETITOR_BRANDS.filter(b => fullText.includes(b) && b !== userBrandLower);
  checks.push({
    id: 'anti_competitor_brand',
    label: 'Bebas dari pencantuman merek kompetitor tanpa izin',
    passed: detectedCompetitors.length === 0,
    details: detectedCompetitors.length === 0
      ? 'Tidak terdeteksi merek kompetitor pada judul dan deskripsi.'
      : `Terdeteksi merek lain: "${detectedCompetitors.join(', ')}". Hapus untuk menghindari banned Shopee.`,
  });

  // 5. Tidak ada klaim berlebihan / bombastis
  const detectedClaims = PROHIBITED_CLAIMS.filter(c => fullText.includes(c));
  checks.push({
    id: 'anti_hyperbolic_claims',
    label: 'Bebas dari klaim berlebihan / bombastis (No.1, Termurah, dll)',
    passed: detectedClaims.length === 0,
    details: detectedClaims.length === 0
      ? 'Listing tidak menggunakan klaim dilarang sesuai ketentuan iklan Shopee.'
      : `Ditemukan klaim dilarang: "${detectedClaims.join(', ')}". Shopee melarang klaim superlatif tanpa bukti.`,
  });

  // 6. Tidak ada kontak WhatsApp / nomor telepon
  const hasPhoneOrWa = /(whatsapp|wa\.me|\b08\d{8,11}\b|\+62\d{8,11}\b)/i.test(fullText);
  checks.push({
    id: 'no_external_contacts',
    label: 'Bebas dari nomor kontak / WhatsApp pribadi',
    passed: !hasPhoneOrWa,
    details: !hasPhoneOrWa
      ? 'Tidak ditemukan nomor telepon atau ajakan transaksi di luar Shopee.'
      : 'Ditemukan kontak telepon/WhatsApp! Shopee melarang keras transaksi offline di luar platform.',
  });

  // 7. Tidak ada link keluar platform Shopee
  const hasExternalLinks = /(https?:\/\/|www\.|bit\.ly|tiktok\.com|tokopedia\.com|instagram\.com)/i.test(fullText);
  checks.push({
    id: 'no_external_links',
    label: 'Bebas dari link eksternal / medsos keluar Shopee',
    passed: !hasExternalLinks,
    details: !hasExternalLinks
      ? 'Tidak terdapat URL atau tautan ke situs luar.'
      : 'Ditemukan link eksternal. Semua transaksi harus dilakukan di dalam aplikasi Shopee.',
  });

  // 8. Deskripsi sesuai spesifikasi
  checks.push({
    id: 'description_quality',
    label: 'Deskripsi lengkap mencakup spesifikasi & isi paket',
    passed: description.includes('📋 Spesifikasi') && description.includes('📦 Isi Paket'),
    details: 'Deskripsi telah mencakup ringkasan, spesifikasi, dan keunggulan produk secara terstruktur.',
  });

  // 9. Harga target pembeli tersedia & valid
  checks.push({
    id: 'price_validity',
    label: 'Harga target pembeli terdefinisi & lebih dari Rp 0',
    passed: financial.targetBuyerPrice > 0,
    details: financial.targetBuyerPrice > 0
      ? `Harga target pembeli terpasang: Rp ${financial.targetBuyerPrice.toLocaleString('id-ID')}`
      : 'Target harga pembeli belum diisi atau bernilai 0.',
  });

  // 10. HPP (Modal Dasar) tersedia & valid
  checks.push({
    id: 'hpp_validity',
    label: 'Modal dasar (HPP) terdefinisi untuk analisis profit',
    passed: financial.hpp > 0,
    details: financial.hpp > 0
      ? `HPP terpasang: Rp ${financial.hpp.toLocaleString('id-ID')}`
      : 'HPP belum diisi. Wajib diisi agar True Profit Engine dapat menghitung keuntungan.',
  });

  // 11. Kategori marketplace terdefinisi
  checks.push({
    id: 'category_validity',
    label: 'Kategori produk Shopee valid',
    passed: !!input.category && input.category.length > 0,
    details: `Kategori terpilih: ${input.category}`,
  });

  return checks;
}

/**
 * 6. PRODUCT QUALITY SCORE (0 - 100)
 * Evaluasi objektif berdasarkan kelengkapan informasi riil.
 */
export function calculateListingQualityScore(
  input: ProductLaunchInput,
  complianceChecks: ComplianceCheckItem[],
  pricing: any
): { score: number; components: QualityScoreComponent[] } {
  const components: QualityScoreComponent[] = [];

  // Komponen 1: Kelengkapan Identitas Produk (15 Poin)
  let identityScore = 0;
  if (input.productName.trim().length >= 10) identityScore += 6;
  if (input.brand && input.brand.trim().length > 0) identityScore += 3;
  if (input.category) identityScore += 3;
  if (input.subCategory) identityScore += 3;
  components.push({
    label: 'Kelengkapan Identitas Produk',
    score: identityScore,
    maxScore: 15,
    feedback: identityScore === 15 ? 'Identitas produk lengkap.' : 'Lengkapi merek dan subkategori untuk skor maksimal.',
  });

  // Komponen 2: Spesifikasi Produk (20 Poin)
  let specScore = 0;
  const s = input.specifications;
  if (s.bahan) specScore += 4;
  if (s.warna || s.motif) specScore += 4;
  if (s.ukuran || s.lingkarDada || s.panjang) specScore += 4;
  if (s.beratGrams && s.beratGrams > 0) specScore += 4;
  if (s.fiturUtama && s.fiturUtama.length > 0) specScore += 4;
  components.push({
    label: 'Kelengkapan Spesifikasi Produk',
    score: specScore,
    maxScore: 20,
    feedback: specScore >= 16 ? 'Spesifikasi sangat mendalam.' : 'Tambahkan bahan, dimensi, dan berat untuk mempermudah pembeli.',
  });

  // Komponen 3: Kata Kunci & SEO (15 Poin)
  let seoScore = 0;
  if (input.seo.primaryKeyword.trim().length >= 4) seoScore += 6;
  if (input.seo.secondaryKeywords && input.seo.secondaryKeywords.length >= 2) seoScore += 4;
  if (input.seo.targetAudience) seoScore += 3;
  if (input.seo.searchIntent) seoScore += 2;
  components.push({
    label: 'Optimasi SEO & Keyword',
    score: seoScore,
    maxScore: 15,
    feedback: seoScore === 15 ? 'Riset kata kunci dan target pembeli matang.' : 'Tambahkan kata kunci sekunder dan target audiens.',
  });

  // Komponen 4: Optimasi Judul (15 Poin)
  let titleScore = 0;
  const title = input.productName;
  if (title.length >= 20 && title.length <= 100) titleScore += 8;
  if (input.seo.primaryKeyword && title.toLowerCase().includes(input.seo.primaryKeyword.toLowerCase())) titleScore += 4;
  if (!PROHIBITED_CLAIMS.some(c => title.toLowerCase().includes(c))) titleScore += 3;
  components.push({
    label: 'Kualitas Judul Shopee',
    score: titleScore,
    maxScore: 15,
    feedback: titleScore === 15 ? 'Judul terstruktur optimal dan bebas pelanggaran.' : 'Perpanjang judul dan sertakan kata kunci utama.',
  });

  // Komponen 5: Deskripsi Terstruktur (15 Poin)
  let descScore = 0;
  if (input.seo.keySellingPoints && input.seo.keySellingPoints.length >= 2) descScore += 6;
  if (specScore >= 8) descScore += 5;
  if (input.seo.targetAudience) descScore += 4;
  components.push({
    label: 'Kualitas Deskripsi Produk',
    score: descScore,
    maxScore: 15,
    feedback: descScore >= 12 ? 'Deskripsi informatif dan meyakinkan pembeli.' : 'Lengkapi poin keunggulan produk (USP).',
  });

  // Komponen 6: Kesehatan Finansial & Profitabilitas (10 Poin)
  let financeScore = 0;
  if (input.financial.targetBuyerPrice > 0) financeScore += 3;
  if (input.financial.hpp > 0) financeScore += 3;
  if (pricing && pricing.profit > 0 && pricing.margin >= 10) financeScore += 4;
  else if (pricing && pricing.profit > 0) financeScore += 2;
  components.push({
    label: 'Kesehatan Finansial & Margin',
    score: financeScore,
    maxScore: 10,
    feedback: financeScore === 10 ? 'Harga menghasilkan margin sehat di atas 10%.' : 'Periksa kembali HPP atau naikkan harga jual jika margin tipis.',
  });

  // Komponen 7: Kepatuhan Kebijakan Shopee (10 Poin)
  const failedCompliance = complianceChecks.filter(c => !c.passed).length;
  let complianceScore = Math.max(0, 10 - (failedCompliance * 2.5));
  components.push({
    label: 'Kepatuhan Aturan Shopee (Compliance)',
    score: complianceScore,
    maxScore: 10,
    feedback: failedCompliance === 0 ? 'Lolos seluruh pemeriksaan internal ASIS.' : `${failedCompliance} hal perlu diperbaiki sebelum upload.`,
  });

  const totalScore = Math.min(100, Math.round(components.reduce((acc, curr) => acc + curr.score, 0)));

  return {
    score: totalScore,
    components,
  };
}

/**
 * 7. REKOMENDASI HARGA PEMBELI (RECOMMENDED BUYER PRICE)
 * Menghitung harga pembeli yang menghasilkan target margin sehat (default 18%).
 */
export function calculateRecommendedBuyerPrice(
  financial: ProductLaunchInput['financial'],
  marketplaceRules?: MarketplaceFeeRule[],
  programRules?: SellerProgramRule[],
  taxProfile?: TaxProfile
): number {
  const {
    hpp,
    packingCost,
    operationalCost,
    adsCostPerOrder,
    targetMargin,
    sellerStatus,
    category,
    isFreeShippingXtraActive,
    isPromoXtraActive,
    isAffiliateActive,
    affiliatePercent,
  } = financial;

  // 1. Fixed overhead: processing fee berasal dari Fee Engine (bukan hardcoded 1250)
  const processingFeeResult = calculateOrderProcessingFee();
  const processingFee = processingFeeResult.feePerOrder;
  const fixedOverhead = packingCost + operationalCost + adsCostPerOrder + processingFee;

  // 2. Admin rate: diperoleh dari authoritative lookup Fee Engine (bukan default 8.25%)
  const applicableRule = findApplicableFeeRule(
    {
      sellerStatus: sellerStatus || 'STAR',
      category: category || 'Fashion & Pakaian',
    },
    marketplaceRules
  );
  const adminRate = applicableRule.percentage;

  // 3. Program rate: diperoleh dari programRules (bukan hardcoded 4.0 & 4.5)
  const effectiveProgramRules = programRules || INITIAL_PROGRAM_RULES;
  const fsRule = effectiveProgramRules.find((r) => r.code === 'FREE_SHIPPING_XTRA');
  const pxRule = effectiveProgramRules.find((r) => r.code === 'PROMO_XTRA');
  const fsRate = isFreeShippingXtraActive
    ? (fsRule?.categoryRules?.[category]?.rate ?? fsRule?.rate ?? 0)
    : 0;
  const pxRate = isPromoXtraActive
    ? (pxRule?.categoryRules?.[category]?.rate ?? pxRule?.rate ?? 0)
    : 0;
  const affRate = isAffiliateActive ? (affiliatePercent || 0) : 0;

  // 4. Tax rate: evaluasi tarif pajak (0.5% default UMKM)
  const taxRate = taxProfile?.taxScheme === 'UMKM Final' ? 0.5 : 0.5;

  const variableRate = adminRate + fsRate + pxRate + affRate + taxRate;

  const rec = calculateTargetPrice(hpp, fixedOverhead, variableRate, targetMargin || 18);
  return rec;
}

/**
 * 8. MAIN ORCHESTRATOR
 * Menggabungkan seluruh engine untuk menghasilkan output siap upload Shopee.
 */
export function processProductLaunch(
  input: ProductLaunchInput,
  marketplaceRules?: MarketplaceFeeRule[],
  programRules?: SellerProgramRule[],
  taxProfile?: TaxProfile
): ProductLaunchResult {
  // 1. Generate SEO Titles
  const seoTitles = generateSeoTitles(input);

  // 2. Generate Keywords
  const keywords = generateKeywordRecommendations(input);

  // 3. Generate Formatted Specs & Description
  const specificationsFormatted = formatSpecifications(input.specifications);
  const productDescription = generateProductDescription(input);

  // 4. Calculate Inverse Pricing & True Profit
  const pricing = calculateListingPriceFromBuyerPrice(
    {
      targetBuyerPrice: input.financial.targetBuyerPrice,
      sellerDiscountPercent: input.financial.sellerDiscountPercent,
      vouchers: [],
      hpp: input.financial.hpp,
      sellerType: input.financial.sellerStatus,
      category: input.financial.category,
      isFreeShippingXtraActive: input.financial.isFreeShippingXtraActive,
      isPromoXtraActive: input.financial.isPromoXtraActive,
      isPromoXtraPlusActive: input.financial.isPromoXtraPlusActive,
      isAffiliateActive: input.financial.isAffiliateActive,
      affiliateConfig: {
        enabled: input.financial.isAffiliateActive,
        commissionPercent: input.financial.affiliatePercent,
        includePpn: true,
      },
      adsCostPerOrder: input.financial.adsCostPerOrder,
      returnConfig: {
        returnRatePercent: input.financial.expectedReturnRate,
        averageReturnShippingCost: 15000,
        replacementCost: 20000,
        restockingCost: 5000,
      },
      operationalCostConfig: {
        allocationType: 'PER_ORDER',
        packingCost: input.financial.packingCost,
        laborCost: input.financial.operationalCost,
        warehouseCost: 0,
        electricityCost: 0,
        internetCost: 0,
        softwareCost: 0,
        rentCost: 0,
        customerServiceCost: 0,
        paymentGatewayCost: 0,
        otherCost: 0,
      },
    },
    marketplaceRules,
    programRules,
    taxProfile
  );

  // 5. Recommended Selling Price for healthy margin
  const recommendedBuyerPrice = calculateRecommendedBuyerPrice(
    input.financial,
    marketplaceRules,
    programRules,
    taxProfile
  );
  const isBelowRecommended = input.financial.targetBuyerPrice < recommendedBuyerPrice;

  // 6. Compliance Checks
  const complianceChecks = runShopeeComplianceCheck(input, seoTitles, productDescription);
  const compliancePassed = complianceChecks.every(c => c.passed);

  // 7. Listing Quality Score
  const quality = calculateListingQualityScore(input, complianceChecks, pricing);

  const packageContents = input.specifications.isiQuantity
    ? `1x ${input.productName} (${input.specifications.isiQuantity})`
    : `1x ${input.productName} (Sesuai varian & ukuran yang dipilih)`;

  const targetAudienceText = input.seo.targetAudience || 'Konsumen umum';

  return {
    seoTitles,
    keywords,
    productDescription,
    specificationsFormatted,
    packageContents,
    targetAudienceText,
    complianceChecks,
    compliancePassed,
    qualityScore: quality.score,
    qualityComponents: quality.components,
    pricing,
    recommendedBuyerPrice,
    isBelowRecommended,
  };
}
