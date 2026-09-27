import { TutorialItem, TutorialCategory } from '../../types/tutorial.ts';
import { coreTutorials } from './coreTutorials.ts';
import { calculatorTutorials } from './calculatorTutorials.ts';
import { analyticsOperationsTutorials } from './analyticsOperationsTutorials.ts';

export const TUTORIAL_CATEGORIES: TutorialCategory[] = [
  'Semua',
  'Kalkulator',
  'Profit & Biaya',
  'Shopee',
  'Iklan',
  'Pajak',
  'Produk',
  'Operasional',
  'Data & Laporan',
];

export const ALL_TUTORIALS: TutorialItem[] = [
  ...coreTutorials,
  ...calculatorTutorials,
  ...analyticsOperationsTutorials,
];

export function getTutorialById(id: string): TutorialItem | undefined {
  return ALL_TUTORIALS.find((t) => t.id === id || t.featureViewId === id);
}

export function searchTutorials(query: string, category: TutorialCategory = 'Semua'): TutorialItem[] {
  let list = ALL_TUTORIALS;

  if (category !== 'Semua') {
    list = list.filter((t) => t.category === category);
  }

  const q = query.trim().toLowerCase();
  if (!q) {
    return list;
  }

  return list.filter((item) => {
    // 1. Check title & badge
    if (item.title.toLowerCase().includes(q)) return true;
    if (item.badge?.toLowerCase().includes(q)) return true;
    if (item.shortSummary.toLowerCase().includes(q)) return true;

    // 2. Check keywords
    if (item.keywords.some((kw) => kw.toLowerCase().includes(q))) return true;

    // 3. Check common problems solved (e.g. "iklan boncos", "kenaikan fee", "diskon", "target profit")
    if (item.commonProblemsSolved.some((p) => p.toLowerCase().includes(q))) return true;

    // 4. Check functionality or steps
    if (item.content.functionality.toLowerCase().includes(q)) return true;

    return false;
  });
}
