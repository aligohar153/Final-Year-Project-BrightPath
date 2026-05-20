import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated, Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getChildren } from '../../firebase/firestoreService';

const { width, height } = Dimensions.get('window');

const ParentDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { children, setChildren, setActiveChild } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [user?.uid])
  );

  const loadData = async () => {
    if (user?.uid) {
      const result = await getChildren(user.uid);
      if (result.success) setChildren(result.children);
    }
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  const getPoints = (child) => {
    const p = child.progressData || {};
    if (typeof p.totalPoints === 'number') return p.totalPoints;
    return Object.values(p).reduce((a, c) => a + (typeof c === 'object' ? (c.score || 0) : 0), 0);
  };

  const totalStars = children.reduce((t, c) => t + getPoints(c), 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '⛅' : '🌙';

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        bounces 
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A9B8B']} tintColor="#1A9B8B" />
        }
      >

        {/* ── HERO GRADIENT HEADER ── */}
        <LinearGradient
          colors={['#1A9B8B', '#4ECDC4', '#80DDD7']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.heroHeader}
        >
          {/* Decorative circles */}
          <View style={s.circle1} />
          <View style={s.circle2} />
          <View style={s.circle3} />

          {/* Top bar */}
          <View style={s.topBar}>
            <View>
              <Text style={s.greetText}>{greeting} {greetEmoji}</Text>
              <Text style={s.nameText}>{user?.fullName || 'Parent'} 👋</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={s.avatarWrap}>
              <View style={s.avatar}>
                <Text style={s.avatarLetter}>{user?.fullName?.charAt(0)?.toUpperCase() || 'P'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stat chips inside header */}
          <View style={s.headerStats}>
            <View style={s.hStat}>
              <Text style={s.hStatNum}>{children.length}</Text>
              <Text style={s.hStatLab}>Children</Text>
            </View>
            <View style={s.hStatDiv} />
            <View style={s.hStat}>
              <Text style={s.hStatNum}>{totalStars.toLocaleString()}</Text>
              <Text style={s.hStatLab}>Total Stars ⭐</Text>
            </View>
            <View style={s.hStatDiv} />
            <View style={s.hStat}>
              <Text style={s.hStatNum}>{children.reduce((t, c) => t + (c.progressData?.levelsCompleted || 0), 0)}</Text>
              <Text style={s.hStatLab}>Games Won 🎮</Text>
            </View>
          </View>
        </LinearGradient>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── CHILDREN CARDS SECTION ── */}
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Your Children</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ChildrenList')}>
                <Text style={s.sectionLink}>Manage All →</Text>
              </TouchableOpacity>
            </View>

            {children.length === 0 ? (
              <TouchableOpacity style={s.emptyCard} onPress={() => navigation.navigate('CreateChildProfile')}>
                <View style={s.emptyIconCircle}>
                  <Text style={{ fontSize: 40 }}>👶</Text>
                </View>
                <Text style={s.emptyTitle}>Add Your First Child</Text>
                <Text style={s.emptySub}>Create a learning profile to get started</Text>
                <LinearGradient colors={['#4ECDC4', '#1A9B8B']} style={s.emptyBtn}>
                  <Text style={s.emptyBtnTxt}>+ Create Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.childScroll}>
                {children.map((child, idx) => {
                  const pts = getPoints(child);
                  const badges = child.progressData?.badgesCount || 0;
                  const cardColors = [
                    ['#4ECDC4', '#1A9B8B'],
                    ['#A78BFA', '#7C3AED'],
                    ['#FB923C', '#EA580C'],
                    ['#34D399', '#059669'],
                    ['#F472B6', '#DB2777'],
                  ];
                  const cols = cardColors[idx % cardColors.length];
                  return (
                    <TouchableOpacity
                      key={child.id}
                      style={s.childCard}
                      onPress={() => setActiveChild(child)}
                    >
                      <LinearGradient colors={cols} style={s.childCardGrad}>
                        <View style={s.childCircleBg}>
                          <Text style={{ fontSize: 34 }}>{child.avatar || '👦'}</Text>
                        </View>
                        <Text style={s.childCardName}>{child.name}</Text>
                        <Text style={s.childCardLevel}>Level {child.autismLevel || 1}</Text>
                        <View style={s.childCardStats}>
                          <View style={s.childStatPill}>
                            <Text style={s.childStatTxt}>⭐ {pts}</Text>
                          </View>
                          <View style={s.childStatPill}>
                            <Text style={s.childStatTxt}>🏅 {badges}</Text>
                          </View>
                        </View>
                        <View style={s.playBtn}>
                          <Text style={s.playBtnTxt}>▶ Start Learning</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
                {/* Add Child */}
                <TouchableOpacity style={s.addChildCard} onPress={() => navigation.navigate('CreateChildProfile')}>
                  <View style={s.addChildInner}>
                    <Text style={s.addChildPlus}>+</Text>
                    <Text style={s.addChildTxt}>Add New{'\n'}Child</Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>

          {/* ── INDIVIDUAL PROGRESS ── */}
          {children.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Progress Overview</Text>
              {children.map((child) => {
                const pts = getPoints(child);
                const pct = Math.min(pts / 20, 100);
                const levels = child.progressData?.levelsCompleted || 0;
                const badges = child.progressData?.badgesCount || 0;
                return (
                  <TouchableOpacity
                    key={child.id}
                    style={s.progressCard}
                    onPress={async () => { await setActiveChild(child); navigation.navigate('Analytics'); }}
                  >
                    <View style={s.progressCardLeft}>
                      <View style={s.progressAvatar}>
                        <Text style={{ fontSize: 28 }}>{child.avatar || '👦'}</Text>
                      </View>
                    </View>
                    <View style={s.progressCardRight}>
                      <View style={s.progressCardTopRow}>
                        <Text style={s.progressName}>{child.name}</Text>
                        <View style={s.starsBubble}>
                          <Text style={s.starsBubbleTxt}>⭐ {pts}</Text>
                        </View>
                      </View>
                      <Text style={s.progressMeta}>Level {child.autismLevel || 1}  ·  {levels} games  ·  {badges} badges</Text>
                      <View style={s.progressTrack}>
                        <LinearGradient
                          colors={['#4ECDC4', '#6BCB77']}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                          style={[s.progressFill, { width: `${Math.max(pct, 3)}%` }]}
                        />
                      </View>
                    </View>
                    <Text style={s.cardArrow}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ── QUICK ACTIONS ── */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Quick Actions</Text>
            <View style={s.actionsGrid}>
              {[
                { emoji: '📈', label: 'Analytics', sub: 'View reports', screen: 'Analytics', bg: '#E0F9F8' },
                { emoji: '👥', label: 'Children', sub: 'Manage profiles', screen: 'ChildrenList', bg: '#EDE9FE' },
                { emoji: '➕', label: 'Add Child', sub: 'New profile', screen: 'CreateChildProfile', bg: '#FFF0E8' },
                { emoji: '⚙️', label: 'Settings', sub: 'Preferences', screen: 'Profile', bg: '#F0FFF4' },
              ].map(a => (
                <TouchableOpacity key={a.label} style={[s.actionCard, { backgroundColor: a.bg }]} onPress={() => navigation.navigate(a.screen)}>
                  <Text style={s.actionEmoji}>{a.emoji}</Text>
                  <Text style={s.actionLabel}>{a.label}</Text>
                  <Text style={s.actionSub}>{a.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4FAF8' },

  // Hero Header
  heroHeader: {
    paddingTop: 55, paddingBottom: 36, paddingHorizontal: 24,
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    overflow: 'hidden', marginBottom: 10,
  },
  circle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -60 },
  circle2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -40, left: -40 },
  circle3: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)', top: 40, right: 100 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  greetText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700' },
  nameText: { color: '#FFF', fontSize: 26, fontWeight: '900', marginTop: 3 },
  avatarWrap: { elevation: 6 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarLetter: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  headerStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 22, padding: 18, alignItems: 'center', justifyContent: 'space-around' },
  hStat: { alignItems: 'center' },
  hStatNum: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  hStatLab: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700', marginTop: 2 },
  hStatDiv: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.3)' },

  // Sections
  section: { paddingHorizontal: 22, marginTop: 28 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1A2B3C', marginBottom: 16 },
  sectionLink: { color: '#4ECDC4', fontWeight: '800', fontSize: 13 },

  // Empty state
  emptyCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 36, alignItems: 'center', elevation: 3 },
  emptyIconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E0F9F8', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1A2B3C', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#7F8C8D', textAlign: 'center', fontWeight: '600', marginBottom: 24 },
  emptyBtn: { borderRadius: 25, paddingHorizontal: 28, paddingVertical: 13 },
  emptyBtnTxt: { color: '#FFF', fontWeight: '900', fontSize: 14 },

  // Child scroll cards
  childScroll: { marginHorizontal: -22, paddingLeft: 22, marginBottom: 8 },
  childCard: { width: 170, borderRadius: 28, marginRight: 16, elevation: 8, overflow: 'hidden' },
  childCardGrad: { padding: 22, alignItems: 'center' },
  childCircleBg: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  childCardName: { color: '#FFF', fontSize: 17, fontWeight: '900', marginBottom: 4 },
  childCardLevel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', marginBottom: 14 },
  childCardStats: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  childStatPill: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  childStatTxt: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  playBtn: { backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  playBtnTxt: { fontWeight: '900', fontSize: 11, color: '#1A9B8B' },
  addChildCard: { width: 120, marginRight: 22, borderRadius: 28, borderWidth: 2, borderColor: '#C0EDE9', borderStyle: 'dashed' },
  addChildInner: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 220 },
  addChildPlus: { fontSize: 36, color: '#4ECDC4', fontWeight: '300' },
  addChildTxt: { fontSize: 12, color: '#7F8C8D', fontWeight: '700', textAlign: 'center', marginTop: 6 },

  // Progress cards
  progressCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14, elevation: 3, gap: 14 },
  progressCardLeft: {},
  progressAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E0F9F8', alignItems: 'center', justifyContent: 'center' },
  progressCardRight: { flex: 1 },
  progressCardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  progressName: { fontSize: 16, fontWeight: '900', color: '#1A2B3C' },
  starsBubble: { backgroundColor: '#FFF9C4', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  starsBubbleTxt: { color: '#9A7D00', fontWeight: '900', fontSize: 11 },
  progressMeta: { fontSize: 10, color: '#7F8C8D', fontWeight: '700', marginBottom: 10 },
  progressTrack: { height: 7, backgroundColor: '#EDF7F2', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  cardArrow: { fontSize: 28, color: '#C0EDE9', fontWeight: '300' },

  // Quick actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  actionCard: { width: (width - 58) / 2, borderRadius: 24, padding: 22, elevation: 2 },
  actionEmoji: { fontSize: 32, marginBottom: 10 },
  actionLabel: { fontSize: 15, fontWeight: '900', color: '#1A2B3C' },
  actionSub: { fontSize: 11, color: '#7F8C8D', fontWeight: '700', marginTop: 3 },
});

export default ParentDashboardScreen;





