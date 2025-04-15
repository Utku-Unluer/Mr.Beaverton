import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL - change this to match your backend server
// Mobil cihazda çalışacağı için localhost yerine bilgisayarın IP adresini kullan
// Örnek: 'http://192.168.1.5:3000/api'
const API_URL = 'http://10.0.2.2:3000/api'; // Android Emulator için özel IP
// const API_URL = 'http://localhost:3000/api'; // Yerel geliştirme için
// Mobil cihaz için kendi IP adresinizi buraya ekleyin

// Define types
export interface WordList {
  id: string | number;
  userId: string | number;
  name: string;
  description: string;
  context?: string;
  createdAt: string;
  wordCount?: number;
}

export interface Word {
  id: number;
  listId: number;
  value: string;
  meaning: string;
  context?: string;
  createdAt: string;
}



export interface Quiz {
  wordId: string;
  type: 'quiz';
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface TestOption {
  id: string; // 'a', 'b', 'c'
  text: string;
}

export interface TestQuestion {
  id: number;
  question: string;
  options: TestOption[];
  correctAnswer: string; // 'a', 'b', 'c'
  wordId: number;
}

export interface User {
  id: number;
  email: string;
  password?: string;
  name: string;
  createdAt: string;
  streak: number;
  lastActive: string;
}

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication token interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Define API service with real implementations
const apiService = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    try {
      // Gerçek API çağrısı
      const response = await api.post('/auth/login', {
        email,
        password
      });

      // Token'i AsyncStorage'a kaydet
      await AsyncStorage.setItem('token', response.data.token);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (username: string, email: string, password: string, name: string) => {
    try {
      // Gerçek API çağrısı
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        name
      });

      // Token'i AsyncStorage'a kaydet
      await AsyncStorage.setItem('token', response.data.token);

      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      // Gerçek API çağrısı
      const response = await api.post('/auth/reset-password', { email });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Gerçek API çağrısı
      await api.post('/auth/logout');
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, remove token
      await AsyncStorage.removeItem('token');
    }
  },

  // Lists endpoints
  getLists: async (): Promise<WordList[]> => {
    try {
      // JWT token'dan kullanıcı bilgilerini al
      const token = await AsyncStorage.getItem('token');
      let userId = 1; // Varsayılan kullanıcı ID

      if (token && token.includes('.') && token.split('.').length > 1) {
        try {
          // Token'dan kullanıcı ID'sini çıkar
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          if (tokenData && tokenData.id) {
            userId = tokenData.id;
          }
        } catch (e) {
          console.error('Token parsing error:', e);
          // Hata durumunda varsayılan userId kullanılacak
        }
      }

      console.log('Getting lists for userId:', userId);
      const response = await api.get(`/lists?userId=${userId}`);
      console.log('Lists response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get lists error:', error);
      throw error;
    }
  },

  createList: async (list: { name: string; description: string; context?: string }): Promise<WordList> => {
    try {
      // JWT token'dan kullanıcı bilgilerini al
      const token = await AsyncStorage.getItem('token');
      let userId = 1; // Varsayılan kullanıcı ID

      if (token && token.includes('.') && token.split('.').length > 1) {
        try {
          // Token'dan kullanıcı ID'sini çıkar
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          if (tokenData && tokenData.id) {
            userId = tokenData.id;
          }
        } catch (e) {
          console.error('Token parsing error:', e);
          // Hata durumunda varsayılan userId kullanılacak
        }
      }

      console.log('Creating list with userId:', userId);
      console.log('List data:', list);

      // userId ekleyerek isteği gönder
      const response = await api.post('/lists', { ...list, userId });
      return response.data;
    } catch (error: any) {
      console.error('Create list error:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Words endpoints
  getWords: async (listId: number): Promise<Word[]> => {
    try {
      const response = await api.get(`/words/list/${listId}`);
      return response.data;
    } catch (error) {
      console.error('Get words error:', error);
      throw error;
    }
  },

  addWord: async (word: { listId: number; value: string; meaning: string; context?: string }): Promise<Word> => {
    try {
      const response = await api.post('/words', word);
      return response.data;
    } catch (error) {
      console.error('Add word error:', error);
      throw error;
    }
  },

  addBulkWords: async (listId: number, words: { value: string; meaning: string; context?: string }[]): Promise<Word[]> => {
    try {
      const response = await api.post('/words/bulk', { listId, words });
      return response.data;
    } catch (error) {
      console.error('Add bulk words error:', error);
      throw error;
    }
  },



  // Quiz endpoints
  startQuiz: async (listId: number): Promise<{ questions: Quiz[] }> => {
    try {
      const response = await api.get(`/quiz/start/${listId}`);
      return response.data;
    } catch (error) {
      console.error('Start quiz error:', error);
      throw error;
    }
  },

  // Delete a word
  deleteWord: async (wordId: number): Promise<void> => {
    try {
      await api.delete(`/words/${wordId}`);
    } catch (error) {
      console.error('Delete word error:', error);
      throw error;
    }
  },

  // Delete multiple words
  deleteBulkWords: async (wordIds: number[]): Promise<{ deletedCount: number }> => {
    try {
      const response = await api.post('/words/bulk-delete', { wordIds });
      return response.data;
    } catch (error) {
      console.error('Delete bulk words error:', error);
      throw error;
    }
  },

  // Generate test for a list
  generateTest: async (listId: number, questionCount: number = 5): Promise<{ questions: TestQuestion[] }> => {
    try {
      const response = await api.post('/tests/generate', { listId, questionCount });
      return response.data;
    } catch (error) {
      console.error('Generate test error:', error);
      throw error;
    }
  },

  // Update a word
  updateWord: async (wordId: number, word: { value: string; meaning: string; context?: string }): Promise<Word> => {
    try {
      const response = await api.put(`/words/${wordId}`, word);
      return response.data;
    } catch (error) {
      console.error('Update word error:', error);
      throw error;
    }
  },

  // Delete a list
  deleteList: async (listId: number): Promise<void> => {
    try {
      await api.delete(`/lists/${listId}`);
    } catch (error) {
      console.error('Delete list error:', error);
      throw error;
    }
  },

  // Update a list
  updateList: async (listId: number, list: { name: string; description: string; context?: string }): Promise<WordList> => {
    try {
      const response = await api.put(`/lists/${listId}`, list);
      return response.data;
    } catch (error) {
      console.error('Update list error:', error);
      throw error;
    }
  },

  // Chatbot endpoints
  sendChatMessage: async (message: string, userId: string = 'default'): Promise<{ message: string }> => {
    try {
      const response = await api.post('/chatbot/message', { message, userId });
      return response.data;
    } catch (error) {
      console.error('Chatbot message error:', error);
      throw error;
    }
  },

  clearChatHistory: async (userId: string = 'default'): Promise<{ message: string }> => {
    try {
      const response = await api.post('/chatbot/clear-history', { userId });
      return response.data;
    } catch (error) {
      console.error('Clear chat history error:', error);
      throw error;
    }
  },
};

export default apiService;
