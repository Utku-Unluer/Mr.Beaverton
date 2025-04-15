import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Logo from '../../assets/logo';
import {
  TextInput,
  Button,
  Text,
  Title,
  Headline,
  Paragraph,
  HelperText,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }: any) => {
  const { authState, login, clearError } = useAuth();
  const { error } = authState;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // E-posta doğrulama
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('E-posta adresi gerekli');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Geçerli bir e-posta adresi girin');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Şifre doğrulama
  const validatePassword = () => {
    if (!password) {
      setPasswordError('Şifre gerekli');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Giriş işlemi
  const handleLogin = async () => {
    clearError();

    // Form doğrulama
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
    } catch (err) {
      // Hata zaten AuthContext tarafından yönetiliyor
      console.log('Giriş hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Test kullanıcısı ile giriş
  const loginWithTestUser = async () => {
    clearError();
    try {
      setIsLoading(true);
      await login({ email: 'test@example.com', password: 'test123' });
    } catch (err) {
      console.log('Test kullanıcısı ile giriş hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Logo width={100} height={100} />
          <Headline style={styles.appName}>Lengo</Headline>
          <Paragraph style={styles.slogan}>
            Dil öğrenmenin en akıllı yolu
          </Paragraph>
        </View>

        <View style={styles.formContainer}>
          <Title style={styles.title}>Giriş Yap</Title>

          {error && (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          )}

          <TextInput
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
            error={!!emailError}
            onBlur={validateEmail}
          />
          {!!emailError && (
            <HelperText type="error" visible={!!emailError}>
              {emailError}
            </HelperText>
          )}

          <TextInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            error={!!passwordError}
            onBlur={validatePassword}
          />
          {!!passwordError && (
            <HelperText type="error" visible={!!passwordError}>
              {passwordError}
            </HelperText>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPassword}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Giriş Yap
          </Button>

          <Button
            mode="outlined"
            onPress={loginWithTestUser}
            disabled={isLoading}
            style={styles.testButton}
            contentStyle={styles.buttonContent}
          >
            Test Kullanıcısı ile Giriş
          </Button>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Hesabınız yok mu?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  // Logo bileşeni doğrudan kullanılıyor
  // logo: {
  //   width: 100,
  //   height: 100,
  //   marginBottom: 16,
  // },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 8,
  },
  slogan: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPassword: {
    color: '#3F51B5',
    fontSize: 14,
  },
  button: {
    marginBottom: 16,
    borderRadius: 5,
    backgroundColor: '#3F51B5',
  },
  testButton: {
    marginBottom: 16,
    borderRadius: 5,
    borderColor: '#3F51B5',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#666',
    marginRight: 5,
  },
  registerLink: {
    color: '#3F51B5',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
