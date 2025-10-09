import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeToSpendCalculator, NeedVsWantChart, GoalWarning, FloatingAddButton } from '../../components/HomeDashboard';

export default function HomeTab() {
  // 🎯 MVP: Hardcoded data for now - we'll connect to Supabase later
  // This creates the "chatbot-ish" feel - just answers the question directly
  
  return (
    <View style={styles.container}>
      
      {/* 🎯 1. Big Safe-to-Spend Number (CENTER, HUGE TEXT) */}
      <SafeToSpendCalculator />
      
      {/* 📊 2. Mini-chart (Need vs Want ratio this month) */}
      <NeedVsWantChart />
      
      {/* 🎯 3. Goal progress (ONLY if behind schedule) */}
      <GoalWarning />
      
      {/* ➕ 4. Floating action button to add transaction */}
      <FloatingAddButton />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});