import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share, Animated } from 'react-native';
import { Card, Title, Paragraph, Button, Text, ProgressBar, IconButton, Badge } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { commonStyles } from '../styles/theme';
import apiService, { Quiz, TestQuestion, TestOption } from '../api/apiService';
import { RootStackParamList, TabParamList } from '../types';

type QuizScreenRouteProp = RouteProp<RootStackParamList, 'Quiz'>;

type QuizScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

const QuizScreen = () => {
  const navigation = useNavigation<QuizScreenNavigationProp>();
  const route = useRoute<QuizScreenRouteProp>();
  const { listId } = route.params;

  const [questions, setQuestions] = useState<Quiz[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 saniye süre
  const [timerActive, setTimerActive] = useState(false);
  const [quizStats, setQuizStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    totalTime: 0,
  });

  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Timer interval referansı
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Soruları yükle
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);

        // Yeni test API'sini kullan
        const response = await apiService.generateTest(listId);

        if (response.questions && response.questions.length > 0) {
          // TestQuestion formatını Quiz formatına dönüştür
          const quizQuestions: Quiz[] = response.questions.map(q => ({
            wordId: q.wordId.toString(),
            type: 'quiz',
            question: q.question,
            options: q.options.map(o => o.text),
            correctAnswer: q.options.find(o => o.id === q.correctAnswer)?.text || ''
          }));

          setQuestions(quizQuestions);
        } else {
          // Yeterli soru yoksa örnek sorular göster
          const sampleQuestions: Quiz[] = [
            {
              wordId: '1',
              type: 'quiz',
              question: '"Apple" kelimesini doğru kullanım hangisidir?',
              options: [
                'I ate an apple for breakfast.',
                'I ate a apple for breakfast.',
                'I ate apple for breakfast.',
                'I ate the apple for breakfast.'
              ],
              correctAnswer: 'I ate an apple for breakfast.'
            },
            {
              wordId: '2',
              type: 'quiz',
              question: '"Book" kelimesinin eş anlamlısı hangisidir?',
              options: ['Volume', 'Paper', 'Page', 'Cover'],
              correctAnswer: 'Volume'
            },
            {
              wordId: '3',
              type: 'quiz',
              question: '"Car" kelimesi hangi cümlede doğru kullanılmıştır?',
              options: [
                'The car is driving on the road.',
                'The car are driving on the road.',
                'The car drives on the road.',
                'The car drive on the road.'
              ],
              correctAnswer: 'The car drives on the road.'
            },
            {
              wordId: '4',
              type: 'quiz',
              question: '"House" kelimesinin çoğul hali nedir?',
              options: ['Housees', 'Houses', 'Hice', 'Housen'],
              correctAnswer: 'Houses'
            },
            {
              wordId: '5',
              type: 'quiz',
              question: '"Computer" kelimesinin doğru telaffuzu hangisidir?',
              options: [
                'kom-PYU-ter',
                'KOM-pyu-ter',
                'kom-pyu-TER',
                'KOM-PYU-TER'
              ],
              correctAnswer: 'kom-PYU-ter'
            }
          ];
          setQuestions(sampleQuestions);
        }
      } catch (error) {
        console.error('Sorular yüklenirken hata oluştu:', error);
      } finally {
        setIsLoading(false);
        setTimerActive(true); // Sorular yüklendikten sonra timer'ı başlat
      }
    };

    loadQuestions();

    // Temizleme fonksiyonu
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [listId]);

  // Timer'ı yönet
  useEffect(() => {
    if (timerActive && !isLoading && !quizComplete) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Süre dolduğunda
            clearInterval(timerRef.current as NodeJS.Timeout);
            if (!isAnswerChecked) {
              // Eğer cevap kontrol edilmediyse, soruyu atla
              handleSkip();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive, isLoading, quizComplete, isAnswerChecked]);

  // Cevabı kontrol et
  const checkAnswer = () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isAnswerCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setIsCorrect(isAnswerCorrect);
    setIsAnswerChecked(true);
    setTimerActive(false); // Timer'ı durdur

    if (isAnswerCorrect) {
      // Doğru cevap animasyonu
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();

      // Skoru güncelle (kalan süreye göre bonus puan)
      const timeBonus = Math.floor(timeLeft / 3);
      const questionScore = 10 + timeBonus;
      setScore(prev => prev + questionScore);

      // İstatistikleri güncelle
      setQuizStats(prev => ({
        ...prev,
        correct: prev.correct + 1,
        totalTime: prev.totalTime + (30 - timeLeft),
      }));
    } else {
      // Yanlış cevap animasyonu
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      // İstatistikleri güncelle
      setQuizStats(prev => ({
        ...prev,
        incorrect: prev.incorrect + 1,
        totalTime: prev.totalTime + (30 - timeLeft),
      }));
    }
  };

  // Soruyu atla
  const handleSkip = () => {
    setTimerActive(false);
    setIsAnswerChecked(true);
    setIsCorrect(false);

    // İstatistikleri güncelle
    setQuizStats(prev => ({
      ...prev,
      skipped: prev.skipped + 1,
      totalTime: prev.totalTime + (30 - timeLeft),
    }));
  };

  // Sonraki soruya geç
  const goToNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setTimeLeft(30);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimerActive(true);
    } else {
      setQuizComplete(true);
    }
  };

  // Testi yeniden başlat
  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setScore(0);
    setTimeLeft(30);
    setTimerActive(true);
    setQuizComplete(false);
    setQuizStats({
      correct: 0,
      incorrect: 0,
      skipped: 0,
      totalTime: 0,
    });
  };

  // Sonuçları paylaş
  const shareResults = async () => {
    try {
      const successRate = Math.round((quizStats.correct / questions.length) * 100);

      await Share.share({
        message: `WordPecker uygulamasında bir test tamamladım!\n\nSkor: ${score} puan\nDoğru: ${quizStats.correct}/${questions.length}\nBaşarı Oranı: %${successRate}\n\nSen de WordPecker ile kelime öğrenmeye başla!`,
        title: 'WordPecker Test Sonuçlarım',
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  // Yükleme durumu
  if (isLoading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Test hazırlanıyor...</Text>
      </View>
    );
  }

  // Test tamamlandı
  if (quizComplete) {
    const successRate = Math.round((quizStats.correct / questions.length) * 100);
    const averageTime = Math.round(quizStats.totalTime / questions.length);

    return (
      <ScrollView style={commonStyles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Test Tamamlandı!</Title>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>Toplam Skor</Text>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.scoreSubtext}>puan</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{quizStats.correct}</Text>
                <Text style={styles.statLabel}>Doğru</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{quizStats.incorrect}</Text>
                <Text style={styles.statLabel}>Yanlış</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{quizStats.skipped}</Text>
                <Text style={styles.statLabel}>Atlanmış</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{averageTime}s</Text>
                <Text style={styles.statLabel}>Ort. Süre</Text>
              </View>
            </View>

            <View style={styles.resultGaugeContainer}>
              <View style={styles.resultGauge}>
                <View style={[styles.resultGaugeFill, { width: `${successRate}%` }]} />
              </View>
              <Text style={styles.resultGaugeText}>%{successRate} Başarı</Text>
            </View>

            <View style={styles.feedbackContainer}>
              {successRate >= 80 ? (
                <>
                  <MaterialIcons name="emoji-events" size={64} color="#FFC107" />
                  <Text style={[styles.feedbackText, { color: '#FFC107' }]}>Mükemmel! Harika bir performans!</Text>
                </>
              ) : successRate >= 60 ? (
                <>
                  <MaterialIcons name="thumb-up" size={64} color="#4CAF50" />
                  <Text style={[styles.feedbackText, { color: '#4CAF50' }]}>İyi iş çıkardın!</Text>
                </>
              ) : successRate >= 40 ? (
                <>
                  <MaterialIcons name="sentiment-satisfied" size={64} color="#2196F3" />
                  <Text style={[styles.feedbackText, { color: '#2196F3' }]}>Fena değil, daha iyisini yapabilirsin!</Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="school" size={64} color="#FF9800" />
                  <Text style={[styles.feedbackText, { color: '#FF9800' }]}>Biraz daha çalışman gerekiyor.</Text>
                </>
              )}
            </View>

            <View style={styles.wrongAnswersSection}>
              <Title style={styles.wrongAnswersTitle}>Yanlış Cevaplar</Title>
              {quizStats.incorrect > 0 ? (
                questions.map((question, index) => {
                  // Sadece yanlış cevaplanan soruları göster
                  if (index < currentQuestionIndex && question.correctAnswer !== selectedAnswer) {
                    return (
                      <View key={index} style={styles.wrongAnswerItem}>
                        <Text style={styles.wrongQuestionText}>{question.question}</Text>
                        <Text style={styles.correctAnswerText}>Doğru Cevap: {question.correctAnswer}</Text>
                      </View>
                    );
                  }
                  return null;
                })
              ) : (
                <Text style={styles.noWrongAnswersText}>Tebrikler! Hiç yanlış cevabın yok.</Text>
              )}
            </View>
          </Card.Content>

          <Card.Actions style={styles.cardActions}>
            <Button
              mode="contained"
              style={styles.button}
              onPress={restartQuiz}
            >
              Tekrar Dene
            </Button>

            <Button
              mode="outlined"
              style={[styles.button, styles.secondaryButton]}
              onPress={shareResults}
              icon="share"
            >
              Paylaş
            </Button>

            <Button
              mode="outlined"
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.goBack()}
            >
              Listelere Dön
            </Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    );
  }

  // Mevcut soru
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex) / questions.length;

  // Timer rengi
  const timerColor = timeLeft > 20 ? '#4CAF50' : timeLeft > 10 ? '#FFC107' : '#EF4444';

  return (
    <ScrollView style={commonStyles.container}>
      <View style={styles.header}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>{currentQuestionIndex + 1} / {questions.length}</Text>
          <ProgressBar progress={progress} color="#4CAF50" style={styles.progressBar} />
        </View>

        <View style={styles.scoreDisplay}>
          <MaterialIcons name="stars" size={20} color="#FFC107" />
          <Text style={styles.scoreText}>{score}</Text>
        </View>

        <View style={[styles.timerContainer, { borderColor: timerColor }]}>
          <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}</Text>
        </View>
      </View>

      <Animated.View style={{
        transform: [{ scale: scaleAnim }],
        opacity: fadeAnim
      }}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.question}>{currentQuestion.question}</Title>

            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => !isAnswerChecked && setSelectedAnswer(option)}
                disabled={isAnswerChecked}
                style={[
                  styles.optionContainer,
                  selectedAnswer === option && styles.selectedOption,
                  isAnswerChecked && selectedAnswer === option && isCorrect && styles.correctOption,
                  isAnswerChecked && selectedAnswer === option && !isCorrect && styles.incorrectOption,
                  isAnswerChecked && option === currentQuestion.correctAnswer && styles.correctOption,
                ]}
              >
                <Text style={[
                  styles.optionText,
                  isAnswerChecked && option === currentQuestion.correctAnswer && styles.correctOptionText,
                  isAnswerChecked && selectedAnswer === option && !isCorrect && styles.incorrectOptionText,
                ]}>
                  {option}
                </Text>

                {isAnswerChecked && option === currentQuestion.correctAnswer && (
                  <MaterialIcons name="check-circle" size={24} color="#4CAF50" style={styles.optionIcon} />
                )}

                {isAnswerChecked && selectedAnswer === option && !isCorrect && (
                  <MaterialIcons name="cancel" size={24} color="#EF4444" style={styles.optionIcon} />
                )}
              </TouchableOpacity>
            ))}

            {isAnswerChecked && (
              <View style={[
                styles.feedbackBox,
                { backgroundColor: isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
              ]}>
                <MaterialIcons
                  name={isCorrect ? "check-circle" : "cancel"}
                  size={24}
                  color={isCorrect ? "#4CAF50" : "#EF4444"}
                />
                <Text style={[
                  styles.feedbackBoxText,
                  { color: isCorrect ? "#4CAF50" : "#EF4444" }
                ]}>
                  {isCorrect
                    ? `Doğru! +${10 + Math.floor(timeLeft / 3)} puan kazandın.`
                    : `Yanlış! Doğru cevap: ${currentQuestion.correctAnswer}`}
                </Text>
              </View>
            )}
          </Card.Content>

          <Card.Actions style={styles.cardActions}>
            {!isAnswerChecked ? (
              <>
                <Button
                  mode="contained"
                  style={styles.button}
                  disabled={!selectedAnswer}
                  onPress={checkAnswer}
                >
                  Cevapla
                </Button>

                <Button
                  mode="outlined"
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleSkip}
                >
                  Atla
                </Button>
              </>
            ) : (
              <Button
                mode="contained"
                style={styles.button}
                onPress={goToNextQuestion}
              >
                {currentQuestionIndex < questions.length - 1 ? "Sonraki Soru" : "Sonuçları Gör"}
              </Button>
            )}
          </Card.Actions>
        </Card>
      </Animated.View>
    </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressInfo: {
    flex: 1,
    marginRight: 16,
  },
  progressText: {
    color: '#FFFFFF',
    marginBottom: 4,
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  scoreText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: 'bold',
    fontSize: 16,
  },
  timerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
  },
  timerText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    marginBottom: 16,
  },
  question: {
    color: '#FFFFFF',
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#4CAF50',
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  incorrectOption: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  optionIcon: {
    marginLeft: 8,
  },
  correctOptionText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  incorrectOptionText: {
    color: '#EF4444',
    textDecorationLine: 'line-through',
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  feedbackBoxText: {
    fontSize: 16,
    marginLeft: 8,
  },
  cardActions: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexWrap: 'wrap',
  },
  button: {
    minWidth: 120,
    backgroundColor: '#4CAF50',
    margin: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#4CAF50',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreValue: {
    color: '#FFC107',
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreSubtext: {
    color: '#94A3B8',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    margin: 8,
    minWidth: 70,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },
  resultGaugeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultGauge: {
    width: '100%',
    height: 16,
    backgroundColor: '#334155',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  resultGaugeFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  resultGaugeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  wrongAnswersSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#0F172A',
    borderRadius: 8,
  },
  wrongAnswersTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 16,
  },
  wrongAnswerItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  wrongQuestionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  correctAnswerText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  noWrongAnswersText: {
    color: '#4CAF50',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default QuizScreen;
