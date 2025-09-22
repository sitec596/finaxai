import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function GoalWarning() {
  // Temporary - we'll make this conditional later
  const isBehindOnGoals = true;

  if (!isBehindOnGoals) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.warning}>⚠️</Text>
      <Text style={styles.title}>Goal Progress Alert</Text>
  <Text style={styles.message}>You&apos;re behind on your &quot;New Laptop&quot; goal</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>View Goals</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  warning: {
    fontSize: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#856404',
    fontWeight: '500',
  },
});