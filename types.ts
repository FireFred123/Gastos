
export enum Category {
  Aluguel = 'Aluguel',
  Contas = 'Contas',
  Alimentacao = 'Alimentação',
  Lazer = 'Lazer',
  FaturaCartao = 'Fatura do Cartão',
  Feira = 'Feira',
  Outros = 'Outros Gastos'
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: Category;
  description: string;
  comment?: string;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}
