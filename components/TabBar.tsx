import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TabBarProps {
  activeTab: 'daily' | 'monthly';
  onTabChange: (tab: 'daily' | 'monthly') => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.tab, activeTab === 'daily' && styles.activeTab]} 
        onPress={() => onTabChange('daily')}
      >
        <MaterialCommunityIcons 
          name="calendar-today" 
          size={24} 
          color={activeTab === 'daily' ? '#2E7D32' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'daily' && styles.activeText]}>
          Daily
        </Text>
      </Pressable>
      <Pressable 
        style={[styles.tab, activeTab === 'monthly' && styles.activeTab]} 
        onPress={() => onTabChange('monthly')}
      >
        <MaterialCommunityIcons 
          name="calendar-month" 
          size={24} 
          color={activeTab === 'monthly' ? '#2E7D32' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'monthly' && styles.activeText]}>
          Monthly
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  activeText: {
    color: '#2E7D32',
  },
});