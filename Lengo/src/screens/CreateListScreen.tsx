import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Title, TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types';
import { MaterialIcons } from '@expo/vector-icons';
import { commonStyles } from '../styles/theme';
import apiService from '../api/apiService';

// Liste şablonları
const listTemplates = [
  {
    id: 'general',
    name: 'Genel',
    description: 'Genel amaçlı kelime listesi',
    icon: 'book',
    defaultLanguage: 'en-tr'
  },
  {
    id: 'travel',
    name: 'Seyahat',
    description: 'Seyahat ederken kullanılacak kelimeler',
    icon: 'flight',
    defaultLanguage: 'en-tr'
  },
  {
    id: 'business',
    name: 'İş',
    description: 'İş hayatında kullanılan terimler',
    icon: 'business',
    defaultLanguage: 'en-tr'
  },
  {
    id: 'academic',
    name: 'Akademik',
    description: 'Akademik çalışmalar için terimler',
    icon: 'school',
    defaultLanguage: 'en-tr'
  },
  {
    id: 'technology',
    name: 'Teknoloji',
    description: 'Bilgisayar ve teknoloji terimleri',
    icon: 'computer',
    defaultLanguage: 'en-tr'
  }
];

// Dil çiftleri
const languagePairs = [
  { id: 'en-tr', sourceLang: 'İngilizce', targetLang: 'Türkçe', displayName: 'İngilizce - Türkçe' },
  { id: 'de-tr', sourceLang: 'Almanca', targetLang: 'Türkçe', displayName: 'Almanca - Türkçe' },
  { id: 'fr-tr', sourceLang: 'Fransızca', targetLang: 'Türkçe', displayName: 'Fransızca - Türkçe' },
  { id: 'es-tr', sourceLang: 'İspanyolca', targetLang: 'Türkçe', displayName: 'İspanyolca - Türkçe' },
  { id: 'it-tr', sourceLang: 'İtalyanca', targetLang: 'Türkçe', displayName: 'İtalyanca - Türkçe' },
  { id: 'ru-tr', sourceLang: 'Rusça', targetLang: 'Türkçe', displayName: 'Rusça - Türkçe' },
  { id: 'ar-tr', sourceLang: 'Arapça', targetLang: 'Türkçe', displayName: 'Arapça - Türkçe' },
  { id: 'ja-tr', sourceLang: 'Japonca', targetLang: 'Türkçe', displayName: 'Japonca - Türkçe' },
  { id: 'zh-tr', sourceLang: 'Çince', targetLang: 'Türkçe', displayName: 'Çince - Türkçe' },
  { id: 'ko-tr', sourceLang: 'Korece', targetLang: 'Türkçe', displayName: 'Korece - Türkçe' },
];

type CreateListScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Create'>,
  StackNavigationProp<RootStackParamList>
>;

// Form için tip tanımları

interface CreateListForm {
  name: string;
  description: string;
  source: string;
  languagePair: string;
  templateId: string;
}

