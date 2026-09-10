import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { STORAGE_KEYS } from '../constants/storageKeys';

const AUTH_TOKEN_SERVICE = 'com.punnaigai.finances.auth-token';

export class StorageService {
  static async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      if (key === STORAGE_KEYS.AUTH_TOKEN) {
        if (typeof value !== 'string' || !value) return false;

        try {
          await Keychain.setGenericPassword('auth', value, {
            service: AUTH_TOKEN_SERVICE,
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          });
        } catch {
          await AsyncStorage.setItem(key, value);
        }
        return true;
      }

      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`[StorageService] Error saving ${key}:`, error);
      return false;
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      if (key === STORAGE_KEYS.AUTH_TOKEN) {
        try {
          const credentials = await Keychain.getGenericPassword({
            service: AUTH_TOKEN_SERVICE,
          });
          if (credentials) return credentials.password as T;
        } catch {}

        const fallbackToken = await AsyncStorage.getItem(key);
        return fallbackToken as T | null;
      }

      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`[StorageService] Error reading ${key}:`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<boolean> {
    try {
      if (key === STORAGE_KEYS.AUTH_TOKEN) {
        try {
          await Keychain.resetGenericPassword({ service: AUTH_TOKEN_SERVICE });
        } catch {}
      }
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[StorageService] Error removing ${key}:`, error);
      return false;
    }
  }

  static async clearAuth(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: AUTH_TOKEN_SERVICE });
    } catch (error) {
      console.error('[StorageService] Error clearing secure token:', error);
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  }
}
