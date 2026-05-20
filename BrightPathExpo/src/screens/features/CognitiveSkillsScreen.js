// BrightPath - Cognitive Skills Screen (Sprint 3)
// Matching & Sorting Games
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/colors';
import { useApp } from '../../context/AppContext';

// Matching Game Data
const MATCH_SETS = [
  {
    id: 'shapes',
    title: 'Shape Match',
    items: [
      { id: 1, emoji: '🔴', match: 'circle', label: 'Circle' },
      { id: 2, emoji: '🟦', match: 'square', label: 'Square' },
      { id: 3, emoji: '🔺', match: 'triangle', label: 'Triangle' },
      { id: 4, emoji: '⭐', match: 'star', label: 'Star' },
    ],
    answers: [
      { id: 'circle', label: 'Circle ⭕' },
      { id: 'square', label: 'Square ⬜' },
      { id: 'triangle', label: 'Triangle 🔻' },
      { id: 'star', label: 'Star ⭐' },
    ],
  },
  {
    id: 'colors_match',
    title: 'Color Match',
    items: [
      { id: 1, emoji: '🍎', match: 'red', label: 'Apple' },
      { id: 2, emoji: '🍌', match: 'yellow', label: 'Banana' },
      { id: 3, emoji: '🍃', match: 'green', label: 'Leaf' },
      { id: 4, emoji: '🫐', match: 'blue', label: 'Blueberry' },
    ],
    answers: [
      { id: 'red', label: 'Red 🔴' },
      { id: 'yellow', label: 'Yellow 🟡' },
      { id: 'green', label: 'Green 🟢' },
      { id: 'blue', label: 'Blue 🔵' },
    ],
  },
];

// Sorting Game Data
const SORT_SETS = [
  {
    id: 'animals_sort',
    title: 'Sort Animals by Size',
    items: [
      { id: 1, emoji: '🐭', label: 'Mouse', size: 1 },
      { id: 2, emoji: '🐕', label: 'Dog', size: 3 },
      { id: 3, emoji: '🐘', label: 'Elephant', size: 5 },
      { id: 4, emoji: '🐈', label: 'Cat', size: 2 },
      { id: 5, emoji: '🐻', label: 'Bear', size: 4 },
    ],
    instruction: 'Arrange from SMALLEST to BIGGEST',
  },
  {
    id: 'numbers_sort',
    title: 'Sort Numbers',
    items: [
      { id: 1, emoji: '3️⃣', label: '3', size: 3 },
      { id: 2, emoji: '1️⃣', label: '1', size: 1 },
      { id: 3, emoji: '5️⃣', label: '5', size: 5 },
      { id: 4, emoji: '2️⃣', label: '2', size: 2 },
      { id: 5, emoji: '4️⃣', label: '4', size: 4 },
    ],
    instruction: 'Arrange from SMALLEST to BIGGEST',
  },
];

const GAMES = [
  { id: 'matching', title: 'Matching Game', emoji: '🔗', color: '#7B2FBE' },
  { id: 'sorting', title: 'Sorting Game', emoji: '📊', color: '#FF9F1C' },
  { id: 'memory', title: 'Memory Game', emoji: '🧠', color: '#4D96FF' },
];

