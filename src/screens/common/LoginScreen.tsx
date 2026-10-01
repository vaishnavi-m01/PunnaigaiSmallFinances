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
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../../component/AppIcon';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { clearLoginError, loginThunk } from '../../store/authSlice';
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
      dispatch(
        showToast({
          type: 'error',
          title: 'Required',
          message: 'Please enter your email and password.',
        }),
      );
      return;
    }

    setIsLoggingIn(true);
    try {
      const resultAction = await dispatch(loginThunk({ email, password }));
      if (loginThunk.fulfilled.match(resultAction)) {
        // Navigation is handled automatically by the auth state change in App.tsx
      } else {
        dispatch(
          showToast({
            type: 'error',
            title: 'Login Failed',
            message: resultAction.payload as string,
          }),
        );
      }
    } catch (error: any) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Error',
          message: 'An unexpected error occurred.',
        }),
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* @ts-ignore */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 50, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.brandTitle}>Punnaigai</Text>
              <Text style={styles.brandSubtitle}>Small Finance</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Sign In</Text>
              <Text style={styles.welcomeSubtitle}>
                Enter your details to proceed.
              </Text>
            </View>

            {/* Email Field */}
            <Text style={styles.inputLabel}>Email Address</Text>
            <View
              style={[
                styles.inputWrapper,
                isFocusedEmail && styles.inputWrapperFocused,
              ]}
            >
              <AppIcon
                name="mail"
                size={20}
                color={isFocusedEmail ? '#0D523B' : '#A0AAB5'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="hello@example.com"
                placeholderTextColor="#A0AAB5"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setIsFocusedEmail(true)}
                onBlur={() => setIsFocusedEmail(false)}
                selectionColor="#0D523B"
              />
            </View>

            {/* Password Field */}
            <Text style={[styles.inputLabel, { marginTop: 24 }]}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                isFocusedPassword && styles.inputWrapperFocused,
              ]}
            >
              <AppIcon
                name="lock"
                size={20}
                color={isFocusedPassword ? '#0D523B' : '#A0AAB5'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Enter your password"
                placeholderTextColor="#A0AAB5"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setIsFocusedPassword(true)}
                onBlur={() => setIsFocusedPassword(false)}
                selectionColor="#0D523B"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <AppIcon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#A0AAB5"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            {/* <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity> */}

            {/* Error Message */}
            {apiError ? (
              <View style={styles.errorContainer}>
                <AppIcon name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isLoggingIn && styles.primaryButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoggingIn}
              activeOpacity={0.8}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>LOGIN</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            {/* <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Contact Support</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean white
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  titleContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0D523B',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  formCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 30,
    marginBottom: 30,
  },
  welcomeSection: {
    marginBottom: 35,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#64748B',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  inputWrapperFocused: {
    borderColor: '#0D523B',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    height: '100%',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 16,
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#0D523B',
    fontSize: 14,
    fontWeight: '700',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 10,
    flex: 1,
  },
  primaryButton: {
    height: 60,
    marginTop: 40,
    backgroundColor: '#0D523B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  footerLink: {
    color: '#0D523B',
    fontSize: 14,
    fontWeight: '700',
  },
});
