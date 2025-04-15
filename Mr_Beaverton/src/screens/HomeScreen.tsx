import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { Button, Card, Title, Paragraph, ProgressBar, Divider } from 'react-native-paper';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { commonStyles } from '../styles/theme';

import { RootStackParamList, TabParamList } from '../types';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [dailyGoal, setDailyGoal] = useState(5);
  const [dailyProgress, setDailyProgress] = useState(3);
  const [streakDays, setStreakDays] = useState(7);
  const [totalWords, setTotalWords] = useState(120);
  const [learnedWords, setLearnedWords] = useState(45);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Günlük hedef ilerleme yüzdesi
  const dailyProgressPercentage = dailyProgress / dailyGoal;

  // Saat güncellemesi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Her dakika güncelle

    return () => clearInterval(timer);
  }, []);

  // Örnek kelime listeleri
  const recentLists = [
    { id: '1', name: 'İngilizce Temel Kelimeler', wordCount: 50, progress: 0.7 },
    { id: '2', name: 'İş İngilizcesi', wordCount: 30, progress: 0.4 },
    { id: '3', name: 'Akademik İngilizce', wordCount: 45, progress: 0.2 },
  ];

  // Örnek günlük kelimeler
  const dailyWords = [
    { id: '1', word: 'Serendipity', meaning: 'Şans eseri güzel bir şey bulmak', learned: true },
    { id: '2', word: 'Ephemeral', meaning: 'Kısa ömürlü, geçici', learned: true },
    { id: '3', word: 'Ubiquitous', meaning: 'Her yerde bulunan, yaygın', learned: true },
    { id: '4', word: 'Mellifluous', meaning: 'Tatlı, akıcı, hoş (ses için)', learned: false },
    { id: '5', word: 'Surreptitious', meaning: 'Gizli, el altından yapılan', learned: false },
  ];

  // Örnek öğrenme ipuçları
  const learningTips = [
    { id: '1', title: 'Kelime Kartları Kullanın', icon: 'style' },
    { id: '2', title: 'Günlük Pratik Yapın', icon: 'today' },
    { id: '3', title: 'Bağlam İçinde Öğrenin', icon: 'menu-book' },
    { id: '4', title: 'Sesli Tekrar Edin', icon: 'record-voice-over' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Karşılama Kartı */}
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <View style={styles.welcomeHeader}>
            <View>
              <Title style={styles.welcomeTitle}>Merhaba!</Title>
              <Text style={styles.dateText}>
                {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
            </View>
            <View style={styles.streakContainer}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF9800" />
              <Text style={styles.streakText}>{streakDays} gün</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Günlük Hedef Kartı */}
      <Card style={styles.goalCard}>
        <Card.Content>
          <View style={styles.goalHeader}>
            <Title style={styles.sectionTitle}>Günlük Hedef</Title>
            <Text style={styles.goalText}>{dailyProgress}/{dailyGoal} kelime</Text>
          </View>

          <ProgressBar
            progress={dailyProgressPercentage}
            color="#4CAF50"
            style={styles.progressBar}
          />

          <View style={styles.goalMessage}>
            <MaterialIcons
              name={dailyProgress >= dailyGoal ? "emoji-events" : "emoji-objects"}
              size={24}
              color={dailyProgress >= dailyGoal ? "#FFC107" : "#64748B"}
            />
            <Text style={styles.goalMessageText}>
              {dailyProgress >= dailyGoal
                ? "Günlük hedefinizi tamamladınız!"
                : `${dailyGoal - dailyProgress} kelime daha öğrenin`}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Günün Kelimeleri */}
      <Title style={styles.sectionTitle}>Günün Kelimeleri</Title>
      <Card style={styles.wordsCard}>
        <Card.Content>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dailyWords.map((item) => (
              <View key={item.id} style={styles.wordItem}>
                <View style={[styles.wordCard, item.learned && styles.wordCardLearned]}>
                  <Text style={styles.wordText}>{item.word}</Text>
                  {item.learned && (
                    <View style={styles.learnedBadge}>
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text style={styles.meaningText} numberOfLines={2}>{item.meaning}</Text>
              </View>
            ))}
          </ScrollView>

          <Button
            mode="outlined"
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('Lists')}
          >
            Tümünü Gör
          </Button>
        </Card.Content>
      </Card>

      {/* İstatistikler */}
      <Title style={styles.sectionTitle}>İstatistikler</Title>
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialIcons name="book" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{totalWords}</Text>
            <Text style={styles.statLabel}>Toplam Kelime</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialIcons name="school" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{learnedWords}</Text>
            <Text style={styles.statLabel}>Öğrenilen</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialIcons name="trending-up" size={24} color="#FFC107" />
            <Text style={styles.statValue}>%{Math.round((learnedWords / totalWords) * 100)}</Text>
            <Text style={styles.statLabel}>Başarı</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Son Listeler */}
      <View style={styles.listsHeader}>
        <Title style={styles.sectionTitle}>Son Listelerim</Title>
        <TouchableOpacity onPress={() => navigation.navigate('Lists')}>
          <Text style={styles.seeAllText}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>

      {recentLists.map((list) => (
        <Card key={list.id} style={styles.listCard}>
          <Card.Content>
            <View style={styles.listCardHeader}>
              <Title style={styles.listCardTitle}>{list.name}</Title>
              <Text style={styles.listCardCount}>{list.wordCount} kelime</Text>
            </View>

            <View style={styles.listProgressContainer}>
              <View style={styles.listProgressBar}>
                <View style={[styles.listProgressFill, { width: `${list.progress * 100}%` }]} />
              </View>
              <Text style={styles.listProgressText}>%{Math.round(list.progress * 100)}</Text>
            </View>

            <View style={styles.listCardActions}>


              <Button
                mode="text"
                compact
                style={styles.listCardButton}
                labelStyle={styles.listCardButtonLabel}
                icon="pencil-box"
                onPress={() => navigation.navigate('Quiz', { listId: list.id })}
              >
                Test
              </Button>

              <Button
                mode="text"
                compact
                style={styles.listCardButton}
                labelStyle={styles.listCardButtonLabel}
                icon="information"
                onPress={() => navigation.navigate('ListDetail', { listId: list.id })}
              >
                Detay
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* Öğrenme İpuçları */}
      <Title style={styles.sectionTitle}>Öğrenme İpuçları</Title>
      <Card style={styles.tipsCard}>
        <Card.Content>
          {learningTips.map((tip, index) => (
            <React.Fragment key={tip.id}>
              <View style={styles.tipItem}>
                <View style={styles.tipIcon}>
                  <MaterialIcons name={tip.icon as any} size={24} color="#4CAF50" />
                </View>
                <Text style={styles.tipText}>{tip.title}</Text>
              </View>
              {index < learningTips.length - 1 && <Divider style={styles.tipDivider} />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      {/* Motivasyon Kartı */}
      <Card style={styles.motivationCard}>
        <Card.Content>
          <Text style={styles.quoteText}>
            "Bir dil, bir insan. İki dil, iki insan."
          </Text>
          <Text style={styles.quoteAuthor}>- Türk Atasözü</Text>
        </Card.Content>
      </Card>

      {/* Yeni Özellikler */}
      <Title style={styles.sectionTitle}>Yeni Özellikler</Title>
      <Card style={styles.featuresCard}>
        <Card.Content>
          <View style={styles.featureItem}>
            <MaterialIcons name="new-releases" size={24} color="#FF5722" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Sesli Telaffuz</Text>
              <Text style={styles.featureDescription}>Kelimelerin doğru telaffuzunu dinleyin</Text>
            </View>
          </View>

          <Divider style={styles.featureDivider} />

          <View style={styles.featureItem}>
            <MaterialIcons name="new-releases" size={24} color="#FF5722" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Hatırlatıcılar</Text>
              <Text style={styles.featureDescription}>Düzenli çalışmak için bildirimler alın</Text>
            </View>
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
  welcomeCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakText: {
    color: '#FF9800',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  goalCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
    marginBottom: 12,
  },
  goalMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalMessageText: {
    color: '#94A3B8',
    marginLeft: 8,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  wordsCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  wordItem: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
  },
  wordCard: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  wordCardLearned: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  wordText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 8,
  },
  learnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meaningText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    height: 32,
  },
  seeAllButton: {
    marginTop: 16,
    borderColor: '#4CAF50',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  statContent: {
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  listsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  listCard: {
    marginBottom: 12,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listCardTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  listCardCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  listProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  listProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  listProgressText: {
    fontSize: 12,
    color: '#94A3B8',
    width: 40,
    textAlign: 'right',
  },
  listCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listCardButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  listCardButtonLabel: {
    fontSize: 12,
    marginLeft: 4,
  },
  tipsCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  tipDivider: {
    backgroundColor: '#334155',
  },
  motivationCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    padding: 8,
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  quoteAuthor: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  featuresCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureContent: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  featureDescription: {
    color: '#94A3B8',
    fontSize: 14,
  },
  featureDivider: {
    backgroundColor: '#334155',
  },
  bottomSpacer: {
    height: 80,
  },
});

export default HomeScreen;
