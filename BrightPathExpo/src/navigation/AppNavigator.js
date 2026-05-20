// BrightPath - App Navigator (root)
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import IntroScreen from '../screens/auth/IntroScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PuzzleScreen from '../screens/auth/PuzzleScreen';
import RegistrationFormScreen from '../screens/auth/RegistrationFormScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Profile Screens
import ChildrenListScreen from '../screens/profile/ChildrenListScreen';
import CreateChildProfileScreen from '../screens/profile/CreateChildProfileScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import AboutUsScreen from '../screens/profile/AboutUsScreen';
import ContactUsScreen from '../screens/profile/ContactUsScreen';
import ContributorsScreen from '../screens/profile/ContributorsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';

// Home
import HomeScreen from '../screens/home/HomeScreen';
import StoryPlayerScreen from '../screens/home/StoryPlayerScreen';
import ParentDashboardScreen from '../screens/dashboard/ParentDashboardScreen';


// Feature Screens
import LanguageLearningScreen from '../screens/features/LanguageLearningScreen';
import BalloonPopActivity from '../screens/features/BalloonPopActivity';
import ColorMatchActivity from '../screens/features/ColorMatchActivity';
import MiniPianoActivity from '../screens/features/MiniPianoActivity';
import ShapesActivity from '../screens/features/ShapesActivity';
import DrumKitActivity from '../screens/features/DrumKitActivity';
import CognitiveSkillsScreen from '../screens/features/CognitiveSkillsScreen';
import EmotionRecognitionScreen from '../screens/features/EmotionRecognitionScreen';
import SocialScenariosScreen from '../screens/features/SocialScenariosScreen';
import AllActivitiesScreen from '../screens/features/AllActivitiesScreen';
import ActivityLevelScreen from '../screens/features/ActivityLevelScreen';
import AlphabetActivity from '../screens/features/AlphabetActivity';
import NumbersActivity from '../screens/features/NumbersActivity';
import EmotionsActivity from '../screens/features/EmotionsActivity';
import SocialActivity from '../screens/features/SocialActivity';
import MusicTherapyActivity from '../screens/features/MusicTherapyActivity';
import PatternActivity from '../screens/features/PatternActivity';
import MemoryGameActivity from '../screens/features/MemoryGameActivity';
import ColorSortingActivity from '../screens/features/ColorSortingActivity';
import BodyPartsActivity from '../screens/features/BodyPartsActivity';
import MorningRoutineActivity from '../screens/features/MorningRoutineActivity';
import NightRoutineActivity from '../screens/features/NightRoutineActivity';
import SafetySkillsActivity from '../screens/features/SafetySkillsActivity';
import CommunityHelpersActivity from '../screens/features/CommunityHelpersActivity';
import WeatherActivity from '../screens/features/WeatherActivity';
import FruitsVegActivity from '../screens/features/FruitsVegActivity';
import TransportActivity from '../screens/features/TransportActivity';
import SpaceActivity from '../screens/features/SpaceActivity';
import TellingTimeActivity from '../screens/features/TellingTimeActivity';
import GardeningActivity from '../screens/features/GardeningActivity';
import OceanCleanupActivity from '../screens/features/OceanCleanupActivity';
import UnderSeaActivity from '../screens/features/UnderSeaActivity';
import AnimalSoundsActivity from '../screens/features/AnimalSoundsActivity';
import YogaActivity from '../screens/features/YogaActivity';
import HealthyEatingActivity from '../screens/features/HealthyEatingActivity';
import DragDropActivity from '../screens/features/DragDropActivity';
import SocialStoriesActivity from '../screens/features/SocialStoriesActivity';
import DailyRoutineScreen from '../screens/features/DailyRoutineScreen';
import ProgressTrackingScreen from '../screens/features/ProgressTrackingScreen';
import CustomContentScreen from '../screens/features/CustomContentScreen';

import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';

const Stack = createStackNavigator();

const screenOptions = {
  headerShown: false,
  cardStyleInterpolator: ({ current, layouts }) => ({
    cardStyle: {
      opacity: current.progress,
      transform: [
        {
          scale: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1],
          }),
        },
      ],
    },
  }),
};

import MainTabNavigator from './MainTabNavigator';

