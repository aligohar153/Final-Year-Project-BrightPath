import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncAllStats } from '../firebase/firestoreService';

const CHILDREN_COLLECTION = 'children';

/**
 * Helper to generate user-specific keys
 */
const getUKey = (userId, key) => `${userId}_${key}`;

/**
 * Sync local progress to SQLite database
 */
export const syncProgressToCloud = async (childId) => {
  try {
    const stats = await getOverallStats(childId);
    await syncAllStats(childId, stats);
  } catch (e) {
    // Fail silently – data is safe locally
    console.log('Local stats sync skipped:', e.message);
  }
};

/**
 * Call this when a level is completed.
 * Saves progress so the next level unlocks.
 */
export const completeLevel = async (activityId, completedLevel, userId) => {
  if (!userId) return;
  try {
    const key = getUKey(userId, `progress_${activityId}`);
    const stored = await AsyncStorage.getItem(key);
    const current = stored ? parseInt(stored, 10) : 1;
    const next = completedLevel + 1;
    
    if (next > current) {
      await AsyncStorage.setItem(key, String(Math.min(next, 20)));
      // Award 50 points per level
      await addPoints(50, userId);
      // Sync total to cloud
      await syncProgressToCloud(userId);
    }
  } catch (err) {
    console.log('Progress save error:', err);
  }
};

/**
 * Total Points Management
 */
export const addPoints = async (pts, userId) => {
  if (!userId) return;
  try {
    // Total Points
    const keyTotal = getUKey(userId, 'total_points');
    const current = await AsyncStorage.getItem(keyTotal);
    const total = (current ? parseInt(current, 10) : 0) + pts;
    await AsyncStorage.setItem(keyTotal, String(total));

    // Daily Points
    const today = new Date().toDateString();
    const keyDate = getUKey(userId, 'last_points_date');
    const keyDaily = getUKey(userId, 'daily_points');
    
    const lastDate = await AsyncStorage.getItem(keyDate);
    let dailyTotal = 0;

    if (lastDate === today) {
      const storedDaily = await AsyncStorage.getItem(keyDaily);
      dailyTotal = (storedDaily ? parseInt(storedDaily, 10) : 0) + pts;
    } else {
      dailyTotal = pts;
      await AsyncStorage.setItem(keyDate, today);
    }
    await AsyncStorage.setItem(keyDaily, String(dailyTotal));
  } catch (e) { console.log(e); }
};

export const getTotalPoints = async (userId) => {
  if (!userId) return 0;
  const current = await AsyncStorage.getItem(getUKey(userId, 'total_points'));
  return current ? parseInt(current, 10) : 0;
};

export const getDailyPoints = async (userId) => {
  if (!userId) return 0;
  const today = new Date().toDateString();
  const lastDate = await AsyncStorage.getItem(getUKey(userId, 'last_points_date'));
  if (lastDate === today) {
    const current = await AsyncStorage.getItem(getUKey(userId, 'daily_points'));
    return current ? parseInt(current, 10) : 0;
  }
  return 0;
};

/**
 * Get overall progress stats
 */
export const getOverallStats = async (userId) => {
  if (!userId) return { points: 0, levelsCompleted: 0, storiesCompleted: 0, badgesCount: 0 };
  try {
    const activities = [
      'alphabet', 'numbers', 'emotions', 'social', 'music', 'patterns', 'memory', 'colorsort',
      'shapes', 'body', 'morning', 'night', 'safety', 'helpers', 'weather', 'food', 'transport',
      'space', 'time', 'gardening', 'ocean', 'sea', 'animal_sounds', 'yoga', 'eating', 'drag_drop'
    ];
    
    let totalLevels = 0;
    let earnedActivityBadges = [];
    for (const id of activities) {
      const p = await AsyncStorage.getItem(getUKey(userId, `progress_${id}`));
      const val = p ? parseInt(p, 10) : 1;
      totalLevels += (val - 1);
      if (val >= 20) {
        earnedActivityBadges.push(id);
      }
    }

    const storyProgress = await AsyncStorage.getItem(getUKey(userId, 'completed_stories'));
    const storiesCompletedList = storyProgress ? JSON.parse(storyProgress) : [];

    const specialBadgesStored = await AsyncStorage.getItem(getUKey(userId, 'special_badges'));
    const specialBadges = specialBadgesStored ? JSON.parse(specialBadgesStored) : [];

    return {
      points: await getTotalPoints(userId),
      dailyPoints: await getDailyPoints(userId),
      levelsCompleted: totalLevels,
      storiesCompleted: storiesCompletedList.length,
      earnedActivityBadges,
      earnedStoryBadges: storiesCompletedList,
      specialBadges,
      badgesCount: earnedActivityBadges.length + storiesCompletedList.length + specialBadges.length,
      streak: 5 
    };
  } catch (e) {
    return { points: 0, levelsCompleted: 0, storiesCompleted: 0, badgesCount: 0, streak: 0, specialBadges: [] };
  }
};

export const completeStory = async (storyId, userId) => {
  if (!userId) return;
  try {
    const key = getUKey(userId, 'completed_stories');
    const stored = await AsyncStorage.getItem(key);
    let list = stored ? JSON.parse(stored) : [];
    if (!list.includes(storyId)) {
      list.push(storyId);
      await AsyncStorage.setItem(key, JSON.stringify(list));
      await addPoints(100, userId);
    }
  } catch (e) { console.log(e); }
};

/**
 * Award special achievement badges (e.g. "Perfect Routine")
 */
export const awardSpecialBadge = async (badgeId, userId) => {
  if (!userId) return false;
  try {
    const key = getUKey(userId, 'special_badges');
    const stored = await AsyncStorage.getItem(key);
    let list = stored ? JSON.parse(stored) : [];
    if (!list.includes(badgeId)) {
      list.push(badgeId);
      await AsyncStorage.setItem(key, JSON.stringify(list));
      await addPoints(200, userId);
      return true;
    }
    return false;
  } catch (e) { console.log(e); return false; }
};





