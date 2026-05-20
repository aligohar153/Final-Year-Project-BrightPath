// BrightPath - Child Profile Card Component
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/colors';
import { AUTISM_LEVELS } from '../utils/constants';

const AVATAR_EMOJIS = {
  male: ['👦', '🧒', '👱‍♂️', '🧑'],
  female: ['👧', '🧒‍♀️', '👱‍♀️', '🧑‍🦰'],
  other: ['🧒', '🧑', '👦', '👧'],
};

const ChildCard = ({ child, onPress, isActive = false, style = {} }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const level = AUTISM_LEVELS[`LEVEL_${child.autismLevel}`] || AUTISM_LEVELS.LEVEL_1;
  const avatarList = AVATAR_EMOJIS[child.gender] || AVATAR_EMOJIS.other;
  const avatar = avatarList[child.age % avatarList.length] || '🧒';

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const blobStyle = {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 40,
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.card, blobStyle, isActive && styles.activeCard]}>
        
        {/* Avatar Area */}
        <View style={[styles.avatarCircle, { backgroundColor: level.color + '15' }]}>
          <Text style={styles.avatarEmoji}>{avatar}</Text>
        </View>

        {/* Info Area */}
        <View style={styles.info}>
          <Text style={styles.name}>{child.name ? child.name.toUpperCase() : 'CHILD'}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.age}>Age {child.age}</Text>
            <View style={[styles.levelDot, { backgroundColor: level.color }]} />
            <Text style={[styles.levelText, { color: level.color }]}>{level.label}</Text>
          </View>
        </View>

        {isActive && <View style={styles.activeIndicator} />}
        {!isActive && <Text style={styles.arrow}>→</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  activeCard: {
    borderColor: '#4D96FF',
    borderWidth: 2,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  avatarEmoji: { fontSize: 32 },
  info: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: '900',
    color: '#333',
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  age: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
  },
  levelDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6BCB77',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  arrow: {
    fontSize: 20,
    color: '#EEE',
    fontWeight: '900',
  },
});

export default ChildCard;





