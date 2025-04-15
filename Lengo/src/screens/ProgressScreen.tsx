import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, ProgressBar, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types';

type ProgressScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

const { width } = Dimensions.get('window');

// Örnek veri
const weeklyData = [
  { day: 'Pzt', count: 15 },
  { day: 'Sal', count: 8 },
  { day: 'Çar', count: 12 },
  { day: 'Per', count: 20 },
  { day: 'Cum', count: 5 },
  { day: 'Cmt', count: 18 },
  { day: 'Paz', count: 10 },
];

const monthlyData = [
  { month: 'Oca', count: 120 },
  { month: 'Şub', count: 150 },
  { month: 'Mar', count: 90 },
  { month: 'Nis', count: 180 },
  { month: 'May', count: 210 },
  { month: 'Haz', count: 160 },
];

const categoryData = [
  { name: 'Akademik', count: 45, total: 60, color: '#4CAF50' },
  { name: 'İş İngilizcesi', count: 30, total: 50, color: '#2196F3' },
  { name: 'Günlük Konuşma', count: 80, total: 100, color: '#FFC107' },
  { name: 'Teknik Terimler', count: 20, total: 40, color: '#9C27B0' },
];

const achievements = [
  { id: '1', title: 'İlk Liste', description: 'İlk kelime listesini oluştur', completed: true, icon: 'playlist-add-check' },
  { id: '2', title: '10 Kelime', description: '10 kelime öğren', completed: true, icon: 'school' },
  { id: '3', title: '50 Kelime', description: '50 kelime öğren', completed: true, icon: 'psychology' },
  { id: '4', title: '100 Kelime', description: '100 kelime öğren', completed: false, icon: 'psychology' },
  { id: '5', title: '7 Gün Serisi', description: '7 gün üst üste çalış', completed: true, icon: 'local-fire-department' },
  { id: '6', title: '30 Gün Serisi', description: '30 gün üst üste çalış', completed: false, icon: 'local-fire-department' },
  { id: '7', title: 'Tam Puan', description: 'Bir testten tam puan al', completed: true, icon: 'emoji-events' },
  { id: '8', title: 'Hızlı Öğrenen', description: 'Bir günde 20 kelime öğren', completed: false, icon: 'speed' },
];

