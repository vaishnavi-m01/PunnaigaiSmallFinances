import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon } from '../../component/AppIcon';

export const PartnerAddExpenseScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const navigation = useNavigation<any>();

  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
          <View style={styles.headerTitleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                <AppIcon name="arrow-left" size={24} color="#0F172A" />
              </TouchableOpacity>
              <Text style={[typography.h2, { color: '#0F172A' }]}>Add Expense</Text>
            </View>
          </View>
          <Text style={[typography.bodyMedium, { color: '#64748B', marginTop: 8 }]}>
            Expense transaction
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[typography.h3, { color: '#0F172A', marginBottom: 20 }]}>New Expense</Text>

          <View style={[styles.formCard, { backgroundColor: colors.white }]}>
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={[typography.caption, styles.label]}>Expense category *</Text>
                <TouchableOpacity style={styles.inputBox}>
                  <Text style={[typography.bodyMedium, { color: category ? '#0F172A' : '#94A3B8' }]}>
                    {category || 'Select category'}
                  </Text>
                  <AppIcon name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[typography.caption, styles.label]}>Amount (₹) *</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={[styles.input, typography.bodyMedium, { color: '#0F172A' }]}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={[typography.caption, styles.label]}>Date *</Text>
                <TouchableOpacity style={styles.inputBox}>
                  <Text style={[typography.bodyMedium, { color: date ? '#0F172A' : '#94A3B8' }]}>
                    {date || 'dd-mm-yyyy'}
                  </Text>
                  <AppIcon name="calendar" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[typography.caption, styles.label]}>Reference</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={[styles.input, typography.bodyMedium, { color: '#0F172A' }]}
                    placeholder="Invoice or voucher number"
                    placeholderTextColor="#94A3B8"
                    value={reference}
                    onChangeText={setReference}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.inputGroup, { marginBottom: 24 }]}>
              <Text style={[typography.caption, styles.label]}>Description</Text>
              <View style={[styles.inputBox, { height: 100, alignItems: 'flex-start', paddingTop: 8 }]}>
                <TextInput
                  style={[styles.input, typography.bodyMedium, { color: '#0F172A', textAlignVertical: 'top' }]}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: '#0D523B' }]}
              onPress={() => {
                // Mock submission
                navigation.goBack();
              }}
            >
              <Text style={[typography.bodyMedium, { color: colors.white, fontWeight: '700' }]}>Create expense</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outlineBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  formCard: {
    borderRadius: 8,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    color: '#0F172A',
    marginBottom: 6,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    height: 44,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
  },
  primaryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
});
