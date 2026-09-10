import React, { useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { fetchLoanPackagesThunk } from '../../store/customerSlice';
import { LoanPackage } from '../../types/models';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';

export const ApplyLoanScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { colors, typography } = useAppTheme();
  const insets = useSafeAreaInsets();
  const loanPackages = useAppSelector(state => state.customer.loanPackages);
  const isPackagesLoading = useAppSelector(
    state => state.customer.isPackagesLoading,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchLoanPackagesThunk());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchLoanPackagesThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const openLoanDetails = (pkg: LoanPackage) => {
    navigation.navigate(ROUTES.LOAN_DETAILS, { loanId: pkg.id || 1 });
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <Header
        title="Loan Packages"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.heroBanner}>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>Choose Loan Package</Text>
            <Text style={styles.heroSubtitle}>
              Tap a package to view loan details.
            </Text>
          </View>
          <Image
            source={require('../../../assets/image/loanPackages.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {isPackagesLoading ? (
          <View>
            <Skeleton
              height={140}
              borderRadius={16}
              style={styles.skeletonGap}
            />
            <Skeleton
              height={140}
              borderRadius={16}
              style={styles.skeletonGap}
            />
            <Skeleton height={140} borderRadius={16} />
          </View>
        ) : loanPackages.length === 0 ? (
          <View style={styles.emptyBox}>
            <AppIcon name="info" size={48} color={colors.textSecondary} />
            <Text style={[typography.h3, styles.emptyTitle]}>
              No loan packages available.
            </Text>
            <Text style={[typography.bodyMedium, styles.emptyText]}>
              Please check back later.
            </Text>
          </View>
        ) : (
          loanPackages.map((pkg, index) => (
            <TouchableOpacity
              key={pkg.id}
              style={styles.packageCard}
              onPress={() => openLoanDetails(pkg)}
              activeOpacity={0.85}
            >
              {index === 0 && (
                <View
                  style={[
                    styles.popularBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}
              <View style={styles.pkgHeader}>
                <View
                  style={[
                    styles.pkgIconCircle,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <AppIcon name="briefcase" size={22} color={colors.primary} />
                </View>
                <View style={styles.pkgHeaderTexts}>
                  <Text style={styles.pkgName}>{pkg.name}</Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {pkg.repaymentPeriod} {pkg.repaymentFrequency} {'•'}{' '}
                    {pkg.dueCalculationType === 'lump_sum'
                      ? 'Lump Sum'
                      : `${pkg.installmentCount} Installments`}
                  </Text>
                </View>
                <AppIcon
                  name="chevron-right"
                  size={18}
                  color={colors.textMuted}
                />
              </View>
              <View
                style={[styles.pkgGrid, { borderTopColor: colors.borderLight }]}
              >
                <PackageValue
                  label="Min Amount"
                  value={formatINR(pkg.minAmount)}
                />
                <PackageValue
                  label="Max Amount"
                  value={formatINR(pkg.maxAmount)}
                />
                <PackageValue
                  label="Deduction"
                  value={`${pkg.deductionPercentage}%`}
                  accent={colors.primary}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const PackageValue = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) => (
  <View style={styles.pkgGridCol}>
    <Text style={styles.gridLabel}>{label}</Text>
    <Text style={[styles.gridValue, accent ? { color: accent } : null]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroTextBlock: { flex: 1, paddingRight: 12 },
  heroTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  heroSubtitle: { fontSize: 12, color: '#64748B', lineHeight: 17 },
  heroImage: { width: 100, height: 80, borderRadius: 10 },
  skeletonGap: { marginBottom: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#64748B', marginTop: 16, textAlign: 'center' },
  emptyText: { color: '#64748B', marginTop: 8, textAlign: 'center' },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  popularBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  popularText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  pkgHeader: { flexDirection: 'row', alignItems: 'center' },
  pkgIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pkgHeaderTexts: { flex: 1, marginLeft: 12 },
  pkgName: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  pkgGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
  },
  pkgGridCol: { flex: 1 },
  gridLabel: { color: '#64748B', fontSize: 10, fontWeight: '600' },
  gridValue: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
});
