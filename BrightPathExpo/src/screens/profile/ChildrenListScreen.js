// BrightPath - Children List (StoryNest Design)
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated, Alert, Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getChildren, deleteChildProfile } from '../../firebase/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');

const D = {
  bg: '#EDF7F2',
  card: '#FFFFFF',
  primary: '#4ECDC4',
  primaryDark: '#3ABDB4',
  accent: '#6BCB77',
  yellow: '#FFD93D',
  coral: '#FF6B6B',
  textDark: '#2C3E50',
  textMed: '#7F8C8D',
  textLight: '#B2BEC3',
  border: '#E8F5F0',
};

const AUTISM_COLORS = {
  1: '#4ECDC4',
  2: '#6BCB77',
  3: '#FFD93D',
};

const ChildrenListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { activeChild, setActiveChild, children, setChildren } = useApp();
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    if (user?.uid && user.uid !== 'guest') {
      const result = await getChildren(user.uid);
      if (result.success) setChildren(result.children);
    }
    setLoading(false);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  const handleSelect = (child) => {
    setActiveChild(child);
    navigation.navigate('MainTabs');
  };

  const handleDelete = (child) => {
    Alert.alert(
      '🗑️ Remove Profile',
      `Remove ${child.name}'s profile? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteChildProfile(child.id);
            setChildren(prev => prev.filter(c => c.id !== child.id));
            if (activeChild?.id === child.id) setActiveChild(null);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={D.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Your Children</Text>
          <Text style={styles.subtitle}>{children.length} profiles in your account</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateChildProfile')}
        >
          <LinearGradient colors={[D.primary, D.primaryDark]} style={styles.addBtnGrad}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[D.primary]} tintColor={D.primary} />
          }
        >
          {/* Add New Card (prominent) */}
          <TouchableOpacity
            style={styles.addCard}
            onPress={() => navigation.navigate('CreateChildProfile')}
          >
            <LinearGradient colors={[D.primary + '18', D.accent + '18']} style={styles.addCardInner}>
              <View style={styles.addCardCircle}>
                <Text style={styles.addCardPlus}>+</Text>
              </View>
              <View>
                <Text style={styles.addCardTitle}>Add New Child</Text>
                <Text style={styles.addCardSub}>Create a new learning profile</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.centerBox}>
              <Text style={styles.loadingText}>Loading profiles...</Text>
            </View>
          ) : children.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 60, marginBottom: 16 }}>👶</Text>
              <Text style={styles.emptyTitle}>No Profiles Yet</Text>
              <Text style={styles.emptyBody}>Tap the card above to add your first child profile.</Text>
            </View>
          ) : (
            children.map((child) => {
              const color = AUTISM_COLORS[child.autismLevel] || D.primary;
              const pts = child.progressData?.totalPoints || 0;
              const badges = child.progressData?.badgesCount || 0;
              const levels = child.progressData?.levelsCompleted || 0;
              const isActive = activeChild?.id === child.id;

              return (
                <View key={child.id} style={styles.childCard}>
                  <TouchableOpacity
                    onPress={() => handleSelect(child)}
                    activeOpacity={0.85}
                  >
                    {isActive && (
                      <View style={styles.activeBanner}>
                        <Text style={styles.activeBannerText}>✓ Currently Active</Text>
                      </View>
                    )}
                    <View style={styles.childCardTop}>
                      {/* Avatar */}
                      <View style={[styles.avatarCircle, { backgroundColor: color + '20', borderColor: color + '40' }]}>
                        <Text style={styles.avatarEmoji}>{child.avatar || '👦'}</Text>
                        {isActive && (
                          <View style={[styles.activeRing, { borderColor: color }]} />
                        )}
                      </View>

                      {/* Info */}
                      <View style={styles.childInfo}>
                        <Text style={styles.childName}>{child.name}</Text>
                        <View style={styles.childMeta}>
                          <View style={[styles.levelChip, { backgroundColor: color + '20' }]}>
                            <Text style={[styles.levelChipText, { color }]}>Level {child.autismLevel || 1}</Text>
                          </View>
                          <Text style={styles.childAge}>Age {child.age}</Text>
                          <Text style={styles.childGender}>{child.gender === 'male' ? '👦' : '👧'}</Text>
                        </View>
                        {/* Mini stats */}
                        <View style={styles.miniStats}>
                          <Text style={styles.miniStat}>⭐ {pts}</Text>
                          <Text style={styles.miniStat}>🎮 {levels}</Text>
                          <Text style={styles.miniStat}>🏅 {badges}</Text>
                        </View>
                      </View>

                      <Text style={styles.chevron}>›</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Actions */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => navigation.navigate('CreateChildProfile', { editChild: child })}
                    >
                      <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(child)}
                    >
                      <Text style={styles.deleteBtnText}>🗑️ Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: D.card, alignItems: 'center', justifyContent: 'center',
    elevation: 2,
  },
  backIcon: { fontSize: 22, color: D.primary, fontWeight: '900' },
  title: { fontSize: 22, fontWeight: '900', color: D.textDark, flex: 1 },
  subtitle: { fontSize: 12, color: D.textMed, fontWeight: '600' },
  addBtn: { borderRadius: 20, overflow: 'hidden', elevation: 3 },
  addBtnGrad: { paddingHorizontal: 16, paddingVertical: 9 },
  addBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 },

  scroll: { padding: 22, paddingBottom: 130 },

  addCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 22, elevation: 2, borderWidth: 1.5, borderColor: D.primary + '30', borderStyle: 'dashed' },
  addCardInner: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  addCardCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: D.card, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  addCardPlus: { fontSize: 30, color: D.primary, fontWeight: '300', marginTop: -2 },
  addCardTitle: { fontSize: 16, fontWeight: '900', color: D.textDark },
  addCardSub: { fontSize: 12, color: D.textMed, fontWeight: '600', marginTop: 2 },

  centerBox: { paddingVertical: 40, alignItems: 'center' },
  loadingText: { color: D.textMed, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: D.textDark, marginBottom: 8 },
  emptyBody: { fontSize: 14, color: D.textMed, textAlign: 'center', fontWeight: '600', paddingHorizontal: 30 },

  childCard: { backgroundColor: D.card, borderRadius: 26, marginBottom: 18, elevation: 4, overflow: 'hidden' },
  activeBanner: { backgroundColor: D.primary, paddingVertical: 6, paddingHorizontal: 20 },
  activeBannerText: { color: '#FFF', fontWeight: '900', fontSize: 11 },

  childCardTop: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  avatarCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 2, position: 'relative' },
  avatarEmoji: { fontSize: 36 },
  activeRing: { position: 'absolute', top: -3, left: -3, right: -3, bottom: -3, borderRadius: 38, borderWidth: 3 },

  childInfo: { flex: 1 },
  childName: { fontSize: 18, fontWeight: '900', color: D.textDark, marginBottom: 6 },
  childMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  levelChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  levelChipText: { fontSize: 10, fontWeight: '900' },
  childAge: { fontSize: 12, color: D.textMed, fontWeight: '700' },
  childGender: { fontSize: 14 },
  miniStats: { flexDirection: 'row', gap: 12 },
  miniStat: { fontSize: 12, fontWeight: '800', color: D.textMed },
  chevron: { fontSize: 28, color: D.textLight, fontWeight: '300' },

  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: D.border },
  editBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRightWidth: 1, borderRightColor: D.border },
  editBtnText: { fontSize: 13, fontWeight: '800', color: D.primary },
  deleteBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  deleteBtnText: { fontSize: 13, fontWeight: '800', color: D.coral },
});

export default ChildrenListScreen;





