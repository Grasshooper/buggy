import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
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

interface ExpenseChartProps {
  expenses: Expense[];
  currency?: string; // Make currency a prop instead of using AsyncStorage
}

const COLORS = [
  "#2E7D32",
  "#1976D2",
  "#C2185B",
  "#7B1FA2",
  "#FBC02D",
  "#F57C00",
  "#455A64",
  "#00796B",
];

export default function ExpenseChart({
  expenses,
  currency = "EUR",
}: ExpenseChartProps) {
  const [currencySymbol, setCurrencySymbol] = useState(
    CURRENCY_SYMBOLS[currency] || "€"
  );

  // Update currency symbol when currency prop changes
  useEffect(() => {
    setCurrencySymbol(CURRENCY_SYMBOLS[currency] || "€");
  }, [currency]);

  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryTotals).map(
    ([category, amount], index) => ({
      name: category,
      amount,
      color: COLORS[index % COLORS.length],
      legendFontColor: "#7F7F7F",
    })
  );

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No expenses yet</Text>
        <Text style={styles.emptySubtext}>
          Add your first expense to see the chart
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.totalAmount}>
        {currencySymbol}
        {totalSpent.toFixed(2)}
      </Text>
      <Text style={styles.totalLabel}>Total Spent</Text>
      <PieChart
        data={chartData}
        width={Dimensions.get("window").width - 32}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  emptyContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    height: 220,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
});
