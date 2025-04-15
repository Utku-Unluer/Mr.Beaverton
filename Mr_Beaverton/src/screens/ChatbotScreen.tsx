import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Text, Avatar, IconButton, Surface, Divider, Menu } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { commonStyles } from '../styles/theme';
import apiService from '../api/apiService';
import { useAuth } from '../context/AuthContext';

// Mesaj tipi
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Örnek mesajlar
const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Merhaba! Ben Mr.Beaverton Chatbot. Kelime öğrenme yolculuğunda sana nasıl yardımcı olabilirim?',
    sender: 'bot',
    timestamp: new Date(),
  },
];

const ChatbotScreen = () => {
  const navigation = useNavigation();
  const { authState } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Kullanıcı ID'sini al
  const userId = authState.user?.id || 'default';

  // Mesaj gönderme fonksiyonu
  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    // Kullanıcı mesajını ekle
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    const userInput = inputText;
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // API'den bot yanıtını al (kullanıcı ID'sini de gönder)
      const response = await apiService.sendChatMessage(userInput, userId);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message || 'Yanıt alınamadı. Lütfen daha sonra tekrar deneyin.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);

      // Eğer kullanıcı konuşmayı temizlemek istiyorsa
      if (userInput.toLowerCase().includes('temizle') ||
        userInput.toLowerCase().includes('sıfırla') ||
        userInput.toLowerCase().includes('yeni konuşma')) {
        clearChatHistory();
      }
    } catch (error) {
      console.error('Chatbot API hatası:', error);

      // Hata durumunda yerel yanıt oluştur
      const fallbackResponse = generateFallbackResponse(userInput);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Hata durumunda yerel yanıt oluştur
  const generateFallbackResponse = (userInput: string) => {
    const input = userInput.toLowerCase();

    if (input.includes('merhaba') || input.includes('selam')) {
      return 'Merhaba! Nasıl yardımcı olabilirim?';
    } else if (input.includes('nasıl') && input.includes('kelime')) {
      return 'Kelime öğrenmek için düzenli pratik yapmanızı öneririm. Her gün 5-10 yeni kelime öğrenmeyi hedefleyin ve öğrendiğiniz kelimeleri cümleler içinde kullanın.';
    } else if (input.includes('test') || input.includes('quiz')) {
      return 'Test özelliğimizi kullanarak kelime bilginizi ölçebilirsiniz. Ana menüden "Test Modu" seçeneğine tıklayarak başlayabilirsiniz.';
    } else if (input.includes('liste') && (input.includes('nasıl') || input.includes('oluştur'))) {
      return 'Yeni bir kelime listesi oluşturmak için ana menüden "Liste Oluştur" seçeneğine tıklayabilirsiniz. Liste adı ve açıklaması girerek kendi kelime listenizi oluşturabilirsiniz.';
    } else if (input.includes('teşekkür')) {
      return 'Rica ederim! Başka bir sorunuz varsa yardımcı olmaktan memnuniyet duyarım.';
    } else {
      return 'Bağlantı hatası nedeniyle yanıtınızı alamadım. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.';
    }
  };

  // Konuşma geçmişini temizle
  const clearChatHistory = async () => {
    try {
      // Backend'de konuşma geçmişini temizle
      await apiService.clearChatHistory(userId);

      // Yerel mesajları sıfırla (sadece hoşgeldin mesajını bırak)
      setMessages(initialMessages);
    } catch (error) {
      console.error('Konuşma geçmişi temizleme hatası:', error);
      Alert.alert('Hata', 'Konuşma geçmişi temizlenirken bir hata oluştu.');
    }
  };

  // Mesajlar güncellendiğinde otomatik olarak en alta kaydır
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Mesaj öğesi render fonksiyonu
  const renderMessageItem = ({ item }: { item: Message }) => {
    const isBot = item.sender === 'bot';

    return (
      <View style={[styles.messageContainer, isBot ? styles.botMessageContainer : styles.userMessageContainer]}>
        {isBot && (
          <Avatar.Text
            size={40}
            label="B"
            style={styles.avatar}
            color="#FFFFFF"
            labelStyle={{ fontSize: 16 }}
          />
        )}
        <Surface style={[styles.messageBubble, isBot ? styles.botBubble : styles.userBubble]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timestampText}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Surface>
        {!isBot && (
          <Avatar.Text
            size={40}
            label="U"
            style={styles.avatar}
            color="#FFFFFF"
            labelStyle={{ fontSize: 16 }}
          />
        )}
      </View>
    );
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#FFFFFF"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Mr.Beaverton Chatbot</Text>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              iconColor="#FFFFFF"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              clearChatHistory();
              Alert.alert('Bilgi', 'Konuşma geçmişi temizlendi.');
            }}
            title="Konuşmayı Temizle"
            leadingIcon="delete"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              Alert.alert(
                'Mr.Beaverton Chatbot Hakkında',
                'Mr.Beaverton Chatbot, dil öğrenme yolculuğunuzda size yardımcı olmak için tasarlanmış bir yapay zeka asistanıdır. Kelime öğrenme, test çözme ve liste oluşturma konularında sorularınızı yanıtlayabilir.'
              );
            }}
            title="Hakkında"
            leadingIcon="information-outline"
          />
        </Menu>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>Mr.Beaverton yazıyor</Text>
          <ActivityIndicator size="small" color="#4CAF50" style={styles.typingIndicator} />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Mesajınızı yazın..."
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <MaterialIcons name="send" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    marginHorizontal: 8,
    backgroundColor: '#4CAF50',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    elevation: 1,
  },
  botBubble: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderTopRightRadius: 4,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  timestampText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginRight: 8,
  },
  typingIndicator: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  input: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
  },
});

export default ChatbotScreen;
