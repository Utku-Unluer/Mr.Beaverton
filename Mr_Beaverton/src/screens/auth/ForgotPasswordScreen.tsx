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
import {
  TextInput,
  Button,
  Text,
  Title,
  Paragraph,
  HelperText,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const { authState, resetPassword, clearError } = useAuth();
  const { error } = authState;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  // Şifre sıfırlama işlemi
  const handleResetPassword = async () => {
    clearError();

    // Form doğrulama
    const isEmailValid = validateEmail();

    if (!isEmailValid) {
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email);
      setIsSubmitted(true);
      Alert.alert(
        'Şifre Sıfırlama',
        'Şifre sıfırlama talimatları e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.',
        [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      // Hata zaten AuthContext tarafından yönetiliyor
      console.log('Şifre sıfırlama hatası:', err);
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
        <View style={styles.formContainer}>
          <MaterialIcons name="lock-reset" size={60} color="#3F51B5" style={styles.icon} />

          <Title style={styles.title}>Şifremi Unuttum</Title>

          <Paragraph style={styles.description}>
            Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin. Size şifre sıfırlama talimatlarını içeren bir e-posta göndereceğiz.
          </Paragraph>

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
            disabled={isSubmitted}
          />
          {!!emailError && (
            <HelperText type="error" visible={!!emailError}>
              {emailError}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={isLoading || isSubmitted}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Şifremi Sıfırla
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.backContainer}
          >
            <MaterialIcons name="arrow-back" size={20} color="#3F51B5" />
            <Text style={styles.backText}>Giriş Ekranına Dön</Text>
          </TouchableOpacity>
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
    paddingVertical: 40,
    justifyContent: 'center',
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
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginBottom: 20,
    borderRadius: 5,
    backgroundColor: '#3F51B5',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#3F51B5',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
