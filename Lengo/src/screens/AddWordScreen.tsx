import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Title, TextInput, Button, Text, Chip, Divider, IconButton, List } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { commonStyles } from '../styles/theme';
import apiService, { WordList, Word } from '../api/apiService';
import { RootStackParamList, TabParamList } from '../types';

type AddWordScreenRouteProp = RouteProp<RootStackParamList, 'AddWord'>;

type AddWordScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

interface WordForm {
  value: string;
  meaning: string;
  context?: string;
}

const AddWordScreen = () => {
  const navigation = useNavigation<AddWordScreenNavigationProp>();
  const route = useRoute<AddWordScreenRouteProp>();
  const { listId } = route.params;

  const [list, setList] = useState<WordList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [wordForm, setWordForm] = useState<WordForm>({
    value: '',
    meaning: '',
    context: '',
  });
  const [errors, setErrors] = useState<{
    value?: string;
    meaning?: string;
  }>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkWords, setBulkWords] = useState('');
  const [recentlyAddedWords, setRecentlyAddedWords] = useState<Word[]>([]);

  // Liste bilgilerini yükle
  useEffect(() => {
    const loadListDetails = async () => {
      try {
        setIsLoading(true);

        // Liste bilgilerini al
        const lists = await apiService.getLists();
        const currentList = lists.find(l => l.id === listId);

        if (currentList) {
          setList(currentList);
        } else {
          // Örnek liste bilgisi (gerçek API'de bu kısım olmayacak)
          setList({
            id: listId,
            name: 'Örnek Liste',
            description: 'Bu bir örnek liste açıklamasıdır.',
            createdAt: new Date().toISOString(),
            wordCount: 10
          });
        }
      } catch (error) {
        console.error('Liste bilgileri yüklenirken hata oluştu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadListDetails();
  }, [listId]);

  // Form değişikliklerini işle
  const handleChange = (name: keyof WordForm, value: string) => {
    setWordForm(prev => ({ ...prev, [name]: value }));

    // Hata mesajlarını temizle
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Kelime değiştiğinde anlam önerileri getir
    if (name === 'value' && value.trim().length > 2) {
      fetchMeaningSuggestions(value);
    } else if (name === 'value') {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Anlam önerileri getir (simüle edilmiş)
  const fetchMeaningSuggestions = (word: string) => {
    // Gerçek uygulamada burada bir API çağrısı yapılacak
    // Şimdilik bazı örnek öneriler gösterelim

    // Basit bir İngilizce-Türkçe sözlük simülasyonu
    const dictionarySimulation: Record<string, string[]> = {
      'apple': ['elma', 'Apple şirketi'],
      'book': ['kitap', 'rezervasyon yapmak'],
      'car': ['araba', 'otomobil'],
      'dog': ['köpek'],
      'eat': ['yemek yemek', 'tüketmek'],
      'food': ['yiyecek', 'gıda', 'besin'],
      'go': ['gitmek', 'yürümek'],
      'house': ['ev', 'konut'],
      'learn': ['öğrenmek', 'öğrenim görmek'],
      'phone': ['telefon', 'aramak'],
      'run': ['koşmak', 'çalıştırmak'],
      'school': ['okul', 'eğitim kurumu'],
      'table': ['masa', 'tablo'],
      'water': ['su', 'sulamak'],
      'work': ['çalışmak', 'iş'],
    };

    // Kelimeyi küçük harfe çevir ve başlangıç eşleşmelerini bul
    const lowercaseWord = word.toLowerCase();
    const matchingWords = Object.keys(dictionarySimulation).filter(
      dictWord => dictWord.startsWith(lowercaseWord)
    );

    if (matchingWords.length > 0) {
      setSuggestions(matchingWords);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Öneriyi seç
  const selectSuggestion = (suggestion: string) => {
    setWordForm(prev => ({ ...prev, value: suggestion }));

    // Seçilen kelimenin anlamını otomatik doldur
    const dictionarySimulation: Record<string, string[]> = {
      'apple': ['elma', 'Apple şirketi'],
      'book': ['kitap', 'rezervasyon yapmak'],
      'car': ['araba', 'otomobil'],
      'dog': ['köpek'],
      'eat': ['yemek yemek', 'tüketmek'],
      'food': ['yiyecek', 'gıda', 'besin'],
      'go': ['gitmek', 'yürümek'],
      'house': ['ev', 'konut'],
      'learn': ['öğrenmek', 'öğrenim görmek'],
      'phone': ['telefon', 'aramak'],
      'run': ['koşmak', 'çalıştırmak'],
      'school': ['okul', 'eğitim kurumu'],
      'table': ['masa', 'tablo'],
      'water': ['su', 'sulamak'],
      'work': ['çalışmak', 'iş'],
    };

    if (dictionarySimulation[suggestion]) {
      setWordForm(prev => ({ ...prev, meaning: dictionarySimulation[suggestion][0] }));
    }

    setShowSuggestions(false);
  };

  // Formu doğrula
  const validateForm = () => {
    const newErrors: {
      value?: string;
      meaning?: string;
    } = {};

    if (!wordForm.value.trim()) {
      newErrors.value = 'Kelime alanı boş olamaz';
    }

    if (!wordForm.meaning.trim()) {
      newErrors.meaning = 'Anlam alanı boş olamaz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Toplu kelime ekleme formunu doğrula
  const validateBulkForm = () => {
    if (!bulkWords.trim()) {
      Alert.alert('Hata', 'Lütfen eklenecek kelimeleri girin');
      return false;
    }
    return true;
  };

  // Kelime ekle
  const handleAddWord = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      // API'ye kelime ekleme isteği gönder
      const newWord = await apiService.addWord({
        listId,
        value: wordForm.value.trim(),
        meaning: wordForm.meaning.trim(),
        context: wordForm.context?.trim()
      });

      // Eklenen kelimeyi listeye ekle
      setRecentlyAddedWords(prev => [newWord, ...prev]);

      // Formu temizle
      setWordForm({
        value: '',
        meaning: '',
        context: '',
      });

      // Başarı mesajı göster
      Alert.alert('Başarılı', 'Kelime başarıyla eklendi');
    } catch (error) {
      console.error('Kelime eklenirken hata oluştu:', error);
      Alert.alert('Hata', 'Kelime eklenirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  // Toplu kelime ekle
  const handleAddBulkWords = async () => {
    if (!validateBulkForm()) return;

    try {
      setIsSaving(true);

      // Kelimeleri satır satır ayır
      const lines = bulkWords.split('\n').filter(line => line.trim());
      const addedWords: Word[] = [];

      for (const line of lines) {
        // Kelime ve anlamı ayır (virgül veya tab ile ayrılmış olabilir)
        const parts = line.split(/[,\t]/).map(part => part.trim());

        if (parts.length >= 2) {
          const [value, meaning] = parts;

          // API'ye kelime ekleme isteği gönder
          const newWord = await apiService.addWord({
            listId,
            value,
            meaning,
          });

          addedWords.push(newWord);
        }
      }

      // Eklenen kelimeleri listeye ekle
      setRecentlyAddedWords(prev => [...addedWords, ...prev]);

      // Formu temizle
      setBulkWords('');

      // Başarı mesajı göster
      Alert.alert('Başarılı', `${addedWords.length} kelime başarıyla eklendi`);
    } catch (error) {
      console.error('Kelimeler eklenirken hata oluştu:', error);
      Alert.alert('Hata', 'Kelimeler eklenirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  // Yükleme durumu
  if (isLoading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Liste bilgileri yükleniyor...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={commonStyles.container}>
        <Card style={styles.listInfoCard}>
          <Card.Content>
            <Title style={styles.listTitle}>
              {list?.name || 'Liste'} - Kelime Ekle
            </Title>

            <View style={styles.modeToggleContainer}>
              <Chip
                selected={!bulkMode}
                onPress={() => setBulkMode(false)}
                style={styles.modeChip}
              >
                Tek Kelime
              </Chip>
              <Chip
                selected={bulkMode}
                onPress={() => setBulkMode(true)}
                style={styles.modeChip}
              >
                Toplu Ekleme
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {!bulkMode ? (
          // Tek kelime ekleme formu
          <Card style={styles.formCard}>
            <Card.Content>
              <View style={styles.inputContainer}>
                <TextInput
                  label="Kelime"
                  value={wordForm.value}
                  onChangeText={(text) => handleChange('value', text)}
                  mode="outlined"
                  style={styles.input}
                  theme={{ colors: { text: '#FFFFFF', placeholder: '#94A3B8', outline: '#4CAF50', primary: '#4CAF50' } }}
                  error={!!errors.value}
                  autoCapitalize="none"
                />
                {errors.value && <Text style={styles.errorText}>{errors.value}</Text>}

                {showSuggestions && suggestions.length > 0 && (
                  <Card style={styles.suggestionsCard}>
                    <ScrollView style={styles.suggestionsList} nestedScrollEnabled={true}>
                      {suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => selectSuggestion(suggestion)}
                        >
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </Card>
                )}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Anlam"
                  value={wordForm.meaning}
                  onChangeText={(text) => handleChange('meaning', text)}
                  mode="outlined"
                  style={styles.input}
                  theme={{ colors: { text: '#FFFFFF', placeholder: '#94A3B8', outline: '#4CAF50', primary: '#4CAF50' } }}
                  error={!!errors.meaning}
                />
                {errors.meaning && <Text style={styles.errorText}>{errors.meaning}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Bağlam (İsteğe Bağlı)"
                  value={wordForm.context || ''}
                  onChangeText={(text) => handleChange('context', text)}
                  mode="outlined"
                  style={styles.input}
                  theme={{ colors: { text: '#FFFFFF', placeholder: '#94A3B8', outline: '#4CAF50', primary: '#4CAF50' } }}
                  multiline
                  numberOfLines={3}
                  placeholder="Kelimeyi içeren bir cümle veya örnek"
                />
              </View>

              <Button
                mode="contained"
                onPress={handleAddWord}
                style={styles.addButton}
                loading={isSaving}
                disabled={isSaving}
              >
                Kelime Ekle
              </Button>
            </Card.Content>
          </Card>
        ) : (
          // Toplu kelime ekleme formu
          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.bulkInstructions}>
                Her satıra bir kelime ve anlamını virgül veya tab ile ayırarak girin:
              </Text>
              <Text style={styles.bulkExample}>
                apple, elma{'\n'}
                book, kitap{'\n'}
                car, araba
              </Text>

              <TextInput
                label="Kelimeler"
                value={bulkWords}
                onChangeText={setBulkWords}
                mode="outlined"
                style={styles.bulkInput}
                theme={{ colors: { text: '#FFFFFF', placeholder: '#94A3B8', outline: '#4CAF50', primary: '#4CAF50' } }}
                multiline
                numberOfLines={10}
              />

              <Button
                mode="contained"
                onPress={handleAddBulkWords}
                style={styles.addButton}
                loading={isSaving}
                disabled={isSaving}
              >
                Kelimeleri Ekle
              </Button>
            </Card.Content>
          </Card>
        )}

        {recentlyAddedWords.length > 0 && (
          <Card style={styles.recentWordsCard}>
            <Card.Content>
              <Title style={styles.recentWordsTitle}>Son Eklenen Kelimeler</Title>

              {recentlyAddedWords.map((word, index) => (
                <View key={word.id} style={styles.recentWordItem}>
                  <View style={styles.recentWordContent}>
                    <Text style={styles.recentWordText}>{word.value}</Text>
                    <Text style={styles.recentWordMeaning}>{word.meaning}</Text>
                  </View>

                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#EF4444"
                    onPress={() => {
                      // Kelimeyi listeden kaldır (gerçek API'de silme işlemi de yapılacak)
                      setRecentlyAddedWords(prev => prev.filter(w => w.id !== word.id));
                    }}
                  />
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => {
              // Yeni kelime eklendiğini belirten bir parametre ile geri dön
              navigation.navigate('ListDetail', {
                listId: listId,
                refresh: true
              });
            }}
            style={styles.backButton}
          >
            Liste Detayına Dön
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  listInfoCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  listTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    marginBottom: 16,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  modeChip: {
    marginRight: 8,
  },
  formCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: '#0F172A',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  suggestionsCard: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    maxHeight: 150,
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    marginTop: 8,
  },
  bulkInstructions: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  bulkExample: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  bulkInput: {
    backgroundColor: '#0F172A',
    marginBottom: 16,
    minHeight: 150,
  },
  recentWordsCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  recentWordsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 16,
  },
  recentWordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  recentWordContent: {
    flex: 1,
  },
  recentWordText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  recentWordMeaning: {
    color: '#94A3B8',
    fontSize: 14,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  backButton: {
    borderColor: '#4CAF50',
  },
});

export default AddWordScreen;
