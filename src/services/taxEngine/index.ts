import {
  TaxProfile,
  TaxRule,
  Pph22Result,
  TaxTreatment,
  TaxEligibilityState,
} from '../../types/rules.ts';
import { OFFICIAL_TAX_RULES, OFFICIAL_PPH22_RULE } from '../profitEngine/rulesData.ts';

export interface TaxCalculationResult {
  taxableRevenue: number;
  taxAmount: number;
  effectiveRatePercent: number;
  isTaxExempt: boolean;
  exemptionReason: string;
  eligibilityState: TaxEligibilityState;
  cumulativeAnnualRevenue: number;
  nonTaxableThresholdRemaining: number;
  thresholdStatus: 'Below Threshold' | 'Approaching Threshold' | 'Threshold Exceeded';
  statusAlertMessage?: string;
  ruleApplied: TaxRule;
  taxTreatment: TaxTreatment;
  cashWithheld: number;
}

/**
 * Evaluasi Status Pemotongan PPh 22 Marketplace (PMK 37/2025)
 * Tanggal Efektif: 1 November 2026 (2026-11-01)
 * Dasar Pengenaan: Peredaran usaha bruto tidak termasuk PPN dan PPnBM
 * Tarif: 0.5% (Configured dari OFFICIAL_PPH22_RULE)
 */
export function evaluatePph22Eligibility(params: {
  taxProfile?: TaxProfile;
  transactionDate?: string;
  grossRevenue: number; // Dasar invoice excluding PPN & PPnBM
  annualGrossRevenue?: number;
}): Pph22Result {
  const txDate = params.transactionDate || '2026-09-25';
  const effectiveDate = OFFICIAL_PPH22_RULE.effectiveFrom; // '2026-11-01'

  // 1. Transaksi sebelum 1 November 2026 belum efektif (PMK 37/2025)
  if (txDate < effectiveDate) {
    return {
      eligible: false,
      status: 'NOT_YET_EFFECTIVE',
      rate: 0,
      taxableBase: 0,
      taxAmount: 0,
      cashWithheld: 0,
      taxTreatment: 'NOT_APPLICABLE',
      reason: `PMK No. 37/2025 baru efektif berlaku mulai 1 November 2026. Transaksi pada ${txDate} belum dipotong PPh 22 oleh marketplace (NOT_YET_EFFECTIVE).`,
      effectiveFrom: effectiveDate,
    };
  }

  const profile = params.taxProfile;
  // 2. Jika profil pajak belum ada, rule memerlukan data (tidak fallback diam-diam)
  if (!profile) {
    return {
      eligible: false,
      status: 'TAX_RULE_REQUIRES_DATA',
      rate: 0,
      taxableBase: 0,
      taxAmount: 0,
      cashWithheld: 0,
      taxTreatment: 'TAX_RULE_REQUIRES_DATA',
      reason: 'Profil pajak penjual belum dikonfigurasi untuk mengevaluasi kewajiban pemotongan PPh 22 (TAX_RULE_REQUIRES_DATA).',
      effectiveFrom: effectiveDate,
    };
  }

  // 3. Cek Surat Keterangan Bebas (SKB)
  if (profile.hasSkbExemption) {
    return {
      eligible: false,
      status: 'EXEMPT_SKB',
      rate: 0,
      taxableBase: 0,
      taxAmount: 0,
      cashWithheld: 0,
      taxTreatment: 'EXEMPT',
      reason: `Penjual memiliki Surat Keterangan Bebas (SKB) No. ${profile.skbCertificateNumber || 'Valid DJP'}, bebas pemotongan PPh 22 Marketplace (EXEMPT_SKB).`,
      effectiveFrom: effectiveDate,
    };
  }

  // 4. Cek Surat Pernyataan Omzet <= 500 Juta untuk WPOP UMKM (PMK 37/2025 Pasal 4 ayat 2)
  if (profile.taxpayerType === 'Individual' && profile.hasUmkmStatementLetter) {
    const annualRev =
      params.annualGrossRevenue ??
      (profile.annualOfflineRevenue + profile.annualOtherMarketplaceRevenue);
    const configuredThreshold =
      OFFICIAL_TAX_RULES.find((r) => r.taxpayerType === 'Individual')?.annualNonTaxableThreshold ?? 500000000;

    if (annualRev <= configuredThreshold) {
      return {
        eligible: false,
        status: 'EXEMPT_OMZET_500M',
        rate: 0,
        taxableBase: 0,
        taxAmount: 0,
        cashWithheld: 0,
        taxTreatment: 'EXEMPT',
        reason: `WPOP memiliki Surat Pernyataan omzet kumulatif <= Rp${configuredThreshold.toLocaleString('id-ID')} (PMK 37/2025). Bebas pemotongan PPh 22 (EXEMPT_OMZET_500M).`,
        effectiveFrom: effectiveDate,
      };
    }
  }

  // 5. Dikenakan potongan PPh 22 Marketplace dari configured rule
  const rate = OFFICIAL_PPH22_RULE.rate; // 0.5%
  const taxableBase = Math.max(0, params.grossRevenue);
  const taxAmount = Math.round(taxableBase * (rate / 100));
  const cashWithheld = taxAmount;

  // Evaluasi tax treatment:
  // - UMKM Final: Withholding platform melunasi kewajiban PPh Final (FINAL_TAX_SETTLEMENT), tidak double-count
  // - General Income Tax: Withholding platform merupakan kredit pajak (CREDITABLE_TAX) di SPT Tahunan
  let taxTreatment: TaxTreatment = 'FINAL_TAX_SETTLEMENT';
  if (profile.taxScheme === 'General Income Tax') {
    taxTreatment = 'CREDITABLE_TAX';
  } else if (profile.taxScheme === 'UMKM Final') {
    taxTreatment = 'FINAL_TAX_SETTLEMENT';
  } else if (!profile.taxScheme) {
    taxTreatment = 'TAX_RULE_REQUIRES_DATA';
  }

  return {
    eligible: true,
    status: 'APPLICABLE',
    rate,
    taxableBase,
    taxAmount,
    cashWithheld,
    taxTreatment,
    reason: `Dikenakan pemotongan PPh 22 Marketplace ${rate}% oleh platform (PMK No. 37/2025). Perlakuan pajak: ${taxTreatment === 'FINAL_TAX_SETTLEMENT' ? 'Pelunasan PPh Final UMKM' : 'Kredit Pajak PPh 22 (CREDITABLE_TAX)'}.`,
    effectiveFrom: effectiveDate,
  };
}

