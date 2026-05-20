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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { ACTIVITIES_DATA } from '../../data/activitiesData';

const { width } = Dimensions.get('window');

const AllActivitiesScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const renderActivity = (activity) => (
    <TouchableOpacity 
      key={activity.id} 
      style={styles.activityCard}
      onPress={() => navigation.navigate('ActivityLevel', { activity })}
    >
      <View style={[styles.iconCircle, { backgroundColor: activity.color + '15' }]}>
        <Text style={styles.activityEmoji}>{activity.emoji}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.activityLabel}>{activity.title}</Text>
        <Text style={styles.levelCount}>20 CHALLENGING LEVELS</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={[styles.arrow, { color: activity.color }]}>❯</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F9FF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backEmoji}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>All Activities</Text>
        <Text style={styles.subtitle}>Explore {ACTIVITIES_DATA.length} games & lessons</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
          {ACTIVITIES_DATA.map(renderActivity)}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  header: { paddingTop: 60, paddingHorizontal: 25, marginBottom: 20 },
  backBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2, marginBottom: 20 },
  backEmoji: { fontSize: 20 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.textDark },
  subtitle: { fontSize: 16, color: COLORS.textMedium, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 120 },
  listContainer: { gap: 15 },
  activityCard: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF', 
    borderRadius: 25, 
    padding: 15, 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconCircle: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  activityEmoji: { fontSize: 32 },
  textContainer: { flex: 1 },
  activityLabel: { fontSize: 16, fontWeight: '900', color: COLORS.textDark },
  levelCount: { fontSize: 9, fontWeight: '800', color: COLORS.textLight, marginTop: 4, letterSpacing: 0.5 },
  arrowContainer: { width: 30, alignItems: 'center' },
  arrow: { fontSize: 18, fontWeight: '900', opacity: 0.5 },
});

export default AllActivitiesScreen;





