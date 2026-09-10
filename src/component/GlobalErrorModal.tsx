import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppHooks';
import { clearError } from '../store/globalErrorSlice';
import { useAppTheme } from '../theme/useAppTheme';
import { AppIcon } from './AppIcon';
import { CustomButton } from './Common/CustomButton';

export const GlobalErrorModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { hasError, title, message, errorCode } = useAppSelector(
    state => state.globalError,
  );
  const { colors, typography, radius } = useAppTheme();

  if (!hasError) return null;

  return (
    <Modal visible={hasError} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalCard,
            { borderRadius: radius.lg, backgroundColor: colors.surface },
          ]}
        >
          <View
            style={[styles.iconCircle, { backgroundColor: colors.errorLight }]}
          >
            <AppIcon name="alert-circle" size={32} color={colors.error} />
          </View>

          <Text
            style={[typography.h3, styles.title, { color: colors.textPrimary }]}
          >
            {title || 'Something went wrong'}
          </Text>

          <Text
            style={[
              typography.bodyMedium,
              styles.message,
              { color: colors.textSecondary },
            ]}
          >
            {message || 'An unexpected error occurred. Please try again.'}
          </Text>

          {errorCode ? (
            <Text
              style={[
                typography.caption,
                { color: colors.textMuted, marginBottom: 16 },
              ]}
            >
              Error Code: {errorCode}
            </Text>
          ) : null}

          <CustomButton
            title="Dismiss"
            variant="alert"
            onPress={() => dispatch(clearError())}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    width: '100%',
  },
});
