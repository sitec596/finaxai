import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function NeedVsWantChart() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Month's Balance</Text>
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          <View style={[styles.slice, styles.needSlice]} />
          <View style={[styles.slice, styles.wantSlice]} />
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.colorBox, styles.needColor]} />
            <Text style={styles.legendText}>Needs: $1,200</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.colorBox, styles.wantColor]} />
            <Text style={styles.legendText}>Wants: $800</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: '#374151',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  chart: {
    width: 100,
    height: 100,
    borderRadius: 50,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  slice: {
    flex: 1,
  },
  needSlice: {
    backgroundColor: '#3b82f6',
  },
  wantSlice: {
    backgroundColor: '#ef4444',
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  needColor: {
    backgroundColor: '#3b82f6',
  },
  wantColor: {
    backgroundColor: '#ef4444',
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
});