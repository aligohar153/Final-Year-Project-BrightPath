import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { getDb } from './sqliteDb';

// ─── Children CRUD ────────────────────────────────────────────────────────────

export const createChildProfile = async (parentUid, childData) => {
  try {
    const db = await getDb();
    const id = 'chd_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const progressData = {
      totalPoints: 0,
      levelsCompleted: 0,
      storiesCompleted: 0,
      badgesCount: 0,
      specialBadges: [],
      language: { score: 0, sessionsCompleted: 0, badges: [] },
      cognitive: { score: 0, sessionsCompleted: 0, badges: [] },
      emotion: { score: 0, sessionsCompleted: 0, badges: [] },
      social: { score: 0, sessionsCompleted: 0, badges: [] },
      routine: { score: 0, sessionsCompleted: 0, badges: [] },
      motor: { score: 0, sessionsCompleted: 0, badges: [] },
    };

    await db.runAsync(
      'INSERT INTO children (id, parentUid, name, age, gender, condition, progressData, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        parentUid,
        childData.name || '',
        parseInt(childData.age, 10) || 0,
        childData.gender || '',
        childData.condition || '',
        JSON.stringify(progressData),
        now,
        now
      ]
    );

    // Refresh cached list
    await getChildren(parentUid);

    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getChildren = async (parentUid) => {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync('SELECT * FROM children WHERE parentUid = ?', [parentUid]);

    const children = rows.map(row => {
      let progress = {};
      try {
        progress = JSON.parse(row.progressData || '{}');
      } catch (e) {
        console.log('Error parsing progressData:', e);
      }
      return {
        id: row.id,
        parentUid: row.parentUid,
        name: row.name,
        age: row.age,
        gender: row.gender,
        condition: row.condition,
        progressData: progress,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });

    // Cache locally
    await AsyncStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
    return { success: true, children };
  } catch (error) {
    console.error('Fetch children error:', error);
    // Return cached
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.CHILDREN);
    return {
      success: true,
      children: cached ? JSON.parse(cached) : [],
      offline: true,
    };
  }
};

export const updateChildProfile = async (childId, updates) => {
  try {
    const db = await getDb();
    const child = await db.getFirstAsync('SELECT * FROM children WHERE id = ?', [childId]);
    if (!child) return { success: false, error: 'Child profile not found' };

    const name = updates.name !== undefined ? updates.name : child.name;
    const age = updates.age !== undefined ? parseInt(updates.age, 10) : child.age;
    const gender = updates.gender !== undefined ? updates.gender : child.gender;
    const condition = updates.condition !== undefined ? updates.condition : child.condition;
    const now = new Date().toISOString();

    await db.runAsync(
      'UPDATE children SET name = ?, age = ?, gender = ?, condition = ?, updatedAt = ? WHERE id = ?',
      [name, age, gender, condition, now, childId]
    );

    // Refresh cache if parentUid is available
    if (child.parentUid) {
      await getChildren(child.parentUid);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteChildProfile = async (childId) => {
  try {
    const db = await getDb();
    const child = await db.getFirstAsync('SELECT * FROM children WHERE id = ?', [childId]);
    
    await db.runAsync('DELETE FROM children WHERE id = ?', [childId]);
    await db.runAsync('DELETE FROM routines WHERE childId = ?', [childId]);
    await db.runAsync('DELETE FROM content WHERE childId = ?', [childId]);

    if (child && child.parentUid) {
      await getChildren(child.parentUid);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ─── Progress Tracking ────────────────────────────────────────────────────────

export const updateProgress = async (childId, feature, progressUpdate) => {
  try {
    const db = await getDb();
    const child = await db.getFirstAsync('SELECT * FROM children WHERE id = ?', [childId]);
    if (!child) return { success: false, error: 'Child profile not found' };

    const progress = JSON.parse(child.progressData || '{}');
    if (!progress[feature]) {
      progress[feature] = [progressUpdate];
    } else if (Array.isArray(progress[feature])) {
      progress[feature].push(progressUpdate);
    } else {
      // If it is initial progress layout object
      if (!progress[feature].history) progress[feature].history = [];
      progress[feature].history.push(progressUpdate);
      if (progressUpdate.score) {
        progress[feature].score = (progress[feature].score || 0) + progressUpdate.score;
      }
      progress[feature].sessionsCompleted = (progress[feature].sessionsCompleted || 0) + 1;
    }

    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE children SET progressData = ?, updatedAt = ? WHERE id = ?',
      [JSON.stringify(progress), now, childId]
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const syncAllStats = async (childId, stats) => {
  try {
    const db = await getDb();
    const child = await db.getFirstAsync('SELECT * FROM children WHERE id = ?', [childId]);
    if (!child) return { success: false, error: 'Child profile not found' };

    const progress = JSON.parse(child.progressData || '{}');
    progress.totalPoints = stats.points;
    progress.levelsCompleted = stats.levelsCompleted;
    progress.storiesCompleted = stats.storiesCompleted;
    progress.badgesCount = stats.badgesCount;
    progress.specialBadges = stats.specialBadges || [];

    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE children SET progressData = ?, updatedAt = ? WHERE id = ?',
      [JSON.stringify(progress), now, childId]
    );

    return { success: true };
  } catch (error) {
    console.error('Sync stats error:', error);
    return { success: false, error: error.message };
  }
};

export const getProgress = async (childId) => {
  try {
    const db = await getDb();
    const child = await db.getFirstAsync('SELECT * FROM children WHERE id = ?', [childId]);
    if (!child) return { success: false, progress: {} };
    
    return { success: true, progress: JSON.parse(child.progressData || '{}') };
  } catch (error) {
    const cached = await AsyncStorage.getItem(`${STORAGE_KEYS.PROGRESS}_${childId}`);
    return {
      success: true,
      progress: cached ? JSON.parse(cached) : {},
      offline: true,
    };
  }
};

// ─── Custom Content Upload ────────────────────────────────────────────────────

export const uploadContent = async (childId, uri, type, name) => {
  try {
    const db = await getDb();
    const id = 'cnt_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    // Since we are strictly local database now, we store the local URI path directly as the content URL!
    // No Firebase Storage uploads needed!
    await db.runAsync(
      'INSERT INTO content (id, childId, url, type, name, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, childId, uri, type, name, now]
    );

    return { success: true, url: uri };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getChildContent = async (childId) => {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync('SELECT * FROM content WHERE childId = ? ORDER BY createdAt DESC', [childId]);
    return { success: true, content: rows };
  } catch (error) {
    return { success: false, content: [], error: error.message };
  }
};

// ─── Daily Routines ───────────────────────────────────────────────────────────

export const saveRoutine = async (childId, routine) => {
  try {
    const db = await getDb();
    const now = new Date().toISOString();

    await db.runAsync(
      'INSERT OR REPLACE INTO routines (childId, tasks, updatedAt) VALUES (?, ?, ?)',
      [childId, JSON.stringify(routine), now]
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getRoutine = async (childId) => {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync('SELECT * FROM routines WHERE childId = ?', [childId]);
    if (!row) return { success: true, tasks: [] };
    
    return { success: true, tasks: JSON.parse(row.tasks || '[]') };
  } catch (error) {
    return { success: true, tasks: [] };
  }
};

// ─── Offline Queue (No-op in offline mode) ───────────────────────────────────

export const syncOfflineQueue = async () => {
  // Always local, so no syncing is needed
  return { success: true };
};
