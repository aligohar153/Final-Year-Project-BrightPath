import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, Dimensions, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 70) / 3;

const generateLevels = (activityId) =>
  Array.from({ length: 20 }, (_, i) => {
    const level = i + 1;
    const difficulty = level <= 5 ? 'Easy' : level <= 12 ? 'Medium' : 'Hard';
    return { level, difficulty, points: level * 50 };
  });

const SCREEN_MAP = {
  alphabet: 'AlphabetActivity',
  numbers: 'NumbersActivity',
  emotions: 'EmotionsActivity',
  social: 'SocialActivity',
  music: 'MusicTherapyActivity',
  patterns: 'PatternActivity',
  memory: 'MemoryGameActivity',
  colorsort: 'ColorSortingActivity',
  body: 'BodyPartsActivity',
  morning: 'MorningRoutineActivity',
  night: 'NightRoutineActivity',
  safety: 'SafetySkillsActivity',
  helpers: 'CommunityHelpersActivity',
  weather: 'WeatherActivity',
  food: 'FruitsVegActivity',
  transport: 'TransportActivity',
  space: 'SpaceActivity',
  time: 'TellingTimeActivity',
  gardening: 'GardeningActivity',
  ocean: 'OceanCleanupActivity',
  sea: 'UnderSeaActivity',
  animal_sounds: 'AnimalSoundsActivity',
  yoga: 'YogaActivity',
  eating: 'HealthyEatingActivity',
  drag_drop: 'DragDropActivity',
  shapes: 'ShapesActivity',
};

const ActivityLevelScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const { activity } = route.params || { activity: { title: 'Activity', emoji: '🎮', color: '#4D96FF', id: 'default' } };
  const [levels] = useState(generateLevels(activity.id));
  const [unlockedUpTo, setUnlockedUpTo] = useState(1);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadProgress = async () => {
    // Use child ID to keep levels separate per child
    const trackingId = activeChild?.id || user?.uid;
    if (!trackingId) return;
    try {
      const key = `${trackingId}_progress_${activity.id}`;
      const stored = await AsyncStorage.getItem(key);
      const val = stored ? parseInt(stored, 10) : 1;
      setUnlockedUpTo(Math.max(1, val));
    } catch {
      setUnlockedUpTo(1);
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  // Reload progress every time this screen gets focus (after returning from a level)
  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      loadProgress();
    }, [activity.id, user?.uid, activeChild?.id])
  );

  const handleLevelPress = (lvl) => {
    if (lvl.level > unlockedUpTo) {
      Alert.alert('🔒 Level Locked', `Complete Level ${lvl.level - 1} first!`, [{ text: 'OK' }]);
      return;
    }
    const screenName = SCREEN_MAP[activity.id];
    if (screenName) {
      navigation.navigate(screenName, { level: lvl.level, activityId: activity.id });
    } else {
      Alert.alert(`${activity.emoji} Level ${lvl.level}`, `${activity.title} · ${lvl.difficulty}\n\nComing soon! 🚧`, [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={activity.color} />

      <LinearGradient colors={[activity.color, activity.color + 'BB']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.activityEmoji}>{activity.emoji}</Text>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.levelCount}>20 Levels · Tap to play!</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(unlockedUpTo / 20) * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{unlockedUpTo}/20 Unlocked</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.grid, { opacity: fadeAnim }]}>
          {levels.map((lvl) => {
            const isUnlocked = lvl.level <= unlockedUpTo;
            const diffColor = lvl.difficulty === 'Easy' ? '#6BCB77' : lvl.difficulty === 'Medium' ? '#FFD93D' : '#FF6B6B';
            return (
              <TouchableOpacity
                key={`level-${lvl.level}`}
                style={[styles.levelCard, !isUnlocked && styles.levelCardLocked]}
                onPress={() => handleLevelPress(lvl)}
                activeOpacity={0.85}
              >
                {isUnlocked ? (
                  <LinearGradient
                    colors={[activity.color + '20', activity.color + '08']}
                    style={styles.levelCardInner}
                  >
                    <View style={[styles.levelCircle, { borderColor: activity.color + '60', backgroundColor: activity.color + '15' }]}>
                      <Text style={[styles.levelNumber, { color: activity.color }]}>{lvl.level}</Text>
                    </View>
                    <View style={[styles.diffBadge, { backgroundColor: diffColor + '25' }]}>
                      <Text style={[styles.diffText, { color: diffColor }]}>{lvl.difficulty}</Text>
                    </View>
                    <Text style={styles.pointsLabel}>{lvl.points} pts</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.levelCardInner}>
                    <View style={styles.lockCircle}>
                      <Text style={styles.lockEmoji}>🔒</Text>
                    </View>
                    <Text style={styles.lockedNum}>{lvl.level}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
        <View style={{ height: 150 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  backText: { fontSize: 18 },
  headerInfo: { alignItems: 'center', marginBottom: 20 },
  activityEmoji: { fontSize: 56, marginBottom: 8 },
  activityTitle: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  levelCount: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '700', marginTop: 4 },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
  progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '800', textAlign: 'center' },
  scrollContent: { padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  levelCard: { width: CARD_SIZE, borderRadius: 25, overflow: 'hidden', elevation: 4, backgroundColor: '#FFF', marginBottom: 4 },
  levelCardLocked: { opacity: 0.5 },
  levelCardInner: { padding: 14, alignItems: 'center', minHeight: 120, justifyContent: 'center' },
  levelCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: 8 },
  levelNumber: { fontSize: 24, fontWeight: '900' },
  lockCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  lockEmoji: { fontSize: 22 },
  lockedNum: { fontSize: 13, fontWeight: '900', color: '#CCC' },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginBottom: 6 },
  diffText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  pointsLabel: { fontSize: 9, fontWeight: '800', color: '#AAA' },
});

export default ActivityLevelScreen;





