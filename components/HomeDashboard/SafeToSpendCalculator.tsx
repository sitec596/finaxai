import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function SafeToSpendCalculator() {
  // MVP: Hardcoded for now - this answers "Can I afford this?" directly
  const safeToSpend = 347;

  return (
    <View style={styles.container}>
      <Text style={styles.question}>Can I afford this?</Text>
      <Text style={styles.amount}>${safeToSpend}</Text>
      <Text style={styles.answer}>Yes, this is safe to spend today</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 50,
    marginTop: -80, // Pull it higher for better centering
  },
  question: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  amount: {
    fontSize: 80, // Even bigger for chatbot emphasis
    fontWeight: 'bold',
    color: '#10b981',
    textShadowColor: 'rgba(16, 185, 129, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  answer: {
    fontSize: 16,
    color: '#374151',
    marginTop: 12,
    fontWeight: '500',
  },
});