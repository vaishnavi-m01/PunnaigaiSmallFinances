import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  Switch,
  Modal,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { useAppTheme } from '../../theme/useAppTheme';
import { Header } from '../../component/Header';
import { AppIcon } from '../../component/AppIcon';
import { formatINR } from '../../utils/currency';
import { ROUTES } from '../../constants/routes';
import { logoutThunk } from '../../store/authSlice';
import { fetchPartnerProfileThunk } from '../../store/partnerSlice';
import { showToast } from '../../store/toastSlice';
import { Skeleton } from '../../component/Common/Skeleton';
import { useTranslation } from '../../context/LanguageContext';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import * as partnerApi from '../../services/api/partnerApi';

export const PartnerProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const user = useAppSelector(state => state.auth.user);
  const partner = useAppSelector(state => state.partner);
  const dispatch = useAppDispatch();
  const { t, language, setLanguage } = useTranslation();

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = React.useState(false);
  const [isImageViewVisible, setIsImageViewVisible] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState<string | null>(null);

  // Edit Profile State
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editMobile, setEditMobile] = React.useState('');
  const [editPassword, setEditPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [nameError, setNameError] = React.useState('');
  const [mobileError, setMobileError] = React.useState('');
  const [emailError, setEmailError] = React.useState('');

  const uploadImage = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append('profileimage', {
        uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);

      await partnerApi.updatePartnerProfile(formData);
      dispatch(
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Profile photo updated successfully',
        }),
      );
      dispatch(fetchPartnerProfileThunk());
    } catch (error) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to update profile photo',
        }),
      );
    }
  };

  const handleTakePhoto = async () => {
    setIsPhotoModalVisible(false);
    const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const handleChooseFromGallery = async () => {
    setIsPhotoModalVisible(false);
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const handleDeletePhoto = async () => {
    setIsPhotoModalVisible(false);
    setIsImageViewVisible(false);
    try {
      await partnerApi.deletePartnerProfileImage();
      setProfileImage(null);
      dispatch(
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Profile photo removed successfully',
        }),
      );
      dispatch(fetchPartnerProfileThunk());
    } catch (error) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to remove profile photo',
        }),
      );
    }
  };

  useEffect(() => {
    dispatch(fetchPartnerProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    if (partner.profile) {
      setProfileImage((partner.profile as any).profile_image_url || null);
      setEditName(partner.profile.name || '');
      setEditEmail(partner.profile.email || '');
      setEditMobile(partner.profile.mobile || '');
    }
  }, [partner.profile]);

  const handleSaveProfile = async () => {
    let hasError = false;

    if (!editName) {
      setNameError(t('Please enter name') || 'Please enter name');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!editMobile) {
      setMobileError(
        t('Please enter mobile number') || 'Please enter mobile number',
      );
      hasError = true;
    } else {
      setMobileError('');
    }

    if (!editEmail) {
      setEmailError(t('Please enter email') || 'Please enter email');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (hasError) {
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('email', editEmail);
      formData.append('mobile', editMobile);
      if (editPassword) {
        formData.append('password', editPassword);
      }

      await partnerApi.updatePartnerProfile(formData);
      dispatch(
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Profile updated successfully',
        }),
      );
      setIsEditModalVisible(false);
      setEditPassword('');
      dispatch(fetchPartnerProfileThunk());
    } catch (error) {
      dispatch(
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to update profile',
        }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchPartnerProfileThunk());
    setIsRefreshing(false);
  }, [dispatch]);

  const name = partner.profile?.name || user?.name?.split(' ')[0] || 'Partner';

  const handleLogout = () => {
    Alert.alert(
      t('Confirm Logout') || 'Confirm Logout',
      t('Are you sure you want to log out of your account?') || 'Are you sure you want to log out of your account?',
      [
        { text: t('Cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('Log Out') || 'Log Out',
          style: 'destructive',
          onPress: () => dispatch(logoutThunk()),
        },
      ],
      { cancelable: true },
    );
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F4F9F6' }]}>
      <StatusBar barStyle="dark-content" />
      <Header title={t('Profile')} showBack={false} />

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {isRefreshing ? (
            <View>
              <View style={[styles.profileRow, { marginBottom: 32 }]}>
                <Skeleton height={52} width={52} borderRadius={26} />
                <View style={{ marginLeft: 16 }}>
                  <Skeleton
                    height={24}
                    width={150}
                    borderRadius={8}
                    style={{ marginBottom: 8 }}
                  />
                  <Skeleton height={16} width={80} borderRadius={8} />
                </View>
              </View>
              <Skeleton
                height={180}
                borderRadius={16}
                style={{ marginBottom: 16 }}
              />
              <Skeleton
                height={180}
                borderRadius={16}
                style={{ marginBottom: 16 }}
              />
              <Skeleton
                height={100}
                borderRadius={16}
                style={{ marginBottom: 16 }}
              />
            </View>
          ) : (
            <>
              {/* Profile Header */}
              <View style={styles.profileRow}>
                <View style={{ position: 'relative' }}>
                  <View
                    style={[
                      styles.avatarCircle,
                      { backgroundColor: '#10B981' },
                    ]}
                  >
                    {profileImage ? (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setIsImageViewVisible(true)}
                      >
                        <Image
                          source={{ uri: profileImage }}
                          style={{ width: 52, height: 52, borderRadius: 26 }}
                        />
                      </TouchableOpacity>
                    ) : (
                      <Text style={[typography.h3, { color: colors.white }]}>
                        {name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.cameraIconContainer}
                    onPress={() => setIsPhotoModalVisible(true)}
                  >
                    <AppIcon name="camera" size={12} color="#FFF" />
                  </TouchableOpacity>
                </View>
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={[typography.h3, { color: '#0F172A' }]}>
                    {name}
                  </Text>
                  <Text style={[typography.bodyMedium, { color: '#64748B' }]}>
                    Partner
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsEditModalVisible(true)}
                  style={styles.editBtn}
                >
                  <AppIcon name="edit-2" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Investment Summary */}
              <View style={[styles.card, { backgroundColor: colors.white }]}>
                <View style={styles.cardHeaderRow}>
                  <View
                    style={[
                      styles.smallIconCircle,
                      { backgroundColor: '#E0F2FE' },
                    ]}
                  >
                    <AppIcon name="briefcase" size={14} color="#0284C7" />
                  </View>
                  <Text
                    style={[
                      typography.subtitle,
                      { color: '#0F172A', marginLeft: 8 },
                    ]}
                  >
                    {t('Investment Summary') || 'Investment Summary'}
                  </Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.dataRow}>
                  <Text style={[typography.bodyMedium, { color: '#64748B' }]}>
                    {t('Total Investment') || 'Total Investment'}
                  </Text>
                  <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                    {formatINR(
                      partner.profile?.investment_summary?.total_investment ||
                        0,
                    )}
                  </Text>
                </View>
                {/* <View style={[styles.dataRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={[typography.bodyMedium, { color: '#64748B' }]}>{t('Remaining Investment') || 'Remaining Investment'}</Text>
              <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                {formatINR(partner.profile?.investment_summary?.remaining_investment || 0)}
              </Text>
            </View> */}
              </View>

              {/* Wallet Balance */}
              <View
                style={[
                  styles.card,
                  { backgroundColor: '#F5F3FF', borderColor: '#EDE9FE' },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <View
                    style={[
                      styles.smallIconCircle,
                      { backgroundColor: '#EDE9FE' },
                    ]}
                  >
                    <AppIcon name="credit-card" size={14} color="#8B5CF6" />
                  </View>
                  <Text
                    style={[
                      typography.subtitle,
                      { color: '#8B5CF6', marginLeft: 8 },
                    ]}
                  >
                    {t('Wallet Balance') || 'Wallet Balance'}
                  </Text>
                </View>
                <View
                  style={[styles.divider, { backgroundColor: '#EDE9FE' }]}
                />

                <View
                  style={[
                    styles.dataRow,
                    { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 },
                  ]}
                >
                  <Text style={[typography.bodyMedium, { color: '#64748B' }]}>
                    {t('Total Wallet Balance') || 'Total Wallet Balance'}
                  </Text>
                  <Text style={[typography.subtitle, { color: '#0F172A' }]}>
                    {formatINR(partner.profile?.wallet_balance || 0)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Sticky Bottom Section */}
        {(!isRefreshing || partner.profile) && (
          <View
            style={{
              paddingHorizontal: 24,
              paddingBottom: Math.max(insets.bottom + 16, 24),
              paddingTop: 8,
              backgroundColor: '#F4F9F6',
            }}
          >
            {/* Language Toggle */}
            <View
              style={[
                styles.bottomBtn,
                { backgroundColor: '#ECFDF5', marginBottom: 16 },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppIcon
                  name="globe"
                  size={20}
                  color="#059669"
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    typography.subtitle,
                    { color: '#059669', fontWeight: '700' },
                  ]}
                >
                  {t('Language')} : {language === 'en' ? 'English' : 'தமிழ்'}
                </Text>
              </View>
              <Switch
                value={language === 'ta'}
                onValueChange={toggleLanguage}
                trackColor={{ false: '#D1D5DB', true: '#34D399' }}
                thumbColor={language === 'ta' ? '#059669' : '#F3F4F6'}
              />
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={[
                styles.bottomBtn,
                {
                  backgroundColor: '#FEF2F2',
                  position: 'relative',
                  justifyContent: 'center',
                },
              ]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  typography.subtitle,
                  { color: '#EF4444', fontWeight: '700' },
                ]}
              >
                {t('Logout')}
              </Text>
              <View style={{ position: 'absolute', right: 20 }}>
                <AppIcon name="log-out" size={20} color="#EF4444" />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={isPhotoModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsPhotoModalVisible(false)}
        >
          <View style={styles.photoModalCard}>
            <Text style={styles.photoModalTitle}>
              {t('Change Profile Photo') || 'Change Profile Photo'}
            </Text>
            <TouchableOpacity
              style={styles.photoOptionBtn}
              onPress={handleTakePhoto}
            >
              <AppIcon name="camera" size={20} color="#059669" />
              <Text style={styles.photoOptionText}>
                {t('Take Photo') || 'Take Photo'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoOptionBtn}
              onPress={handleChooseFromGallery}
            >
              <AppIcon name="image" size={20} color="#059669" />
              <Text style={styles.photoOptionText}>
                {t('Choose from Gallery') || 'Choose from Gallery'}
              </Text>
            </TouchableOpacity>
            {profileImage && (
              <TouchableOpacity
                style={styles.photoOptionBtn}
                onPress={handleDeletePhoto}
              >
                <AppIcon name="trash-2" size={20} color="#EF4444" />
                <Text style={[styles.photoOptionText, { color: '#EF4444' }]}>
                  {t('Remove Photo') || 'Remove Photo'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.photoCancelBtn}
              onPress={() => setIsPhotoModalVisible(false)}
            >
              <Text style={styles.photoCancelText}>
                {t('Cancel') || 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Full Screen Image View Modal */}
      <Modal
        visible={isImageViewVisible && !!profileImage}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImageViewVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: insets.top + 16,
              right: 16,
              flexDirection: 'row',
              gap: 16,
              zIndex: 10,
            }}
          >
            <TouchableOpacity onPress={handleDeletePhoto}>
              <AppIcon name="trash-2" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsImageViewVisible(false)}>
              <AppIcon name="x" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          {profileImage && (
            <Image
              source={{ uri: profileImage }}
              style={{ width: '100%', height: '80%' }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setIsEditModalVisible(false)}
            />
            <View style={[styles.photoModalCard, { maxHeight: '90%' }]}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <Text style={styles.photoModalTitle}>
                  {t('Edit Profile') || 'Edit Profile'}
                </Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <AppIcon name="x" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom || 24 }}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('Name') || 'Name'}{' '}
                    <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      nameError ? { borderColor: colors.error } : {},
                    ]}
                    value={editName}
                    onChangeText={val => {
                      setEditName(val);
                      setNameError('');
                    }}
                    placeholder="Enter name"
                    placeholderTextColor="#94A3B8"
                  />
                  {nameError ? (
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.error, marginTop: 4 },
                      ]}
                    >
                      {nameError}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('Mobile Number') || 'Mobile Number'}{' '}
                    <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      mobileError ? { borderColor: colors.error } : {},
                    ]}
                    value={editMobile}
                    onChangeText={val => {
                      setEditMobile(val);
                      setMobileError('');
                    }}
                    placeholder="Enter mobile number"
                    keyboardType="phone-pad"
                    placeholderTextColor="#94A3B8"
                  />
                  {mobileError ? (
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.error, marginTop: 4 },
                      ]}
                    >
                      {mobileError}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('Email') || 'Email'}{' '}
                    <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      emailError ? { borderColor: colors.error } : {},
                    ]}
                    value={editEmail}
                    onChangeText={val => {
                      setEditEmail(val);
                      setEmailError('');
                    }}
                    placeholder="Enter email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#94A3B8"
                  />
                  {emailError ? (
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.error, marginTop: 4 },
                      ]}
                    >
                      {emailError}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('New Password') || 'New Password'} (Optional)
                  </Text>
                  <View
                    style={[
                      styles.input,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingRight: 12,
                        paddingVertical: Platform.OS === 'ios' ? 12 : 0,
                      },
                    ]}
                  >
                    <TextInput
                      style={{
                        flex: 1,
                        fontSize: 15,
                        color: '#0F172A',
                        paddingVertical: Platform.OS === 'android' ? 12 : 0,
                      }}
                      value={editPassword}
                      onChangeText={setEditPassword}
                      placeholder="Enter new password"
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#94A3B8"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={{ padding: 4 }}
                    >
                      <AppIcon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#94A3B8"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>
                      {t('Save Changes') || 'Save Changes'}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#059669',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F4F9F6',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  photoModalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  photoModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  photoOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  photoOptionText: {
    fontSize: 16,
    color: '#334155',
    marginLeft: 12,
    fontWeight: '500',
  },
  photoCancelBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  photoCancelText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  editBtn: {
    padding: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  saveBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