const ProgressScreen = () => {
  const navigation = useNavigation<ProgressScreenNavigationProp>();
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // En yüksek değeri bulma
  const maxWeeklyCount = Math.max(...weeklyData.map(item => item.count));
  const maxMonthlyCount = Math.max(...monthlyData.map(item => item.count));

  // Toplam istatistikler
  const totalWords = 250;
  const learnedWords = 175;
  const learningStreak = 7;
  const testsCompleted = 15;
  const averageScore = 85;

  // Grafik çubuğu yüksekliği hesaplama
  const getBarHeight = (count: number, max: number) => {
    return (count / max) * 150;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>İlerleme İstatistikleri</Title>
        <Paragraph style={styles.headerSubtitle}>Öğrenme yolculuğunuzu takip edin</Paragraph>
      </View>

      {/* Özet Kartı */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialIcons name="book" size={24} color="#4CAF50" />
              <Text style={styles.summaryValue}>{totalWords}</Text>
              <Text style={styles.summaryLabel}>Toplam Kelime</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <MaterialIcons name="school" size={24} color="#2196F3" />
              <Text style={styles.summaryValue}>{learnedWords}</Text>
              <Text style={styles.summaryLabel}>Öğrenilen</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF9800" />
              <Text style={styles.summaryValue}>{learningStreak}</Text>
              <Text style={styles.summaryLabel}>Gün Serisi</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelContainer}>
              <Text style={styles.progressLabel}>Genel İlerleme</Text>
              <Text style={styles.progressPercentage}>%{Math.round((learnedWords / totalWords) * 100)}</Text>
            </View>
            <ProgressBar
              progress={learnedWords / totalWords}
              color="#4CAF50"
              style={styles.progressBar}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Aktivite Grafiği */}
      <Card style={styles.graphCard}>
        <Card.Content>
          <View style={styles.graphHeader}>
            <Title style={styles.graphTitle}>Aktivite Grafiği</Title>
            <View style={styles.timeRangeSelector}>
              <TouchableOpacity
                style={[
                  styles.timeRangeButton,
                  timeRange === 'weekly' && styles.timeRangeButtonActive
                ]}
                onPress={() => setTimeRange('weekly')}
              >
                <Text
                  style={[
                    styles.timeRangeButtonText,
                    timeRange === 'weekly' && styles.timeRangeButtonTextActive
                  ]}
                >
                  Haftalık
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.timeRangeButton,
                  timeRange === 'monthly' && styles.timeRangeButtonActive
                ]}
                onPress={() => setTimeRange('monthly')}
              >
                <Text
                  style={[
                    styles.timeRangeButtonText,
                    timeRange === 'monthly' && styles.timeRangeButtonTextActive
                  ]}
                >
                  Aylık
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.graphContainer}>
            {timeRange === 'weekly' ? (
              // Haftalık grafik
              <View style={styles.barGraph}>
                {weeklyData.map((item, index) => (
                  <View key={index} style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { height: getBarHeight(item.count, maxWeeklyCount) }
                      ]}
                    />
                    <Text style={styles.barLabel}>{item.day}</Text>
                    <Text style={styles.barValue}>{item.count}</Text>
                  </View>
                ))}
              </View>
            ) : (
              // Aylık grafik
              <View style={styles.barGraph}>
                {monthlyData.map((item, index) => (
                  <View key={index} style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { height: getBarHeight(item.count, maxMonthlyCount) }
                      ]}
                    />
                    <Text style={styles.barLabel}>{item.month}</Text>
                    <Text style={styles.barValue}>{item.count}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Kategori İlerlemesi */}
      <Card style={styles.categoryCard}>
        <Card.Content>
          <Title style={styles.categoryTitle}>Kategori İlerlemesi</Title>
          
          {categoryData.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
              onPress={() => setSelectedCategory(
                selectedCategory === category.name ? null : category.name
              )}
            >
              <View style={styles.categoryHeader}>
                <View style={styles.categoryNameContainer}>
                  <View
                    style={[
                      styles.categoryColorIndicator,
                      { backgroundColor: category.color }
                    ]}
                  />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <Text style={styles.categoryCount}>
                  {category.count}/{category.total}
                </Text>
              </View>
              
              <View style={styles.categoryProgressContainer}>
                <View style={styles.categoryProgressBar}>
                  <View
                    style={[
                      styles.categoryProgressFill,
                      { width: `${(category.count / category.total) * 100}%`, backgroundColor: category.color }
                    ]}
                  />
                </View>
                <Text style={styles.categoryPercentage}>
                  %{Math.round((category.count / category.total) * 100)}
                </Text>
              </View>
              
              {selectedCategory === category.name && (
                <View style={styles.categoryDetails}>
                  <Button
                    mode="outlined"
                    style={[styles.categoryButton, { borderColor: category.color }]}
                    labelStyle={{ color: category.color }}
                    onPress={() => navigation.navigate('Lists')}
                  >
                    Listeyi Görüntüle
                  </Button>
                  
                  <Button
                    mode="outlined"
                    style={[styles.categoryButton, { borderColor: category.color }]}
                    labelStyle={{ color: category.color }}
                    onPress={() => navigation.navigate('Learn', { listId: '1' })}
                  >
                    Öğrenmeye Devam Et
                  </Button>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>

      {/* Test Sonuçları */}
      <Card style={styles.testCard}>
        <Card.Content>
          <Title style={styles.testTitle}>Test Performansı</Title>
          
          <View style={styles.testSummary}>
            <View style={styles.testSummaryItem}>
              <Text style={styles.testSummaryValue}>{testsCompleted}</Text>
              <Text style={styles.testSummaryLabel}>Tamamlanan Test</Text>
            </View>
            
            <View style={styles.testSummaryItem}>
              <Text style={styles.testSummaryValue}>%{averageScore}</Text>
              <Text style={styles.testSummaryLabel}>Ortalama Başarı</Text>
            </View>
          </View>
          
          <View style={styles.testScoreDistribution}>
            <Title style={styles.testScoreTitle}>Başarı Dağılımı</Title>
            
            <View style={styles.scoreBar}>
              <View style={styles.scoreSegment}>
                <View style={[styles.scoreSegmentFill, { width: '15%', backgroundColor: '#F44336' }]} />
              </View>
              <View style={styles.scoreSegment}>
                <View style={[styles.scoreSegmentFill, { width: '25%', backgroundColor: '#FF9800' }]} />
              </View>
              <View style={styles.scoreSegment}>
                <View style={[styles.scoreSegmentFill, { width: '60%', backgroundColor: '#4CAF50' }]} />
              </View>
            </View>
            
            <View style={styles.scoreLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
                <Text style={styles.legendText}>%0-50</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.legendText}>%51-80</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>%81-100</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Başarılar */}
      <Card style={styles.achievementsCard}>
        <Card.Content>
          <Title style={styles.achievementsTitle}>Başarılar</Title>
          
          <View style={styles.achievementsList}>
            {achievements.map((achievement, index) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View
                  style={[
                    styles.achievementIcon,
                    achievement.completed
                      ? styles.achievementIconCompleted
                      : styles.achievementIconLocked
                  ]}
                >
                  <MaterialIcons
                    name={achievement.icon as any}
                    size={24}
                    color={achievement.completed ? '#FFFFFF' : '#64748B'}
                  />
                </View>
                
                <View style={styles.achievementContent}>
                  <Text
                    style={[
                      styles.achievementTitle,
                      achievement.completed && styles.achievementTitleCompleted
                    ]}
                  >
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                </View>
                
                {achievement.completed && (
                  <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                )}
                
                {!achievement.completed && (
                  <MaterialIcons name="lock" size={24} color="#64748B" />
                )}
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Boşluk */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  graphCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  graphTitle: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 2,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeRangeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  timeRangeButtonText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  timeRangeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  graphContainer: {
    marginTop: 8,
  },
  barGraph: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  barValue: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  categoryCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  categoryTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  categoryCount: {
    color: '#94A3B8',
    fontSize: 14,
  },
  categoryProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
  },
  categoryPercentage: {
    color: '#94A3B8',
    fontSize: 14,
    width: 40,
    textAlign: 'right',
  },
  categoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  categoryButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  testCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  testTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  testSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  testSummaryItem: {
    alignItems: 'center',
  },
  testSummaryValue: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  testSummaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  testScoreDistribution: {
    marginTop: 16,
  },
  testScoreTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  scoreBar: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  scoreSegment: {
    height: '100%',
    flex: 1,
    backgroundColor: '#334155',
  },
  scoreSegmentFill: {
    height: '100%',
  },
  scoreLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  achievementsCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  achievementsTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  achievementsList: {
    
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementIconCompleted: {
    backgroundColor: '#4CAF50',
  },
  achievementIconLocked: {
    backgroundColor: '#334155',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  achievementTitleCompleted: {
    color: '#4CAF50',
  },
  achievementDescription: {
    color: '#94A3B8',
    fontSize: 12,
  },
  bottomSpacer: {
    height: 80,
  },
});

export default ProgressScreen;
