import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('need');
  const [note, setNote] = useState('');

  const handleSaveExpense = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid number greater than 0.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Not signed in', 'Please log in to add expenses.');
        return;
      }

      const { error } = await supabase.from('transactions').insert([
        {
          user_id: user.id,
          amount: value,
          category,
          note,
        },
      ]);

      if (error) throw error;

      Alert.alert('Success', 'Expense saved successfully!');
      setAmount('');
      setCategory('need');
      setNote('');
    } catch (error: any) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to save expense.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Expense</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Picker
        selectedValue={category}
  onValueChange={(itemValue: string) => setCategory(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Need" value="need" />
        <Picker.Item label="Want" value="want" />
        <Picker.Item label="Goal" value="goal" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Optional note"
        value={note}
        onChangeText={setNote}
      />

      <Button title="Save Expense" onPress={handleSaveExpense} />
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
    marginBottom: 20,
    textAlign: 'center',
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