const CreateListScreen = () => {
  const navigation = useNavigation<CreateListScreenNavigationProp>();

  // Form state
  const [form, setForm] = useState<CreateListForm>({
    name: '',
    description: '',
    source: '',
    languagePair: 'en-tr',
    templateId: 'general'
  });

  // Errors state
  const [errors, setErrors] = useState<{
    name: string;
    description: string;
    source?: string;
  }>({
    name: '',
    description: ''
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Template selection state
  const [showTemplates, setShowTemplates] = useState(false);

  // Language selection state
  const [showLanguages, setShowLanguages] = useState(false);

  // Form değişikliklerini işle
  const handleChange = (field: keyof CreateListForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    // Hata mesajını temizle
    if (field === 'name' || field === 'description') {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Şablon seç
  const selectTemplate = (templateId: string) => {
    const template = listTemplates.find(t => t.id === templateId);

    if (template) {
      setForm(prev => ({
        ...prev,
        templateId,
        description: template.description,
        languagePair: template.defaultLanguage
      }));
    }

    setShowTemplates(false);
  };

  // Dil çifti seç
  const selectLanguagePair = (pairId: string) => {
    setForm(prev => ({ ...prev, languagePair: pairId }));
    setShowLanguages(false);
  };

  // Formu doğrula
  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', description: '' };

    if (!form.name.trim()) {
      newErrors.name = 'Liste adı boş olamaz';
      isValid = false;
    } else if (form.name.trim().length < 3) {
      newErrors.name = 'Liste adı en az 3 karakter olmalıdır';
      isValid = false;
    }

    if (!form.description.trim()) {
      newErrors.description = 'Liste açıklaması boş olamaz';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Liste oluştur
  const handleCreateList = async (addWordsAfter: boolean = false) => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      console.log('Liste oluşturma isteği gönderiliyor...');
      console.log('Form verileri:', {
        name: form.name.trim(),
        description: form.description.trim(),
        context: form.source.trim() || undefined
      });

      // API'ye liste oluşturma isteği gönder
      const newList = await apiService.createList({
        name: form.name.trim(),
        description: form.description.trim(),
        context: form.source.trim() || undefined
      });

      console.log('Liste başarıyla oluşturuldu:', newList);

      // Kelime ekleme ekranına veya liste ekranına yönlendir
      if (addWordsAfter) {
        // Kelime ekleme ekranına yönlendir
        navigation.navigate('AddWord', { listId: newList.id });
      } else {
        // Başarı mesajı göster ve liste ekranına yönlendir
        Alert.alert(
          'Başarılı',
          'Liste başarıyla oluşturuldu',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.navigate('Lists')
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Liste oluşturulurken hata oluştu:', error);
      console.error('Hata detayları:', error.response?.data);
      Alert.alert('Hata', `Liste oluşturulurken bir hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Seçili şablonu bul
  const selectedTemplate = listTemplates.find(t => t.id === form.templateId);

  // Seçili dil çiftini bul
  const selectedLanguage = languagePairs.find(l => l.id === form.languagePair);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={commonStyles.container}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.headerTitle}>Yeni Liste Oluştur</Title>
            <Text style={styles.headerSubtitle}>
              Yeni bir kelime listesi oluşturmak için aşağıdaki formu doldurun.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.formCard}>
          <Card.Content>
            {/* Liste Adı */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Liste Adı"
                value={form.name}
                onChangeText={(text) => handleChange('name', text)}
                mode="outlined"
                style={styles.input}
                theme={{ colors: { text: '#FFFFFF', placeholder: '#94A3B8', outline: '#4CAF50', primary: '#4CAF50' } }}
                error={!!errors.name}
              />
              {errors.name ? (
                <HelperText type="error" visible={!!errors.name}>
                  {errors.name}
                </HelperText>
              ) : null}
            </View>

            {/* Liste Açıklaması */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Açıklama"
                value={form.description}
                onChangeText={(text) => handleChange('description', text)}
                mode="outlined"
                style={styles.input}
                theme={{ colors: { text: '#FFFFFF', placeholder: '#94A3B8', outline: '#4CAF50', primary: '#4CAF50' } }}
                multiline
                numberOfLines={3}
                error={!!errors.description}
              />
              {errors.description ? (
                <HelperText type="error" visible={!!errors.description}>
                  {errors.description}
                </HelperText>
              ) : null}
            </View>

            {/* Kaynak (İsteğe Bağlı) */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Kaynak (İsteğe Bağlı)"
                value={form.source}
                onChangeText={(text) => handleChange('source', text)}
                mode="outlined"
                style={styles.input}
                theme={{ colors: { text: '#FFFFFF', placeholder: '#94A3B8', outline: '#4CAF50', primary: '#4CAF50' } }}
                placeholder="Kitap, makale, film vb."
              />
              <HelperText type="info">
                Bu listedeki kelimelerin kaynağını belirtebilirsiniz.
              </HelperText>
            </View>

            {/* Şablon Seçimi */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Liste Şablonu</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowTemplates(!showTemplates)}
              >
                <View style={styles.selectedItem}>
                  <MaterialIcons name={selectedTemplate?.icon || 'book' as any} size={24} color="#4CAF50" />
                  <Text style={styles.selectedItemText}>{selectedTemplate?.name || 'Genel'}</Text>
                </View>
                <MaterialIcons name={(showTemplates ? 'arrow-drop-up' : 'arrow-drop-down') as any} size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {showTemplates && (
                <Card style={styles.dropdownCard}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {listTemplates.map((template) => (
                      <TouchableOpacity
                        key={template.id}
                        style={[
                          styles.dropdownItem,
                          form.templateId === template.id && styles.dropdownItemSelected
                        ]}
                        onPress={() => selectTemplate(template.id)}
                      >
                        <MaterialIcons name={template.icon as any} size={24} color={form.templateId === template.id ? "#4CAF50" : "#94A3B8"} />
                        <View style={styles.dropdownItemContent}>
                          <Text style={styles.dropdownItemTitle}>{template.name}</Text>
                          <Text style={styles.dropdownItemDescription}>{template.description}</Text>
                        </View>
                        {form.templateId === template.id && (
                          <MaterialIcons name="check" size={24} color="#4CAF50" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Card>
              )}
            </View>

            {/* Dil Seçimi */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Dil Çifti</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowLanguages(!showLanguages)}
              >
                <View style={styles.selectedItem}>
                  <MaterialIcons name={"translate" as any} size={24} color="#4CAF50" />
                  <Text style={styles.selectedItemText}>{selectedLanguage?.displayName || 'İngilizce - Türkçe'}</Text>
                </View>
                <MaterialIcons name={(showLanguages ? 'arrow-drop-up' : 'arrow-drop-down') as any} size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {showLanguages && (
                <Card style={styles.dropdownCard}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {languagePairs.map((pair) => (
                      <TouchableOpacity
                        key={pair.id}
                        style={[
                          styles.dropdownItem,
                          form.languagePair === pair.id && styles.dropdownItemSelected
                        ]}
                        onPress={() => selectLanguagePair(pair.id)}
                      >
                        <MaterialIcons name="translate" size={24} color={form.languagePair === pair.id ? "#4CAF50" : "#94A3B8"} />
                        <Text style={styles.dropdownItemTitle}>{pair.displayName}</Text>
                        {form.languagePair === pair.id && (
                          <MaterialIcons name="check" size={24} color="#4CAF50" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Card>
              )}
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => handleCreateList(false)}
            style={styles.createButton}
            loading={isLoading}
            disabled={isLoading}
          >
            Liste Oluştur
          </Button>

          <Button
            mode="contained"
            onPress={() => handleCreateList(true)}
            style={styles.createAndAddButton}
            loading={isLoading}
            disabled={isLoading}
          >
            Oluştur ve Kelime Ekle
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            İptal
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 16,
  },
  formCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0F172A',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  dropdownCard: {
    marginTop: 4,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  dropdownItemContent: {
    flex: 1,
    marginLeft: 8,
  },
  dropdownItemTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dropdownItemDescription: {
    color: '#94A3B8',
    fontSize: 14,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 12,
  },
  createAndAddButton: {
    backgroundColor: '#2196F3',
    marginBottom: 12,
  },
  cancelButton: {
    borderColor: '#94A3B8',
  },
});

export default CreateListScreen;