const AppNavigator = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { activeChild, loadActiveChild } = useApp();

  useEffect(() => {
    loadActiveChild();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!isAuthenticated ? (
          // ─── Auth Stack ───────────────────────────────────────────────────
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Intro" component={IntroScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Puzzle" component={PuzzleScreen} />
            <Stack.Screen name="RegistrationForm" component={RegistrationFormScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          // ─── Main App Stack ───────────────────────────────────────────────
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
            />
            <Stack.Screen name="ChildrenList" component={ChildrenListScreen} />
            <Stack.Screen name="CreateChildProfile" component={CreateChildProfileScreen} />

            {/* Feature Screens */}
            <Stack.Screen name="LanguageLearning" component={LanguageLearningScreen} />
            <Stack.Screen name="CognitiveSkills" component={CognitiveSkillsScreen} />
            <Stack.Screen name="EmotionRecognition" component={EmotionRecognitionScreen} />
            <Stack.Screen name="SocialScenarios" component={SocialScenariosScreen} />
            <Stack.Screen name="AllActivities" component={AllActivitiesScreen} />
            <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
            <Stack.Screen name="AlphabetActivity" component={AlphabetActivity} />
            <Stack.Screen name="NumbersActivity" component={NumbersActivity} />
            <Stack.Screen name="EmotionsActivity" component={EmotionsActivity} />
            <Stack.Screen name="SocialActivity" component={SocialActivity} />
            <Stack.Screen name="MusicTherapyActivity" component={MusicTherapyActivity} />
            <Stack.Screen name="PatternActivity" component={PatternActivity} />
            <Stack.Screen name="MemoryGameActivity" component={MemoryGameActivity} />
            <Stack.Screen name="ColorSortingActivity" component={ColorSortingActivity} />
            <Stack.Screen name="BodyPartsActivity" component={BodyPartsActivity} />
            <Stack.Screen name="MorningRoutineActivity" component={MorningRoutineActivity} />
            <Stack.Screen name="NightRoutineActivity" component={NightRoutineActivity} />
            <Stack.Screen name="SafetySkillsActivity" component={SafetySkillsActivity} />
            <Stack.Screen name="CommunityHelpersActivity" component={CommunityHelpersActivity} />
            <Stack.Screen name="WeatherActivity" component={WeatherActivity} />
            <Stack.Screen name="FruitsVegActivity" component={FruitsVegActivity} />
            <Stack.Screen name="TransportActivity" component={TransportActivity} />
            <Stack.Screen name="SpaceActivity" component={SpaceActivity} />
            <Stack.Screen name="TellingTimeActivity" component={TellingTimeActivity} />
            <Stack.Screen name="GardeningActivity" component={GardeningActivity} />
            <Stack.Screen name="OceanCleanupActivity" component={OceanCleanupActivity} />
            <Stack.Screen name="UnderSeaActivity" component={UnderSeaActivity} />
            <Stack.Screen name="AnimalSoundsActivity" component={AnimalSoundsActivity} />
            <Stack.Screen name="YogaActivity" component={YogaActivity} />
            <Stack.Screen name="HealthyEatingActivity" component={HealthyEatingActivity} />
            <Stack.Screen name="DragDropActivity" component={DragDropActivity} />
            <Stack.Screen name="SocialStories" component={SocialStoriesActivity} />
            <Stack.Screen name="DailyRoutine" component={DailyRoutineScreen} />
            <Stack.Screen name="ProgressTracking" component={ProgressTrackingScreen} />
            <Stack.Screen name="CustomContent" component={CustomContentScreen} />
            <Stack.Screen name="StoryPlayer" component={StoryPlayerScreen} />
            <Stack.Screen name="BalloonPop" component={BalloonPopActivity} />
            <Stack.Screen name="ColorMatch" component={ColorMatchActivity} />
            <Stack.Screen name="MiniPiano" component={MiniPianoActivity} />
            <Stack.Screen name="DrumKit" component={DrumKitActivity} />
            <Stack.Screen name="ShapesActivity" component={ShapesActivity} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
            <Stack.Screen name="ContactUs" component={ContactUsScreen} />
            <Stack.Screen name="Contributors" component={ContributorsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AppNavigator;





