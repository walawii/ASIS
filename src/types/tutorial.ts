import { AppView } from '../context/AppContext.tsx';

export type TutorialCategory =
  | 'Semua'
  | 'Kalkulator'
  | 'Profit & Biaya'
  | 'Shopee'
  | 'Iklan'
  | 'Pajak'
  | 'Produk'
  | 'Operasional'
  | 'Data & Laporan';

export interface TutorialSectionFormat {
  // A. Apa fungsi fitur ini?
  functionality: string;
  // B. Kapan fitur ini digunakan?
  whenToUse: string;
  // C. Input yang diperlukan
  requiredInputs: {
    name: string;
    description: string;
    example?: string;
  }[];
  // D. Langkah penggunaan
  steps: string[];
  // E. Contoh
  example: {
    scenario: string;
    inputValues: Record<string, string>;
    calculationFlow: string[];
    finalResult: string;
    explanation: string;
  };
  // F. Cara membaca hasil
  howToReadResults: {
    metric: string;
    meaning: string;
    actionGuide: string;
  }[];
  // G. Tips
  tips: string[];
  // H. Kesalahan umum
  commonMistakes: string[];
}

export interface TutorialItem {
  id: string;
  featureViewId?: AppView;
  title: string;
  badge?: string;
  badgeColor?: string;
  category: TutorialCategory;
  shortSummary: string;
  readTimeMinutes: number;
  difficulty: 'Pemula' | 'Menengah' | 'Lanjutan';
  keywords: string[];
  commonProblemsSolved: string[];
  content: TutorialSectionFormat;
}
