import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeStory, syncProgressToCloud } from '../../utils/progressService';

const StoryPlayerScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const story = route.params?.story;
  const [currentLine, setCurrentLine] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    if (story) {
      speak(story.content[0]);
    }
  }, []);

  const handleNext = async () => {
    if (currentLine < story.content.length - 1) {
      const nextLine = currentLine + 1;
      setCurrentLine(nextLine);
      speak(story.content[nextLine]);
    } else {
      // Story complete
      const trackingId = activeChild?.id || user?.uid;
      await completeStory(story.level, trackingId);
      if (trackingId) await syncProgressToCloud(trackingId);
      speak("Wonderful! You finished the story.");
      navigation.goBack();
    }
  };

  if (!story) return null;

  return (
    <View style={[styles.container, { backgroundColor: story.color }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{story.title}</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.storyCard}>
          <Text style={styles.storyEmoji}>{story.emoji}</Text>
          <Text style={styles.storyText}>{story.content[currentLine]}</Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Page {currentLine + 1} of {story.content.length}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentLine + 1) / story.content.length) * 100}%` }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <LinearGradient colors={['#FF6BB5', '#FFD93D']} style={styles.nextGrad}>
            <Text style={styles.nextText}>
              {currentLine < story.content.length - 1 ? 'Next Page →' : 'Finish Story 🏆'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  backEmoji: { fontSize: 20 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textDark, marginLeft: 15 },
  content: { flex: 1, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center' },
  storyCard: { backgroundColor: '#FFF', borderRadius: 40, padding: 40, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, marginBottom: 40, width: '100%' },
  storyEmoji: { fontSize: 100, marginBottom: 30 },
  storyText: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', lineHeight: 34 },
  progressContainer: { width: '100%', marginBottom: 40 },
  progressText: { fontSize: 12, fontWeight: '900', color: COLORS.textMedium, textAlign: 'center', marginBottom: 10, letterSpacing: 1 },
  progressBar: { height: 10, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FF6BB5', borderRadius: 5 },
  nextBtn: { width: '100%', borderRadius: 25, overflow: 'hidden', elevation: 5 },
  nextGrad: { paddingVertical: 20, alignItems: 'center' },
  nextText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
});

export default StoryPlayerScreen;





