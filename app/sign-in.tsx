import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      // For MVP, we'll use magic link sign-in
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // For demo purposes, we'll skip email confirmation
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      alert('Check your email for the login link! For MVP, just proceed to the app.');
      router.replace('/(tabs)');
      
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Sign in failed. Using demo mode instead.');
      // For MVP, proceed anyway
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    // Skip authentication for MVP
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FinaxAI</Text>
      <Text style={styles.subtitle}>Your Personal Finance Assistant</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TouchableOpacity 
        style={styles.signInButton}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.signInButtonText}>Sign In with Email</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.demoButton}
        onPress={handleDemoMode}
      >
        <Text style={styles.demoButtonText}>Try Demo Mode</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 50,
    color: '#6b7280',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 20,
    fontSize: 16,
  },
  signInButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#f3f4f6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});