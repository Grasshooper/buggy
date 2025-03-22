import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { useNavigation } from '@react-navigation/native';

interface UserProfile {
  name: string;
  email: string;
  currency: string;
  customCategories: string[];
  useCustomCategories: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  currency: 'USD',
  customCategories: [],
  useCustomCategories: false,
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [newCategory, setNewCategory] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('@userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem('@userProfile', JSON.stringify(updatedProfile));
      toast.success('Profile saved successfully');
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (profile.customCategories.includes(newCategory.trim())) {
      toast.error('Category already exists');
      return;
    }
    const updatedProfile = {
      ...profile,
      customCategories: [...profile.customCategories, newCategory.trim()]
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
    setNewCategory('');
  };

  const handleRemoveCategory = (category: string) => {
    const updatedProfile = {
      ...profile,
      customCategories: profile.customCategories.filter(c => c !== category)
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  const updateProfile = (key: keyof UserProfile, value: any) => {
    const updatedProfile = { ...profile, [key]: value };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.title}>Profile Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(value) => updateProfile('name', value)}
              placeholder="Enter your name"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={(value) => updateProfile('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyList}>
            {CURRENCIES.map((curr) => (
              <Pressable
                key={curr}
                style={[
                  styles.currencyButton,
                  profile.currency === curr && styles.selectedCurrency,
                ]}
                onPress={() => updateProfile('currency', curr)}
              >
                <Text style={[
                  styles.currencyText,
                  profile.currency === curr && styles.selectedCurrencyText
                ]}>{curr}</Text>
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
              onValueChange={(value) => updateProfile('useCustomCategories', value)}
            />
          </View>
          <View style={styles.categoryInputContainer}>
            <TextInput
              style={styles.categoryInput}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="Add new category"
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  currencyList: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  currencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  selectedCurrency: {
    backgroundColor: '#2E7D32',
  },
  currencyText: {
    fontSize: 16,
    color: '#666',
  },
  selectedCurrencyText: {
    color: 'white',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#2E7D32',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
});