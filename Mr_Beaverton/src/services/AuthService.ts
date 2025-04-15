import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../api/apiService';

// Kullanıcı tipi
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  createdAt: string;
  streak?: number;
  lastActive?: string;
}

// Kullanıcı girişi için tip
export interface LoginCredentials {
  email: string;
  password: string;
}

// Kullanıcı kaydı için tip
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
}

// Auth servisi
class AuthService {
  private currentUser: User | null = null;
  private readonly USER_STORAGE_KEY = 'wordpecker_current_user';
  private readonly TOKEN_STORAGE_KEY = 'token';

  constructor() {
    this.loadCurrentUser();
  }

  // Mevcut kullanıcıyı AsyncStorage'a kaydet
  private async saveCurrentUser(): Promise<void> {
    try {
      if (this.currentUser) {
        await AsyncStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this.currentUser));
      } else {
        await AsyncStorage.removeItem(this.USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Mevcut kullanıcı kaydedilirken hata oluştu:', error);
    }
  }

  // Mevcut kullanıcıyı AsyncStorage'dan yükle
  private async loadCurrentUser(): Promise<void> {
    try {
      const storedUser = await AsyncStorage.getItem(this.USER_STORAGE_KEY);
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Mevcut kullanıcı yüklenirken hata oluştu:', error);
    }
  }

  // Kullanıcı girişi
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiService.login(credentials.email, credentials.password);
      this.currentUser = response.user;
      await this.saveCurrentUser();
      return response.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Kullanıcı kaydı
  async register(data: RegisterData): Promise<User> {
    try {
      const response = await apiService.register(data.username, data.email, data.password, data.name);
      this.currentUser = response.user;
      await this.saveCurrentUser();
      return response.user;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // Şifre sıfırlama
  async resetPassword(email: string): Promise<boolean> {
    try {
      await apiService.resetPassword(email);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Çıkış yap
  async logout(): Promise<void> {
    this.currentUser = null;
    await this.saveCurrentUser();
    await AsyncStorage.removeItem(this.TOKEN_STORAGE_KEY);
  }

  // Mevcut kullanıcıyı getir
  async getCurrentUser(): Promise<User | null> {
    await this.loadCurrentUser();
    return this.currentUser;
  }

  // Kullanıcı oturum açmış mı kontrol et
  async isLoggedIn(): Promise<boolean> {
    await this.loadCurrentUser();
    return this.currentUser !== null;
  }
}

export default new AuthService();
