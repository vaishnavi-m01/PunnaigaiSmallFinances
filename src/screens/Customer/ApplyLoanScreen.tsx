import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { fetchLoanPackagesThunk, submitLoanRequestThunk } from '../../store/customerSlice';
import { LoanPackage } from '../../types/models';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';
import { Skeleton } from '../../component/Common/Skeleton';
import { formatINR } from '../../utils/currency';
import { showToast } from '../../store/toastSlice';
import { ROUTES } from '../../constants/routes';

const FREQUENCIES = [
  { id: 'DAILY', label: 'Daily', div: 1 },
  { id: 'WEEKLY', label: 'Weekly', div: 7 },
  { id: 'MONTHLY', label: 'Monthly', div: 30 },
];

export const ApplyLoanScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { colors, typography } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Real loan packages from API
  const loanPackages = useAppSelector(state => state.customer.loanPackages);
  const isPackagesLoading = useAppSelector(state => state.customer.isPackagesLoading);
  const isSubmittingLoan = useAppSelector(state => state.customer.isSubmittingLoan);

  // Wizard State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State — selectedType now refs a real LoanPackage
  const [selectedPkg, setSelectedPkg] = useState<LoanPackage | null>(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [frequency] = useState(FREQUENCIES[2]); // Default Monthly
  const [tenureDays, setTenureDays] = useState('365');
  const [purpose, setPurpose] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch loan packages on mount
  useEffect(() => {
    dispatch(fetchLoanPackagesThunk());
  }, [dispatch]);

  // Auto-select first package when packages load
  useEffect(() => {
    if (loanPackages.length > 0 && !selectedPkg) {
      setSelectedPkg(loanPackages[0]);
      setLoanAmount(String(loanPackages[0].minAmount));
    }
  }, [loanPackages, selectedPkg]);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchLoanPackagesThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  // Calculations
  const amountNum = parseFloat(loanAmount.replace(/,/g, '')) || 0;
  const daysNum = parseInt(tenureDays, 10) || 365;
  const isAmountExcess = selectedPkg ? amountNum > selectedPkg.maxAmount : false;
  const isAmountTooLow = selectedPkg ? amountNum < selectedPkg.minAmount : false;

  // Deduction % acts as interest/fee
  const deductionRate = selectedPkg ? selectedPkg.deductionPercentage / 100 : 0;
  const interestAmount = amountNum * deductionRate;
  const totalRepayment = amountNum; // repayment_obligation already includes deduction
  const processingFeeAmt = interestAmount;

  const periods = daysNum > 0 ? (daysNum / frequency.div) : 0;
  const emiAmount = periods > 0 ? Math.round(totalRepayment / periods) : 0;

  const handleNext = () => {
    if (currentStep === 2) {
      if (!amountNum || isAmountTooLow) {
        dispatch(showToast({ type: 'error', title: 'Invalid Amount', message: `Minimum amount is ${formatINR(selectedPkg?.minAmount ?? 0)}` }));
        return;
      }
      if (isAmountExcess) {
        dispatch(showToast({ type: 'error', title: 'Invalid Amount', message: `Maximum amount is ${formatINR(selectedPkg?.maxAmount ?? 0)}` }));
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3) as 1 | 2 | 3);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (!selectedPkg) {
      dispatch(showToast({ type: 'error', title: 'No Package', message: 'Please select a loan package.' }));
      return;
    }
    const result = await dispatch(
      submitLoanRequestThunk({
        loan_package_id: selectedPkg.id,
        requested_amount: amountNum,
      })
    );
    if (submitLoanRequestThunk.fulfilled.match(result)) {
      setShowSuccess(true);
    } else {
      const errMsg = result.payload as string;
      dispatch(showToast({ type: 'error', title: 'Submission Failed', message: errMsg }));
    }
  };

  const getHeaderTitle = () => {
    if (currentStep === 1) return 'Loan Packages';
    if (currentStep === 2) return 'Apply for Loan';
    return 'Review & Submit';
  };

  // UI Components
  const renderProgressBar = () => {
    const steps = [
      { num: 1, label: 'Package' },
      { num: 2, label: 'Details' },
      { num: 3, label: 'Confirm' },
    ];

    return (
      <View style={styles.progressWrapper}>
        <View style={styles.progressContainer}>
          {steps.map((step, index) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <React.Fragment key={step.num}>
                <View style={styles.stepItem}>
                  <View style={[
                    styles.stepCircle,
                    { 
                      backgroundColor: isActive || isCompleted ? colors.primary : '#F1F5F9',
                      borderColor: isActive || isCompleted ? colors.primary : '#CBD5E1',
                    }
                  ]}>
                    {isCompleted ? (
                      <AppIcon name="check" size={14} color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.stepNum, { color: isActive ? '#FFFFFF' : '#64748B' }]}>
                        {step.num}
                      </Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepLabel, 
                    { color: isActive || isCompleted ? colors.textPrimary : '#64748B', fontWeight: isActive ? '700' : '500' }
                  ]}>
                    {step.label}
                  </Text>
                </View>
                {index < steps.length - 1 && (
                  <View style={[styles.stepLine, { backgroundColor: currentStep > index + 1 ? colors.primary : '#E2E8F0' }]} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSelectedPackageCard = () => (
    <View style={styles.selectedPackageCard}>
      <View style={[styles.selectedIconBox, { backgroundColor: colors.primarySoft }]}>
        <AppIcon name="briefcase" size={20} color={colors.primary} />
      </View>
      <View style={styles.selectedDetails}>
        <Text style={[typography.caption, { color: '#64748B' }]}>Selected Package</Text>
        <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{selectedPkg?.name ?? '—'}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {formatINR(selectedPkg?.minAmount ?? 0)} - {formatINR(selectedPkg?.maxAmount ?? 0)} | {selectedPkg?.repaymentPeriod} {selectedPkg?.repaymentFrequency}
        </Text>
      </View>
    </View>
  );

  const renderInput = (label: string, value: string, onChange: (val: string) => void, placeholder: string, keyboardType: any = 'default', isCurrency = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputFieldBox}>
        {isCurrency && <Text style={styles.currencyPrefix}>₹</Text>}
        <TextInput
          style={[styles.inputField, isCurrency && { paddingLeft: 4 }]}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <Header title={getHeaderTitle()} showBack={true} onBackPress={handleBack} />

      {currentStep > 1 && renderProgressBar()}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {isRefreshing ? (
          <View style={{ paddingTop: 16 }}>
            <Skeleton height={200} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={150} borderRadius={16} style={{ marginBottom: 16 }} />
            <Skeleton height={150} borderRadius={16} />
          </View>
        ) : (
          <>
            {currentStep === 1 && (
              <View style={styles.stepContainer}>
                <View style={styles.headerRow}>
                  <Text style={[typography.h2, { color: colors.textPrimary }]}>Choose Loan Package</Text>
                  <Text style={[typography.body, { color: colors.textSecondary }]}>Select a package that best fits your needs.</Text>
                </View>

                {isPackagesLoading ? (
                  <View>
                    <Skeleton height={140} borderRadius={16} style={{ marginBottom: 12 }} />
                    <Skeleton height={140} borderRadius={16} style={{ marginBottom: 12 }} />
                    <Skeleton height={140} borderRadius={16} />
                  </View>
                ) : loanPackages.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                    <AppIcon name="info" size={32} color={colors.textSecondary} />
                    <Text style={[typography.body, { color: colors.textSecondary, marginTop: 12 }]}>No loan packages available.</Text>
                  </View>
                ) : (
                  loanPackages.map((pkg) => (
                    <TouchableOpacity
                      key={pkg.id}
                      style={[
                        styles.packageCard,
                        { borderColor: colors.border },
                        selectedPkg?.id === pkg.id && [styles.packageCardActive, { borderColor: colors.primary, backgroundColor: colors.primarySoft }]
                      ]}
                      onPress={() => {
                        setSelectedPkg(pkg);
                        setLoanAmount(String(pkg.minAmount));
                      }}
                      activeOpacity={0.8}
                    >
                      {pkg.id === loanPackages[0]?.id && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularText}>Most Popular</Text>
                        </View>
                      )}

                      <View style={styles.packageHeader}>
                        <View style={[styles.packageIconCircle, { backgroundColor: selectedPkg?.id === pkg.id ? colors.primary : colors.surface }]}>
                          <AppIcon name="briefcase" size={24} color={selectedPkg?.id === pkg.id ? colors.white : colors.primary} />
                        </View>
                        <View style={styles.packageHeaderTexts}>
                          <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: 4 }]}>{pkg.name}</Text>
                          <Text style={[typography.caption, { color: colors.textSecondary }]}>
                            {pkg.repaymentPeriod} {pkg.repaymentFrequency} • {pkg.dueCalculationType === 'lump_sum' ? 'Lump Sum' : `${pkg.installmentCount} Installments`}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.packageDetailsGrid, { borderTopColor: colors.borderLight }]}>
                        <View style={styles.packageDetailCol}>
                          <Text style={[typography.caption, { color: colors.textSecondary }]}>Amount Range</Text>
                          <Text style={[typography.subtitle, { color: colors.textPrimary, marginTop: 4 }]}>
                            {formatINR(pkg.minAmount)} - {formatINR(pkg.maxAmount)}
                          </Text>
                        </View>
                        <View style={styles.packageDetailCol}>
                          <Text style={[typography.caption, { color: colors.textSecondary }]}>Deduction</Text>
                          <Text style={[typography.subtitle, { color: colors.textPrimary, marginTop: 4 }]}>
                            {pkg.deductionPercentage}%
                          </Text>
                        </View>
                        <View style={styles.packageDetailCol}>
                          <Text style={[typography.caption, { color: colors.textSecondary }]}>Duration</Text>
                          <Text style={[typography.subtitle, { color: colors.textPrimary, marginTop: 4 }]}>
                            {pkg.repaymentPeriod} {pkg.repaymentFrequency}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* STEP 2: DETAILS (FORM) */}
            {currentStep === 2 && (
              <View>
                {renderSelectedPackageCard()}

                <Text style={styles.sectionTitle}>Loan Details</Text>
                
                {renderInput('Loan Amount', loanAmount, setLoanAmount, 'e.g. 10000', 'numeric', true)}
                {isAmountTooLow && <Text style={styles.errorText}>Min: {formatINR(selectedPkg?.minAmount ?? 0)}</Text>}
                {isAmountExcess && <Text style={styles.errorText}>Max: {formatINR(selectedPkg?.maxAmount ?? 0)}</Text>}

                {renderInput('Purpose of Loan', purpose, setPurpose, 'e.g. Personal Needs')}
                
                {renderInput('Total Tenure (Days)', tenureDays, setTenureDays, 'e.g. 365', 'numeric')}

                <Text style={styles.sectionTitle}>Guarantor Details</Text>
                {renderInput('Guarantor Name', guarantorName, setGuarantorName, 'e.g. Ramesh')}
                {renderInput('Guarantor Phone', guarantorPhone, setGuarantorPhone, 'e.g. 9876543210', 'phone-pad')}
              </View>
            )}

            {/* STEP 3: CONFIRM (REVIEW) */}
            {currentStep === 3 && (
              <View>
                {renderSelectedPackageCard()}

                <Text style={styles.sectionTitle}>Loan Details</Text>
                
                <View style={styles.reviewList}>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Loan Amount</Text>
                    <Text style={styles.reviewValue}>{formatINR(amountNum)}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Repayment Duration</Text>
                    <Text style={styles.reviewValue}>{tenureDays} Days</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>{frequency.label} EMI (Approx.)</Text>
                    <Text style={styles.reviewValue}>{formatINR(emiAmount)}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Total Repayment Amount</Text>
                    <Text style={styles.reviewValue}>{formatINR(totalRepayment)}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Deduction ({selectedPkg?.deductionPercentage ?? 0}%)</Text>
                    <Text style={styles.reviewValue}>{formatINR(processingFeeAmt)}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Repayment Period</Text>
                    <Text style={styles.reviewValue}>{selectedPkg?.repaymentPeriod} {selectedPkg?.repaymentFrequency}</Text>
                  </View>
                </View>

                <View style={[styles.reviewList, { marginTop: 16 }]}>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Purpose of Loan</Text>
                    <Text style={styles.reviewValue}>{purpose}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Guarantor Name</Text>
                    <Text style={styles.reviewValue}>{guarantorName || 'N/A'}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Guarantor Phone</Text>
                    <Text style={styles.reviewValue}>{guarantorPhone || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <AppIcon name="info" size={16} color={colors.primary} />
                  <Text style={styles.infoText}>Please confirm your details before submitting the request.</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* BOTTOM BUTTON */}
      {currentStep >= 1 && (
        <View style={[styles.bottomFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={currentStep === 1 ? handleNext : (currentStep === 2 ? handleNext : handleSubmit)}
            disabled={isSubmittingLoan}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmittingLoan ? 'Submitting...' : (currentStep === 1 ? 'Apply for Loan' : (currentStep === 2 ? 'Next' : 'Submit Request'))}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SUCCESS MODAL */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            
            <View style={styles.successIllustration}>
              <AppIcon name="file-text" size={48} color={colors.primarySoft} />
              <View style={[styles.successCheck, { backgroundColor: colors.primary }]}>
                <AppIcon name="check" size={16} color="#FFF" />
              </View>
            </View>

            <Text style={styles.modalTitle}>Loan Request Submitted!</Text>
            <Text style={styles.modalSub}>
              Your loan request has been successfully submitted. You will be notified once your request is reviewed.
            </Text>

            <View style={styles.modalDetailsList}>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Package</Text>
                <Text style={styles.modalValue}>{selectedPkg?.name ?? '—'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Loan Amount</Text>
                <Text style={styles.modalValue}>{formatINR(amountNum)}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Request ID</Text>
                <Text style={styles.modalValue}>#PLN2025001</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Date</Text>
                <Text style={styles.modalValue}>09 Sep 2026</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: colors.primary, width: '100%' }]}
              onPress={() => {
                setShowSuccess(false);
                navigation.navigate(ROUTES.CUSTOMER_TABS);
              }}
            >
              <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
    marginTop: 6,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    marginTop: -18,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  heroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  heroImage: {
    width: 140,
    height: 140,
    // resizeMode: 'contain',
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  popularBadgeWrapper: {
    position: 'absolute',
    top: -12,
    left: 20,
    zIndex: 10,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pkgHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pkgHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pkgIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pkgTitleBlock: {
    marginLeft: 16,
  },
  pkgName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  pkgAmountRange: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pkgDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  pkgColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pkgColItem: {
    flex: 1,
    alignItems: 'center',
  },
  pkgColIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pkgColLabel: {
    fontSize: 9.5,
    color: '#64748B',
    marginLeft: 4,
  },
  pkgColValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  pkgColDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F5F9',
  },
  selectedPackageCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 24,
  },
  selectedIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedDetails: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputFieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 14,
  },
  currencyPrefix: {
    fontSize: 16,
    color: '#1E293B',
    marginRight: 4,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 12,
  },
  reviewList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  reviewLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#1E293B',
    marginLeft: 10,
    flex: 1,
  },
  bottomFooter: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  primaryButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  successIllustration: {
    width: 80,
    height: 80,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successCheck: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalDetailsList: {
    width: '100%',
    marginBottom: 24,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  modalValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  stepContainer: {
    marginTop: 4,
  },
  headerRow: {
    marginBottom: 20,
    gap: 4,
  },
  packageCardActive: {
    borderWidth: 2,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  packageIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageHeaderTexts: {
    flex: 1,
  },
  packageDetailsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 14,
    gap: 4,
  },
  packageDetailCol: {
    flex: 1,
    alignItems: 'center',
  },
});
