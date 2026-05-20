// BrightPath - Profile Screen (StoryNest Design)
import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, StatusBar, ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { getOverallStats } from '../../utils/progressService';
import { BADGES, STORY_BADGES } from '../../data/badgesData';

const { width } = Dimensions.get('window');

const ROLE_META = {
  parent:    { emoji: '👨‍👩‍👧', label: 'PARENT',    colors: ['#1A9B8B','#4ECDC4'] },
  teacher:   { emoji: '👩‍🏫', label: 'TEACHER',   colors: ['#A78BFA','#7C3AED'] },
  caregiver: { emoji: '🤝',   label: 'CAREGIVER', colors: ['#FB923C','#EA580C'] },
  guest:     { emoji: '👦',   label: 'GUEST',     colors: ['#94A3B8','#64748B'] },
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ points: 0, badgesCount: 0, dailyPoints: 0, earnedActivityBadges: [], earnedStoryBadges: [] });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useFocusEffect(
    React.useCallback(() => {
      if (user?.uid) {
        getOverallStats(user.uid).then(s => setStats(s));
      }
    }, [user?.uid])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const meta = ROLE_META[user?.role] || ROLE_META.guest;
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'BP';

  const menuItems = [
    { emoji: '🔒', label: 'Privacy Policy', sub: 'How we protect your data', screen: 'PrivacyPolicy' },
    { emoji: '🔑', label: 'Change Password', sub: 'Update your account security', screen: 'ChangePassword' },
    { emoji: '✨', label: 'About BrightPath', sub: 'Our mission and vision', screen: 'AboutUs' },
    { emoji: '🤝', label: 'Contributors', sub: 'Specialists who supported us', screen: 'Contributors' },
    { emoji: '💬', label: 'Contact Us', sub: 'Get in touch with our team', screen: 'ContactUs' },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Hero Header */}
      <LinearGradient colors={meta.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <View style={s.blob1} /><View style={s.blob2} />

        <Animated.View style={[s.heroInner, { opacity: fadeAnim }]}>
          {/* Avatar */}
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>{initials}</Text>
            <View style={s.avatarBadge}><Text style={{ fontSize: 14 }}>{meta.emoji}</Text></View>
          </View>
          <Text style={s.heroName}>{user?.fullName || 'User'}</Text>
          <Text style={s.heroEmail}>{user?.email || ''}</Text>
          <View style={s.roleChip}>
            <Text style={s.roleChipTxt}>{meta.label}</Text>
          </View>
        </Animated.View>

        {/* Stats inside hero */}
        <Animated.View style={[s.heroStats, { opacity: fadeAnim }]}>
          {[
            { val: stats.points.toLocaleString(), lab: 'Total Stars', emoji: '⭐' },
            { val: stats.dailyPoints?.toString() || '0', lab: 'Today', emoji: '🔥' },
            { val: stats.badgesCount.toString(), lab: 'Badges', emoji: '🏅' },
          ].map((st, i) => (
            <View key={i} style={s.heroStat}>
              <Text style={s.heroStatEmoji}>{st.emoji}</Text>
              <Text style={s.heroStatVal}>{st.val}</Text>
              <Text style={s.heroStatLab}>{st.lab}</Text>
            </View>
          ))}
        </Animated.View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Badges Collection */}
          <Text style={s.sectionTitle}>Your Badges 🏆</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.badgeRow}>
            {[
              ...BADGES.filter(b => stats.earnedActivityBadges.includes(b.id)),
              ...STORY_BADGES.filter(b => stats.earnedStoryBadges.includes(b.level)),
            ].length > 0 ? (
              [...BADGES.filter(b => stats.earnedActivityBadges.includes(b.id)),
               ...STORY_BADGES.filter(b => stats.earnedStoryBadges.includes(b.level))].map((badge, i) => (
                <View key={i} style={s.badgeCard}>
                  <View style={[s.badgeCircle, { backgroundColor: badge.color || '#FFF9C4' }]}>
                    <Text style={s.badgeEmoji}>{badge.emoji || '🏅'}</Text>
                  </View>
                  <Text style={s.badgeLabel} numberOfLines={2}>{badge.title}</Text>
                </View>
              ))
            ) : (
              <View style={s.emptyBadge}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>🎯</Text>
                <Text style={s.emptyBadgeTxt}>Complete activities to earn badges!</Text>
              </View>
            )}
          </ScrollView>

          {/* Menu */}
          <Text style={s.sectionTitle}>Settings</Text>
          <View style={s.menuCard}>
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[s.menuRow, i < menuItems.length - 1 && s.menuBorder]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={s.menuIconBg}>
                  <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                </View>
                <View style={s.menuText}>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  <Text style={s.menuSub}>{item.sub}</Text>
                </View>
                <Text style={s.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity style={s.logoutBtn} onPress={logout}>
            <Text style={s.logoutTxt}>🚪  Sign Out</Text>
          </TouchableOpacity>

          <Text style={s.version}>BrightPath v2.0 · Designed for Every Child 🌱</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4FAF8' },

  hero: { paddingTop: 55, paddingBottom: 30, paddingHorizontal: 24, overflow: 'hidden' },
  blob1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)', top: -70, right: -70 },
  blob2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -50, left: -50 },

  heroInner: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', marginBottom: 12, position: 'relative' },
  avatarText: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  avatarBadge: { position: 'absolute', bottom: -4, right: -4, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  heroName: { color: '#FFF', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  heroEmail: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  roleChip: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 5 },
  roleChipTxt: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },

  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 22, padding: 16, justifyContent: 'space-around' },
  heroStat: { alignItems: 'center' },
  heroStatEmoji: { fontSize: 18, marginBottom: 4 },
  heroStatVal: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  heroStatLab: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '800', marginTop: 2 },

  scroll: { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 120 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1A2B3C', marginBottom: 14 },

  badgeRow: { marginHorizontal: -22, paddingLeft: 22, marginBottom: 30 },
  badgeCard: { width: 90, backgroundColor: '#FFF', borderRadius: 20, padding: 14, marginRight: 12, alignItems: 'center', elevation: 2 },
  badgeCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  badgeEmoji: { fontSize: 26 },
  badgeLabel: { fontSize: 9, fontWeight: '800', color: '#7F8C8D', textAlign: 'center' },
  emptyBadge: { width: width - 44, backgroundColor: '#FFF', borderRadius: 22, padding: 28, alignItems: 'center', elevation: 2 },
  emptyBadgeTxt: { color: '#7F8C8D', fontWeight: '700', textAlign: 'center' },

  menuCard: { backgroundColor: '#FFF', borderRadius: 26, overflow: 'hidden', elevation: 3, marginBottom: 20 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: '#EEF5F3' },
  menuIconBg: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EDF7F2', alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '800', color: '#1A2B3C' },
  menuSub: { fontSize: 11, color: '#7F8C8D', fontWeight: '600', marginTop: 2 },
  menuArrow: { fontSize: 24, color: '#C0EDE9', fontWeight: '300' },

  logoutBtn: { backgroundColor: '#FFF3F3', borderRadius: 22, paddingVertical: 18, alignItems: 'center', borderWidth: 1.5, borderColor: '#FFD4D4', marginBottom: 24 },
  logoutTxt: { color: '#FF6B6B', fontWeight: '900', fontSize: 15 },
  version: { textAlign: 'center', color: '#B2BEC3', fontSize: 11, fontWeight: '600' },
});

export default ProfileScreen;





