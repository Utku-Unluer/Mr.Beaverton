import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, FlatList } from 'react-native';
import { Searchbar, Card, Title, Paragraph, Chip, Divider, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types';

type SearchScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

// Örnek veri
const sampleLists = [
  { id: '1', name: 'İngilizce Temel Kelimeler', wordCount: 50, category: 'Akademik' },
  { id: '2', name: 'İş İngilizcesi', wordCount: 30, category: 'İş' },
  { id: '3', name: 'Akademik İngilizce', wordCount: 45, category: 'Akademik' },
  { id: '4', name: 'Seyahat Terimleri', wordCount: 25, category: 'Seyahat' },
  { id: '5', name: 'Teknoloji Terimleri', wordCount: 35, category: 'Teknoloji' },
];

const sampleWords = [
  { id: '1', word: 'Serendipity', meaning: 'Şans eseri güzel bir şey bulmak', listId: '1', listName: 'İngilizce Temel Kelimeler' },
  { id: '2', word: 'Ephemeral', meaning: 'Kısa ömürlü, geçici', listId: '1', listName: 'İngilizce Temel Kelimeler' },
  { id: '3', word: 'Ubiquitous', meaning: 'Her yerde bulunan, yaygın', listId: '3', listName: 'Akademik İngilizce' },
  { id: '4', word: 'Mellifluous', meaning: 'Tatlı, akıcı, hoş (ses için)', listId: '1', listName: 'İngilizce Temel Kelimeler' },
  { id: '5', word: 'Surreptitious', meaning: 'Gizli, el altından yapılan', listId: '2', listName: 'İş İngilizcesi' },
  { id: '6', word: 'Eloquent', meaning: 'Güzel konuşan, belagatli', listId: '3', listName: 'Akademik İngilizce' },
  { id: '7', word: 'Pernicious', meaning: 'Zararlı, yıkıcı', listId: '3', listName: 'Akademik İngilizce' },
  { id: '8', word: 'Pragmatic', meaning: 'Pratik, gerçekçi', listId: '2', listName: 'İş İngilizcesi' },
  { id: '9', word: 'Resilient', meaning: 'Esnek, dayanıklı', listId: '2', listName: 'İş İngilizcesi' },
  { id: '10', word: 'Meticulous', meaning: 'Titiz, ayrıntılı', listId: '1', listName: 'İngilizce Temel Kelimeler' },
];

const categories = [
  { id: '1', name: 'Akademik' },
  { id: '2', name: 'İş' },
  { id: '3', name: 'Seyahat' },
  { id: '4', name: 'Teknoloji' },
  { id: '5', name: 'Günlük' },
];

type SearchResult = {
  type: 'list' | 'word';
  item: any;
};

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'ephemeral', 'iş ingilizcesi', 'akademik'
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'all' | 'lists' | 'words'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Arama işlemi
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    
    // Gerçek bir API çağrısını simüle etmek için setTimeout kullanıyoruz
    setTimeout(() => {
      const results: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();
      
      // Liste araması
      if (searchType === 'all' || searchType === 'lists') {
        const filteredLists = sampleLists.filter(list => 
          list.name.toLowerCase().includes(lowerQuery) || 
          list.category.toLowerCase().includes(lowerQuery)
        );
        
        filteredLists.forEach(list => {
          results.push({ type: 'list', item: list });
        });
      }
      
      // Kelime araması
      if (searchType === 'all' || searchType === 'words') {
        const filteredWords = sampleWords.filter(word => 
          word.word.toLowerCase().includes(lowerQuery) || 
          word.meaning.toLowerCase().includes(lowerQuery)
        );
        
        filteredWords.forEach(word => {
          results.push({ type: 'word', item: word });
        });
      }
      
      // Kategori filtresi
      const filteredResults = selectedCategory 
        ? results.filter(result => {
            if (result.type === 'list') {
              return result.item.category === selectedCategory;
            } else {
              const list = sampleLists.find(l => l.id === result.item.listId);
              return list && list.category === selectedCategory;
            }
          })
        : results;
      
      setSearchResults(filteredResults);
      setIsLoading(false);
      
      // Son aramaları güncelle
      if (query.trim() !== '' && !recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }
    }, 500);
  };

  // Son aramaları temizle
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Son aramaya tıklama
  const handleRecentSearchPress = (search: string) => {
    setSearchQuery(search);
    handleSearch(search);
  };

  // Kategori seçimi
  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  // Arama tipini değiştirme
  const handleSearchTypeChange = (type: 'all' | 'lists' | 'words') => {
    setSearchType(type);
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  };

  // Arama sonuçlarını render etme
  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    if (item.type === 'list') {
      return (
        <Card 
          style={styles.resultCard}
          onPress={() => navigation.navigate('ListDetail', { listId: item.item.id })}
        >
          <Card.Content>
            <View style={styles.resultHeader}>
              <MaterialIcons name="folder" size={24} color="#4CAF50" style={styles.resultIcon} />
              <View style={styles.resultContent}>
                <Title style={styles.resultTitle}>{item.item.name}</Title>
                <View style={styles.resultMeta}>
                  <Chip style={styles.categoryChip} textStyle={styles.chipText}>
                    {item.item.category}
                  </Chip>
                  <Text style={styles.wordCount}>{item.item.wordCount} kelime</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      );
    } else {
      return (
        <Card 
          style={styles.resultCard}
          onPress={() => navigation.navigate('ListDetail', { listId: item.item.listId })}
        >
          <Card.Content>
            <View style={styles.resultHeader}>
              <MaterialIcons name="text-fields" size={24} color="#2196F3" style={styles.resultIcon} />
              <View style={styles.resultContent}>
                <Title style={styles.resultTitle}>{item.item.word}</Title>
                <Text style={styles.resultMeaning}>{item.item.meaning}</Text>
                <Text style={styles.resultListName}>Liste: {item.item.listName}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Arama Çubuğu */}
      <Searchbar
        placeholder="Kelime veya liste ara..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        iconColor="#4CAF50"
        inputStyle={styles.searchInput}
        placeholderTextColor="#94A3B8"
        onSubmitEditing={() => handleSearch(searchQuery)}
      />
      
      {/* Filtreler */}
      <View style={styles.filtersContainer}>
        {/* Arama Tipi Seçimi */}
        <View style={styles.searchTypeContainer}>
          <TouchableOpacity
            style={[
              styles.searchTypeButton,
              searchType === 'all' && styles.searchTypeButtonActive
            ]}
            onPress={() => handleSearchTypeChange('all')}
          >
            <Text
              style={[
                styles.searchTypeText,
                searchType === 'all' && styles.searchTypeTextActive
              ]}
            >
              Tümü
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.searchTypeButton,
              searchType === 'lists' && styles.searchTypeButtonActive
            ]}
            onPress={() => handleSearchTypeChange('lists')}
          >
            <Text
              style={[
                styles.searchTypeText,
                searchType === 'lists' && styles.searchTypeTextActive
              ]}
            >
              Listeler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.searchTypeButton,
              searchType === 'words' && styles.searchTypeButtonActive
            ]}
            onPress={() => handleSearchTypeChange('words')}
          >
            <Text
              style={[
                styles.searchTypeText,
                searchType === 'words' && styles.searchTypeTextActive
              ]}
            >
              Kelimeler
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Kategori Filtreleri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.name && styles.categoryButtonActive
              ]}
              onPress={() => handleCategoryPress(category.name)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.name && styles.categoryButtonTextActive
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* İçerik */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Aranıyor...</Text>
        </View>
      ) : searchQuery ? (
        searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item, index) => `${item.type}-${item.item.id}-${index}`}
            contentContainerStyle={styles.resultsContainer}
            ListHeaderComponent={
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  "{searchQuery}" için {searchResults.length} sonuç bulundu
                </Text>
              </View>
            }
            ListFooterComponent={<View style={styles.bottomSpacer} />}
          />
        ) : (
          <View style={styles.noResultsContainer}>
            <MaterialIcons name="search-off" size={64} color="#64748B" />
            <Text style={styles.noResultsText}>
              "{searchQuery}" için sonuç bulunamadı
            </Text>
            <Text style={styles.noResultsSubtext}>
              Farklı anahtar kelimeler veya filtreler deneyin
            </Text>
          </View>
        )
      ) : (
        <ScrollView style={styles.initialContent}>
          {/* Son Aramalar */}
          {recentSearches.length > 0 && (
            <View style={styles.recentSearchesContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Son Aramalar</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearText}>Temizle</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.recentSearchesList}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentSearchItem}
                    onPress={() => handleRecentSearchPress(search)}
                  >
                    <MaterialIcons name="history" size={16} color="#94A3B8" />
                    <Text style={styles.recentSearchText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Popüler Kategoriler */}
          <View style={styles.popularCategoriesContainer}>
            <Text style={styles.sectionTitle}>Popüler Kategoriler</Text>
            
            <View style={styles.categoriesGrid}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => {
                    setSelectedCategory(category.name);
                    setSearchQuery(category.name);
                    handleSearch(category.name);
                  }}
                >
                  <MaterialIcons
                    name={
                      category.name === 'Akademik' ? 'school' :
                      category.name === 'İş' ? 'business' :
                      category.name === 'Seyahat' ? 'flight' :
                      category.name === 'Teknoloji' ? 'devices' : 'chat'
                    }
                    size={32}
                    color="#4CAF50"
                  />
                  <Text style={styles.categoryCardText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Popüler Aramalar */}
          <View style={styles.popularSearchesContainer}>
            <Text style={styles.sectionTitle}>Popüler Aramalar</Text>
            
            <View style={styles.popularSearchesList}>
              {['İngilizce Temel', 'İş Terimleri', 'Akademik', 'Seyahat', 'Teknoloji'].map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.popularSearchItem}
                  onPress={() => handleRecentSearchPress(search)}
                >
                  <MaterialIcons name="trending-up" size={16} color="#4CAF50" />
                  <Text style={styles.popularSearchText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Boşluk */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  searchBar: {
    margin: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    elevation: 0,
  },
  searchInput: {
    color: '#FFFFFF',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 2,
    marginBottom: 12,
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  searchTypeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  searchTypeText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  searchTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryButtonText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 16,
    fontSize: 16,
  },
  resultsContainer: {
    paddingHorizontal: 16,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  resultCard: {
    marginBottom: 12,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
  },
  resultIcon: {
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryChip: {
    backgroundColor: '#334155',
    height: 24,
    marginRight: 8,
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  wordCount: {
    color: '#94A3B8',
    fontSize: 12,
  },
  resultMeaning: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },
  resultListName: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noResultsText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  noResultsSubtext: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  initialContent: {
    flex: 1,
    padding: 16,
  },
  recentSearchesContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  clearText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  recentSearchesList: {
    
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  recentSearchText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  popularCategoriesContainer: {
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginRight: '5%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryCardText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  popularSearchesContainer: {
    marginBottom: 24,
  },
  popularSearchesList: {
    marginTop: 12,
  },
  popularSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  popularSearchText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 80,
  },
});

export default SearchScreen;
