import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView, Dimensions, PanResponder, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { GARDENING_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const { width, height } = Dimensions.get('window');

const GardeningActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'gardening';
  const data = GARDENING_LEVELS[level - 1];

  const [shuffledSteps, setShuffledSteps] = useState([]);
  const [userSequence, setUserSequence] = useState(new Array(data.steps.length).fill(null));
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('play'); // play | result
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Drag state
  const draggingId = useRef(null);
  const pans = useRef({}).current;
  const responders = useRef({}).current;
  const slotLayouts = useRef({});
  const hoveredSlotRef = useRef(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setUserSequence(new Array(data.steps.length).fill(null));
    setScore(0);
    setPhase('play');
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    const shuffled = [...data.steps].sort(() => Math.random() - 0.5);
    setShuffledSteps(shuffled);

    // Initialize pans and responders for each step
    data.steps.forEach(step => {
      if (!pans[step.id]) pans[step.id] = new Animated.ValueXY();
      if (!responders[step.id]) {
        responders[step.id] = PanResponder.create({
          onStartShouldSetPanResponder: () => {
            draggingId.current = step.id;
            setIsDragging(true);
            return true;
          },
          onPanResponderGrant: () => {
            const pan = pans[step.id];
            pan.setOffset({ x: 0, y: 0 });
            pan.setValue({ x: 0, y: 0 });
          },
          onPanResponderMove: (e, gesture) => {
            const pan = pans[step.id];
            pan.x.setValue(gesture.dx);
            pan.y.setValue(gesture.dy);

            // Collision detection
            let foundSlot = null;
            const slots = slotLayouts.current;
            Object.keys(slots).forEach(idx => {
              const layout = slots[idx];
              if (
                gesture.moveX >= layout.x - 20 &&
                gesture.moveX <= layout.x + layout.width + 20 &&
                gesture.moveY >= layout.y - 20 &&
                gesture.moveY <= layout.y + layout.height + 20
              ) {
                foundSlot = parseInt(idx, 10);
              }
            });
            hoveredSlotRef.current = foundSlot;
            if (hoveredSlot !== foundSlot) setHoveredSlot(foundSlot);
          },
          onPanResponderRelease: (e, gesture) => {
            const pan = pans[step.id];
            pan.flattenOffset();
            
            const activeHoveredSlot = hoveredSlotRef.current;
            if (activeHoveredSlot !== null) {
              const isCorrectPosition = data.steps[activeHoveredSlot].id === step.id;
              if (isCorrectPosition) {
                setUserSequence(prev => {
                  const newSeq = [...prev];
                  newSeq[activeHoveredSlot] = step;
                  return newSeq;
                });
                speak(step.text);
                Vibration.vibrate(50);
                
                setUserSequence(current => {
                  if (current.every(s => s !== null)) handleComplete();
                  return current;
                });
              } else {
                speak("Try a different slot!");
                Vibration.vibrate([0, 30, 30, 30]);
              }
            }

            draggingId.current = null;
            hoveredSlotRef.current = null;
            setHoveredSlot(null);
            setIsDragging(false);
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
          }
        });
      }
    });

    speak("Let us plant some flowers! Drag the steps.");
  }, [level]);

  const handleComplete = async () => {
    setScore(s => s + 50);
    await completeLevel(activityId, level, activeChild?.id || user?.uid);
    setTimeout(() => setPhase('result'), 1000);
    speak("Beautiful garden! You are a master gardener!");
  };

  const goNextLevel = () => {
    if (level < 20) {
      navigation.replace('GardeningActivity', { level: level + 1, activityId });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#A8E063', '#56AB2F']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>GARDENING · LEVEL {level}</Text>
        <Text style={styles.title}>Planting Time!</Text>
        <Text style={styles.scoreText}>⭐ {score} pts</Text>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {phase === 'play' ? (
          <View style={styles.gameArea}>
            <View style={styles.targetRow}>
              {data.steps.map((_, i) => (
                <View 
                  key={i} 
                  collapsable={false}
                  onLayout={(e) => {
                    e.target.measureInWindow((x, y, w, h) => {
                      if (w > 0) slotLayouts.current[i] = { x, y, width: w, height: h };
                    });
                  }}
                  style={[
                    styles.targetSlot, 
                    userSequence[i] && styles.slotFilled,
                    hoveredSlot === i && styles.slotHover
                  ]}
                >
                  {userSequence[i] ? (
                    <Text style={styles.slotEmoji}>{userSequence[i].emoji}</Text>
                  ) : (
                    <Text style={styles.slotNumber}>{i + 1}</Text>
                  )}
                  {userSequence[i] && <Text style={styles.slotLabel}>{userSequence[i].text}</Text>}
                </View>
              ))}
            </View>

            <View style={styles.stepsContainer}>
              {shuffledSteps.map((step) => {
                const isUsed = userSequence.some(s => s?.id === step.id);
                const isThisDragging = isDragging && draggingId.current === step.id;
                const stepPan = pans[step.id] || new Animated.ValueXY();
                const stepResponder = responders[step.id];
                
                return (
                  <View key={step.id} style={styles.stepWrapper}>
                    {!isUsed && stepResponder && (
                      <Animated.View
                        {...stepResponder.panHandlers}
                        style={[
                          { transform: [...stepPan.getTranslateTransform(), { scale: isThisDragging ? 1.1 : 1 }] },
                          styles.stepBtn,
                          isThisDragging && styles.stepDragging
                        ]}
                      >
                        <Text style={styles.stepEmoji}>{step.emoji}</Text>
                        <Text style={styles.stepText}>{step.text}</Text>
                      </Animated.View>
                    )}
                    {isUsed && <View style={[styles.stepBtn, styles.stepUsed]} />}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🌻</Text>
            <Text style={styles.resultTitle}>Garden Bloom!</Text>
            <Text style={styles.resultScore}>+50 Stars Earned</Text>
            <TouchableOpacity style={styles.nextLevelBtn} onPress={goNextLevel}>
              <LinearGradient colors={['#A8E063', '#56AB2F']} style={styles.nextLevelGrad}>
                <Text style={styles.nextLevelText}>
                  {level < 20 ? `Level ${level + 1} →` : '🏆 All Done!'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  content: { flex: 1, padding: 20 },
  gameArea: { flex: 1, justifyContent: 'space-between', paddingVertical: 20 },
  targetRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 40 },
  targetSlot: { width: 85, height: 100, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#A8E063', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(168, 224, 99, 0.1)' },
  slotFilled: { borderStyle: 'solid', backgroundColor: '#FFF', elevation: 4, borderColor: '#6BCB77' },
  slotHover: { backgroundColor: 'rgba(107, 203, 119, 0.2)', borderColor: '#6BCB77', transform: [{ scale: 1.05 }] },
  slotEmoji: { fontSize: 35 },
  slotNumber: { fontSize: 24, color: '#A8E063', fontWeight: '900' },
  slotLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMedium, marginTop: 4, textAlign: 'center' },
  stepsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, paddingBottom: 40 },
  stepWrapper: { width: width * 0.4, height: 100 },
  stepBtn: { width: '100%', height: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 12, alignItems: 'center', justifyContent: 'center', elevation: 3, borderWidth: 1, borderColor: '#EEE' },
  stepDragging: { elevation: 15, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, scale: 1.1 },
  stepUsed: { opacity: 0.1, backgroundColor: '#F0F0F0', borderStyle: 'dashed' },
  stepEmoji: { fontSize: 40, marginBottom: 4 },
  stepText: { fontSize: 12, fontWeight: '800', color: COLORS.textDark, textAlign: 'center' },
  resultCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 5, marginTop: 50 },
  resultEmoji: { fontSize: 60, marginBottom: 10 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: '#56AB2F', marginBottom: 6 },
  resultScore: { fontSize: 16, fontWeight: '800', color: '#6BCB77', marginBottom: 20 },
  nextLevelBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  nextLevelGrad: { paddingVertical: 16, alignItems: 'center' },
  nextLevelText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});

export default GardeningActivity;





