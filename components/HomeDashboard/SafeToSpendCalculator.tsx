import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function SafeToSpendCalculator() {
  // Temporary hardcoded value - we'll connect to Supabase later
  const safeToSpend = 347;

  return (
    <View style={styles.container}>
      <Text style={styles.amount}>${safeToSpend}</Text>
      <Text style={styles.label}>Safe to Spend</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 30,
  },
  amount: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#10b981',
  },
  label: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 8,
  },
});