import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ACTIVITIES_DATA } from '../../data/activitiesData';
import { STORIES_DATA } from '../../data/storiesData';
import { getTotalPoints } from '../../utils/progressService';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { activeChild, setActiveChild } = useApp();
  const [points, setPoints] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        const id = activeChild?.id;
        if (!id) { setPoints(0); return; }
        const cloud = activeChild?.progressData?.totalPoints || 0;
        const local = await getTotalPoints(id);
        setPoints(Math.max(cloud, local));
      };
      fetch();
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]).start();
    }, [activeChild?.id, activeChild?.progressData?.totalPoints])
  );

  const activities = [
    { label: 'Alphabets', emoji: '🔤', bg: ['#4ECDC4', '#1A9B8B'], nav: 'LanguageLearning', p: { category: 'alphabet' }, tag: 'Language', desc: 'Learn letters, phonics, and spelling words.' },
    { label: 'Numbers', emoji: '🔢', bg: ['#F472B6', '#DB2777'], nav: 'LanguageLearning', p: { category: 'numbers' }, tag: 'Math', desc: 'Count numbers and solve simple math puzzles.' },
    { label: 'Emotions', emoji: '😊', bg: ['#FB923C', '#EA580C'], nav: 'EmotionRecognition', p: {}, tag: 'EQ', desc: 'Identify feelings and facial expressions.' },
    { label: 'Social', emoji: '🤝', bg: ['#34D399', '#059669'], nav: 'ActivityLevel', p: { activity: ACTIVITIES_DATA.find(act => act.id === 'social') }, tag: 'Social', desc: 'Learn kindness, sharing, and making friends.' },
    { label: 'Memory', emoji: '🧩', bg: ['#A78BFA', '#7C3AED'], nav: 'ActivityLevel', p: { activity: ACTIVITIES_DATA.find(act => act.id === 'memory') }, tag: 'Brain', desc: 'Boost memory and cognitive problem solving.' },
    { label: 'Music', emoji: '🎵', bg: ['#FBBF24', '#D97706'], nav: 'ActivityLevel', p: { activity: ACTIVITIES_DATA.find(act => act.id === 'music') }, tag: 'Rhythm', desc: 'Explore musical notes, instruments, and sounds.' },
  ];

  const stories = STORIES_DATA ? STORIES_DATA.slice(0, 5) : [];
  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? '🌅 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>

        {/* ── HERO HEADER ── */}
        <LinearGradient
          colors={['#1A9B8B', '#4ECDC4', '#6BDDDA']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          {/* Decorative blobs */}
          <View style={s.blob1} />
          <View style={s.blob2} />

          {/* Top Row */}
          <Animated.View style={[s.topRow, { opacity: fadeAnim }]}>
            <TouchableOpacity onPress={() => setActiveChild(null)} style={s.avatarBtn}>
              <View style={s.avatarRing}>
                <Text style={s.avatarEmoji}>{activeChild?.avatar || '👦'}</Text>
              </View>
              <View style={s.switchDot}><Text style={{ fontSize: 8 }}>🔄</Text></View>
            </TouchableOpacity>
            <View style={s.heroCenter}>
              <Text style={s.heroTime}>{timeGreet}</Text>
              <Text style={s.heroName}>{activeChild?.name || 'Explorer'}</Text>
            </View>
            <View style={s.starBubble}>
              <Text style={s.starBubbleEmoji}>⭐</Text>
              <Text style={s.starBubbleCount}>{points.toLocaleString()}</Text>
            </View>
          </Animated.View>

          {/* Story Hero Card */}
          <Animated.View style={[s.storyHero, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}>
            <View style={s.storyHeroLeft}>
              <View style={s.recommendBadge}><Text style={s.recommendTxt}>📖 FEATURED STORY</Text></View>
              <Text style={s.storyHeroTitle}>"The Brave Lion and His Jungle Friends"</Text>
              <TouchableOpacity style={s.storyHeroBtn} onPress={() => navigation.navigate('Stories')}>
                <Text style={s.storyHeroBtnTxt}>▶  Play Now</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.storyHeroEmoji}>🦁</Text>
          </Animated.View>
        </LinearGradient>

        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── ACTIVITIES TITLE ── */}
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Activities</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Activities')}>
              <Text style={s.sectionLink}>See All →</Text>
            </TouchableOpacity>
          </View>

          {/* ── ACTIVITIES LIST (SINGLE SHOW) ── */}
          <View style={s.actList}>
            {activities.map((a, i) => (
              <TouchableOpacity key={i} style={s.actCardSingle} onPress={() => navigation.navigate(a.nav, a.p)} activeOpacity={0.9}>
                <LinearGradient colors={a.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.actCardGradSingle}>
                  <View style={s.actCardInfo}>
                    <View style={s.tagBadge}>
                      <Text style={s.tagText}>{a.tag}</Text>
                    </View>
                    <Text style={s.actCardTitle}>{a.label}</Text>
                    <Text style={s.actCardDesc}>{a.desc}</Text>
                    <View style={s.playBtn}>
                      <Text style={s.playText}>Play Now ▶</Text>
                    </View>
                  </View>
                  <View style={s.emojiContainer}>
                    <Text style={s.actCardEmoji}>{a.emoji}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── SOCIAL BANNER ── */}
          <TouchableOpacity 
            style={s.socialCard} 
            onPress={() => navigation.navigate('ActivityLevel', { activity: ACTIVITIES_DATA.find(act => act.id === 'social') })}
          >
            <LinearGradient colors={['#A78BFA', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.socialGrad}>
              <View style={s.socialLeft}>
                <View style={s.socialTag}><Text style={s.socialTagTxt}>NEW</Text></View>
                <Text style={s.socialTitle}>Social Skills</Text>
                <Text style={s.socialSub}>Learn how to make friends 🤝</Text>
              </View>
              <View style={s.socialRight}>
                <View style={s.socialPlayBtn}>
                  <Text style={s.socialPlayTxt}>Play ▶</Text>
                </View>
                <Text style={{ fontSize: 50 }}>🤝</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* ── STORIES SECTION ── */}
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Bedtime Stories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Stories')}>
              <Text style={s.sectionLink}>More →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.storiesRow}>
            {stories.map((story) => (
              <TouchableOpacity
                key={story.id}
                style={s.storyCard}
                onPress={() => navigation.navigate('StoryPlayer', { story })}
              >
                <View style={[s.storyCardTop, { backgroundColor: story.color || '#E0F9F8' }]}>
                  <Text style={s.storyEmoji}>{story.emoji}</Text>
                </View>
                <View style={s.storyCardBottom}>
                  <Text style={s.storyCat}>{story.category?.toUpperCase()}</Text>
                  <Text style={s.storyTitle} numberOfLines={2}>{story.title}</Text>
                  <View style={s.storyMeta}>
                    <Text style={s.storyPlay}>▶ Play</Text>
                    <Text style={s.storyTime}>{story.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── ARCADE BANNER ── */}
          <TouchableOpacity style={s.arcadeBanner} onPress={() => navigation.navigate('Arcade')}>
            <LinearGradient colors={['#FB923C', '#F43F5E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.arcadeGrad}>
              <Text style={{ fontSize: 50 }}>🕹️</Text>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={s.arcadeTitle}>Arcade Games</Text>
                <Text style={s.arcadeSub}>Play fun mini-games & earn stars!</Text>
              </View>
              <View style={s.arcadeArrow}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: 20 }}>›</Text></View>
            </LinearGradient>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4FAF8' },

  // Hero
  hero: {
    paddingTop: 52,
    paddingHorizontal: 22,
    paddingBottom: 28,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    marginBottom: 8,
  },
  blob1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.07)', top: -70, right: -70 },
  blob2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -30, left: -30 },

  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  avatarBtn: { position: 'relative' },
  avatarRing: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  avatarEmoji: { fontSize: 26 },
  switchDot: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  heroCenter: { flex: 1 },
  heroTime: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },
  heroName: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  starBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, gap: 5 },
  starBubbleEmoji: { fontSize: 16 },
  starBubbleCount: { color: '#FFF', fontWeight: '900', fontSize: 16 },

  storyHero: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 26, padding: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  storyHeroLeft: { flex: 1, marginRight: 10 },
  recommendBadge: { backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  recommendTxt: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  storyHeroTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', lineHeight: 22, marginBottom: 16 },
  storyHeroBtn: { backgroundColor: '#FFF', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 9 },
  storyHeroBtnTxt: { color: '#1A9B8B', fontWeight: '900', fontSize: 13 },
  storyHeroEmoji: { fontSize: 70 },

  // Sections
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, marginTop: 26, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1A2B3C' },
  sectionLink: { color: '#4ECDC4', fontWeight: '800', fontSize: 13 },

  // Activity list (Single Show)
  actList: { paddingHorizontal: 22, gap: 18, marginBottom: 16 },
  actCardSingle: { borderRadius: 28, elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, overflow: 'hidden' },
  actCardGradSingle: { padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actCardInfo: { flex: 1, marginRight: 16 },
  tagBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 10 },
  tagText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  actCardTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  actCardDesc: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 18, lineHeight: 20 },
  playBtn: { alignSelf: 'flex-start', backgroundColor: '#FFF', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18 },
  playText: { color: '#1A2B3C', fontWeight: '900', fontSize: 13 },
  emojiContainer: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  actCardEmoji: { fontSize: 60 },

  // Social
  socialCard: { marginHorizontal: 22, borderRadius: 28, overflow: 'hidden', elevation: 5, marginTop: 22, marginBottom: 6 },
  socialGrad: { flexDirection: 'row', alignItems: 'center', padding: 22 },
  socialLeft: { flex: 1 },
  socialTag: { backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  socialTagTxt: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  socialTitle: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  socialSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700', marginTop: 4 },
  socialRight: { alignItems: 'center', gap: 10 },
  socialPlayBtn: { backgroundColor: '#FFF', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8 },
  socialPlayTxt: { color: '#7C3AED', fontWeight: '900', fontSize: 13 },

  // Stories
  storiesRow: { marginLeft: 22, paddingRight: 22 },
  storyCard: { width: 165, backgroundColor: '#FFF', borderRadius: 22, marginRight: 14, overflow: 'hidden', elevation: 4 },
  storyCardTop: { height: 110, alignItems: 'center', justifyContent: 'center' },
  storyEmoji: { fontSize: 60 },
  storyCardBottom: { padding: 14 },
  storyCat: { fontSize: 8, fontWeight: '900', color: '#7F8C8D', letterSpacing: 1, marginBottom: 5 },
  storyTitle: { fontSize: 13, fontWeight: '900', color: '#1A2B3C', marginBottom: 10, lineHeight: 18 },
  storyMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storyPlay: { fontSize: 11, fontWeight: '900', color: '#4ECDC4' },
  storyTime: { fontSize: 10, color: '#7F8C8D', fontWeight: '700' },

  // Arcade
  arcadeBanner: { marginHorizontal: 22, marginTop: 22, borderRadius: 26, overflow: 'hidden', elevation: 5 },
  arcadeGrad: { flexDirection: 'row', alignItems: 'center', padding: 22 },
  arcadeTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  arcadeSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700', marginTop: 4 },
  arcadeArrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
});

export default HomeScreen;





