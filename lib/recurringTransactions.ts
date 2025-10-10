import { supabase } from './supabase';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  last_processed: string | null;
  end_date: string | null;
  is_active: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

// Separate interface for form data (with string amount)
export interface CreateRecurringTransactionFormData {
  name: string;
  amount: string; // String for TextInput
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  description?: string;
}

// Interface for database data (with number amount)
export interface CreateRecurringTransactionData {
  name: string;
  amount: number; // Number for database
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  description?: string;
}

export const recurringTransactionsService = {
  // Get all recurring transactions for user
  async getRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a new recurring transaction
  async createRecurringTransaction(
    userId: string, 
    data: CreateRecurringTransactionData
  ): Promise<RecurringTransaction> {
    const transactionData = {
      user_id: userId,
      name: data.name,
      amount: data.amount,
      category: data.category,
      type: data.category === 'income' ? 'income' : 'expense',
      frequency: data.frequency,
      start_date: data.start_date,
      last_processed: null,
      end_date: null,
      is_active: true,
      description: data.description || `Recurring ${data.category}`,
    };

    const { data: result, error } = await supabase
      .from('recurring_transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Update a recurring transaction
  async updateRecurringTransaction(
    id: string,
    updates: Partial<CreateRecurringTransactionData>
  ): Promise<RecurringTransaction> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a recurring transaction
  async deleteRecurringTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Toggle active status
  async toggleRecurringTransaction(id: string, isActive: boolean): Promise<RecurringTransaction> {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create a transaction from recurring template
  async createTransactionFromRecurring(
    recurringTransaction: RecurringTransaction
  ): Promise<any> {
    const userId = 'demo-user-mvp-123';
    
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          amount: recurringTransaction.amount,
          category: recurringTransaction.category,
          description: recurringTransaction.description,
          type: recurringTransaction.type,
        }
      ])
      .select()
      .single();

    if (transactionError) throw transactionError;

    const today = new Date().toISOString().split('T')[0];
    const { error: updateError } = await supabase
      .from('recurring_transactions')
      .update({ last_processed: today })
      .eq('id', recurringTransaction.id);

    if (updateError) throw updateError;

    return transaction;
  },

  // Get recurring transactions that are due
  async getDueRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
    const allRecurring = await this.getRecurringTransactions(userId);
    const today = new Date();
    
    return allRecurring.filter(rt => {
      if (!rt.is_active) return false;
      
      const lastProcessed = rt.last_processed ? new Date(rt.last_processed) : null;
      const startDate = new Date(rt.start_date);
      
      if (!lastProcessed) {
        return today >= startDate;
      }
      
      const daysSinceLastProcessed = Math.floor((today.getTime() - lastProcessed.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (rt.frequency) {
        case 'daily':
          return daysSinceLastProcessed >= 1;
        case 'weekly':
          return daysSinceLastProcessed >= 7;
        case 'monthly':
          return daysSinceLastProcessed >= 30;
        case 'yearly':
          return daysSinceLastProcessed >= 365;
        default:
          return false;
      }
    });
  },
};