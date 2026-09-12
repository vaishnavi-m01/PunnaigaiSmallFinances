import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';

const HeaderGraphic = () => (
  <View style={[StyleSheet.absoluteFillObject, { overflow: 'hidden' }]} pointerEvents="none">
    <View style={{
      position: 'absolute',
      top: -30,
      right: -40,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(255,255,255,0.06)'
    }} />
    <View style={{
      position: 'absolute',
      top: 40,
      right: -80,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(255,255,255,0.04)'
    }} />
  </View>
);

export const PartnerEarningsReportScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const partner = useAppSelector(state => state.partner);

  const investmentHistory = [
    {
      id: '1',
      title: 'Initial Capital Investment',
      date: '02 Sep 2026',
      time: '10:00 AM',
      amount: partner.details.totalContribution,
      status: 'Active',
    }
  ];

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
        <HeaderGraphic />
        <View style={styles.headerTitleRow}>
          <Text style={[typography.h3, { color: colors.white }]}>
            My Investment
          </Text>
        </View>
      </LinearGradient>

      {/* Full Page White Container */}
      <View style={styles.pageContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Investment Card */}
          <View style={[styles.card, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.smallIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <AppIcon name="briefcase" size={14} color="#16A34A" />
              </View>
              <Text style={[typography.subtitle, { color: '#16A34A', marginLeft: 8 }]}>
                Total Capital Invested
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: '#DCFCE7' }]} />
            
            <View style={{ alignItems: 'center', marginVertical: 12 }}>
              <Text style={[typography.h1, { color: '#0F172A', fontSize: 32 }]}>
                {formatINR(partner.details.totalContribution)}
              </Text>
              <Text style={[typography.bodyMedium, { color: '#16A34A', marginTop: 8, fontWeight: '600' }]}>
                ● Active Partnership
              </Text>
            </View>
          </View>

          {/* Investment Agreement Details */}
          <Text style={[typography.h3, { color: '#0F172A', marginBottom: 16, marginTop: 8 }]}>
            Agreement Details
          </Text>
          <View style={[styles.card, { backgroundColor: colors.white, borderColor: '#E2E8F0' }]}>
            <View style={[styles.dataRow, { borderBottomColor: '#F1F5F9' }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Profit Share Percentage</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>25% of Net Profit</Text>
            </View>
            <View style={[styles.dataRow, { borderBottomColor: '#F1F5F9' }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Payout Frequency</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>Monthly (Wallet Credit)</Text>
            </View>
            <View style={[styles.dataRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>Lock-in Period</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>36 Months</Text>
            </View>
          </View>

          {/* Investment History Log */}
          <Text style={[typography.h3, { color: '#0F172A', marginBottom: 16, marginTop: 8 }]}>
            Investment History
          </Text>
          {investmentHistory.map((item) => (
            <View key={item.id} style={[styles.historyCard, { backgroundColor: colors.white, borderColor: '#E2E8F0' }]}>
              <View style={styles.historyLeft}>
                <View style={[styles.historyIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <AppIcon name="download" size={18} color="#16A34A" />
                </View>
                <View>
                  <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                    {item.title}
                  </Text>
                  <Text style={[typography.caption, { color: '#64748B', marginTop: 2 }]}>
                    {item.date} • {item.time}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.subtitle, { color: '#16A34A' }]}>
                  {formatINR(item.amount)}
                </Text>
                <Text style={[typography.caption, { color: '#16A34A', marginTop: 2, fontWeight: '600' }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          ))}

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
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
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
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});
