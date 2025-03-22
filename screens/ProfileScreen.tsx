import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { toast } from "sonner-native";
import { useNavigation } from "@react-navigation/native";
import IntlPhoneField, {
  ICountryCca2,
} from "react-native-international-phone-number";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  phoneCountryCode: ICountryCca2;
  phoneCountryDialCode: string;
  currency: string;
  customCategories: string[];
  useCustomCategories: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  phoneCountryCode: "GB" as ICountryCca2,
  phoneCountryDialCode: "+44",
  currency: "EUR",
  customCategories: [],
  useCustomCategories: false,
};

const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "INR",
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

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [originalProfile, setOriginalProfile] =
    useState<UserProfile>(DEFAULT_PROFILE);
  const [newCategory, setNewCategory] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigation = useNavigation();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    // Check if there are unsaved changes by comparing with original
    if (JSON.stringify(profile) !== JSON.stringify(originalProfile)) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [profile, originalProfile]);

  useEffect(() => {
    // When the profile currency changes, update it globally
    if (profile.currency) {
      AsyncStorage.setItem("@selectedCurrency", profile.currency);
    }
  }, [profile.currency]);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem("@userProfile");
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        // Handle migration from old profile format to new format
        const updatedProfile = {
          ...DEFAULT_PROFILE,
          ...parsedProfile,
          firstName:
            parsedProfile.firstName || parsedProfile.name?.split(" ")[0] || "",
          lastName:
            parsedProfile.lastName ||
            parsedProfile.name?.split(" ").slice(1).join(" ") ||
            "",
          // Ensure phoneCountryCode is properly typed as ICountryCca2
          phoneCountryCode: (parsedProfile.phoneCountryCode ||
            "GB") as ICountryCca2,
          phoneCountryDialCode: parsedProfile.phoneCountryDialCode || "+44",
        };
        setProfile(updatedProfile);
        setOriginalProfile(updatedProfile);
      }
    } catch (error) {
      toast.error("Failed to load profile");
    }
  };

  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate email
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation is handled by the IntlPhoneField component

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!validateProfile()) {
      toast.error("Please correct the errors before saving");
      return;
    }

    try {
      await AsyncStorage.setItem("@userProfile", JSON.stringify(profile));
      // Also save the currency separately for easy access elsewhere
      await AsyncStorage.setItem("@selectedCurrency", profile.currency);
      setOriginalProfile(profile);
      setHasUnsavedChanges(false);
      toast.success("Profile saved successfully");
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  const confirmDiscardChanges = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to leave?",
        [
          {
            text: "Discard Changes",
            onPress: () => navigation.goBack(),
            style: "destructive",
          },
          {
            text: "Stay",
            style: "cancel",
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (profile.customCategories.includes(newCategory.trim())) {
      toast.error("Category already exists");
      return;
    }
    const updatedProfile = {
      ...profile,
      customCategories: [...profile.customCategories, newCategory.trim()],
    };
    setProfile(updatedProfile);
    setNewCategory("");
  };

  const handleRemoveCategory = (category: string) => {
    const updatedProfile = {
      ...profile,
      customCategories: profile.customCategories.filter((c) => c !== category),
    };
    setProfile(updatedProfile);
  };

  const updateProfile = (key: keyof UserProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    // Clear error for the field being updated
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // Phone number change handler for IntlPhoneField
  const handlePhoneChange = (data: any) => {
    updateProfile("phoneNumber", data.phoneNumber);
    if (data.selectedCountry && data.selectedCountry.code) {
      updateProfile(
        "phoneCountryCode",
        data.selectedCountry.code as ICountryCca2
      );
    }
    if (data.selectedCountry && data.selectedCountry.dialCode) {
      updateProfile("phoneCountryDialCode", data.selectedCountry.dialCode);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={confirmDiscardChanges} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.title}>Profile Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={profile.firstName}
              onChangeText={(value) => updateProfile("firstName", value)}
              placeholder="Enter your first name (e.g., John)"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={profile.lastName}
              onChangeText={(value) => updateProfile("lastName", value)}
              placeholder="Enter your last name (e.g., Smith)"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={profile.email}
              onChangeText={(value) => updateProfile("email", value)}
              placeholder="Enter your email (e.g., john.smith@example.com)"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={() => {
                if (
                  profile.email &&
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
                ) {
                  setErrors({
                    ...errors,
                    email: "Please enter a valid email address",
                  });
                }
              }}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>
          <View style={styles.phoneContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <IntlPhoneField
              defaultCountry={profile.phoneCountryCode}
              defaultValue={profile.phoneNumber}
              onChangeText={handlePhoneChange}
              containerStyle={styles.phoneFieldContainer}
              textInputStyle={styles.phoneFieldInput}
              dialCodeTextStyle={styles.phoneFieldDialCode}
              flagButtonStyle={styles.phoneFieldFlag}
              placeholder="Enter your phone number"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          <Text style={styles.currencySymbolPreview}>
            Selected currency symbol:{" "}
            {CURRENCY_SYMBOLS[profile.currency] || profile.currency}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.currencyList}
          >
            {CURRENCIES.map((curr) => (
              <Pressable
                key={curr}
                style={[
                  styles.currencyButton,
                  profile.currency === curr && styles.selectedCurrency,
                ]}
                onPress={() => updateProfile("currency", curr)}
              >
                <Text
                  style={[
                    styles.currencyText,
                    profile.currency === curr && styles.selectedCurrencyText,
                  ]}
                >
                  {curr} ({CURRENCY_SYMBOLS[curr]})
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Categories</Text>
          <View style={styles.toggleContainer}>
            <Text style={styles.label}>Use Custom Categories</Text>
            <Switch
              value={profile.useCustomCategories}
              onValueChange={(value) =>
                updateProfile("useCustomCategories", value)
              }
            />
          </View>
          <View style={styles.categoryInputContainer}>
            <TextInput
              style={styles.categoryInput}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="Add new category (e.g., Travel, Gifts)"
            />
            <Pressable style={styles.addButton} onPress={handleAddCategory}>
              <MaterialIcons name="add" size={24} color="white" />
            </Pressable>
          </View>
          <View style={styles.categoriesList}>
            {profile.customCategories.map((category) => (
              <View key={category} style={styles.categoryTag}>
                <Text style={styles.categoryText}>{category}</Text>
                <Pressable onPress={() => handleRemoveCategory(category)}>
                  <MaterialIcons name="close" size={20} color="#666" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {hasUnsavedChanges && (
          <View style={styles.unsavedChangesIndicator}>
            <MaterialIcons name="info" size={16} color="#FFA000" />
            <Text style={styles.unsavedChangesText}>
              You have unsaved changes
            </Text>
          </View>
        )}
      </ScrollView>

      {hasUnsavedChanges && (
        <View style={styles.bottomBar}>
          <Pressable style={styles.saveButtonLarge} onPress={saveProfile}>
            <MaterialIcons name="save" size={20} color="white" />
            <Text style={styles.saveButtonLargeText}>Save Changes</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  currencySymbolPreview: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  phoneContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#E53935",
    borderWidth: 1,
  },
  errorText: {
    color: "#E53935",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  // Phone field styles
  phoneFieldContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    height: 50,
  },
  phoneFieldInput: {
    fontSize: 16,
    color: "#333",
  },
  phoneFieldDialCode: {
    fontSize: 16,
    color: "#333",
  },
  phoneFieldFlag: {
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  currencyList: {
    flexDirection: "row",
    marginBottom: 8,
  },
  currencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  selectedCurrency: {
    backgroundColor: "#2E7D32",
  },
  currencyText: {
    fontSize: 16,
    color: "#666",
  },
  selectedCurrencyText: {
    color: "white",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryInputContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  categoryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#2E7D32",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
    marginRight: 4,
  },
  unsavedChangesIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginBottom: 16,
  },
  unsavedChangesText: {
    color: "#FFA000",
    fontSize: 14,
    marginLeft: 6,
  },
  bottomBar: {
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  saveButtonLarge: {
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonLargeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});
