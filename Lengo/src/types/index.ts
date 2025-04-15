// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Home: undefined;
  FeaturePlaceholder: {
    featureId: number;
    featureName: string;
    description: string
  };
  // These would be implemented by the team
  Lists: undefined;
  CreateList: undefined;
  ListDetail: { listId: string, refresh?: boolean };
  AddWord: { listId: string };

  Quiz: { listId: string };
  Test: { listId: string, listName: string };
  Progress: undefined;
  Search: undefined;
  Settings: undefined;
  UserProfile: undefined;
  Chatbot: undefined;
  // Innovative features would be added here
};

// Tab Navigator Types
export type TabParamList = {
  Home: undefined;
  Lists: undefined;
  Create: undefined;
  Profile: undefined;
};

// Data Types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface WordList {
  id: string;
  name: string;
  description: string;
  context?: string;
  createdAt: string;
  wordCount?: number;
}

export interface Word {
  id: string;
  listId: string;
  value: string;
  meaning: string;
  createdAt: string;
}



export interface Quiz {
  wordId: string;
  type: 'quiz';
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Progress {
  listId: string;
  wordId: string;
  mastery: number; // 0-100
  lastPracticed: string;
  timesCorrect: number;
  timesIncorrect: number;
}

// Auth Context Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface AuthContextProps {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}
