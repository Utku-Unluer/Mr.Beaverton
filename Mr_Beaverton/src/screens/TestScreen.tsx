import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import apiService, { TestQuestion } from '../api/apiService';
import { SafeAreaView } from 'react-native-safe-area-context';

const TestScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { listId, listName } = route.params as { listId: number; listName: string };

  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestCompleted, setIsTestCompleted] = useState(false);

  useEffect(() => {
    loadTest();
  }, []);

  const loadTest = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.generateTest(listId, 5);
      
      if (response.questions.length === 0) {
        Alert.alert(
          'Yetersiz Kelime',
          'Test oluşturmak için listede en az 3 kelime olmalıdır.',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
        return;
      }
      
      setQuestions(response.questions);
    } catch (error) {
      console.error('Test yüklenirken hata oluştu:', error);
      Alert.alert(
        'Hata',
        'Test yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(answerId);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setIsAnswerChecked(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setIsTestCompleted(true);
    }
  };

  const restartTest = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setScore(0);
    setIsTestCompleted(false);
    loadTest();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Test hazırlanıyor...</Text>
      </View>
    );
  }

  if (isTestCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Test Tamamlandı!</Text>
          <Text style={styles.resultScore}>
            Skorunuz: {score}/{questions.length} ({percentage}%)
          </Text>
          
          <View style={styles.resultMessage}>
            {percentage >= 80 ? (
              <Text style={[styles.resultMessageText, { color: '#4CAF50' }]}>
                Harika! Kelimeleri çok iyi öğrenmişsiniz.
              </Text>
            ) : percentage >= 60 ? (
              <Text style={[styles.resultMessageText, { color: '#2196F3' }]}>
                İyi! Biraz daha çalışmayla mükemmel olacaksınız.
              </Text>
            ) : (
              <Text style={[styles.resultMessageText, { color: '#FF9800' }]}>
                Bu kelimeleri biraz daha çalışmanız gerekiyor.
              </Text>
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              onPress={restartTest}
              style={styles.button}
            >
              Testi Yeniden Başlat
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Listeye Dön
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.listName}>{listName}</Text>
          <Text style={styles.progress}>
            Soru {currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>
        
        <View style={styles.questionContainer}>
          <Text style={styles.question}>{currentQuestion.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedAnswer === option.id && styles.selectedOption,
                  isAnswerChecked && option.id === currentQuestion.correctAnswer && styles.correctOption,
                  isAnswerChecked && selectedAnswer === option.id && 
                    selectedAnswer !== currentQuestion.correctAnswer && styles.wrongOption
                ]}
                onPress={() => handleAnswerSelect(option.id)}
                disabled={isAnswerChecked}
              >
                <Text style={styles.optionId}>{option.id.toUpperCase()})</Text>
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.actionContainer}>
          {!isAnswerChecked ? (
            <Button 
              mode="contained" 
              onPress={checkAnswer}
              disabled={!selectedAnswer}
              style={styles.actionButton}
            >
              Cevabı Kontrol Et
            </Button>
          ) : (
            <Button 
              mode="contained" 
              onPress={nextQuestion}
              style={styles.actionButton}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Sonraki Soru' : 'Testi Bitir'}
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6200ee',
  },
  header: {
    marginBottom: 24,
  },
  listName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progress: {
    fontSize: 16,
    color: '#666',
  },
  questionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  correctOption: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  wrongOption: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  optionId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    color: '#555',
    width: 30,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  actionContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
    paddingVertical: 8,
  },
  resultContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  resultScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 30,
  },
  resultMessage: {
    marginBottom: 40,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultMessageText: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginBottom: 12,
  },
});

export default TestScreen;
