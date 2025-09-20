import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase'; // We'll create this next

export default function OnboardingScreen() {
  const [monthlyIncome, setMonthlyIncome] = useState('');

  const handleSaveIncome = async () => {
    // Basic validation
    const income = parseFloat(monthlyIncome);
    if (isNaN(income) || income <= 0) {
      alert('Please enter a valid income amount');
      return;
    }

    // TODO: Save to Supabase
    console.log('Saving income:', income);
    alert(`Income set to: $${income}`);
    
    // Next step: navigate to goals screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FinaxAI! 💰</Text>
      <Text style={styles.subtitle}>Let's start with your monthly income</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your monthly income"
        keyboardType="numeric"
        value={monthlyIncome}
        onChangeText={setMonthlyIncome}
      />
      
      <Button title="Continue" onPress={handleSaveIncome} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
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
});