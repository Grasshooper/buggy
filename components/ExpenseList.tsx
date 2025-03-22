import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Expense } from "./ExpenseForm";

// Currency symbol map
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "Fr",
  CNY: "¥",
  INR: "₹",
};

interface ExpenseListProps {
  expenses: Expense[];
  currency?: string; // Make currency a prop instead of using AsyncStorage
}

export default function ExpenseList({
  expenses,
  currency = "EUR",
}: ExpenseListProps) {
  const [currencySymbol, setCurrencySymbol] = useState(
    CURRENCY_SYMBOLS[currency] || "€"
  );

  // Update currency symbol when currency prop changes
  useEffect(() => {
    setCurrencySymbol(CURRENCY_SYMBOLS[currency] || "€");
  }, [currency]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recent expenses</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Expenses</Text>
      <ScrollView style={styles.list}>
        {expenses.map((expense) => (
          <View key={expense.id} style={styles.expenseItem}>
            <View style={styles.expenseInfo}>
              <Text style={styles.category}>{expense.category}</Text>
              <Text style={styles.date}>{formatDate(expense.timestamp)}</Text>
            </View>
            <Text style={styles.amount}>
              {currencySymbol}
              {expense.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  list: {
    maxHeight: 300,
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  expenseInfo: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
  emptyContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
