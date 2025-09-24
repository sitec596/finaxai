import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { FloatingAddButton, GoalWarning, NeedVsWantChart, SafeToSpendCalculator } from '../../components/HomeDashboard';
import { supabase } from '../../lib/supabase';

export default function HomeTab() {
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [currentIncome, setCurrentIncome] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Load existing income when component mounts
  useEffect(() => {
    loadCurrentIncome();
  }, []);

  const loadCurrentIncome = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_income')
        .select('monthly_income')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setCurrentIncome(data.monthly_income);
      }
    } catch {
      console.log('Error loading income');
    }
  };

  const handleSaveIncome = async () => {
    const income = parseFloat(monthlyIncome);
    if (isNaN(income) || income <= 0) {
      alert('Please enter a valid income amount');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in first');
        return;
      }

      const { error } = await supabase
        .from('user_income')
        .insert([{ user_id: user.id, monthly_income: income }]);

      if (error) throw error;

      setCurrentIncome(income);
      setMonthlyIncome('');
    } catch {
      alert('Failed to save income');
    } finally {
      setLoading(false);
    }
  };

  // 🎯 ONBOARDING: If no income set
  if (!currentIncome) {
    return (
      <View style={styles.onboardingContainer}>
        <Text style={styles.title}>Welcome to FinaxAI! 💰</Text>
        <Text style={styles.subtitle}>Enter your monthly income to start</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter amount (e.g., 3000)"
          keyboardType="numeric"
          value={monthlyIncome}
          onChangeText={setMonthlyIncome}
        />
        
        {loading ? (
          <ActivityIndicator size="large" color="#10b981" />
        ) : (
          <Button 
            title="Start Tracking" 
            onPress={handleSaveIncome} 
            disabled={!monthlyIncome}
          />
        )}
      </View>
    );
  }

  // 🎯 DASHBOARD: Clean, focused answer to "Can I afford this?"
  return (
    <View style={styles.dashboardContainer}>
      
      {/* 🎯 1. Big Safe-to-Spend Number (CENTER) */}
      <SafeToSpendCalculator />
      
      {/* 📊 2. Mini-chart (Need vs Want ratio) */}
      <NeedVsWantChart />
      
      {/* 🎯 3. Goal progress (ONLY if behind schedule) */}
      <GoalWarning />
      
      {/* ➕ 4. Floating action button to add transaction */}
      <FloatingAddButton />
      
    </View>
  );
}

const styles = StyleSheet.create({
  onboardingContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    color: '#6b7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'white',
  },
});