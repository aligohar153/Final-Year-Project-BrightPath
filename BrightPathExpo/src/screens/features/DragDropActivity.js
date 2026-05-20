import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, PanResponder, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { DRAG_LEVELS } from '../../data/levelData';
import { speak } from '../../utils/ttsService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { completeLevel } from '../../utils/progressService';

const { width, height } = Dimensions.get('window');

const DragDropActivity = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const level = Math.min(route.params?.level || 1, 20);
  const activityId = route.params?.activityId || 'drag_drop';
  const data = DRAG_LEVELS[level - 1];

  const [phase, setPhase] = useState('play'); // play | result
  const [score, setScore] = useState(0);
  const [isDropped, setIsDropped] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Drag logic
  const pan = useRef(new Animated.ValueXY()).current;
  const targetRef = useRef(null);
  const targetLayoutRef = useRef(null);
  const [targetLayout, setTargetLayout] = useState(null);
  const [isOverTarget, setIsOverTarget] = useState(false);

  useEffect(() => {
    setPhase('play');
    setScore(0);
    setIsDropped(false);
    setIsOverTarget(false);
    pan.setValue({ x: 0, y: 0 });
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    speak(data.instructions);
  }, [level]);

  // Use a ref to measure the target safely
  const measureTarget = () => {
    if (targetRef.current) {
      targetRef.current.measureInWindow((x, y, width, height) => {
        if (width > 0) {
          const layout = { x, y, width, height };
          targetLayoutRef.current = layout;
          setTargetLayout(layout);
        }
      });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isDropped,
      onMoveShouldSetPanResponder: () => !isDropped,
      onPanResponderGrant: () => {
        pan.setOffset({ x: 0, y: 0 });
        pan.setValue({ x: 0, y: 0 });
        measureTarget();
      },
      onPanResponderMove: (e, gesture) => {
        pan.x.setValue(gesture.dx);
        pan.y.setValue(gesture.dy);

        // Visual feedback during drag
        const activeLayout = targetLayoutRef.current;
        if (activeLayout) {
          const isOver = 
            gesture.moveX >= activeLayout.x - 20 && 
            gesture.moveX <= activeLayout.x + activeLayout.width + 20 &&
            gesture.moveY >= activeLayout.y - 20 && 
            gesture.moveY <= activeLayout.y + activeLayout.height + 20;
          setIsOverTarget(isOver);
        }
      },
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        const activeLayout = targetLayoutRef.current;
        
        if (!activeLayout) {
          // If measurement failed, try one last time or snap back
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
          return;
        }

        const isInside = 
          gesture.moveX >= activeLayout.x - 20 && 
          gesture.moveX <= activeLayout.x + activeLayout.width + 20 &&
          gesture.moveY >= activeLayout.y - 20 && 
          gesture.moveY <= activeLayout.y + activeLayout.height + 20;

        if (isInside) {
          setIsDropped(true);
          setScore(s => s + 50);
          speak(`Correct! ${data.tip}`);
          handleWin();
        } else {
          setIsOverTarget(false);
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      }
    })
  ).current;

  const handleWin = async () => {
    await completeLevel(activityId, level, activeChild?.id || user?.uid);
    setTimeout(() => setPhase('result'), 1000);
  };

  const goNextLevel = () => {
    if (level < 20) {
      navigation.replace('DragDropActivity', { level: level + 1, activityId });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#FF5722', '#E64A19']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.levelTag}>DRAG & DROP · LEVEL {level}</Text>
        <Text style={styles.title}>Move & Match</Text>
        <Text style={styles.scoreText}>⭐ {score} pts</Text>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {phase === 'play' ? (
          <View style={styles.gameArea}>
            <Text style={styles.instructions}>{data.instructions}</Text>
            
            {/* Target Area */}
            <View 
              ref={targetRef}
              collapsable={false}
              style={[
                styles.targetBox, 
                isDropped && styles.targetBoxFilled,
                isOverTarget && !isDropped && styles.targetBoxHover
              ]}
              onLayout={measureTarget}
            >
              <Text style={styles.targetEmoji}>{isDropped ? data.emoji : data.targetEmoji}</Text>
              <Text style={styles.targetLabel}>{data.target}</Text>
            </View>

            {/* Draggable Item */}
            <View style={styles.dragContainer}>
              {!isDropped && (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    { transform: pan.getTranslateTransform() },
                    styles.draggable,
                    isOverTarget && styles.draggableOver
                  ]}
                >
                  <Text style={styles.itemEmoji}>{data.emoji}</Text>
                  <Text style={styles.itemLabel}>{data.item}</Text>
                </Animated.View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🎯</Text>
            <Text style={styles.resultTitle}>Perfect Aim!</Text>
            <Text style={styles.tip}>{data.tip}</Text>
            <Text style={styles.resultScore}>+50 Stars Earned</Text>
            
            <TouchableOpacity style={styles.nextLevelBtn} onPress={goNextLevel}>
              <LinearGradient colors={['#FF5722', '#E64A19']} style={styles.nextLevelGrad}>
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
  container: { flex: 1, backgroundColor: '#FFF3E0' },
  header: { paddingTop: 55, paddingBottom: 25, paddingHorizontal: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backText: { fontSize: 18 },
  levelTag: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  content: { flex: 1, padding: 20 },
  gameArea: { flex: 1, alignItems: 'center', justifyContent: 'space-around', paddingVertical: 20, paddingBottom: 60 },
  instructions: { fontSize: 20, fontWeight: '800', color: '#E64A19', textAlign: 'center', marginBottom: 20 },
  targetBox: { width: 180, height: 180, borderRadius: 40, borderStyle: 'dashed', borderWidth: 3, borderColor: '#FF5722', backgroundColor: 'rgba(255, 87, 34, 0.05)', alignItems: 'center', justifyContent: 'center' },
  targetBoxFilled: { borderStyle: 'solid', backgroundColor: '#FFF', elevation: 8, borderColor: '#6BCB77' },
  targetBoxHover: { backgroundColor: 'rgba(107, 203, 119, 0.2)', borderColor: '#6BCB77', transform: [{ scale: 1.05 }] },
  targetEmoji: { fontSize: 70, marginBottom: 5 },
  targetLabel: { fontSize: 18, fontWeight: '900', color: '#FF5722' },
  dragContainer: { height: 120, width: '100%', alignItems: 'center', justifyContent: 'center' },
  draggable: { width: 110, height: 110, backgroundColor: '#FFF', borderRadius: 25, alignItems: 'center', justifyContent: 'center', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 8, zIndex: 100 },
  draggableOver: { borderColor: '#6BCB77', borderWidth: 2 },
  itemEmoji: { fontSize: 50, marginBottom: 2 },
  itemLabel: { fontSize: 14, fontWeight: '900', color: COLORS.textMedium },
  resultCard: { backgroundColor: '#FFF', borderRadius: 35, padding: 40, alignItems: 'center', elevation: 8, marginTop: 50 },
  resultEmoji: { fontSize: 80, marginBottom: 15 },
  resultTitle: { fontSize: 28, fontWeight: '900', color: '#E64A19', marginBottom: 10 },
  tip: { fontSize: 16, color: COLORS.textMedium, textAlign: 'center', marginBottom: 25, fontWeight: '600' },
  resultScore: { fontSize: 18, fontWeight: '900', color: '#6BCB77', marginBottom: 30 },
  nextLevelBtn: { width: '100%', borderRadius: 25, overflow: 'hidden' },
  nextLevelGrad: { paddingVertical: 18, alignItems: 'center' },
  nextLevelText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
});

export default DragDropActivity;