const CognitiveSkillsScreen = ({ navigation }) => {
  const { recordProgress } = useApp();
  const [activeGame, setActiveGame] = useState('matching');
  const [score, setScore] = useState(0);
  const [matchSet, setMatchSet] = useState(MATCH_SETS[0]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [matches, setMatches] = useState({});
  const [sortItems, setSortItems] = useState([...SORT_SETS[0].items].sort(() => Math.random() - 0.5));
  const [userOrder, setUserOrder] = useState([]);
  const [memoryCards, setMemoryCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [canFlip, setCanFlip] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    initMemoryGame();
  }, []);

  const initMemoryGame = () => {
    const pairs = ['🐱', '🐶', '🐰', '🦊', '🐸', '🐨'];
    const cards = [...pairs, ...pairs]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji }));
    setMemoryCards(cards);
    setFlipped([]);
    setMatched([]);
    setCanFlip(true);
  };

  const handleMatch = (answerId) => {
    if (!selectedItem) return;
    const isCorrect = selectedItem.match === answerId;

    if (isCorrect) {
      const newMatches = { ...matches, [selectedItem.id]: answerId };
      setMatches(newMatches);
      setScore(prev => prev + 15);
      recordProgress('cognitive', { type: 'match', correct: true });

      if (Object.keys(newMatches).length === matchSet.items.length) {
        setTimeout(() => {
          Alert.alert('🎉 Perfect Match!', 'All items matched correctly! +15 stars', [
            { text: 'Next Set', onPress: () => {
              const nextIdx = MATCH_SETS.indexOf(matchSet) + 1;
              if (nextIdx < MATCH_SETS.length) {
                setMatchSet(MATCH_SETS[nextIdx]);
                setMatches({});
                setSelectedItem(null);
              }
            }},
          ]);
        }, 300);
      }
    } else {
      recordProgress('cognitive', { type: 'match', correct: false });
    }
    setSelectedItem(null);
  };

  const handleSortTap = (item) => {
    if (userOrder.find(i => i.id === item.id)) {
      setUserOrder(prev => prev.filter(i => i.id !== item.id));
    } else {
      setUserOrder(prev => [...prev, item]);
    }
  };

  const checkSortOrder = () => {
    const correctOrder = [...sortItems].sort((a, b) => a.size - b.size);
    const isCorrect = userOrder.every((item, i) => item.id === correctOrder[i].id)
      && userOrder.length === sortItems.length;

    if (isCorrect) {
      setScore(prev => prev + 20);
      Alert.alert('🌟 Correct!', 'Perfect sorting! +20 stars');
      recordProgress('cognitive', { type: 'sort', correct: true });
    } else {
      Alert.alert('💪 Try Again!', 'Not quite right. Keep trying!');
    }
  };

  const handleMemoryFlip = (cardId) => {
    if (!canFlip || flipped.includes(cardId) || matched.includes(cardId)) return;
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setCanFlip(false);
      const [a, b] = newFlipped;
      const cardA = memoryCards[a];
      const cardB = memoryCards[b];

      if (cardA.emoji === cardB.emoji) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        setFlipped([]);
        setCanFlip(true);
        setScore(prev => prev + 10);
        if (newMatched.length === memoryCards.length) {
          Alert.alert('🏆 You Won!', 'All pairs matched! Great memory!');
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  };

  const matchedIds = Object.keys(matches).map(Number);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4D96FF" />
      
      <View style={styles.topWave}>
        <View style={styles.blueWave} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
          <Text style={styles.backTextHeader}>←</Text>
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Train Your{'\n'}<Text style={styles.heroTitlePink}>Big Brain</Text></Text>
      </View>

      <View style={styles.layout}>
        {/* Game Selector Tabs (Reference Style) */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {GAMES.map(game => (
              <TouchableOpacity
                key={game.id}
                style={[
                  styles.catTab,
                  activeGame === game.id && { backgroundColor: game.color + '20' }
                ]}
                onPress={() => setActiveGame(game.id)}>
                <Text style={[styles.catTabText, activeGame === game.id && { color: game.color }]}>
                  {game.title.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right Panel */}
        <View style={styles.rightPanel}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gameArea}>

            {/* MATCHING GAME */}
            {activeGame === 'matching' && (
              <View>
                <Text style={styles.gameTitle}>🔗 {matchSet.title}</Text>
                <Text style={styles.gameInstruction}>Tap an item, then tap its match!</Text>

                <View style={styles.matchingLayout}>
                  {/* Items Column */}
                  <View style={styles.matchColumn}>
                    <Text style={styles.colTitle}>Items</Text>
                    {matchSet.items.map(item => {
                      const isMatched = matchedIds.includes(item.id);
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => !isMatched && setSelectedItem(item)}
                          style={styles.blobTouchable}>
                          <View style={[
                            styles.blobShape,
                            { backgroundColor: isMatched ? '#E8F5E9' : isSelected ? '#FFFDE7' : '#F8F8F8' },
                            isMatched && { borderColor: '#6BCB77', borderWidth: 2 },
                            isSelected && { borderColor: '#FFD93D', borderWidth: 2 }
                          ]}>
                            <Text style={styles.blobEmoji}>{item.emoji}</Text>
                          </View>
                          <Text style={[styles.blobLabel, { color: isMatched ? '#6BCB77' : isSelected ? '#FFD93D' : '#333' }]}>
                            {item.label.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Connector */}
                  <View style={styles.connector}>
                    <Text style={styles.connectorLine}>{'→→→'}</Text>
                  </View>

                  {/* Answers Column */}
                  <View style={styles.matchColumn}>
                    <Text style={styles.colTitle}>Matches</Text>
                    {matchSet.answers.map(answer => {
                      const isMatched = Object.values(matches).includes(answer.id);
                      return (
                        <TouchableOpacity
                          key={answer.id}
                          onPress={() => handleMatch(answer.id)}
                          disabled={isMatched}
                          style={[styles.matchItem, isMatched && styles.matchItemDone]}>
                          <Text style={styles.matchLabel}>{answer.label}</Text>
                          {isMatched && <Text style={styles.matchCheck}>✓</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* SORTING GAME */}
            {activeGame === 'sorting' && (
              <View>
                <Text style={styles.gameTitle}>📊 {SORT_SETS[0].title}</Text>
                <Text style={styles.gameInstruction}>{SORT_SETS[0].instruction}</Text>

                <Text style={styles.sortSectionTitle}>Available Items (tap to pick):</Text>
                <View style={styles.sortGrid}>
                  {sortItems.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleSortTap(item)}
                      style={[
                        styles.sortItem,
                        userOrder.find(i => i.id === item.id) && styles.sortItemPicked,
                      ]}>
                      <Text style={styles.sortEmoji}>{item.emoji}</Text>
                      <Text style={styles.sortLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sortSectionTitle}>Your Order:</Text>
                <View style={styles.sortGrid}>
                  {userOrder.map((item, i) => (
                    <View key={item.id} style={styles.sortOrderItem}>
                      <Text style={styles.sortOrderNum}>#{i + 1}</Text>
                      <Text style={styles.sortEmoji}>{item.emoji}</Text>
                      <Text style={styles.sortLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.checkBtn} onPress={checkSortOrder}>
                  <LinearGradient colors={['#6BCB77', '#06D6A0']} style={styles.checkBtnGrad}>
                    <Text style={styles.checkBtnText}>✅ Check My Answer</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resetBtn} onPress={() => setUserOrder([])}>
                  <Text style={styles.resetBtnText}>🔄 Reset</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* MEMORY GAME */}
            {activeGame === 'memory' && (
              <View>
                <Text style={styles.gameTitle}>🧠 Memory Match</Text>
                <Text style={styles.gameInstruction}>Find the matching pairs! {matched.length / 2}/{memoryCards.length / 2} found</Text>

                <View style={styles.memoryGrid}>
                  {memoryCards.map((card, index) => {
                    const isFlipped = flipped.includes(index) || matched.includes(index);
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleMemoryFlip(index)}
                        style={[styles.memoryCard, isFlipped && styles.memoryCardFlipped]}>
                        {isFlipped ? (
                          <Text style={styles.memoryEmoji}>{card.emoji}</Text>
                        ) : (
                          <Text style={styles.memoryHidden}>❓</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity style={styles.resetBtn} onPress={initMemoryGame}>
                  <Text style={styles.resetBtnText}>🔄 New Game</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topWave: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blueWave: {
    position: 'absolute',
    top: -120,
    width: '150%',
    height: 240,
    backgroundColor: '#4D96FF',
    borderRadius: 200,
  },
  backBtnHeader: {
    position: 'absolute',
    left: 20,
    top: 40,
    zIndex: 10,
  },
  backTextHeader: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    marginTop: 20,
  },
  heroTitlePink: {
    color: '#FF6B6B',
  },
  layout: {
    flex: 1,
  },
  categoryContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  catScroll: {
    paddingHorizontal: 15,
  },
  catTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  catTabText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#999',
    letterSpacing: 0.5,
  },
  rightPanel: {
    flex: 1,
  },
  gameArea: {
    padding: 20,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  gameInstruction: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  matchingLayout: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  matchColumn: {
    alignItems: 'center',
  },
  blobTouchable: {
    alignItems: 'center',
    marginBottom: 20,
  },
  blobShape: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  blobEmoji: {
    fontSize: 36,
  },
  blobLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  connector: {
    justifyContent: 'center',
  },
  connectorLine: {
    fontSize: 24,
    color: '#EEE',
    fontWeight: '900',
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 20,
  },
  sortItem: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderTopLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
  },
  sortItemPicked: {
    opacity: 0.4,
    backgroundColor: '#EEE',
  },
  sortEmoji: { fontSize: 40 },
  sortLabel: { fontSize: 9, fontWeight: '900', marginTop: 4, color: '#333' },
  sortOrderItem: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderTopLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderColor: '#6BCB77',
    borderWidth: 2,
  },
  sortOrderNum: {
    position: 'absolute',
    top: 5,
    left: 10,
    fontSize: 10,
    fontWeight: '900',
    color: '#6BCB77',
  },
  checkBtn: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  checkBtnGrad: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  checkBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  resetBtn: {
    marginTop: 15,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#BBB',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  memoryCard: {
    width: 75,
    height: 75,
    borderRadius: 37,
    borderTopLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  memoryCardFlipped: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4D96FF',
    borderWidth: 2,
  },
  memoryEmoji: { fontSize: 36 },
  memoryHidden: { fontSize: 30, color: '#DDD' },
  colTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#CCC',
    marginBottom: 10,
    letterSpacing: 1,
  },
  sortSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default CognitiveSkillsScreen;





