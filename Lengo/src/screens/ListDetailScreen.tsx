import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip, Searchbar, Menu, Divider, FAB, IconButton, Modal, Portal } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute, CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { commonStyles } from '../styles/theme';
import apiService, { WordList, Word } from '../api/apiService';
import { RootStackParamList, TabParamList } from '../types';

type ListDetailScreenRouteProp = RouteProp<RootStackParamList, 'ListDetail'>;

type ListDetailScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

const ListDetailScreen = () => {
  const navigation = useNavigation<ListDetailScreenNavigationProp>();
  const route = useRoute<ListDetailScreenRouteProp>();
  const { listId, refresh } = route.params;
  const listIdNumber = parseInt(listId as string);

  const [list, setList] = useState<WordList | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'alphabetical'>('date');
  const [wordMenuVisible, setWordMenuVisible] = useState<number | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedWords, setSelectedWords] = useState<number[]>([]);

  // Liste ve kelimeleri yükle
  const loadListDetails = useCallback(async () => {
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
          id: listIdNumber,
          userId: 1, // Varsayılan kullanıcı ID'si
          name: 'Örnek Liste',
          description: 'Bu bir örnek liste açıklamasıdır.',
          createdAt: new Date().toISOString(),
          wordCount: 10
        });
      }

      // Kelimeleri al
      const wordsData = await apiService.getWords(listIdNumber);

      // Veritabanından gelen kelimeleri kullan
      console.log('Veritabanından gelen kelimeler:', wordsData);
      setWords(wordsData);
      setFilteredWords(wordsData);
    } catch (error) {
      console.error('Liste detayları yüklenirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [listId]);

  // İlk yükleme
  useEffect(() => {
    loadListDetails();
  }, [loadListDetails]);

  // Refresh parametresi geldiğinde listeyi yenile
  useEffect(() => {
    if (refresh) {
      console.log('Refresh parametresi algılandı, liste yenileniyor...');
      loadListDetails();
    }
  }, [refresh, loadListDetails]);

  // Ekran odaklandığında listeyi yenile
  useFocusEffect(
    useCallback(() => {
      // Ekran odaklandığında çalışacak
      console.log('Liste detay ekranı odaklandı, liste yenileniyor...');
      loadListDetails();

      return () => {
        // Ekran odaktan çıktığında çalışacak (cleanup)
        console.log('Liste detay ekranı odaktan çıktı');
      };
    }, [loadListDetails])
  );

  // Yenileme işlemi
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadListDetails();
  }, [loadListDetails]);

  // Arama işlemi
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredWords(words);
    } else {
      const filtered = words.filter(
        word =>
          word.value.toLowerCase().includes(query.toLowerCase()) ||
          word.meaning.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredWords(filtered);
    }
  };

  // Sıralama işlemi
  const handleSort = (method: 'date' | 'alphabetical') => {
    setSortBy(method);
    setSortMenuVisible(false);

    let sorted = [...filteredWords];

    switch (method) {
      case 'date':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'alphabetical':
        sorted.sort((a, b) => a.value.localeCompare(b.value));
        break;
    }

    setFilteredWords(sorted);
  };

  // Kelime silme işlemi
  const handleDeleteWord = (wordId: number) => {
    Alert.alert(
      "Kelimeyi Sil",
      "Bu kelimeyi silmek istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Sil",
          onPress: async () => {
            try {
              setIsLoading(true);
              // API'de silme işlemi yap
              await apiService.deleteWord(wordId);

              // Yerel state'i güncelle
              const updatedWords = words.filter(word => word.id !== wordId);
              setWords(updatedWords);
              setFilteredWords(updatedWords.filter(
                word =>
                  word.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
              ));
              setWordMenuVisible(null);
            } catch (error) {
              console.error('Kelime silinirken hata oluştu:', error);
              Alert.alert('Hata', 'Kelime silinirken bir hata oluştu.');
            } finally {
              setIsLoading(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Toplu silme işlemi
  const handleBulkDelete = () => {
    if (selectedWords.length === 0) return;

    Alert.alert(
      "Kelimeleri Sil",
      `${selectedWords.length} kelimeyi silmek istediğinizden emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Sil",
          onPress: async () => {
            try {
              setIsLoading(true);
              const selectedWordCount = selectedWords.length;

              // Toplu silme API'sini çağır
              const result = await apiService.deleteBulkWords(selectedWords);
              console.log('Toplu silme sonuçları:', result);

              // Yerel state'i güncelle
              const updatedWords = words.filter(word => !selectedWords.includes(word.id));
              setWords(updatedWords);
              setFilteredWords(updatedWords.filter(
                word =>
                  word.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
              ));
              setSelectedWords([]);
              setEditMode(false);

              Alert.alert('Başarılı', `${selectedWordCount} kelime başarıyla silindi.`);
            } catch (error) {
              console.error('Kelimeler silinirken hata oluştu:', error);
              Alert.alert('Hata', 'Kelimeler silinirken bir hata oluştu.');
            } finally {
              setIsLoading(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Kelime seçme işlemi
  const toggleWordSelection = (wordId: number) => {
    if (selectedWords.includes(wordId)) {
      setSelectedWords(selectedWords.filter(id => id !== wordId));
    } else {
      setSelectedWords([...selectedWords, wordId]);
    }
  };

  // Tüm kelimeleri seç/kaldır
  const toggleSelectAll = () => {
    if (selectedWords.length === filteredWords.length) {
      setSelectedWords([]);
    } else {
      setSelectedWords(filteredWords.map(word => word.id));
    }
  };

  // Düzenleme modunu aç/kapat
  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      setSelectedWords([]);
    }
  };

  // Liste başlığı
  const renderListHeader = () => {
    if (!list) return null;

    return (
      <Card style={styles.listInfoCard}>
        <Card.Content>
          <Title style={styles.listTitle}>{list.name}</Title>
          <Paragraph style={styles.listDescription}>{list.description}</Paragraph>

          <View style={styles.listMetaContainer}>
            <Chip icon="book-outline" style={styles.chip}>{words.length} kelime</Chip>
            <Chip icon="calendar" style={styles.chip}>
              {new Date(list.createdAt).toLocaleDateString('tr-TR')}
            </Chip>
          </View>

          <View style={styles.listActionsContainer}>


            <Button
              mode="contained"
              style={styles.actionButton}
              icon="pencil-box"
              onPress={() => {
                if (words.length < 3) {
                  Alert.alert(
                    "Yetersiz Kelime",
                    "Test oluşturmak için listede en az 3 kelime olmalıdır.",
                    [{ text: "Tamam" }]
                  );
                } else {
                  navigation.navigate('Test', { listId, listName: list?.name || 'Liste' });
                }
              }}
            >
              Test
            </Button>

            <Button
              mode="contained"
              style={styles.actionButton}
              icon="pencil"
              onPress={() => navigation.navigate('AddWord', {
                listId: listId
              })}
            >
              Düzenle
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Kelime öğesi render fonksiyonu
  const renderWordItem = ({ item }: { item: Word }) => {
    return (
      <Card style={styles.wordCard}>
        <TouchableOpacity
          style={[
            styles.wordCardContent,
            editMode && { backgroundColor: selectedWords.includes(item.id) ? 'rgba(76, 175, 80, 0.1)' : 'transparent' }
          ]}
          onPress={() => editMode && toggleWordSelection(item.id)}
          activeOpacity={editMode ? 0.7 : 1}
        >
          {editMode && (
            <View style={styles.checkboxContainer}>
              <MaterialIcons
                name={selectedWords.includes(item.id) ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={selectedWords.includes(item.id) ? "#4CAF50" : "#94A3B8"}
              />
            </View>
          )}

          {!editMode && (
            <TouchableOpacity
              style={styles.wordMenuButton}
              onPress={() => {
                setWordMenuVisible(item.id);
                setSelectedWord(item);
              }}
            >
              <MaterialIcons name="more-vert" size={28} color="#94A3B8" />
            </TouchableOpacity>
          )}

          <View style={styles.wordContent}>
            <Text style={styles.wordText}>{item.value}</Text>
            <Text style={styles.meaningText}>{item.meaning}</Text>
          </View>


        </TouchableOpacity>
      </Card>
    );
  };

  // Yükleme durumu
  if (isLoading && !refreshing) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Liste detayları yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <Portal>
        <Modal
          visible={wordMenuVisible !== null}
          onDismiss={() => {
            setWordMenuVisible(null);
            setSelectedWord(null);
          }}
          contentContainerStyle={styles.modalContainer}
          dismissable={true}
          style={styles.modalBackground}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kelime İşlemleri</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                if (selectedWord) {
                  handleDeleteWord(selectedWord.id);
                }
                setWordMenuVisible(null);
                setSelectedWord(null);
              }}
            >
              <MaterialIcons name="delete" size={24} color="#EF4444" />
              <Text style={[styles.modalButtonText, { color: '#EF4444' }]}>Sil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setWordMenuVisible(null);
                setSelectedWord(null);
                // Kelime düzenleme işlevi
                Alert.alert("Bilgi", "Kelime düzenleme özelliği henüz uygulanmadı.");
              }}
            >
              <MaterialIcons name="edit" size={24} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>Düzenle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setWordMenuVisible(null);
                setSelectedWord(null);
              }}
            >
              <MaterialIcons name="close" size={24} color="#94A3B8" />
              <Text style={[styles.modalButtonText, { color: '#94A3B8' }]}>İptal</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>

      <View style={styles.header}>
        <Searchbar
          placeholder="Kelime ara..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#94A3B8"
          inputStyle={{ color: '#FFFFFF' }}
        />

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortMenuVisible(true)}
        >
          <MaterialIcons name="sort" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.editButton, editMode && styles.editButtonActive]}
          onPress={toggleEditMode}
        >
          <MaterialIcons name="edit" size={24} color={editMode ? "#4CAF50" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>

      {sortMenuVisible && (
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={{ x: 0, y: 0 }}
          style={[styles.menu, { right: 10, top: 60 }]}
        >
          <Menu.Item
            onPress={() => handleSort('date')}
            title="Tarihe Göre"
            leadingIcon={sortBy === 'date' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleSort('alphabetical')}
            title="Alfabetik"
            leadingIcon={sortBy === 'alphabetical' ? 'check' : undefined}
          />
        </Menu>
      )}

      {editMode && (
        <View style={styles.editToolbar}>
          <Button
            mode="text"
            onPress={toggleSelectAll}
            icon={selectedWords.length === filteredWords.length ? "checkbox-marked" : "checkbox-blank-outline"}
            textColor="#FFFFFF"
          >
            {selectedWords.length === filteredWords.length ? "Tümünü Kaldır" : "Tümünü Seç"}
          </Button>

          <Button
            mode="text"
            onPress={handleBulkDelete}
            icon="delete"
            textColor="#EF4444"
            disabled={selectedWords.length === 0}
          >
            Sil ({selectedWords.length})
          </Button>
        </View>
      )}

      <FlatList
        data={filteredWords}
        renderItem={renderWordItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="book" size={64} color="#64748B" />
            <Text style={styles.emptyText}>Bu listede henüz kelime yok</Text>
            <Text style={styles.emptySubText}>Yeni kelimeler eklemek için aşağıdaki butona tıklayın</Text>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        color="#FFFFFF"
        onPress={() => navigation.navigate('AddWord', {
          listId: listId
        })}
      />
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  sortButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  editButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  editButtonActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  listContainer: {
    paddingBottom: 80,
  },
  listInfoCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  listTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    marginBottom: 8,
  },
  listDescription: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 16,
  },
  listMetaContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#334155',
    marginRight: 8,
  },
  listActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#4CAF50',
  },
  wordCard: {
    marginBottom: 8,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    padding: 0,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '95%',
  },
  wordCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'flex-start',
    position: 'relative',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  wordContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  meaningText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
  wordMenuButton: {
    padding: 8,
    alignSelf: 'center',
    marginRight: 24,
    position: 'absolute',
    left: 0,
  },
  menu: {
    backgroundColor: '#1E293B',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4CAF50',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    minHeight: 300,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  editToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalContainer: {
    backgroundColor: '#0F172A',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
    borderColor: '#334155',
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    padding: 0,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
    borderBottomWidth: 1,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#334155',
    borderBottomWidth: 1,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 16,
  },
  cancelButton: {
    borderBottomWidth: 0,
  },
  modalBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
});

export default ListDetailScreen;
