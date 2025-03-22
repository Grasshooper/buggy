import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';

const DEFAULT_CATEGORIES = [
  'Food', 'Groceries', 'Transport', 'Shopping', 
  'Entertainment', 'Health', 'Bills', 'Other'
];

export interface Expense {
  id: string;
  amount: number;
  category: string;
  timestamp: number;
}

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => void;
}

export default function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      amount: Number(amount),
      category,
      timestamp: Date.now(),
    };

    onAddExpense(expense);
    setAmount('');
    toast.success('Expense added successfully!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.amountContainer}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor="#A0A0A0"
          />
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.picker}
          >
            {DEFAULT_CATEGORIES.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      </View>
      <Pressable style={styles.button} onPress={handleSubmit}>
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.buttonText}>Add Expense</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 16,
    paddingBottom: 8,
  },
  currency: {
    fontSize: 24,
    color: '#2E7D32',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: '#333',
  },
  pickerContainer: {
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});