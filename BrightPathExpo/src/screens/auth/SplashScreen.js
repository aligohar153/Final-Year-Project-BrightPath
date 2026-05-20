// BrightPath - Animated Splash Screen (New Design)
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, StatusBar, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const float     = useRef(new Animated.Value(0)).current;
  const pulse     = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    
    // Entry
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();

    // Float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -12, duration: 1800, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0,   duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    // Pulse glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(() => navigation.replace('Intro'), 3200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#0D7A6E', '#1A9B8B', '#4ECDC4', '#7EEAE4']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.bg}
      >
        {/* Decorative blobs */}
        <View style={s.blob1} />
        <View style={s.blob2} />
        <View style={s.blob3} />

        {/* Floating star accents */}
        <Animated.Text style={[s.accent, s.a1, { transform: [{ translateY: float }] }]}>⭐</Animated.Text>
        <Animated.Text style={[s.accent, s.a2, { transform: [{ translateY: float }] }]}>✨</Animated.Text>
        <Animated.Text style={[s.accent, s.a3, { transform: [{ translateY: float }] }]}>🌟</Animated.Text>

        {/* Logo */}
        <Animated.View style={[
          s.logoWrap,
          {
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulse) },
              { translateY: float },
            ],
          },
        ]}>
          <View style={s.logoContainer}>
            <Image
              source={require('../../../assets/logo.png')}
              style={s.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Text */}
        <Animated.View style={[s.textBlock, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={s.appName}>BrightPath</Text>
          <View style={s.divider} />
          <Text style={s.tagline}>Empowering Every Mind ✨</Text>
        </Animated.View>

        {/* Bottom loader */}
        <Animated.View style={[s.loader, { opacity: fadeAnim }]}>
          <View style={s.loaderTrack}>
            <Animated.View style={[s.loaderFill, { transform: [{ scaleX: scaleAnim }] }]} />
          </View>
          <Text style={s.loaderTxt}>Loading your journey...</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  bg: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },

  blob1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.07)', top: -100, right: -80 },
  blob2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -80, left: -60 },
  blob3: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)', top: height * 0.3, left: 30 },

  accent: { position: 'absolute', fontSize: 28 },
  a1: { top: height * 0.15, right: 50 },
  a2: { top: height * 0.25, left: 30 },
  a3: { bottom: height * 0.25, right: 40 },

  logoWrap: { marginBottom: 32 },
  logoContainer: {
    width: 220, height: 220, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    padding: 25,
    elevation: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20,
    borderWidth: 8, borderColor: 'rgba(255,255,255,0.3)',
  },
  logo: { width: '100%', height: '100%' },

  textBlock: { alignItems: 'center' },
  appName: {
    fontSize: 48, fontWeight: '900', color: '#FFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  divider: { width: 60, height: 4, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 2, marginVertical: 16 },
  tagline: { fontSize: 17, color: 'rgba(255,255,255,0.9)', fontWeight: '700', letterSpacing: 0.8 },

  loader: { position: 'absolute', bottom: 60, alignItems: 'center' },
  loaderTrack: { width: 160, height: 5, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  loaderFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 3 },
  loaderTxt: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
});

export default SplashScreen;





