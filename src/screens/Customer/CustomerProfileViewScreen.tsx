import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/useAppHooks';
import { Header } from '../../component/Header';
import { formatDate } from '../../utils/date';

export const CustomerProfileViewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useAppSelector(state => state.auth.user);
  const profile = user?.customer ?? user;

  const profileName = profile?.name || user?.name || 'Customer';
  const profileMobile = profile?.mobile || user?.phone || '';
  const profileEmail = profile?.email || user?.email || 'Not provided';
  const customerCode = profile?.customer_code || '—';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="Personal Information" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <InfoRow label="Full Name" value={profileName} />
          <InfoRow label="Customer ID" value={customerCode} />
          <InfoRow label="Phone Number" value={profileMobile} />
          <InfoRow label="Email Address" value={profileEmail} />
          <InfoRow 
            label="Address" 
            value={[profile?.address, profile?.city, profile?.state, profile?.pincode]
              .filter(Boolean)
              .join(', ') || 'Not provided'} 
          />
          <InfoRow label="Date of Birth" value={profile?.date_of_birth ? formatDate(profile.date_of_birth) : 'Not provided'} />
          <InfoRow label="Occupation" value={profile?.occupation || 'Not provided'} isLast />
        </View>
      </ScrollView>
    </View>
  );
};

const InfoRow = ({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) => (
  <View style={[styles.infoRow, !isLast && styles.borderBottom]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F6',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
});
