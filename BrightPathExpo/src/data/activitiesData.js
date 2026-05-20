// BrightPath - Extensive Activities Library (20 Activities)
export const ACTIVITIES_DATA = [
  { id: 'alphabet', title: 'Alphabet', emoji: '🔤', color: '#FF6BB5', totalLevels: 20 },
  { id: 'numbers', title: 'Numbers', emoji: '🔢', color: '#4D96FF', totalLevels: 20 },
  { id: 'emotions', title: 'Emotions', emoji: '😊', color: '#FFD93D', totalLevels: 20 },
  { id: 'social', title: 'Social Skills', emoji: '🤝', color: '#6BCB77', totalLevels: 20 },
  { id: 'music', title: 'Music Therapy', emoji: '🎵', color: '#7B2FBE', totalLevels: 20 },
  { id: 'patterns', title: 'Patterns', emoji: '🧩', color: '#FF9F1C', totalLevels: 20 },
  { id: 'memory', title: 'Memory Game', emoji: '🧠', color: '#06D6A0', totalLevels: 20 },
  { id: 'colorsort', title: 'Color Sorting', emoji: '🎨', color: '#FF6B6B', totalLevels: 20 },
  { id: 'shapes', title: 'Shapes', emoji: '📐', color: '#4361EE', totalLevels: 20 },
  { id: 'body', title: 'Body Parts', emoji: '👤', color: '#F72585', totalLevels: 20 },
  { id: 'morning', title: 'Morning Routine', emoji: '☀️', color: '#FFD93D', totalLevels: 20 },
  { id: 'night', title: 'Night Routine', emoji: '🌙', color: '#3A0CA3', totalLevels: 20 },
  { id: 'safety', title: 'Safety Skills', emoji: '🛡️', color: '#EF233C', totalLevels: 20 },
  { id: 'helpers', title: 'Community Helpers', emoji: '👨‍🚒', color: '#2B2D42', totalLevels: 20 },
  { id: 'weather', title: 'Weather', emoji: '☁️', color: '#CAF0F8', totalLevels: 20 },
  { id: 'food', title: 'Fruits & Veg', emoji: '🍎', color: '#99D98C', totalLevels: 20 },
  { id: 'transport', title: 'Transport', emoji: '🚗', color: '#8E9AAF', totalLevels: 20 },
  { id: 'sea', title: 'Under the Sea', emoji: '🌊', color: '#00B4D8', totalLevels: 20 },
  { id: 'space', title: 'Space', emoji: '🌌', color: '#1A0533', totalLevels: 20 },
  { id: 'time', title: 'Telling Time', emoji: '⌚', color: '#FF9E00', totalLevels: 20 },
  { id: 'gardening', title: 'Gardening', emoji: '🌱', color: '#4CAF50', totalLevels: 20 },
  { id: 'ocean', title: 'Ocean Cleanup', emoji: '🧹', color: '#0077B6', totalLevels: 20 },
  { id: 'animal_sounds', title: 'Animal Sounds', emoji: '🔊', color: '#795548', totalLevels: 20 },
  { id: 'yoga', title: 'Yoga', emoji: '🧘', color: '#9C27B0', totalLevels: 20 },
  { id: 'eating', title: 'Healthy Eating', emoji: '🥗', color: '#8BC34A', totalLevels: 20 },
  { id: 'drag_drop', title: 'Drag & Drop', emoji: '🎯', color: '#FF5722', totalLevels: 20 },
];

export const getLevelConfig = (activityId, level) => {
  // Logic to generate level configuration programmatically up to level 20
  return {
    level,
    difficulty: level <= 5 ? 'Easy' : level <= 15 ? 'Medium' : 'Hard',
    points: level * 50,
    // Add specific game logic props here
  };
};





