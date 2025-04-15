import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { TouchableOpacity, StyleSheet, View, Modal, Text, Animated, Dimensions } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Tab Navigator param list
export type TabParamList = {
  Home: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Menü seçenekleri
interface MenuOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  screen: string;
  params?: any;
}

const menuOptions: MenuOption[] = [
  { id: '1', name: 'Kelime Listeleri', icon: 'list', color: '#4CAF50', screen: 'Lists' },
  { id: '2', name: 'Liste Oluştur', icon: 'add-circle', color: '#2196F3', screen: 'CreateList' },

  { id: '4', name: 'Test Modu', icon: 'quiz', color: '#9C27B0', screen: 'Quiz', params: { listId: '1' } },
  { id: '5', name: 'Kelime Ekle', icon: 'post-add', color: '#FF5722', screen: 'AddWord', params: { listId: '1' } },
  { id: '6', name: 'Liste Detayı', icon: 'info', color: '#00BCD4', screen: 'ListDetail', params: { listId: '1' } },
  { id: '7', name: 'İlerleme', icon: 'trending-up', color: '#3F51B5', screen: 'Progress' },
  { id: '8', name: 'Arama', icon: 'search', color: '#607D8B', screen: 'Search' },
  { id: '9', name: 'Profil', icon: 'person', color: '#E91E63', screen: 'UserProfile' },
  { id: '10', name: 'Ana Sayfa', icon: 'home', color: '#009688', screen: 'Home' },
  { id: '11', name: 'Chatbot', icon: 'chat', color: '#00BCD4', screen: 'Chatbot' },
];

const { width, height } = Dimensions.get('window');

interface TabNavigatorProps {
  navigation: any;
}

const TabNavigator = ({ navigation }: TabNavigatorProps) => {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));

  // Menüyü aç/kapat
  const toggleMenu = () => {
    if (menuVisible) {
      // Menüyü kapat
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMenuVisible(false);
      });
    } else {
      // Menüyü aç
      setMenuVisible(true);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Menü öğesine tıklandığında
  const handleMenuItemPress = (option: MenuOption) => {
    // Menüyü kapat ve yönlendirme yap
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);

      // Navigasyon işlemi
      try {
        // Tab içindeki ekranlar için özel işlem
        if (option.screen === 'Home') {
          // Ana sayfa için özel durum
          return;
        }

        // Profil için özel durum - Profil butonuna tıklandığında özel profil sayfasına git
        if (option.screen === 'UserProfile') {
          console.log('Profil butonuna tıklandı, Profil sayfasına yönlendiriliyor...');
          // Özel profil sayfasına yönlendir
          setTimeout(() => {
            navigation.navigate('UserProfile');
          }, 300);
          return;
        }

        // Diğer ekranlar için
        setTimeout(() => {
          if (option.params) {
            navigation.navigate(option.screen, option.params);
          } else {
            navigation.navigate(option.screen);
          }
        }, 100);
      } catch (error) {
        console.error('Navigasyon hatası:', error);
      }
    });
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            backgroundColor: '#1E293B',
            borderTopColor: '#334155',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerStyle: {
            backgroundColor: '#1E293B',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Ana Sayfa',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Chatbot"
          component={HomeScreen}
          options={{
            title: 'Chatbot',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="chat" color={color} size={size} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              // Prevent default action
              e.preventDefault();
              // Navigate to Chatbot screen
              navigation.navigate('Chatbot');
            },
          }}
        />
        <Tab.Screen
          name="Settings"
          component={ProfileScreen}
          options={{
            title: 'Ayarlar',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>

      {/* Menü Butonu */}
      <TouchableOpacity
        style={tabStyles.menuButtonContainer}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <View style={tabStyles.menuButton}>
          <MaterialIcons
            name={menuVisible ? 'close' : 'apps'}
            size={28}
            color="#FFFFFF"
          />
        </View>
      </TouchableOpacity>

      {/* Menü Modal */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="none"
        onRequestClose={toggleMenu}
      >
        <Animated.View
          style={[
            tabStyles.modalContainer,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={tabStyles.modalBackground}
            activeOpacity={1}
            onPress={toggleMenu}
          />

          <Animated.View
            style={[
              tabStyles.menuContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={tabStyles.menuGrid}>
              {menuOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={tabStyles.menuItem}
                  onPress={() => handleMenuItemPress(option)}
                >
                  <View
                    style={[
                      tabStyles.menuItemIcon,
                      { backgroundColor: option.color },
                    ]}
                  >
                    <MaterialIcons name={option.icon} size={24} color="#FFFFFF" />
                  </View>
                  <Text style={tabStyles.menuItemText}>{option.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};



const tabStyles = StyleSheet.create({
  menuButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    marginLeft: -30,
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuContainer: {
    width: width * 0.85,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuItemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default TabNavigator;
