import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { toast } from "sonner-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ExpenseForm, { Expense } from "../components/ExpenseForm";
import ExpenseChart from "../components/ExpenseChart";
import ExpenseList from "../components/ExpenseList";
import TabBar from "../components/TabBar";
import ExpenseStats from "../components/ExpenseStats";

const STORAGE_KEY = "@expenses";

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const navigation = useNavigation();

  // Load expenses and currency whenever the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      loadExpenses();
      loadCurrency();
    }, [])
  );

  const loadExpenses = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch (error) {
      toast.error("Failed to load expenses");
    }
  };

  const loadCurrency = async () => {
    try {
      const currency = await AsyncStorage.getItem("@selectedCurrency");
      if (currency) {
        setSelectedCurrency(currency);
      }
    } catch (error) {
      console.error("Failed to load currency setting:", error);
    }
  };

  const handleAddExpense = async (expense: Expense) => {
    const newExpenses = [expense, ...expenses];
    setExpenses(newExpenses);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
    } catch (error) {
      toast.error("Failed to save expense");
    }
  };

  const handleClearAll = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setExpenses([]);
      toast.success("All expenses cleared");
    } catch (error) {
      toast.error("Failed to clear expenses");
    }
  };

  const handleTabChange = (tab: "daily" | "monthly") => {
    setActiveTab(tab);
  };

  const getCurrentExpenses = () => {
    const now = new Date();
    if (activeTab === "daily") {
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();
      return expenses.filter((expense) => expense.timestamp >= today);
    } else {
      const firstDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).getTime();
      return expenses.filter((expense) => expense.timestamp >= firstDayOfMonth);
    }
  };

  const currentExpenses = getCurrentExpenses();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Buggy</Text>
          <View style={styles.headerButtons}>
            <Pressable
              style={styles.iconButton}
              onPress={() => navigation.navigate("Profile" as never)}
            >
              <MaterialIcons name="person-outline" size={24} color="#2E7D32" />
            </Pressable>
            {expenses.length > 0 && (
              <Pressable style={styles.iconButton} onPress={handleClearAll}>
                <MaterialIcons
                  name="delete-outline"
                  size={24}
                  color="#E53935"
                />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

          <View>
            <ExpenseStats
              expenses={expenses}
              type={activeTab}
              currency={selectedCurrency}
            />
            <ExpenseForm
              onAddExpense={handleAddExpense}
              currency={selectedCurrency}
            />
            <View style={styles.spacer} />
            <ExpenseChart
              expenses={currentExpenses}
              currency={selectedCurrency}
            />
            <View style={styles.spacer} />
            <ExpenseList
              expenses={currentExpenses}
              currency={selectedCurrency}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  spacer: {
    height: 16,
  },
});
