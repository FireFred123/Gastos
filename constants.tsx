
import { Category } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.Aluguel]: '#3b82f6', // blue-500
  [Category.Contas]: '#ef4444',  // red-500
  [Category.Alimentacao]: '#10b981', // emerald-500
  [Category.Lazer]: '#f59e0b', // amber-500
  [Category.FaturaCartao]: '#8b5cf6', // violet-500
  [Category.Feira]: '#06b6d4', // cyan-500
  [Category.Outros]: '#64748b', // slate-500
};

export const STORAGE_KEY = 'finance_pro_expenses_v1';
