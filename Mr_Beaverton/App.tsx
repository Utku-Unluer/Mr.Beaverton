import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import HomeScreen from './src/screens/HomeScreen';
import FeaturePlaceholder from './src/screens/placeholders/FeaturePlaceholder';
import ListsScreen from './src/screens/ListsScreen';

import QuizScreen from './src/screens/QuizScreen';
import TestScreen from './src/screens/TestScreen';
import ListDetailScreen from './src/screens/ListDetailScreen';
import AddWordScreen from './src/screens/AddWordScreen';
import CreateListScreen from './src/screens/CreateListScreen';
import MainScreen from './src/screens/MainScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SearchScreen from './src/screens/SearchScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import AuthNavigator from './src/navigation/AuthNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
// Tema değişimi için gerekli importlar
import { RootStackParamList } from './src/types';

// Navigasyon parametreleri src/types/index.ts dosyasında tanımlanmıştır

const Stack = createStackNavigator<RootStackParamList>();

const AppContent = () => {
  const { authState } = useAuth();
  const { isAuthenticated, isLoading } = authState;

  // Tema için react-native-paper'ın varsayılan temasını kullan
  const paperTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#3F51B5',
      accent: '#303F9F',
      background: '#F5F5F5',
      surface: '#FFFFFF',
      text: '#1E293B',
    },
  };

  // Yükleme durumunda boş ekran göster
  if (isLoading) {
    return (
      <PaperProvider theme={paperTheme}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer
        theme={{
          dark: false,
          colors: {
            primary: paperTheme.colors.primary,
            background: paperTheme.colors.background,
            card: paperTheme.colors.surface,
            text: paperTheme.colors.text,
            border: '#E2E8F0',
            notification: '#FF5722',
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: 'normal',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System',
              fontWeight: '700',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '800',
            },
          },
        }}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
          <Stack.Navigator
            initialRouteName={isAuthenticated ? "Main" : "Auth"}
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1E293B',
              },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: {
                color: '#FFFFFF',
              },
              cardStyle: { backgroundColor: '#0F172A' }
            }}
          >
            <Stack.Screen
              name="Auth"
              component={AuthNavigator}
              options={{ headerShown: false }}
            />

            {isAuthenticated && (
              <>
                <Stack.Screen
                  name="Main"
                  component={MainScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Lists"
                  component={ListsScreen}
                  options={{ title: 'Kelime Listeleri' }}
                />
                <Stack.Screen
                  name="CreateList"
                  component={CreateListScreen}
                  options={{ title: 'Liste Oluştur' }}
                />
                <Stack.Screen
                  name="UserProfile"
                  component={ProfileScreen}
                  options={{ title: 'Profil' }}
                />

                <Stack.Screen
                  name="Quiz"
                  component={QuizScreen}
                  options={{ title: 'Test Modu' }}
                />
                <Stack.Screen
                  name="Test"
                  component={TestScreen}
                  options={{ title: 'Test' }}
                />
                <Stack.Screen
                  name="ListDetail"
                  component={ListDetailScreen}
                  options={{ title: 'Liste Detayı' }}
                />
                <Stack.Screen
                  name="AddWord"
                  component={AddWordScreen}
                  options={{ title: 'Kelime Ekle' }}
                />
                <Stack.Screen
                  name="FeaturePlaceholder"
                  component={FeaturePlaceholder}
                  options={({ route }) => ({ title: route.params.featureName })}
                />
                <Stack.Screen
                  name="Progress"
                  component={ProgressScreen}
                  options={{ title: 'İlerleme' }}
                />
                <Stack.Screen
                  name="Search"
                  component={SearchScreen}
                  options={{ title: 'Arama' }}
                />
                <Stack.Screen
                  name="Chatbot"
                  component={ChatbotScreen}
                  options={{ title: 'Chatbot' }}
                />
              </>
            )}
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </PaperProvider>
  );
};

function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});

export default App;
