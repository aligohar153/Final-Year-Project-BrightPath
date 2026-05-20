import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../utils/ThemeContext';
import { SOCIAL_STORIES } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { completeStory } from '../../utils/progressService';

const { width } = Dimensions.get('window');

const SocialStoriesActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const storyId = route.params?.storyId || 1;
  const story = SOCIAL_STORIES.find(s => s.id === storyId) || SOCIAL_STORIES[0];

  const [currentPage, setCurrentPage] = useState(0);
  const [phase, setPhase] = useState('reading'); // reading | quiz | result
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    speak(story.pages[0].text);
  }, []);

  const nextPage = () => {
    if (currentPage < story.pages.length - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setCurrentPage(currentPage + 1);
        speak(story.pages[currentPage + 1].text);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    } else {
      setPhase('quiz');
      speak(story.questions[0].q);
    }
  };

  const handleAnswer = (index) => {
    setSelectedOption(index);
    if (index === story.questions[quizIndex].correct) {
      speak("Correct! Well done.");
      setTimeout(() => {
        if (quizIndex < story.questions.length - 1) {
          setQuizIndex(quizIndex + 1);
          setSelectedOption(null);
          speak(story.questions[quizIndex + 1].q);
        } else {
          setPhase('result');
          completeStory(storyId, user?.uid);
        }
      }, 1000);
    } else {
      speak("Try again!");
      setTimeout(() => setSelectedOption(null), 1000);
    }
  };

  const renderReading = () => (
    <Animated.View style={[styles.card, { opacity: fadeAnim, backgroundColor: colors.bgWhite }]}>
      <Text style={styles.emoji}>{story.pages[currentPage].emoji}</Text>
      <Text style={[styles.storyText, { color: colors.textDark }]}>
        {story.pages[currentPage].text}
      </Text>
      <TouchableOpacity 
        style={[styles.nextBtn, { backgroundColor: colors.primary }]} 
        onPress={nextPage}
      >
        <Text style={styles.btnText}>Next →</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderQuiz = () => (
    <View style={[styles.card, { backgroundColor: colors.bgWhite }]}>
      <Text style={[styles.questionLabel, { color: colors.primary }]}>QUESTION {quizIndex + 1}</Text>
      <Text style={[styles.quizQuestion, { color: colors.textDark }]}>{story.questions[quizIndex].q}</Text>
      {story.questions[quizIndex].options.map((option, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.optionBtn,
            { borderColor: colors.border },
            selectedOption === i && { 
              backgroundColor: i === story.questions[quizIndex].correct ? '#6BCB77' : '#FF6B6B',
              borderColor: 'transparent'
            }
          ]}
          onPress={() => handleAnswer(i)}
          disabled={selectedOption !== null}
        >
          <Text style={[
            styles.optionText, 
            { color: selectedOption === i ? '#FFF' : colors.textDark }
          ]}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgLight }]}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#4D96FF', '#6BCB77']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{story.title}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {phase === 'reading' && renderReading()}
        {phase === 'quiz' && renderQuiz()}
        {phase === 'result' && (
          <View style={[styles.resultCard, { backgroundColor: colors.bgWhite }]}>
            <Text style={styles.resultEmoji}>🎉</Text>
            <Text style={[styles.resultTitle, { color: colors.textDark }]}>Story Completed!</Text>
            <Text style={[styles.resultSub, { color: colors.textMedium }]}>You learned about {story.title}</Text>
            <TouchableOpacity 
              style={[styles.doneBtn, { backgroundColor: colors.primary }]} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.btnText}>Back to Stories</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  backText: { fontSize: 20 },
  title: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  card: { padding: 30, borderRadius: 30, elevation: 5, alignItems: 'center' },
  emoji: { fontSize: 100, marginBottom: 20 },
  storyText: { fontSize: 22, fontWeight: '800', textAlign: 'center', lineHeight: 32, marginBottom: 30 },
  nextBtn: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 20 },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
  questionLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 10 },
  quizQuestion: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 30 },
  optionBtn: { width: '100%', padding: 20, borderRadius: 20, borderWidth: 2, marginBottom: 12 },
  optionText: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  resultCard: { padding: 40, borderRadius: 30, alignItems: 'center', elevation: 5 },
  resultEmoji: { fontSize: 80, marginBottom: 20 },
  resultTitle: { fontSize: 28, fontWeight: '900', marginBottom: 10 },
  resultSub: { fontSize: 16, fontWeight: '700', marginBottom: 30 },
  doneBtn: { paddingVertical: 16, paddingHorizontal: 40, borderRadius: 20 },
});

export default SocialStoriesActivity;





