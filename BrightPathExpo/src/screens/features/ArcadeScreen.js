import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ARCADE_GAMES = [
  {
    id: 'g1',
    title: 'Balloon Pop',
    emoji: '🎈',
    color: '#FF6BB5',
    screen: 'BalloonPop',
    tag: 'Reflex',
    desc: 'Tap the balloons before they float away!'
  },
  {
    id: 'g2',
    title: 'Color Match',
    emoji: '🌈',
    color: '#4D96FF',
    screen: 'ColorMatch',
    tag: 'Logic',
    desc: 'Match the colors to their names.'
  },
  {
    id: 'g3',
    title: 'Mini Piano',
    emoji: '🎹',
    color: '#6BCB77',
    screen: 'MiniPiano',
    tag: 'Music',
    desc: 'Tap the keys to play musical notes.'
  },
  {
    id: 'g4',
    title: 'Drum Kit',
    emoji: '🥁',
    color: '#FFD93D',
    screen: 'DrumKit',
    tag: 'Rhythm',
    desc: 'Tap the pads to create your own beat.'
  }
];

const ArcadeScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const openGame = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Game{'\n'}<Text style={styles.titleAccent}>Center</Text></Text>
          <Text style={styles.subtitle}>Fun interactive learning games!</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeEmoji}>🕹️</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {ARCADE_GAMES.map((game, index) => (
            <TouchableOpacity 
              key={game.id} 
              style={styles.gameCard}
              onPress={() => openGame(game.screen)}
              activeOpacity={0.9}
            >
              <LinearGradient 
                colors={[game.color, game.color + 'CC']} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 1}}
                style={styles.cardGradient}
              >
                <View style={styles.cardInfo}>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{game.tag}</Text>
                  </View>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameDesc}>{game.desc}</Text>
                  <View style={styles.playBtn}>
                    <Text style={styles.playText}>Play Now ▶</Text>
                  </View>
                </View>
                <View style={styles.emojiContainer}>
                  <Text style={styles.gameEmoji}>{game.emoji}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </Animated.View>
        
        <View style={styles.footerNote}>
          <Text style={styles.noteText}>New games added every month! 🚀</Text>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: { paddingHorizontal: 25, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.textDark, lineHeight: 36 },
  titleAccent: { color: COLORS.primary },
  subtitle: { fontSize: 13, color: COLORS.textMedium, fontWeight: '600', marginTop: 4 },
  headerBadge: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  badgeEmoji: { fontSize: 32 },
  scrollContent: { paddingHorizontal: 20 },
  gameCard: { borderRadius: 30, marginBottom: 20, elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, overflow: 'hidden' },
  cardGradient: { padding: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardInfo: { flex: 1 },
  tagBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 8 },
  tagText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  gameTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  gameDesc: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 15, lineHeight: 18 },
  playBtn: { alignSelf: 'flex-start', backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15 },
  playText: { color: COLORS.textDark, fontWeight: '900', fontSize: 12 },
  emojiContainer: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  gameEmoji: { fontSize: 60 },
  footerNote: { alignItems: 'center', marginTop: 10, opacity: 0.5 },
  noteText: { fontSize: 12, fontWeight: '700', color: COLORS.textMedium },
});

export default ArcadeScreen;





