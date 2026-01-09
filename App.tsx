
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, LayoutDashboard, List, Wallet, ChevronLeft, ChevronRight, Trash2, Calendar, MessageSquare, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense, Category } from './types';
import { CATEGORY_COLORS, STORAGE_KEY } from './constants';

const ExpenseItem: React.FC<{ expense: Expense; onDelete: (id: string) => void }> = ({ expense, onDelete }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start group">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
        ></span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{expense.category}</span>
      </div>
      <h3 className="font-semibold text-slate-800">{expense.description}</h3>
      {expense.comment && (
        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
          <MessageSquare size={12} /> {expense.comment}
        </p>
      )}
      <p className="text-xs text-slate-400 mt-1">
        {new Date(expense.date).toLocaleDateString('pt-BR')}
      </p>
    </div>
    <div className="flex flex-col items-end gap-2">
      <span className="font-bold text-slate-900">
        {expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </span>
      <button 
        onClick={() => onDelete(expense.id)}
        className="text-red-400 p-1 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'form' | 'list'>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(Category.Alimentacao);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse expenses", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const monthYearStr = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const eDate = new Date(e.date);
      // Adjusting for UTC/Local mismatch in basic date strings
      const [y, m] = e.date.split('-').map(Number);
      return (m - 1) === currentMonth.getMonth() && y === currentMonth.getFullYear();
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, currentMonth]);

  const chartData = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.values(Category).forEach(c => totals[c] = 0);
    
    filteredExpenses.forEach(e => {
      totals[e.category] += e.amount;
    });

    return Object.entries(totals)
      .filter(([_, val]) => val > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name as Category]
      }));
  }, [filteredExpenses]);

  const totalMonthly = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      category,
      date,
      description,
      comment,
    };

    setExpenses(prev => [newExpense, ...prev]);
    setView('dashboard');
    setAmount('');
    setDescription('');
    setComment('');
  };

  const deleteExpense = (id: string) => {
    if (confirm('Deseja excluir este registro?')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newDate);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 rounded-b-[2.5rem] shadow-xl sticky top-0 z-20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">FinancePro</h1>
          </div>
          {view !== 'form' && (
            <button 
              onClick={() => setView('form')}
              className="bg-white text-blue-600 p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
          {view === 'form' && (
             <button 
             onClick={() => setView('dashboard')}
             className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
           >
             <ArrowLeft className="w-6 h-6" />
           </button>
          )}
        </div>
        
        <div className="flex items-center justify-between px-2">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={20}/></button>
          <div className="text-center">
            <p className="text-[10px] uppercase opacity-70 font-bold tracking-widest">Saldo de Gastos</p>
            <p className="text-lg font-bold capitalize">{monthYearStr}</p>
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={20}/></button>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <p className="text-4xl font-black">
            {totalMonthly.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {view === 'dashboard' && (
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Gastos por Categoria</h2>
              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={8}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                  <Calendar size={40} className="mb-2 opacity-20" />
                  <p className="text-sm font-medium">Nenhum gasto este mês</p>
                </div>
              )}
            </section>

            <section>
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recentes</h2>
                <button onClick={() => setView('list')} className="text-blue-600 font-bold text-xs uppercase hover:underline">Ver Histórico</button>
              </div>
              <div className="space-y-3">
                {filteredExpenses.slice(0, 4).map(exp => (
                  <ExpenseItem key={exp.id} expense={exp} onDelete={deleteExpense} />
                ))}
                {filteredExpenses.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">Toque no + para começar</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {view === 'list' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
               <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <ArrowLeft size={20} />
               </button>
               <h2 className="text-lg font-bold text-slate-800 tracking-tight">Todos os Registros</h2>
            </div>
            <div className="space-y-3">
              {filteredExpenses.map(exp => (
                <ExpenseItem key={exp.id} expense={exp} onDelete={deleteExpense} />
              ))}
              {filteredExpenses.length === 0 && (
                <p className="text-center text-slate-400 py-20 font-medium">Sem registros para exibir.</p>
              )}
            </div>
          </div>
        )}

        {view === 'form' && (
          <section className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Novo Gasto</h2>
            <form onSubmit={handleAddExpense} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Valor</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                   <input 
                    type="number" 
                    step="0.01"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-lg"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  {Object.values(Category).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data do Gasto</label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Descrição Curta</label>
                <input 
                  type="text" 
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Almoço no shopping"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Comentário Adicional</label>
                <textarea 
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Detalhes opcionais..."
                  rows={3}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setView('dashboard')}
                  className="flex-1 p-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] p-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-3 flex justify-between items-center z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Início</span>
        </button>
        
        <div className="relative -top-10">
          <button 
            onClick={() => setView('form')}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${view === 'form' ? 'bg-slate-800 text-white rotate-45' : 'bg-blue-600 text-white'}`}
          >
            <Plus size={32} />
          </button>
        </div>

        <button 
          onClick={() => setView('list')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'list' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <List size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Lista</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
