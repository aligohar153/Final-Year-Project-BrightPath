import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, StatusBar, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { addPoints, syncProgressToCloud } from '../../utils/progressService';

const { width, height } = Dimensions.get('window');

const Balloon = ({ id, onPop }) => {
  const [popped, setPopped] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const position = useRef(new Animated.ValueXY({ 
    x: Math.random() * (width - 100) + 20, 
    y: height + 100 
  })).current;
  
  // Memoize color to prevent flickering on re-renders
  const color = React.useMemo(() => 
    ['#FF6BB5', '#4D96FF', '#6BCB77', '#FFD93D', '#FF9F1C'][Math.floor(Math.random() * 5)], 
  []);

  useEffect(() => {
    Animated.timing(position.y, {
      toValue: -150,
      duration: Math.random() * 3000 + 4000,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !popped) onPop(id, false);
    });
  }, []);

  const handlePress = () => {
    if (popped) return;
    setPopped(true);
    Vibration.vibrate(40);
    
    // Pop animation
    Animated.timing(scale, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onPop(id, true);
    });
  };

  return (
    <Animated.View 
      style={[
        styles.balloon, 
        { 
          backgroundColor: color, 
          transform: [
            ...position.getTranslateTransform(),
            { scale: scale }
          ]
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.balloonTouchable} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.balloonEmoji}>🎈</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const BalloonPopActivity = ({ navigation }) => {
  const { user } = useAuth();
  const { activeChild } = useApp();
  const [balloons, setBalloons] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const spawnTimer = useRef(null);

  useEffect(() => {
    startGame();
    return () => clearInterval(spawnTimer.current);
  }, []);

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    // Initial balloons
    setBalloons([{ id: Date.now() + Math.random() }, { id: Date.now() + Math.random() + 1 }]);
    
    spawnTimer.current = setInterval(() => {
      setBalloons(prev => {
        if (prev.length < 6) { // Limit max balloons on screen
          return [...prev, { id: Date.now() + Math.random() }];
        }
        return prev;
      });
    }, 1200);

    setTimeout(() => {
      endGame();
    }, 30000); // 30 second game
  };

  const endGame = () => {
    clearInterval(spawnTimer.current);
    setGameOver(true);
  };

  const handlePop = async (id, wasPopped) => {
    if (wasPopped) {
      setScore(s => s + 5);
      const trackingId = activeChild?.id || user?.uid;
      if (trackingId) {
        await addPoints(5, trackingId);
        syncProgressToCloud(trackingId);
      }
      // Spawn next one immediately for responsiveness
      setBalloons(prev => [...prev.filter(b => b.id !== id), { id: Date.now() + Math.random() }]);
    } else {
      setBalloons(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient colors={['#E0F2FF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>⬅️</Text>
        </TouchableOpacity>
        <View style={styles.scoreBoard}>
          <Text style={styles.scoreLabel}>STARS</Text>
          <Text style={styles.scoreValue}>⭐ {score}</Text>
        </View>
      </View>

      <View style={styles.gameArea}>
        {balloons.map(b => (
          <Balloon key={b.id} id={b.id} onPop={handlePop} />
        ))}
      </View>

      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🏆</Text>
            <Text style={styles.resultTitle}>Time's Up!</Text>
            <Text style={styles.resultScore}>You earned {score} Stars!</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={startGame}>
              <Text style={styles.retryText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.exitText}>Exit Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 25, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  backBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  backText: { fontSize: 24 },
  scoreBoard: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, elevation: 5, alignItems: 'center' },
  scoreLabel: { fontSize: 10, fontWeight: '900', color: COLORS.textLight, letterSpacing: 1 },
  scoreValue: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  gameArea: { flex: 1 },
  balloon: { width: 80, height: 100, borderRadius: 40, position: 'absolute', alignItems: 'center', justifyContent: 'center', elevation: 10 },
  balloonTouchable: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  balloonEmoji: { fontSize: 50 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  resultCard: { backgroundColor: '#FFF', borderRadius: 40, padding: 40, alignItems: 'center', width: '85%' },
  resultEmoji: { fontSize: 80, marginBottom: 20 },
  resultTitle: { fontSize: 32, fontWeight: '900', color: COLORS.textDark, marginBottom: 10 },
  resultScore: { fontSize: 18, fontWeight: '800', color: COLORS.success, marginBottom: 30 },
  retryBtn: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 25, marginBottom: 15, width: '100%', alignItems: 'center' },
  retryText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
  exitBtn: { paddingVertical: 10 },
  exitText: { color: COLORS.textLight, fontWeight: '800', fontSize: 14 },
});

export default BalloonPopActivity;





