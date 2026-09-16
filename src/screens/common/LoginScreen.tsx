import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../../constants/routes';
import { AppIcon } from '../../component/AppIcon';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { clearLoginError, loginThunk } from '../../store/authSlice';
import * as authApi from '../../services/api/authApi';
import { showToast } from '../../store/toastSlice';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const apiError = useAppSelector(state => state.auth.loginError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (apiError) dispatch(clearLoginError());
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (apiError) dispatch(clearLoginError());
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      dispatch(showToast({ type: 'error', title: 'Required', message: 'Please enter your email and password.' }));
      return;
    }
    
    setIsLoggingIn(true);
    try {
      /* 
      // Commented out OTP flow as requested
      await authApi.sendOtp({ mobile });
      navigation.navigate(ROUTES.OTP_VERIFY, { phone: mobile, isLogin: true });
      */
      
      const resultAction = await dispatch(loginThunk({ email, password }));
      if (loginThunk.fulfilled.match(resultAction)) {
        // Navigation is handled automatically by the auth state change in App.tsx (or similar Root Navigator)
      } else {
        dispatch(showToast({ type: 'error', title: 'Login Failed', message: resultAction.payload as string }));
      }
    } catch (error: any) {
      dispatch(showToast({ type: 'error', title: 'Error', message: 'An unexpected error occurred.' }));
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
      >
        <View style={styles.headerSection}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>Punnaigai</Text>
          <Text style={styles.brandSubtitle}>Small Finance</Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Sign In</Text>
          <Text style={styles.welcomeSubtitle}>Enter your email and password to securely access your account.</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={[styles.inputWrapper, isFocusedEmail && styles.inputWrapperFocused]}>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your email"
              placeholderTextColor="#CBD5E1"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setIsFocusedEmail(true)}
              onBlur={() => setIsFocusedEmail(false)}
              selectionColor="#10B981"
            />
            {email.length > 0 && (
              <TouchableOpacity onPress={() => handleEmailChange('')} style={styles.clearButton}>
                <AppIcon name="x-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>Password</Text>
          <View style={[styles.inputWrapper, isFocusedPassword && styles.inputWrapperFocused]}>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your password"
              placeholderTextColor="#CBD5E1"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onFocus={() => setIsFocusedPassword(true)}
              onBlur={() => setIsFocusedPassword(false)}
              selectionColor="#10B981"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={[styles.clearButton, { marginRight: password.length > 0 ? 8 : 0 }]}>
              <AppIcon name={showPassword ? "eye-off" : "eye"} size={20} color="#94A3B8" />
            </TouchableOpacity>
            {password.length > 0 && (
              <TouchableOpacity onPress={() => handlePasswordChange('')} style={styles.clearButton}>
                <AppIcon name="x-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {apiError ? (
            <View style={styles.errorContainer}>
              <AppIcon name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryButton, isLoggingIn && styles.primaryButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoggingIn}
            activeOpacity={0.8}
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoImage: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
    lineHeight: 22,
  },
  formSection: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  inputWrapperFocused: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
  },
  countryCodeBadge: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    height: '100%',
    padding: 0,
    letterSpacing: 1,
  },
  clearButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
    marginLeft: 6,
    flex: 1,
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#0D523B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
