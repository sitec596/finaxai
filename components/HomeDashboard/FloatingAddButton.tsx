import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export function FloatingAddButton() {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={() => router.push('/(tabs)/add')}
    >
      <Text style={styles.plus}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  plus: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -2,
  },
});