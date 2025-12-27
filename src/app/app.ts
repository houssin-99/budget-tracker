import { Component, signal, effect, OnInit, runInInjectionContext, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
}

interface Goal {
  id: number;
  name: string;
  target: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  constructor(private injector: Injector) {}

  private STORAGE_KEY = 'budget-tracker-data';

// -----------------------------------------
// 📌 State & Inputs (No errors now)
// -----------------------------------------
transactions = signal<Transaction[]>([
  { id: 1, date: '2024-01-15', description: 'Salary', amount: 2000, type: 'income', category: 'Income' },
  { id: 2, date: '2024-01-16', description: 'Groceries', amount: 80, type: 'expense', category: 'Food' }
]);

goals = signal<Goal[]>([]);

draftDescription = '';
draftAmount: number | null = null;
draftType: 'income' | 'expense' = 'expense';
draftCategory = '';
draftGoalName = '';
draftGoalTarget: number | null = null;

chart: any;


  // -----------------------------
  // 🔧 FIXED ngOnInit (NO MORE ERROR)
  // -----------------------------
  ngOnInit() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      this.transactions.set(data.transactions || []);
      this.goals.set(data.goals || []);
    }

    // 👇 BELANGRIJK: effect binnen injection context!
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.saveData();
        this.updateChart();
      });
    });
  }

  // -----------------------------
  // SAVE SYSTEM
  // -----------------------------
  saveData() {
    const data = {
      transactions: this.transactions(),
      goals: this.goals()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // -----------------------------
  // TRANSACTIONS
  // -----------------------------
  addTransaction() {
    if (!this.draftDescription.trim() || this.draftAmount === null) return;

    this.autoDetectCategory(this.draftDescription);

    this.transactions.update(current => [
      ...current,
      {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        description: this.draftDescription,
        amount: this.draftAmount as number,
        type: this.draftType,
        category: this.draftCategory || 'Uncategorized'
      }
    ]);

    this.draftDescription = '';
    this.draftAmount = null;
    this.draftType = 'expense';
    this.draftCategory = '';
  }

  autoDetectCategory(desc: string): void {
    const text = desc.toLowerCase();
    const categories: Record<string, string> = {
      food: 'Food', burger: 'Food', pizza: 'Food', kebab: 'Food',
      uber: 'Transport', taxi: 'Transport', bus: 'Transport',
      clothes: 'Shopping', shirt: 'Shopping', shoes: 'Shopping',
      rent: 'Housing', water: 'Housing', electricity: 'Housing', internet: 'Housing',
      movie: 'Entertainment', game: 'Entertainment',
      salary: 'Income', bonus: 'Income', paycheck: 'Income'
    };

    for (const keyword in categories) {
      if (text.includes(keyword)) {
        this.draftCategory = categories[keyword];
        return;
      }
    }
    this.draftCategory = 'Uncategorized';
  }

  removeTransaction(id: number) {
    this.transactions.update(current => current.filter(t => t.id !== id));
  }

  // -----------------------------
  // GOALS
  // -----------------------------
  addGoal() {
    if (!this.draftGoalName.trim() || !this.draftGoalTarget) return;

    this.goals.update(g => [
      ...g,
      {
        id: Date.now(),
        name: this.draftGoalName,
        target: this.draftGoalTarget as number
      }
    ]);

    this.draftGoalName = '';
    this.draftGoalTarget = null;
  }

  removeGoal(id: number) {
    this.goals.update(g => g.filter(goal => goal.id !== id));
  }

  goalProgress(goal: Goal): number {
    if (!goal.target || goal.target <= 0) return 0;
    return Math.min(100, Math.round((this.balance / goal.target) * 100));
  }

  // -----------------------------
  // FILTER SYSTEM
  // -----------------------------
  filter = signal<'all' | 'income' | 'expense'>('all');

  setFilter(type: 'all' | 'income' | 'expense') {
    this.filter.set(type);
  }

  getFilteredTransactions() {
    const f = this.filter();
    const all = this.transactions();
    if (f === 'income') return all.filter(t => t.type === 'income');
    if (f === 'expense') return all.filter(t => t.type === 'expense');
    return all;
  }

  // -----------------------------
  // BALANCE CALC
  // -----------------------------
  get income() {
    return this.transactions().filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  }

  get expenses() {
    return this.transactions().filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  }

  get balance() {
    return this.income - this.expenses;
  }

  // -----------------------------
  // CHART
  // -----------------------------
  updateChart() {
    if (this.chart) this.chart.destroy();
    const ctx = document.getElementById('balanceChart') as HTMLCanvasElement;
    if (!ctx) return;

    let running = 0;
    const labels: string[] = [];
    const data: number[] = [];

    this.transactions().forEach(t => {
      running += t.type === 'income' ? t.amount : -t.amount;
      labels.push(t.description);
      data.push(running);
    });

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: "Balance Over Time",
          data,
          borderColor: '#00FFC3',
          backgroundColor: 'rgba(0,255,195,0.15)',
          borderWidth: 3,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        plugins: { legend: { display: false }},
        scales: {
          x: { ticks: { color: '#ccc' }},
          y: { ticks: { color: '#ccc' }}
        }
      }
    });
  }
}
