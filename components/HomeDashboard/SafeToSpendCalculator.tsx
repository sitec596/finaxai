import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function SafeToSpendCalculator() {
  // This will calculate: Income - Needs - Wants - Goals = Safe-to-Spend
  const safeToSpend = 347; // We'll connect to real calculation later

  return (
    <View style={styles.container}>
      <Text style={styles.amount}>${safeToSpend}</Text>
      <Text style={styles.label}>Safe to Spend</Text>
      <Text style={styles.subLabel}>Available today</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: -50, // Pull it up to be more centered
  },
  amount: {
    fontSize: 72, // Even bigger!
    fontWeight: 'bold',
    color: '#10b981',
    textShadowColor: 'rgba(16, 185, 129, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  label: {
    fontSize: 20,
    color: '#374151',
    marginTop: 8,
    fontWeight: '600',
  },
  subLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});