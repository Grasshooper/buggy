import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Expense } from './ExpenseForm';

interface ExpenseStatsProps {
  expenses: Expense[];
  type: 'daily' | 'monthly';
}

export default function ExpenseStats({ expenses, type }: ExpenseStatsProps) {
  const getCurrentStats = () => {
    const now = new Date();
    if (type === 'daily') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return expenses.filter(expense => expense.timestamp >= today);
    } else {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return expenses.filter(expense => expense.timestamp >= firstDayOfMonth);
    }
  };

  const currentExpenses = getCurrentStats();
  const totalAmount = currentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgAmount = currentExpenses.length > 0 ? totalAmount / currentExpenses.length : 0;

  return (
    <View style={styles.container}>
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="currency-usd" size={24} color="#2E7D32" />
        <Text style={styles.statTitle}>Total {type === 'daily' ? 'Today' : 'This Month'}</Text>
        <Text style={styles.statAmount}>${totalAmount.toFixed(2)}</Text>
      </View>
      
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="chart-line" size={24} color="#1976D2" />
        <Text style={styles.statTitle}>Average per expense</Text>
        <Text style={[styles.statAmount, { color: '#1976D2' }]}>${avgAmount.toFixed(2)}</Text>
      </View>
      
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="receipt" size={24} color="#7B1FA2" />
        <Text style={styles.statTitle}>Total Entries</Text>
        <Text style={[styles.statAmount, { color: '#7B1FA2' }]}>{currentExpenses.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 4,
  },
});