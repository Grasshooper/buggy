import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import { toast } from "sonner-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_CATEGORIES = [
  "Food",
  "Groceries",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Bills",
  "Other",
];

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

export interface Expense {
  id: string;
  amount: number;
  category: string;
  timestamp: number;
}

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => void;
  currency?: string; // Make currency a prop instead of using AsyncStorage
}

export default function ExpenseForm({
  onAddExpense,
  currency = "EUR",
}: ExpenseFormProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [useCustomCategories, setUseCustomCategories] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState(
    CURRENCY_SYMBOLS[currency] || "€"
  );

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Update currency symbol when currency prop changes
  useEffect(() => {
    setCurrencySymbol(CURRENCY_SYMBOLS[currency] || "€");
  }, [currency]);

  const loadUserProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem("@userProfile");
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setCustomCategories(profile.customCategories || []);
        setUseCustomCategories(profile.useCustomCategories || false);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      amount: Number(amount),
      category,
      timestamp: Date.now(),
    };

    onAddExpense(expense);
    setAmount("");
    toast.success("Expense added successfully!");
  };

  const categories =
    useCustomCategories && customCategories.length > 0
      ? customCategories
      : DEFAULT_CATEGORIES;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.amountContainer}>
          <Text style={styles.currency}>{currencySymbol}</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {Platform.OS === "ios" ? (
          // iOS specific implementation
          <View style={styles.pickerContainerIOS}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              itemStyle={styles.pickerItemIOS}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        ) : (
          // Android specific implementation
          <View style={styles.pickerContainerAndroid}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.pickerAndroid}
              dropdownIconColor="#333333"
              mode="dropdown"
            >
              {categories.map((cat) => (
                <Picker.Item
                  key={cat}
                  label={cat}
                  value={cat}
                  color="#333333"
                />
              ))}
            </Picker>
          </View>
        )}

        {/* Display selected category label for clarity */}
        <View style={styles.selectedCategory}>
          <Text style={styles.selectedCategoryLabel}>Selected Category:</Text>
          <Text style={styles.selectedCategoryValue}>{category}</Text>
        </View>
      </View>

      <Pressable
        style={styles.button}
        onPress={handleSubmit}
        android_ripple={{ color: "#1b5e20" }}
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.buttonText}>Add Expense</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 16,
    paddingBottom: 8,
  },
  currency: {
    fontSize: 24,
    color: "#2E7D32",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: "#333",
  },
  // iOS specific styles
  pickerContainerIOS: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#F5F5F5",
  },
  pickerItemIOS: {
    fontSize: 16,
    height: 120,
    color: "#333",
  },
  // Android specific styles
  pickerContainerAndroid: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#F5F5F5",
    height: 50,
    justifyContent: "center",
  },
  pickerAndroid: {
    color: "#333333",
    backgroundColor: "transparent",
  },
  // Category display
  selectedCategory: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedCategoryLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  selectedCategoryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  button: {
    backgroundColor: "#2E7D32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
