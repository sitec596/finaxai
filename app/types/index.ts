export interface RecurringTransaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: 'need' | 'want' | 'goal' | 'income';
  type: 'income' | 'expense';
  
  // Recurrence fields
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  start_date: string;
  end_date?: string;
  last_processed?: string;
  goal_id?: string;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  created_at: string;
  user_id: string;
}