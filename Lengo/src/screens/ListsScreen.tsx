import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Searchbar, Menu, Divider, Chip, Text } from 'react-native-paper';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { commonStyles } from '../styles/theme';
import apiService, { WordList } from '../api/apiService';
import { RootStackParamList, TabParamList } from '../types';

type ListsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Lists'>,
  StackNavigationProp<RootStackParamList>
>;

const ListsScreen = () => {
  const navigation = useNavigation<ListsScreenNavigationProp>();
  // Menü konumları için state'ler
  const [sortMenuPosition, setSortMenuPosition] = useState({ x: 0, y: 0 });
  const [itemMenuPositions, setItemMenuPositions] = useState<Record<string, { x: number, y: number }>>({});
  const [lists, setLists] = useState<WordList[]>([]);
  const [filteredLists, setFilteredLists] = useState<WordList[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'wordCount'>('date');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  // Örnek ilerleme verileri (gerçek uygulamada API'den gelecek)
  const progressData: Record<string, number> = {
    '1': 0.75,
    '2': 0.3,
    '3': 0.5,
    '4': 0.9,
    '5': 0.1,
  };

  // Listeleri yükle
  const loadLists = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Listeler yükleniyor...');
      const data = await apiService.getLists();
      console.log('Yüklenen listeler:', data);

      setLists(data);
      setFilteredLists(data);
    } catch (error) {
      console.error('Listeler yüklenirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // İlk yükleme ve ekran odaklandığında yeniden yükleme
  useEffect(() => {
    loadLists();

    // Ekran odaklandığında listeleri yeniden yükle
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Lists screen focused, reloading lists...');
      loadLists();
    });

    return unsubscribe;
  }, [loadLists, navigation]);

  // Yenileme işlemi
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLists();
  }, [loadLists]);

  // Arama işlemi
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredLists(lists);
    } else {
      const filtered = lists.filter(
        list =>
          list.name.toLowerCase().includes(query.toLowerCase()) ||
          list.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLists(filtered);
    }
  };

  // Sıralama işlemi
  const handleSort = (method: 'date' | 'name' | 'wordCount') => {
    setSortBy(method);
    setSortMenuVisible(false);

    let sorted = [...filteredLists];

    switch (method) {
      case 'date':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'wordCount':
        sorted.sort((a, b) => (b.wordCount || 0) - (a.wordCount || 0));
        break;
    }

    setFilteredLists(sorted);
  };

  // Liste öğesi render fonksiyonu
  const renderListItem = ({ item }: { item: WordList }) => {
    console.log('Rendering list item:', item);
    const progress = progressData[item.id.toString()] || 0;

    return (
      <Card style={styles.listCard} onPress={() => navigation.navigate('ListDetail', {
        listId: item.id.toString()
      })}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.cardTitle}>{item.name}</Title>
            <TouchableOpacity
              onPress={(event) => {
                // Menü konumunu hesapla
                const { pageX, pageY } = event.nativeEvent;
                setItemMenuPositions(prev => ({
                  ...prev,
                  [item.id.toString()]: { x: pageX, y: pageY }
                }));
                setMenuVisible(item.id.toString());
              }}
            >
              <MaterialIcons name="more-vert" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Paragraph style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Paragraph>

          <View style={styles.cardFooter}>
            <Chip icon="book-outline" style={styles.chip}>{item.wordCount || 0} kelime</Chip>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          <View style={styles.actionButtons}>

            <Button
              mode="outlined"
              style={styles.actionButton}
              labelStyle={{ fontSize: 12 }}
              icon="pencil-box"
              onPress={() => navigation.navigate('Quiz', {
                listId: item.id.toString()
              })}
            >
              Test
            </Button>
            <Button
              mode="outlined"
              style={styles.actionButton}
              labelStyle={{ fontSize: 12 }}
              icon="information"
              onPress={() => navigation.navigate('ListDetail', {
                listId: item.id.toString()
              })}
            >
              Detay
            </Button>
          </View>
        </Card.Content>

        {menuVisible === item.id.toString() && itemMenuPositions[item.id.toString()] && (
          <Menu
            visible={true}
            onDismiss={() => setMenuVisible(null)}
            anchor={itemMenuPositions[item.id.toString()]}
            style={styles.menu}
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                navigation.navigate('FeaturePlaceholder', {
                  featureId: 4, // Kelime Ekle
                  featureName: 'Kelime Ekle: ' + item.name,
                  description: 'Mevcut listeye anlamları ve bağlam örnekleriyle yeni kelimeler ekleme.'
                });
              }}
              title="Kelime Ekle"
              leadingIcon="plus"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                // Düzenleme işlevi
              }}
              title="Listeyi Düzenle"
              leadingIcon="pencil"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                // Silme işlevi
                Alert.alert(
                  "Listeyi Sil",
                  "Bu listeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve listedeki tüm kelimeler silinecektir.",
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
                          await apiService.deleteList(Number(item.id));

                          // Yerel state'i güncelle
                          const updatedLists = lists.filter(list => list.id !== item.id);
                          setLists(updatedLists);
                          setFilteredLists(updatedLists);

                          // Başarı mesajı göster
                          Alert.alert('Başarılı', 'Liste başarıyla silindi.');
                        } catch (error) {
                          console.error('Liste silinirken hata oluştu:', error);
                          Alert.alert('Hata', 'Liste silinirken bir hata oluştu.');
                        } finally {
                          setIsLoading(false);
                        }
                      },
                      style: "destructive"
                    }
                  ]
                );
              }}
              title="Listeyi Sil"
              leadingIcon="delete"
              titleStyle={{ color: '#EF4444' }}
            />
          </Menu>
        )}
      </Card>
    );
  };

  // Boş liste durumu
  const renderEmptyList = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="list-alt" size={64} color="#64748B" />
        <Text style={styles.emptyText}>Henüz kelime listeniz yok</Text>
        <Text style={styles.emptySubText}>Yeni bir liste oluşturmak için aşağıdaki butona tıklayın</Text>
        <Button
          mode="contained"
          style={styles.createButton}
          icon="plus"
          onPress={() => navigation.navigate('CreateList')}
        >
          Yeni Liste Oluştur
        </Button>
      </View>
    );
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Liste ara..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#94A3B8"
          inputStyle={{ color: '#FFFFFF' }}
        />

        <TouchableOpacity
          style={styles.sortButton}
          onPress={(event) => {
            // Menü konumunu hesapla
            const { pageX, pageY } = event.nativeEvent;
            setSortMenuPosition({ x: pageX, y: pageY - 10 });
            setSortMenuVisible(true);
          }}
        >
          <MaterialIcons name="sort" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {sortMenuVisible && (
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={sortMenuPosition}
          style={styles.menu}
        >
          <Menu.Item
            onPress={() => handleSort('date')}
            title="Tarihe Göre"
            leadingIcon={sortBy === 'date' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleSort('name')}
            title="İsme Göre"
            leadingIcon={sortBy === 'name' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleSort('wordCount')}
            title="Kelime Sayısına Göre"
            leadingIcon={sortBy === 'wordCount' ? 'check' : undefined}
          />
        </Menu>
      )}

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Listeler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLists}
          renderItem={renderListItem}
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
          ListEmptyComponent={renderEmptyList}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateList')}
      >
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  listContainer: {
    paddingBottom: 80,
  },
  listCard: {
    marginBottom: 12,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    padding: 4, // Kart içeriğine padding eklendi
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    flex: 1,
  },
  cardDescription: {
    color: '#94A3B8',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#334155',
  },
  progressContainer: {
    width: 100,
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8, // Butonların altına boşluk eklendi
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderColor: '#334155',
    paddingVertical: 4, // Butonlara dikey padding eklendi
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menu: {
    backgroundColor: '#1E293B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
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
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
  },
});

export default ListsScreen;
