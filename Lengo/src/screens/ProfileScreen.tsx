import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Card, Title, Text, Button, Avatar, Divider, List, Switch, Badge } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { commonStyles } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const navigation = useNavigation();
  const { logout } = useAuth();

  // Tema tercihini yükle
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme_preference');
        if (savedTheme !== null) {
          setDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Tema tercihi yüklenirken hata oluştu:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Tema değiştirme fonksiyonu
  const toggleTheme = async () => {
    try {
      const newMode = !darkMode;
      setDarkMode(newMode);
      await AsyncStorage.setItem('theme_preference', newMode ? 'dark' : 'light');
      Alert.alert(
        'Tema Değiştirildi',
        `Tema ${newMode ? 'karanlık' : 'açık'} moda geçirildi. Değişikliklerin tamamen uygulanması için uygulamayı yeniden başlatın.`,
        [{ text: 'Tamam', onPress: () => console.log('Tema değiştirildi') }]
      );
    } catch (error) {
      console.error('Tema tercihi kaydedilirken hata oluştu:', error);
    }
  };

  // Örnek kullanıcı verileri
  const user = {
    name: 'Kullanıcı',
    email: 'kullanici@example.com',
    joinDate: '01.01.2023',
    totalLists: 5,
    totalWords: 120,
    learningStreak: 7,
    completedWords: 45,
  };

  // Örnek başarılar
  const achievements = [
    { id: '1', title: 'İlk Liste', description: 'İlk kelime listesini oluştur', completed: true },
    { id: '2', title: '10 Kelime', description: '10 kelime öğren', completed: true },
    { id: '3', title: '50 Kelime', description: '50 kelime öğren', completed: false },
    { id: '4', title: '7 Gün Serisi', description: '7 gün üst üste çalış', completed: true },
    { id: '5', title: 'Tam Puan', description: 'Bir testten tam puan al', completed: false },
  ];

  return (
    <ScrollView style={commonStyles.container}>
      {/* Profil Kartı */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Avatar.Icon
            size={80}
            icon="account"
            style={styles.avatar}
            color="#FFFFFF"
          />
          <View style={styles.profileInfo}>
            <Title style={styles.profileName}>{user.name}</Title>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profileDate}>Üyelik: {user.joinDate}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalLists}</Text>
            <Text style={styles.statLabel}>Liste</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalWords}</Text>
            <Text style={styles.statLabel}>Kelime</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.learningStreak}</Text>
            <Text style={styles.statLabel}>Gün Serisi</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round((user.completedWords / user.totalWords) * 100)}%</Text>
            <Text style={styles.statLabel}>Tamamlanan</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Genel İlerleme</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round((user.completedWords / user.totalWords) * 100)}%` }
              ]}
            />
          </View>
        </View>
      </Card>

      {/* Ayarlar Kartı */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Ayarlar</Title>

          <List.Item
            title="Karanlık Mod"
            titleStyle={styles.settingTitle}
            description="Karanlık temayı etkinleştir"
            descriptionStyle={styles.settingDescription}
            left={props => <List.Icon {...props} icon="theme-light-dark" color="#3F51B5" />}
            right={props => (
              <Switch
                value={darkMode}
                onValueChange={toggleTheme}
                color="#3F51B5"
              />
            )}
          />

          <Divider style={styles.settingDivider} />

          <List.Item
            title="Bildirimler"
            titleStyle={styles.settingTitle}
            description="Günlük hatırlatıcılar ve bildirimler"
            descriptionStyle={styles.settingDescription}
            left={props => <List.Icon {...props} icon="bell" color="#3F51B5" />}
            right={props => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color="#3F51B5"
              />
            )}
          />

          <Divider style={styles.settingDivider} />

          <List.Item
            title="Ses Efektleri"
            titleStyle={styles.settingTitle}
            description="Uygulama ses efektleri"
            descriptionStyle={styles.settingDescription}
            left={props => <List.Icon {...props} icon="volume-high" color="#3F51B5" />}
            right={props => (
              <Switch
                value={soundEffects}
                onValueChange={setSoundEffects}
                color="#3F51B5"
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Başarılar Kartı */}
      <Card style={styles.achievementsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Başarılar</Title>

          {achievements.map((achievement) => (
            <View key={achievement.id}>
              <List.Item
                title={achievement.title}
                titleStyle={[
                  styles.achievementTitle,
                  achievement.completed && styles.achievementCompleted
                ]}
                description={achievement.description}
                descriptionStyle={styles.achievementDescription}
                left={props => (
                  <View style={styles.achievementIconContainer}>
                    <MaterialIcons
                      name={achievement.completed ? "emoji-events" : "emoji-events"}
                      size={24}
                      color={achievement.completed ? "#FFC107" : "#64748B"}
                    />
                    {achievement.completed && (
                      <View style={styles.completedBadge}>
                        <MaterialIcons name="check" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                )}
              />
              {achievement.id !== achievements[achievements.length - 1].id && (
                <Divider style={styles.achievementDivider} />
              )}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Çıkış Butonu */}
      <Button
        mode="outlined"
        style={styles.logoutButton}
        icon="logout"
        onPress={async () => {
          // Çıkış işlemi
          Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinize emin misiniz?',
            [
              {
                text: 'İptal',
                style: 'cancel'
              },
              {
                text: 'Çıkış Yap',
                onPress: async () => {
                  // Sadece logout fonksiyonunu çağır
                  // AuthContext içindeki state değiştiğinde App.tsx otomatik olarak Auth ekranına yönlendirecek
                  await logout();
                }
              }
            ]
          );
        }}
      >
        Çıkış Yap
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#3F51B5',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 22,
    marginBottom: 4,
  },
  profileEmail: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 4,
  },
  profileDate: {
    color: '#64748B',
    fontSize: 12,
  },
  divider: {
    backgroundColor: '#334155',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3F51B5',
  },
  settingsCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    marginBottom: 16,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  settingDescription: {
    color: '#94A3B8',
    fontSize: 12,
  },
  settingDivider: {
    backgroundColor: '#334155',
    height: 1,
  },
  achievementsCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  achievementTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  achievementCompleted: {
    color: '#FFC107',
  },
  achievementDescription: {
    color: '#94A3B8',
    fontSize: 12,
  },
  achievementIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  completedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3F51B5',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementDivider: {
    backgroundColor: '#334155',
    height: 1,
    marginLeft: 56,
  },
  logoutButton: {
    marginBottom: 32,
    borderColor: '#EF4444',
    borderWidth: 1,
  },
});

export default ProfileScreen;
