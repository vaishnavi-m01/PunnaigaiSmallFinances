import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';
import { logout } from '../../store/authSlice';

export const PartnerProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const user = useAppSelector(state => state.auth.user);
  const partner = useAppSelector(state => state.partner);
  const dispatch = useAppDispatch();

  const name = user?.name?.split(' ')[0] || 'Kavin';

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logout()) },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#168B5E' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Area */}
      <LinearGradient
        colors={['#0B533E', '#168B5E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}
      >
        <View style={styles.headerTitleRow}>
          <Text style={[typography.h3, { color: colors.white }]}>
            Profile
          </Text>
        </View>
      </LinearGradient>

      {/* Full Page White Container */}
      <View style={styles.pageContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileRow}>
            <View style={[styles.avatarCircle, { backgroundColor: '#10B981' }]}>
              <Text style={[typography.h3, { color: colors.white }]}>
                {name.charAt(0)}
              </Text>
            </View>
            <View style={{ marginLeft: 16 }}>
              <Text style={[typography.h3, { color: '#0F172A' }]}>
                {name}
              </Text>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>
                Partner
              </Text>
            </View>
          </View>

          {/* Investment Summary */}
          <View style={[styles.card, { backgroundColor: colors.white }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.smallIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <AppIcon name="briefcase" size={14} color="#0284C7" />
              </View>
              <Text style={[typography.subtitle, { color: '#0F172A', marginLeft: 8 }]}>
                Investment Summary
              </Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.dataRow}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Total Investment</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                {formatINR(partner.details.totalContribution)}
              </Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Investment Withdrawn</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                {formatINR(0)}
              </Text>
            </View>
            <View style={[styles.dataRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Remaining Investment</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                {formatINR(partner.details.totalContribution)}
              </Text>
            </View>
          </View>

          {/* Profit Summary */}
          <View style={[styles.card, { backgroundColor: '#FFF5F5', borderColor: '#FEE2E2' }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.smallIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <AppIcon name="pie-chart" size={14} color="#EF4444" />
              </View>
              <Text style={[typography.subtitle, { color: '#EF4444', marginLeft: 8 }]}>
                Profit Summary
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: '#FEE2E2' }]} />
            
            <View style={[styles.dataRow, { borderBottomColor: '#FEE2E2' }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Total Profit Earned</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                {formatINR(partner.details.totalEarnings)}
              </Text>
            </View>
            <View style={[styles.dataRow, { borderBottomColor: '#FEE2E2' }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Profit Withdrawn</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                {formatINR(0)}
              </Text>
            </View>
            <View style={[styles.dataRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Available Profit (Wallet)</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                {formatINR(partner.details.walletBalance)}
              </Text>
            </View>
          </View>

          {/* Wallet Balance */}
          <View style={[styles.card, { backgroundColor: '#F5F3FF', borderColor: '#EDE9FE' }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.smallIconCircle, { backgroundColor: '#EDE9FE' }]}>
                <AppIcon name="credit-card" size={14} color="#8B5CF6" />
              </View>
              <Text style={[typography.subtitle, { color: '#8B5CF6', marginLeft: 8 }]}>
                Wallet Balance
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: '#EDE9FE' }]} />
            
            <View style={[styles.dataRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Total Wallet Balance</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                {formatINR(partner.details.walletBalance)}
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.bottomBtn, { backgroundColor: '#FEF2F2', position: 'relative', justifyContent: 'center', marginTop: 16 }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={[typography.subtitle, { color: '#EF4444', fontWeight: '700' }]}>
              Log Out
            </Text>
            <View style={{ position: 'absolute', right: 20 }}>
              <AppIcon name="log-out" size={20} color="#EF4444" />
            </View>
          </TouchableOpacity>

        </ScrollView>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Make room for sticky bottom
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  smallIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  bottomBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
});
