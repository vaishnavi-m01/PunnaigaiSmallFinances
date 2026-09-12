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
    navigation.navigate(ROUTES.LOAN_PACKAGE_DETAIL, { pkg });
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
                    { backgroundColor: colors.primary + '1A' },
                  ]}
                >
                  <AppIcon name="star" size={20} color={colors.primary} />
                </View>
                <View style={styles.pkgHeaderTexts}>
                  <Text style={styles.pkgName}>{pkg.name}</Text>
                  <Text style={styles.pkgSubText}>
                    {pkg.repaymentPeriod} {pkg.repaymentFrequency} {'•'}{' '}
                    {pkg.dueCalculationType === 'lump_sum'
                      ? 'Lump Sum'
                      : `${pkg.installmentCount} Installments`}
                  </Text>
                </View>
                <View style={styles.arrowIcon}>
                  <AppIcon
                    name="arrow-right"
                    size={16}
                    color={colors.primary}
                  />
                </View>
              </View>
              <View style={styles.pkgGrid}>
                <PackageValue
                  label="Min Amount"
                  value={formatINR(pkg.minAmount)}
                  icon="trending-down"
                />
                <View style={styles.gridDivider} />
                <PackageValue
                  label="Max Amount"
                  value={formatINR(pkg.maxAmount)}
                  icon="trending-up"
                />
                <View style={styles.gridDivider} />
                <PackageValue
                  label="Deduction"
                  value={`${pkg.deductionPercentage}%`}
                  icon="percent"
                  accent="#C2410C"
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
  icon,
}: {
  label: string;
  value: string;
  accent?: string;
  icon?: string;
}) => (
  <View style={styles.pkgGridCol}>
    <View style={styles.gridLabelRow}>
      {icon && <AppIcon name={icon as any} size={12} color="#94A3B8" />}
      <Text style={styles.gridLabel}>{label}</Text>
    </View>
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
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pkgHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  pkgIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pkgHeaderTexts: { flex: 1, marginLeft: 12 },
  pkgName: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  pkgSubText: { color: '#64748B', fontSize: 12, fontWeight: '500' },
  arrowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pkgGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pkgGridCol: {
    alignItems: 'center',
    flex: 1,
  },
  gridDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  gridLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  gridLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
  },
});
