import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { STORIES_DATA, STORY_CATEGORIES } from '../../data/storiesData';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');

const StoriesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [completedStories, setCompletedStories] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [user?.uid, activeChild?.id])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const loadProgress = async () => {
    const trackingId = activeChild?.id || user?.uid;
    if (!trackingId) return;
    try {
      const progress = await AsyncStorage.getItem(`${trackingId}_completed_stories`);
      if (progress) setCompletedStories(JSON.parse(progress));
    } catch (e) { console.log(e); }
  };

  const isStoryUnlocked = (level) => {
    if (level === 1) return true;
    // For now, allow all but show level badge. 
    // In a real app, check if level-1 is in completedStories.
    return true; 
  };

  const renderStory = (story) => {
    const unlocked = isStoryUnlocked(story.level);
    const completed = completedStories.includes(story.level);

    return (
      <TouchableOpacity 
        key={story.id} 
        style={[styles.storyCard, { backgroundColor: story.color }]}
        onPress={() => navigation.navigate('StoryPlayer', { story })}
      >
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>LVL {story.level}</Text>
        </View>
        <Text style={styles.storyEmoji}>{story.emoji}</Text>
        <Text style={styles.storyName}>{story.title}</Text>
        <View style={styles.meta}>
          <Text style={styles.playIcon}>{completed ? '✅' : '▶'}</Text>
          <Text style={styles.timeText}>{story.duration}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Story{'\n'}<Text style={styles.titleAccent}>Library</Text></Text>
          <Text style={styles.subtitle}>Level up your reading skills!</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchEmoji}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {STORY_CATEGORIES.map(category => (
          <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.title.toUpperCase()}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {STORIES_DATA.filter(s => s.category.toLowerCase().includes(category.id.split(' ')[0])).map(renderStory)}
            </ScrollView>
          </View>
        ))}

        {/* Progress Summary */}
        <View style={styles.progressContainer}>
          <LinearGradient colors={['#FF6BB5', '#FFD93D']} style={styles.progressCard}>
            <View>
              <Text style={styles.progressTitle}>Your Reading Progress</Text>
              <Text style={styles.progressSub}>{completedStories.length} of 20 stories completed</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>{Math.round((completedStories.length / 20) * 100)}%</Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: { paddingHorizontal: 25, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.textDark, lineHeight: 36 },
  titleAccent: { color: COLORS.primary },
  subtitle: { fontSize: 13, color: COLORS.textMedium, fontWeight: '600', marginTop: 4 },
  searchBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  searchEmoji: { fontSize: 20 },
  scrollContent: { paddingBottom: 150 },
  categorySection: { marginBottom: 30 },
  categoryTitle: { fontSize: 12, fontWeight: '900', color: COLORS.textMedium, marginLeft: 25, marginBottom: 15, letterSpacing: 1 },
  horizontalScroll: { paddingLeft: 25 },
  storyCard: { width: 160, borderRadius: 30, padding: 20, marginRight: 15, alignItems: 'center', elevation: 3, position: 'relative' },
  levelBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  levelBadgeText: { fontSize: 8, fontWeight: '900', color: COLORS.textDark },
  storyEmoji: { fontSize: 50, marginBottom: 15, marginTop: 10 },
  storyName: { fontSize: 14, fontWeight: '900', color: COLORS.textDark, textAlign: 'center', marginBottom: 10, height: 40 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  playIcon: { fontSize: 10, color: COLORS.primary },
  timeText: { fontSize: 10, fontWeight: '800', color: COLORS.textMedium },
  progressContainer: { paddingHorizontal: 25, marginTop: 10 },
  progressCard: { borderRadius: 35, padding: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  progressSub: { fontSize: 12, color: '#FFF', opacity: 0.8, fontWeight: '600' },
  progressCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  progressPercent: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});

export default StoriesScreen;





