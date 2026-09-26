import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Linking, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';

export const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleCall = () => {
    Linking.openURL('tel:18001237866');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@punnaigaifinances.com');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="Help & Support" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <AppIcon name="help-circle" size={32} color="#0D523B" />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>Our support team is available 24x7</Text>
        </View>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        
        <TouchableOpacity style={styles.contactCard} onPress={handleCall} activeOpacity={0.8}>
          <View style={[styles.iconCircle, { backgroundColor: '#EAF5EE' }]}>
            <AppIcon name="phone-call" size={20} color="#0D523B" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Toll-Free Helpline</Text>
            <Text style={styles.contactValue}>1800-123-PUNNAIGAI (7866)</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleEmail} activeOpacity={0.8}>
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
            <AppIcon name="mail" size={20} color="#1D4ED8" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email Support</Text>
            <Text style={styles.contactValue}>support@punnaigaifinances.com</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <AppIcon name="clock" size={16} color="#64748B" />
          <Text style={styles.infoText}>Support Hours: Mon - Sat (9:00 AM - 6:00 PM)</Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F6',
  },
  content: {
    padding: 16,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '800',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    padding: 12,
    gap: 8,
  },
  infoText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});
