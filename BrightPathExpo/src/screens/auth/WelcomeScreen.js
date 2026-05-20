// BrightPath - Welcome Screen (StoryNest Design)
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, Image,
  TouchableOpacity, StatusBar, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../utils/ThemeContext';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const { setGuestMode } = useAuth();
  const { isHighContrast, toggleHighContrast } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
        Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(float1, { toValue: -14, duration: 2600, useNativeDriver: true }),
      Animated.timing(float1, { toValue: 0, duration: 2600, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(float2, { toValue: -10, duration: 3400, useNativeDriver: true }),
      Animated.timing(float2, { toValue: 0, duration: 3400, useNativeDriver: true }),
    ])).start();
  }, []);

  const features = [
    { emoji: '🗣️', text: 'Language & Communication' },
    { emoji: '🧩', text: 'Cognitive Skills Games' },
    { emoji: '😊', text: 'Emotion Recognition' },
    { emoji: '📅', text: 'Daily Routine Planner' },
    { emoji: '📊', text: 'Progress Tracking' },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Full hero background */}
      <LinearGradient
        colors={['#0D7A6E', '#1A9B8B', '#4ECDC4']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.heroBg}
      >
        <View style={s.blob1} /><View style={s.blob2} /><View style={s.blob3} />

        {/* Floating emojis */}
        <Animated.Text style={[s.floatEmoji, s.fe1, { transform: [{ translateY: float1 }] }]}>🌟</Animated.Text>
        <Animated.Text style={[s.floatEmoji, s.fe2, { transform: [{ translateY: float2 }] }]}>🧠</Animated.Text>
        <Animated.Text style={[s.floatEmoji, s.fe3, { transform: [{ translateY: float1 }] }]}>🎈</Animated.Text>

        {/* Logo & branding */}
        <Animated.View style={[s.brand, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={s.logoSquare}>
            <Image source={require('../../../assets/logo.png')} style={s.logoImg} resizeMode="contain" />
          </View>
          <Text style={s.appName}>BrightPath</Text>
          <Text style={s.tagline}>Nurturing potential, together.</Text>
        </Animated.View>
      </LinearGradient>

      {/* Bottom sheet */}
      <View style={s.sheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={s.sheetTitle}>Supporting children{'\n'}with autism 💜</Text>
            <Text style={s.sheetSub}>Personalized learning for every unique journey</Text>

            {/* Features */}
            <View style={s.featureGrid}>
              {features.map((f, i) => (
                <View key={i} style={s.featureChip}>
                  <Text style={s.featureEmoji}>{f.emoji}</Text>
                  <Text style={s.featureTxt}>{f.text}</Text>
                </View>
              ))}
            </View>

            {/* Login */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.9}>
              <LinearGradient colors={['#1A9B8B', '#4ECDC4']} style={s.primaryBtn}>
                <Text style={s.primaryBtnTxt}>🔐  Sign In to Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Register */}
            <TouchableOpacity style={s.outlineBtn} onPress={() => navigation.navigate('Register')}>
              <Text style={s.outlineBtnTxt}>✨  Create New Account</Text>
            </TouchableOpacity>

            {/* Guest */}
            <TouchableOpacity style={s.ghostBtn} onPress={() => setGuestMode()}>
              <Text style={s.ghostBtnTxt}>Continue as Guest →</Text>
            </TouchableOpacity>

            <Text style={s.version}>BrightPath v2.0 · Designed for Every Child 🌱</Text>
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4FAF8' },
  heroBg: { height: height * 0.42, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  blob1: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.07)', top: -80, right: -80 },
  blob2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -60, left: -60 },
  blob3: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.06)', top: 60, left: 60 },
  floatEmoji: { position: 'absolute', fontSize: 36 },
  fe1: { top: 60, right: 40 },
  fe2: { bottom: 60, left: 30 },
  fe3: { top: 80, left: width / 2 - 10 },
  brand: { alignItems: 'center' },
  logoSquare: {
    width: 150, height: 150, borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 5, borderColor: 'rgba(255,255,255,0.4)',
    elevation: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15,
  },
  logoImg: { width: '85%', height: '85%' },
  appName: { fontSize: 48, fontWeight: '900', color: '#FFF', letterSpacing: -1, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '700', marginTop: 8 },

  sheet: { flex: 1, marginTop: -32 },
  sheetContent: { paddingHorizontal: 24, paddingTop: 36, paddingBottom: 60 },
  sheetTitle: { fontSize: 28, fontWeight: '900', color: '#1A2B3C', lineHeight: 36, marginBottom: 8 },
  sheetSub: { fontSize: 14, color: '#7F8C8D', fontWeight: '600', marginBottom: 26 },

  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  featureChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9, gap: 8, elevation: 2 },
  featureEmoji: { fontSize: 16 },
  featureTxt: { fontSize: 12, fontWeight: '700', color: '#2C3E50' },

  primaryBtn: { borderRadius: 22, paddingVertical: 18, alignItems: 'center', elevation: 6, shadowColor: '#4ECDC4', shadowOpacity: 0.4, shadowRadius: 12, marginBottom: 14 },
  primaryBtnTxt: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  outlineBtn: { borderRadius: 22, paddingVertical: 17, alignItems: 'center', borderWidth: 2, borderColor: '#4ECDC4', marginBottom: 14 },
  outlineBtnTxt: { color: '#1A9B8B', fontWeight: '900', fontSize: 16 },
  ghostBtn: { alignItems: 'center', paddingVertical: 12, marginBottom: 24 },
  ghostBtnTxt: { color: '#7F8C8D', fontWeight: '700', fontSize: 14 },
  version: { textAlign: 'center', color: '#B2BEC3', fontSize: 11, fontWeight: '600' },
});

export default WelcomeScreen;





