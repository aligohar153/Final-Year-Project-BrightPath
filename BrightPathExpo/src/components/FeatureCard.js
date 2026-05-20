// BrightPath - Feature Card Component
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 80) / 3; // 3 columns in landscape

const FeatureCard = ({ feature, onPress, isLocked = false }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  // Organic shape based on feature ID or index for variety
  const blobStyle = {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 45,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 30,
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={isLocked ? null : onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.card, 
          blobStyle,
          isLocked && { opacity: 0.5 }
        ]}>
        
        <View style={styles.content}>
          <Text style={styles.emoji}>{feature.emoji}</Text>
          <Text style={[styles.title, { color: feature.color || '#333' }]}>
            {feature.title.toUpperCase()}
          </Text>
        </View>

        {isLocked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  card: {
    width: 105,
    height: 105,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontWeight: '900',
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 1,
  },
  lockOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 4,
    borderRadius: 10,
  },
  lockIcon: {
    fontSize: 10,
  },
});

export default FeatureCard;





