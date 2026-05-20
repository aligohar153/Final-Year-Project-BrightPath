import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View, Dimensions, TouchableOpacity, Animated } from 'react-native';
import HomeScreen from '../screens/home/HomeScreen';
import AllActivitiesScreen from '../screens/features/AllActivitiesScreen';
import StoriesScreen from '../screens/home/StoriesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ArcadeScreen from '../screens/features/ArcadeScreen';
import ChildrenListScreen from '../screens/profile/ChildrenListScreen';
import ProgressTrackingScreen from '../screens/features/ProgressTrackingScreen';
import ParentDashboardScreen from '../screens/dashboard/ParentDashboardScreen';
import { COLORS } from '../utils/colors';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

// Dynamic theme color mapper for individual tabs
const getTabColors = (routeName) => {
  switch (routeName) {
    case 'Home':
    case 'ParentDashboard':
      return { active: '#4D96FF', bg: '#4D96FF14' };
    case 'Activities':
    case 'Analytics':
      return { active: '#6BCB77', bg: '#6BCB7714' };
    case 'Arcade':
    case 'ChildrenList':
      return { active: '#FF9F1C', bg: '#FF9F1C14' };
    case 'Stories':
    case 'Profile':
      return { active: '#FF6BB5', bg: '#FF6BB514' };
    default:
      return { active: COLORS.primary, bg: `${COLORS.primary}14` };
  }
};

// Custom animated icon component for bottom tab items
const TabIconInner = ({ emoji, label, focused, routeName }) => {
  const colors = getTabColors(routeName);
  
  // Spring animations for premium scale and float transition
  const scaleAnim = useRef(new Animated.Value(focused ? 1.15 : 1)).current;
  const translateAnim = useRef(new Animated.Value(focused ? -5 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.22 : 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(translateAnim, {
        toValue: focused ? -6 : 0,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      })
    ]).start();
  }, [focused, scaleAnim, translateAnim]);

  const activeColorStyle = { color: colors.active };
  const inactiveColorStyle = { color: COLORS.textLight };

  return (
    <View style={styles.tabIcon}>
      <Animated.View style={[
        styles.iconWrapper, 
        focused && { backgroundColor: colors.bg },
        { transform: [{ scale: scaleAnim }, { translateY: translateAnim }] }
      ]}>
        <Text style={[styles.emoji, focused ? styles.emojiActive : styles.emojiInactive]}>{emoji}</Text>
      </Animated.View>
      <Text style={[
        styles.labelText, 
        focused ? activeColorStyle : inactiveColorStyle,
        focused ? styles.labelActive : styles.labelInactive
      ]}>
        {label}
      </Text>
    </View>
  );
};

// Custom Tab Bar component with sliding top indicator
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const totalTabs = state.routes.length;
  const tabWidth = (width - 40) / totalTabs;
  
  // Animated value for sliding top indicator
  const slideAnim = useRef(new Animated.Value(state.index * tabWidth)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index * tabWidth,
      tension: 75,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [state.index, tabWidth, slideAnim]);

  const currentRouteName = state.routes[state.index].name;
  const currentColors = getTabColors(currentRouteName);

  const dynamicPillStyle = { 
    backgroundColor: currentColors.active,
    shadowColor: currentColors.active,
  };

  return (
    <View style={styles.tabBarContainer}>
      {/* Dynamic top slider indicator bar */}
      <Animated.View 
        style={[
          styles.indicator, 
          { 
            width: tabWidth, 
            transform: [{ translateX: slideAnim }] 
          }
        ]}
      >
        <View style={[styles.indicatorPill, dynamicPillStyle]} />
      </Animated.View>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Map route names to emojis and standard display labels
        let emoji = '🏠';
        let friendlyLabel = label;
        if (route.name === 'Home') { emoji = '🏠'; friendlyLabel = 'Home'; }
        else if (route.name === 'Activities') { emoji = '🧩'; friendlyLabel = 'Games'; }
        else if (route.name === 'Arcade') { emoji = '🕹️'; friendlyLabel = 'Arcade'; }
        else if (route.name === 'Stories') { emoji = '📖'; friendlyLabel = 'Stories'; }
        else if (route.name === 'ParentDashboard') { emoji = '📊'; friendlyLabel = 'Dashboard'; }
        else if (route.name === 'ChildrenList') { emoji = '🧒'; friendlyLabel = 'Children'; }
        else if (route.name === 'Analytics') { emoji = '📈'; friendlyLabel = 'Analytics'; }
        else if (route.name === 'Profile') { emoji = '👤'; friendlyLabel = 'Profile'; }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.8}
          >
            <TabIconInner emoji={emoji} label={friendlyLabel} focused={isFocused} routeName={route.name} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const MainTabNavigator = () => {
  const { activeChild } = useApp();

  // If a child is selected, show the Child's Learning Hub bottom navigation
  if (activeChild) {
    return (
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Activities" component={AllActivitiesScreen} />
        <Tab.Screen name="Arcade" component={ArcadeScreen} />
        <Tab.Screen name="Stories" component={StoriesScreen} />
      </Tab.Navigator>
    );
  }

  // If no child is selected, show Parent/Teacher Dashboard bottom navigation
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="ParentDashboard" component={ParentDashboardScreen} />
      <Tab.Screen name="ChildrenList" component={ChildrenListScreen} />
      <Tab.Screen name="Analytics" component={ProgressTrackingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 78,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#081F3E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emoji: {
    fontSize: 22,
  },
  emojiActive: {
    opacity: 1,
  },
  emojiInactive: {
    opacity: 0.65,
  },
  labelText: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  labelActive: {
    fontWeight: '900',
  },
  labelInactive: {
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorPill: {
    width: 32,
    height: 4,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default MainTabNavigator;