/**
 * Evaluasi Status Pajak & Perhitungan Beban Pajak UMKM (PP 55/2022 & PMK 164/2023)
 * Menangani WPOP (threshold Rp500 Juta) dan WP Badan (0.5% sejak rupiah pertama / evaluasi jangka waktu)
 */
export function calculateTaxForTransaction(
  grossTransactionAmount: number,
  profile?: TaxProfile,
  customRule?: TaxRule
): TaxCalculationResult {
  const defaultRule = customRule || OFFICIAL_TAX_RULES[0];

  if (!profile) {
    return {
      taxableRevenue: 0,
      taxAmount: 0,
      effectiveRatePercent: 0,
      isTaxExempt: true,
      exemptionReason: 'Data profil pajak penjual belum dikonfigurasi (TAX_RULE_REQUIRES_DATA).',
      eligibilityState: 'TAX_RULE_REQUIRES_DATA',
      cumulativeAnnualRevenue: 0,
      nonTaxableThresholdRemaining: 0,
      thresholdStatus: 'Below Threshold',
      ruleApplied: defaultRule,
      taxTreatment: 'TAX_RULE_REQUIRES_DATA',
      cashWithheld: 0,
    };
  }

  const rule =
    customRule ||
    OFFICIAL_TAX_RULES.find((r) => r.taxpayerType === profile.taxpayerType) ||
    defaultRule;

  // Hitung Omzet Kumulatif Tahunan (Shopee + Offline + Toko Lain)
  const cumulativeAnnualRevenue =
    profile.annualOfflineRevenue +
    profile.annualOtherMarketplaceRevenue;

  // 1. Cek Surat Keterangan Bebas (SKB)
  if (profile.hasSkbExemption) {
    return {
      taxableRevenue: 0,
      taxAmount: 0,
      effectiveRatePercent: 0,
      isTaxExempt: true,
      exemptionReason: `Memiliki SKB Pajak resmi No. ${profile.skbCertificateNumber || 'Valid'} (Bebas Pemotongan PPh).`,
      eligibilityState: 'EXEMPT_SKB',
      cumulativeAnnualRevenue,
      nonTaxableThresholdRemaining: Math.max(0, rule.annualNonTaxableThreshold - cumulativeAnnualRevenue),
      thresholdStatus: 'Below Threshold',
      ruleApplied: rule,
      taxTreatment: 'EXEMPT',
      cashWithheld: 0,
    };
  }

  // 2. Cek apakah skema pajak belum ditentukan
  if (!profile.taxScheme) {
    return {
      taxableRevenue: 0,
      taxAmount: 0,
      effectiveRatePercent: 0,
      isTaxExempt: false,
      exemptionReason: 'Skema pajak penjual belum ditentukan (TAX_RULE_REQUIRES_DATA).',
      eligibilityState: 'TAX_RULE_REQUIRES_DATA',
      cumulativeAnnualRevenue,
      nonTaxableThresholdRemaining: 0,
      thresholdStatus: 'Below Threshold',
      ruleApplied: rule,
      taxTreatment: 'TAX_RULE_REQUIRES_DATA',
      cashWithheld: 0,
    };
  }

  // 3. Cek Rezim Umum (General Income Tax / PPh 17 Pembukuan)
  if (profile.taxScheme === 'General Income Tax') {
    return {
      taxableRevenue: grossTransactionAmount,
      taxAmount: 0, // Dalam pembukuan umum, PPh dihitung tahunan dari laba bersih, bukan per-transaksi omzet
      effectiveRatePercent: 0,
      isTaxExempt: false,
      exemptionReason: 'Menggunakan Rezim Pajak Umum PPh Pasal 17 (Pembukuan). Pajak dihitung tahunan atas laba neto komersial.',
      eligibilityState: 'NOT_ELIGIBLE_REGIME',
      cumulativeAnnualRevenue: cumulativeAnnualRevenue + grossTransactionAmount,
      nonTaxableThresholdRemaining: 0,
      thresholdStatus: cumulativeAnnualRevenue >= rule.pkpThreshold ? 'Threshold Exceeded' : 'Below Threshold',
      ruleApplied: rule,
      taxTreatment: 'CREDITABLE_TAX',
      cashWithheld: 0,
    };
  }

  // 4. Rezim PPh Final UMKM (PP 55/2022)
  const isPkpExceeded = cumulativeAnnualRevenue >= rule.pkpThreshold;

  // Cek jangka waktu pemanfaatan PP 55/2022 jika tahun mulai rezim / pendirian ditentukan
  if (profile.regimeStartYear || profile.establishmentYear) {
    const startYear = profile.regimeStartYear || profile.establishmentYear!;
    const referenceYear = 2026;
    // Jangka waktu PP 55/2022: WPOP 7 th, CV/Koperasi 4 th, PT 3 th
    const maxYears = profile.taxpayerType === 'Individual' ? 7 : (profile.taxpayerType === 'Company' ? 4 : 3);
    if (referenceYear - startYear > maxYears) {
      return {
        taxableRevenue: grossTransactionAmount,
        taxAmount: 0,
        effectiveRatePercent: 0,
        isTaxExempt: false,
        exemptionReason: `Jangka waktu pemanfaatan PPh Final UMKM (${maxYears} tahun sesuai PP 55/2022) telah berakhir. Wajib menggunakan Tarif Umum PPh Pasal 17.`,
        eligibilityState: 'PERIOD_EXPIRED',
        cumulativeAnnualRevenue: cumulativeAnnualRevenue + grossTransactionAmount,
        nonTaxableThresholdRemaining: 0,
        thresholdStatus: 'Threshold Exceeded',
        ruleApplied: rule,
        taxTreatment: 'CREDITABLE_TAX',
        cashWithheld: 0,
      };
    }
  }

  // 5. Wajib Pajak Orang Pribadi (WPOP) UMKM: Batas bebas pajak Rp 500 Juta per tahun
  if (profile.taxpayerType === 'Individual' && profile.taxScheme === 'UMKM Final') {
    const threshold = rule.annualNonTaxableThreshold; // Diambil dari configured rule
    const remainingBeforeTransaction = Math.max(0, threshold - cumulativeAnnualRevenue);

    if (cumulativeAnnualRevenue + grossTransactionAmount <= threshold) {
      const remainingAfter = threshold - (cumulativeAnnualRevenue + grossTransactionAmount);
      const isApproaching = remainingAfter <= 50000000;

      return {
        taxableRevenue: 0,
        taxAmount: 0,
        effectiveRatePercent: 0,
        isTaxExempt: true,
        exemptionReason: `Omzet kumulatif tahunan masih di bawah batas bebas pajak Rp ${threshold.toLocaleString('id-ID')} (PP 55/2022).`,
        eligibilityState: 'EXEMPT_OMZET_500M',
        cumulativeAnnualRevenue: cumulativeAnnualRevenue + grossTransactionAmount,
        nonTaxableThresholdRemaining: remainingAfter,
        thresholdStatus: isApproaching ? 'Approaching Threshold' : 'Below Threshold',
        statusAlertMessage: isApproaching
          ? 'Perhatian: Omzet tahunan Anda mendekati batas Rp 500 Juta. Sisa batas bebas pajak tinggal sedikit!'
          : undefined,
        ruleApplied: rule,
        taxTreatment: 'EXEMPT',
        cashWithheld: 0,
      };
    }

    // Sebagian atau seluruhnya di atas threshold
    const taxablePortion = Math.min(
      grossTransactionAmount,
      cumulativeAnnualRevenue + grossTransactionAmount - threshold
    );
    const taxAmount = Math.round(taxablePortion * (rule.rate / 100));

    return {
      taxableRevenue: taxablePortion,
      taxAmount,
      effectiveRatePercent: rule.rate,
      isTaxExempt: false,
      exemptionReason: `Omzet kumulatif telah melewati batas Rp ${threshold.toLocaleString('id-ID')}. Dikenakan PPh Final ${rule.rate}%.`,
      eligibilityState: isPkpExceeded ? 'THRESHOLD_EXCEEDED_PKP' : 'ELIGIBLE',
      cumulativeAnnualRevenue: cumulativeAnnualRevenue + grossTransactionAmount,
      nonTaxableThresholdRemaining: 0,
      thresholdStatus: isPkpExceeded ? 'Threshold Exceeded' : 'Below Threshold',
      statusAlertMessage: isPkpExceeded
        ? 'Peringatan: Omzet kumulatif telah melampaui batas PKP Rp 4.8 Miliar per tahun.'
        : undefined,
      ruleApplied: rule,
      taxTreatment: 'FINAL_TAX_SETTLEMENT',
      cashWithheld: 0,
    };
  }

  // 6. Wajib Pajak Badan (PT / CV / Koperasi): Dikenakan PPh Final 0.5% dari rupiah pertama
  // Regulasi 2026 tidak menganggap seluruh WP Badan otomatis tidak eligible.
  // Jika memilih skema UMKM Final dan dalam batas waktu/omzet, badan usaha tetap eligible.
  const taxAmount = Math.round(grossTransactionAmount * (rule.rate / 100));

  return {
    taxableRevenue: grossTransactionAmount,
    taxAmount,
    effectiveRatePercent: rule.rate,
    isTaxExempt: false,
    exemptionReason: `Wajib Pajak Badan UMKM dikenakan PPh Final ${rule.rate}% atas seluruh peredaran bruto (PP 55/2022).`,
    eligibilityState: isPkpExceeded ? 'THRESHOLD_EXCEEDED_PKP' : 'ELIGIBLE',
    cumulativeAnnualRevenue: cumulativeAnnualRevenue + grossTransactionAmount,
    nonTaxableThresholdRemaining: 0,
    thresholdStatus: isPkpExceeded ? 'Threshold Exceeded' : 'Below Threshold',
    statusAlertMessage: isPkpExceeded
      ? 'Peringatan: Omzet kumulatif Anda telah melampaui batas PKP Rp 4.8 Miliar per tahun. Wajib mendaftar PKP!'
      : undefined,
    ruleApplied: rule,
    taxTreatment: 'FINAL_TAX_SETTLEMENT',
    cashWithheld: 0,
  };
}
