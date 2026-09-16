import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { loginSuccess, loginThunk } from '../../store/authSlice';
import { APP_ROLES, AppRoleType } from '../../constants/roles';
import { ROUTES } from '../../constants/routes';

import { AppIcon } from '../../component/AppIcon';
import { CustomButton } from '../../component/Common/CustomButton';
import { BrandLogo } from '../../component/Common/BrandLogo';
import { showToast } from '../../store/toastSlice';
import { setActiveRole } from '../../theme/activeRole';
import * as authApi from '../../services/api/authApi';
import { StorageService } from '../../services/StorageService';
import { STORAGE_KEYS } from '../../constants/storageKeys';
export const OtpVerificationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();

  const phone = route.params?.phone || '+91 98765 43210';
  const role: AppRoleType = route.params?.role || APP_ROLES.CUSTOMER;
  const isLogin = route.params?.isLogin === true;
  const isLoading = useAppSelector(state => state.auth.isLoading);

  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
  
    if (value.length > 1) {
      const cleanDigits = value
        .replace(/[^0-9]/g, '')
        .slice(0, 4)
        .split('');
      const newOtp = [...otp];
      cleanDigits.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(cleanDigits.length, 3);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const cleanChar = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanChar;
    setOtp(newOtp);

    if (cleanChar && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    if (!isLogin) {
      setTimer(30);
      dispatch(
        showToast({
          type: 'info',
          title: 'OTP Resent',
          message:
            'A fresh 4-digit OTP has been dispatched to your mobile number.',
        }),
      );
      return;
    }

    try {
      await authApi.sendOtp({ mobile: phone.replace(/\s+/g, '') });
      setTimer(30);
      dispatch(
        showToast({
          type: 'info',
          title: 'OTP Resent',
          message:
            'A fresh 4-digit OTP has been dispatched to your mobile number.',
        }),
      );
    } catch (error: any) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Unable to resend OTP',
          message:
            error?.response?.data?.message ?? 'Please try again shortly.',
        }),
      );
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(ROUTES.LOGIN);
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 4 || otp.some(d => !d)) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Invalid OTP',
          message: 'Please enter all 4 digits of the OTP',
        }),
      );
      return;
    }

    if (isLogin) {
      const result = await dispatch(
        loginThunk({ mobile: phone.replace(/\s+/g, ''), otp: fullOtp }),
      );

      if (loginThunk.fulfilled.match(result)) {
        const loggedInRole = result.payload.user.role;
        setActiveRole(loggedInRole);
        
        dispatch(
          showToast({
            type: 'success',
            title: 'Welcome!',
            message: `Logged in as ${result.payload.user.name || 'User'} (Role: ${loggedInRole})`,
          }),
        );

        // RootNavigator uses conditional rendering (isAuthenticated) and handles navigation automatically.
      }
      return;
    }

    setActiveRole(role);
    
    // Create a basic fallback user since mock data was removed
    const user = {
      id: `USR_${Date.now()}`,
      name: `Demo ${role}`,
      phone: phone,
      role: role,
    };

    // Save mock login to persistent storage
    StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, 'authenticated_mock_token').catch(console.error);
    StorageService.setItem(STORAGE_KEYS.USER_DATA, user).catch(console.error);
    StorageService.setItem(STORAGE_KEYS.USER_ROLE, role).catch(console.error);

    dispatch(loginSuccess({ user, token: 'authenticated_mock_token' }));
    dispatch(
      showToast({
        type: 'success',
        title: 'Welcome!',
        message: `Logged in as ${user.name} (Role: ${role})`,
      }),
    );

    // RootNavigator uses conditional rendering (isAuthenticated) and handles navigation automatically.
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 8, 24),
            paddingBottom: Math.max(insets.bottom + 8, 24),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
      <StatusBar barStyle="dark-content" />
      {/* Top Back Arrow Header */}
      <View style={[styles.headerRow, { top: Math.max(insets.top + 8, 16) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <AppIcon name="arrow-left" size={20} color="#0D523B" />
        </TouchableOpacity>
      </View>

      {/* Center Content */}
      <View style={styles.content}>
        <BrandLogo size={56} style={styles.logo} />
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>We have sent a 4 digit OTP to</Text>
        <Text style={styles.phoneText}>{phone}</Text>

        {/* 6 Individual Square/Rounded OTP Input Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={el => {
                inputRefs.current[idx] = el;
              }}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : styles.otpBoxEmpty,
              ]}
              value={digit}
              onChangeText={val => handleOtpChange(val, idx)}
              onKeyPress={e => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={2}
              textAlign="center"
              placeholder=""
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Countdown Timer */}
        <TouchableOpacity
          style={styles.timerRow}
          onPress={handleResendOtp}
          disabled={timer > 0}
          activeOpacity={0.7}
        >
          <Text style={styles.timerText}>
            {timer > 0 ? (
              <>
                Resend OTP in{' '}
                <Text style={styles.timerBold}>
                  00:{timer < 10 ? `0${timer}` : timer}
                </Text>
              </>
            ) : (
              <Text style={styles.timerBold}>Resend OTP</Text>
            )}
          </Text>
        </TouchableOpacity>

        {/* Verify CTA Pill Button */}
        <CustomButton
          title={isLoading ? 'Verifying...' : 'Verify'}
          onPress={handleVerify}
          variant="primary"
          style={styles.verifyBtn}
          gradientColors={['#168A53', '#0D523B']}
          disabled={isLoading}
        />

        {/* Back to Login Link */}
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backToLoginBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  bottomLeaves: {
    bottom: -10,
    right: -20,
    transform: [{ rotate: '-30deg' }],
  },
  headerRow: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logo: {
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0D523B',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    color: '#64748B',
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
    marginBottom: 28,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 22,
    width: '100%',
  },
  otpBox: {
    width: 46,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    fontWeight: '800',
    fontSize: 19,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFilled: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  otpBoxEmpty: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  timerRow: {
    marginBottom: 24,
  },
  timerText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
  },
  timerBold: {
    color: '#0D523B',
    fontWeight: '800',
  },
  verifyBtn: {
    width: '100%',
    borderRadius: 24,
    height: 50,
    marginBottom: 16,
  },
  backToLoginBtn: {
    paddingVertical: 8,
  },
  backToLoginText: {
    color: '#0D523B',
    fontSize: 13,
    fontWeight: '700',
  },
});
