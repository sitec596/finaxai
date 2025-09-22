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
    } catch (error) {
      console.log('Error loading income:', error);
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

      // Save to Supabase
      const { error } = await supabase
        .from('user_income')
        .insert([
          { 
            user_id: user.id, 
            monthly_income: income 
          }
        ]);

      if (error) {
        throw error;
      }

  setCurrentIncome(income);
  setMonthlyIncome('');
  alert('Income saved successfully!');

    } catch (error) {
      console.error('Error saving income:', error);
      alert('Failed to save income');
    } finally {
      setLoading(false);
    }
  };

  // If user hasn't set up income yet, show onboarding
  if (!currentIncome) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to FinaxAI! 💰</Text>
        
        <Text style={styles.subtitle}>Enter your monthly income</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter amount (e.g., 3000)"
          keyboardType="numeric"
          value={monthlyIncome}
          onChangeText={setMonthlyIncome}
        />
        
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button 
            title="Save Income" 
            onPress={handleSaveIncome} 
            disabled={!monthlyIncome}
          />
        )}
      </View>
    );
  }

  // If user has set up income, show the dashboard
  return (
    <View style={styles.dashboardContainer}>
      {/* Show current income at the top */}
      <View style={styles.incomeHeader}>
        <Text style={styles.incomeLabel}>Monthly Income:</Text>
        <Text style={styles.incomeAmount}>${currentIncome}</Text>
        <Text style={styles.changeText} onPress={() => setCurrentIncome(null)}>
          Change
        </Text>
      </View>

      {/* Dashboard Components */}
      <SafeToSpendCalculator />
      <NeedVsWantChart />
      <GoalWarning />
      <FloatingAddButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  incomeHeader: {
    position: 'absolute',
    top: 50,
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incomeLabel: {
    fontSize: 12,
    color: '#666',
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00cc00',
  },
  changeText: {
    color: '#0066cc',
    fontSize: 12,
    marginTop: 4,
  },
});