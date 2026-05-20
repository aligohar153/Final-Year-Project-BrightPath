import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { useApp } from '../../context/AppContext';
import { speak } from '../../utils/ttsService';

const { width } = Dimensions.get('window');

const EMOTIONS = [
  { id: 'happy', emoji: '😄', label: 'Happy', color: '#FFD93D', desc: 'I feel happy when I smile and laugh!' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: '#4D96FF', desc: 'I feel sad when something upsets me.' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: '#FF6B6B', desc: 'I feel angry when things go wrong.' },
  { id: 'scared', emoji: '😨', label: 'Scared', color: '#7B2FBE', desc: 'I feel scared when something frightens me.' },
  { id: 'excited', emoji: '🤩', label: 'Excited', color: '#6BCB77', desc: 'I feel excited when something fun is about to happen!' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: '#06D6A0', desc: 'I feel calm and peaceful and relaxed.' },
];

const EmotionRecognitionScreen = ({ navigation }) => {
  const { recordProgress } = useApp();
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
    speak(`${emotion.label}. ${emotion.desc}`);
    recordProgress('emotion', { emotion: emotion.id });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Emotions</Text>
          <Text style={styles.headerSub}>How are you feeling today?</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Spotlight Card */}
        {selectedEmotion && (
          <Animated.View style={[styles.spotlightCard, { opacity: fadeAnim }]}>
            <Text style={styles.spotlightEmoji}>{selectedEmotion.emoji}</Text>
            <Text style={[styles.spotlightTitle, { color: selectedEmotion.color }]}>
              {selectedEmotion.label.toUpperCase()}
            </Text>
            <Text style={styles.spotlightDesc}>{selectedEmotion.desc}</Text>
          </Animated.View>
        )}

        <Text style={styles.gridTitle}>TAP AN EMOJI TO EXPLORE</Text>

        <View style={styles.emotionGrid}>
          {EMOTIONS.map(emotion => (
            <TouchableOpacity
              key={emotion.id}
              onPress={() => handleEmotionSelect(emotion)}
              style={styles.emotionItem}>
              <View style={[
                styles.emojiCircle,
                { backgroundColor: selectedEmotion?.id === emotion.id ? emotion.color + '20' : '#FFF' },
                selectedEmotion?.id === emotion.id && { borderColor: emotion.color, borderWidth: 2 }
              ]}>
                <Text style={styles.emojiText}>{emotion.emoji}</Text>
              </View>
              <Text style={styles.emojiLabel}>{emotion.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: { paddingTop: 60, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  backEmoji: { fontSize: 20 },
  headerText: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textDark },
  headerSub: { fontSize: 12, color: COLORS.textMedium, fontWeight: '600' },

  scrollContent: { paddingHorizontal: 25, paddingBottom: 120 },
  spotlightCard: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, marginBottom: 25 },
  spotlightEmoji: { fontSize: 80, marginBottom: 15 },
  spotlightTitle: { fontSize: 28, fontWeight: '900', marginBottom: 10, letterSpacing: 1 },
  spotlightDesc: { fontSize: 16, color: COLORS.textMedium, textAlign: 'center', lineHeight: 24, fontWeight: '600' },

  gridTitle: { fontSize: 12, fontWeight: '900', color: COLORS.textLight, textAlign: 'center', marginBottom: 20, letterSpacing: 1 },
  emotionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  emotionItem: { width: (width - 70) / 3, alignItems: 'center', marginBottom: 20 },
  emojiCircle: { width: 80, height: 80, borderRadius: 30, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  emojiText: { fontSize: 40 },
  emojiLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textMedium, marginTop: 8 },
});

export default EmotionRecognitionScreen;





