import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_ROLES } from '../../constants/roles';
import { ROUTES } from '../../constants/routes';
import { AppIcon } from '../../component/AppIcon';
import { CustomButton } from '../../component/Common/CustomButton';
import { BrandLogo } from '../../component/Common/BrandLogo';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { clearLoginError } from '../../store/authSlice';
import * as authApi from '../../services/api/authApi';
import { showToast } from '../../store/toastSlice';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const apiError = useAppSelector(state => state.auth.loginError);

  const [mobileNumber, setMobileNumber] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleMobileChange = (text: string) => {
    setMobileNumber(text);
    dispatch(clearLoginError());
  };

  const handleLogin = async () => {
    if (!mobileNumber.trim()) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Mobile number required',
          message: 'Please enter your registered mobile number.',
        }),
      );
      return;
    }

    const mobile = mobileNumber.replace(/\s+/g, '');

    setIsSendingOtp(true);
    try {
      await authApi.sendOtp({ mobile });
      navigation.navigate(ROUTES.OTP_VERIFY, {
        phone: mobile,
        role: APP_ROLES.CUSTOMER,
        isLogin: true,
      });
    } catch (error: any) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Unable to send OTP',
          message:
            error?.response?.data?.message ??
            'Please check your mobile number and try again.',
        }),
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 16, 32),
            paddingBottom: Math.max(insets.bottom + 16, 24),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Logo */}
        <View style={styles.logoSection}>
          <BrandLogo size={68} variant="dark" showTagline={true} />
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>Login to your account</Text>
        </View>

        {/* Form Inputs Container */}
        <View style={styles.formContainer}>
          {/* Mobile Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <AppIcon
                name="phone"
                size={17}
                color="#64748B"
                style={styles.leftIcon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Enter mobile number"
                placeholderTextColor="#94A3B8"
                value={mobileNumber}
                maxLength={10}
                onChangeText={handleMobileChange}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Error Message */}
          {apiError ? (
            <View style={styles.errorBox}>
              <AppIcon name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          ) : null}

          {/* Forgot Password */}
          <View style={styles.rememberRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate(ROUTES.OTP_VERIFY, {
                  phone: mobileNumber.startsWith('+91')
                    ? mobileNumber
                    : `+91 ${mobileNumber}`,
                  role: APP_ROLES.CUSTOMER,
                  isForgot: true,
                });
              }}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button with Emerald Gradient */}
          <CustomButton
            title={isSendingOtp ? 'Sending OTP...' : 'Login'}
            onPress={handleLogin}
            variant="primary"
            size="large"
            style={styles.loginButton}
            gradientColors={['#168A53', '#0D523B']}
            disabled={isSendingOtp}
          />
          {isSendingOtp && (
            <ActivityIndicator
              color="#0D523B"
              style={{ marginTop: -8, marginBottom: 8 }}
            />
          )}

          {/* Don't have an account? Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Don't have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate(ROUTES.OTP_VERIFY, {
                  phone: mobileNumber.startsWith('+91')
                    ? mobileNumber
                    : `+91 ${mobileNumber}`,
                  role: APP_ROLES.CUSTOMER,
                  isRegister: true,
                });
              }}
            >
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  bottomLeaves: {
    bottom: -15,
    right: -25,
    transform: [{ rotate: '-25deg' }],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 26,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
    color: '#64748B',
  },
  formContainer: {
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  leftIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
    height: '100%',
    padding: 0,
  },
  rightIconBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 6,
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  rememberRow: {
    alignItems: 'flex-end',
    marginTop: 2,
    marginBottom: 22,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D523B',
  },
  loginButton: {
    borderRadius: 24,
    height: 50,
    marginBottom: 16,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  registerPrompt: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  registerLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D523B',
  },
});
