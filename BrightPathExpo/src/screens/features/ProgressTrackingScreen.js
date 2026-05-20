// BrightPath - Analytics & Progress (StoryNest Design)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated, StatusBar,
  TouchableOpacity, Dimensions, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getOverallStats } from '../../utils/progressService';

const { width } = Dimensions.get('window');

const D = {
  bg: '#EDF7F2',
  card: '#FFFFFF',
  primary: '#4ECDC4',
  primaryDark: '#3ABDB4',
  accent: '#6BCB77',
  yellow: '#FFD93D',
  coral: '#FF6B6B',
  purple: '#A78BFA',
  textDark: '#2C3E50',
  textMed: '#7F8C8D',
  textLight: '#B2BEC3',
  border: '#E8F5F0',
};

const ProgressScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { activeChild, setActiveChild, children } = useApp();
  const [viewingChild, setViewingChild] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      const target = activeChild || (children.length > 0 ? children[0] : null);
      setViewingChild(target);
    }, [activeChild, children])
  );

  useEffect(() => {
    if (viewingChild) loadStats(viewingChild);
  }, [viewingChild]);

  const loadStats = async (child) => {
    setLoading(true);
    fadeAnim.setValue(0);
    const childId = child?.id;
    if (!childId) {
      setStats({ points: 0, levelsCompleted: 0, badgesCount: 0, specialBadges: [], streak: 0, storiesCompleted: 0 });
      setLoading(false);
      return;
    }
    const local = await getOverallStats(childId);
    const cloud = child?.progressData || {};
    const cloudPts = typeof cloud.totalPoints === 'number' ? cloud.totalPoints : null;
    setStats({
      ...local,
      points: cloudPts !== null ? Math.max(cloudPts, local.points) : local.points,
      levelsCompleted: Math.max(cloud.levelsCompleted || 0, local.levelsCompleted),
      badgesCount: Math.max(cloud.badgesCount || 0, local.badgesCount),
    });
    setLoading(false);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  const ranked = [...children].sort((a, b) => {
    const aP = a.progressData?.totalPoints || 0;
    const bP = b.progressData?.totalPoints || 0;
    return bP - aP;
  });
  const myRank = ranked.findIndex(c => c.id === viewingChild?.id) + 1;

  const skills = [
    { label: 'Language', key: 'language', color: D.coral, emoji: '🗣️', bg: '#FFE8E8' },
    { label: 'Cognitive', key: 'cognitive', color: D.primary, emoji: '🧠', bg: '#E0F9F8' },
    { label: 'Social', key: 'social', color: D.accent, emoji: '🤝', bg: '#E8FFE8' },
    { label: 'Emotions', key: 'emotion', color: '#FF9F1C', emoji: '😊', bg: '#FFF4D6' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={D.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Track your child's learning journey</Text>
        </View>

        {/* Child Switcher */}
        {children.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.switcher}>
            {children.map(child => {
              const active = viewingChild?.id === child.id;
              return (
                <TouchableOpacity
                  key={child.id}
                  onPress={() => setViewingChild(child)}
                  style={[styles.switcherChip, active && styles.switcherChipActive]}
                >
                  <Text style={styles.switcherEmoji}>{child.avatar || '👦'}</Text>
                  <Text style={[styles.switcherName, active && { color: '#FFF' }]}>{child.name}</Text>
                  {active && <View style={styles.activeChipDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={D.primary} />
            <Text style={styles.loadingText}>Loading {viewingChild?.name}'s stats...</Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Score Hero Card */}
            <LinearGradient colors={[D.primary, D.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroChildName}>{viewingChild?.name?.toUpperCase()}</Text>
                <Text style={styles.heroStarLabel}>TOTAL STARS</Text>
                <Text style={styles.heroStarCount}>{stats?.points || 0}</Text>
                <Text style={styles.heroStarIcon}>⭐</Text>
              </View>
              <View style={styles.heroRight}>
                {[
                  { val: stats?.levelsCompleted || 0, lab: 'Games' },
                  { val: stats?.storiesCompleted || 0, lab: 'Stories' },
                  { val: stats?.badgesCount || 0, lab: 'Badges' },
                  { val: `#${myRank || '-'}`, lab: 'Rank' },
                ].map((s, i) => (
                  <View key={i} style={styles.heroStat}>
                    <Text style={styles.heroStatVal}>{s.val}</Text>
                    <Text style={styles.heroStatLab}>{s.lab}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            {/* Family Ranking */}
            {ranked.length > 1 && (
              <>
                <Text style={styles.sectionTitle}>Family Ranking 🏆</Text>
                <View style={styles.rankCard}>
                  {ranked.map((child, idx) => {
                    const pts = child.progressData?.totalPoints || 0;
                    const mine = child.id === viewingChild?.id;
                    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                    return (
                      <TouchableOpacity
                        key={child.id}
                        onPress={() => setViewingChild(child)}
                        style={[styles.rankRow, mine && styles.rankRowActive]}
                      >
                        <Text style={styles.rankMedal}>{medal}</Text>
                        <Text style={styles.rankEmoji}>{child.avatar || '👦'}</Text>
                        <Text style={[styles.rankName, mine && { color: '#FFF' }]}>{child.name}</Text>
                        <Text style={[styles.rankPts, mine && { color: '#FFF' }]}>⭐ {pts}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Skills */}
            <Text style={styles.sectionTitle}>Skill Progress</Text>
            <View style={styles.skillsGrid}>
              {skills.map(skill => {
                const cat = viewingChild?.progressData?.[skill.key] || {};
                const score = cat.score || 0;
                const pct = Math.min((score / 500) * 100, 100);
                return (
                  <View key={skill.key} style={styles.skillCard}>
                    <View style={[styles.skillIconBg, { backgroundColor: skill.bg }]}>
                      <Text style={styles.skillEmoji}>{skill.emoji}</Text>
                    </View>
                    <Text style={styles.skillLabel}>{skill.label}</Text>
                    <View style={styles.skillBar}>
                      <LinearGradient
                        colors={[skill.color, skill.color + 'AA']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[styles.skillBarFill, { width: `${Math.max(pct, 4)}%` }]}
                      />
                    </View>
                    <Text style={[styles.skillScore, { color: skill.color }]}>{score} pts</Text>
                  </View>
                );
              })}
            </View>

            {/* Badges */}
            <Text style={styles.sectionTitle}>Badges & Rewards 🎖️</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesRow}>
              {(stats?.earnedActivityBadges?.length > 0 || stats?.specialBadges?.length > 0) ? (
                [...(stats?.specialBadges || []), ...(stats?.earnedActivityBadges || [])].map((b, i) => (
                  <View key={i} style={styles.badgeCard}>
                    <View style={styles.badgeIconBg}><Text style={{ fontSize: 28 }}>🏅</Text></View>
                    <Text style={styles.badgeName} numberOfLines={2}>{b}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.noBadgeCard}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>🎯</Text>
                  <Text style={styles.noBadgeText}>Complete activities to earn badges!</Text>
                </View>
              )}
            </ScrollView>

          </Animated.View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  scroll: { paddingHorizontal: 22, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 22 },
  title: { fontSize: 30, fontWeight: '900', color: D.textDark },
  subtitle: { fontSize: 14, color: D.textMed, fontWeight: '600', marginTop: 4 },

  switcher: { marginHorizontal: -22, paddingLeft: 22, marginBottom: 24 },
  switcherChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, backgroundColor: D.card, marginRight: 10, elevation: 2 },
  switcherChipActive: { backgroundColor: D.primary },
  switcherEmoji: { fontSize: 20 },
  switcherName: { fontSize: 12, fontWeight: '800', color: D.textMed },
  activeChipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF', marginLeft: 2 },

  loadingBox: { paddingVertical: 60, alignItems: 'center' },
  loadingText: { marginTop: 14, fontSize: 14, color: D.textMed, fontWeight: '700' },

  hero: { borderRadius: 28, padding: 24, marginBottom: 6, flexDirection: 'row', elevation: 6 },
  heroLeft: { flex: 1 },
  heroChildName: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 6 },
  heroStarLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '800' },
  heroStarCount: { color: '#FFF', fontSize: 52, fontWeight: '900', lineHeight: 58 },
  heroStarIcon: { fontSize: 22 },
  heroRight: { justifyContent: 'space-around', gap: 10 },
  heroStat: { alignItems: 'center' },
  heroStatVal: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  heroStatLab: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '800' },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: D.textDark, marginTop: 28, marginBottom: 14 },

  rankCard: { backgroundColor: D.card, borderRadius: 26, padding: 14, elevation: 3 },
  rankRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 18, marginBottom: 6 },
  rankRowActive: { backgroundColor: D.primary },
  rankMedal: { fontSize: 20, width: 32, textAlign: 'center' },
  rankEmoji: { fontSize: 22, marginHorizontal: 8 },
  rankName: { flex: 1, fontSize: 15, fontWeight: '800', color: D.textDark },
  rankPts: { fontSize: 13, fontWeight: '900', color: D.textDark },

  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  skillCard: { width: (width - 58) / 2, backgroundColor: D.card, borderRadius: 22, padding: 16, elevation: 3 },
  skillIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  skillEmoji: { fontSize: 22 },
  skillLabel: { fontSize: 13, fontWeight: '800', color: D.textMed, marginBottom: 10 },
  skillBar: { height: 8, backgroundColor: D.bg, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  skillBarFill: { height: '100%', borderRadius: 4 },
  skillScore: { fontSize: 12, fontWeight: '900', textAlign: 'right' },

  badgesRow: { marginHorizontal: -22, paddingLeft: 22 },
  badgeCard: { width: 100, backgroundColor: D.card, borderRadius: 22, padding: 14, marginRight: 12, alignItems: 'center', elevation: 2 },
  badgeIconBg: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFF9C4', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  badgeName: { fontSize: 10, fontWeight: '800', color: D.textMed, textAlign: 'center' },
  noBadgeCard: { padding: 30, backgroundColor: D.card, borderRadius: 22, width: width - 44, alignItems: 'center', elevation: 2 },
  noBadgeText: { color: D.textMed, fontWeight: '700', textAlign: 'center' },
});

export default ProgressScreen;





