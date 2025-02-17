import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Dimensions,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const VISIBLE_CARDS = 3;

type Article = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  category: string;
};

type Ad = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  company: string;
  cta: string;
  url: string;
};

const staticNews: Article[] = [
  {
    id: 1,
    title: "The Future of Real Estate Investment",
    description: "Discover how technology and market trends are shaping the future of real estate investment. From digital platforms to innovative financing options, learn how the industry is evolving.",
    imageUrl: "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "March 15, 2024",
    category: "real-estate"
  },
  {
    id: 2,
    title: "Smart Cities and Property Technology",
    description: "Explore how smart city initiatives and property technology are transforming urban living. From IoT integration to sustainable development, see what's next in urban real estate.",
    imageUrl: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "March 20, 2024",
    category: "technology"
  },
  {
    id: 3,
    title: "Investment Strategies for 2024",
    description: "Learn about the most effective investment strategies in today's market. Expert insights on portfolio diversification, risk management, and emerging opportunities.",
    imageUrl: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "March 25, 2024",
    category: "finance"
  },
  {
    id: 4,
    title: "Sustainable Real Estate Development",
    description: "How green building practices and sustainability are reshaping real estate development. Discover the latest innovations in eco-friendly construction and design.",
    imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "March 30, 2024",
    category: "real-estate"
  },
  {
    id: 5,
    title: "Digital Finance Revolution",
    description: "The impact of digital transformation on financial services. From blockchain to AI-driven analytics, see how technology is revolutionizing finance.",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    date: "April 5, 2024",
    category: "technology"
  }
];

const staticAds: Ad[] = [
  {
    id: 1,
    title: "Luxury Apartments in Downtown",
    description: "Experience modern living at its finest. Book a tour today!",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    company: "Premium Living",
    cta: "Book Now",
    url: "https://example.com/premium-living"
  },
  {
    id: 2,
    title: "Investment Opportunity",
    description: "High-yield property investments in emerging markets. Limited time offer!",
    imageUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    company: "Global Investments",
    cta: "Invest Now",
    url: "https://example.com/global-investments"
  },
  {
    id: 3,
    title: "Property Management Services",
    description: "Let us handle your property while you focus on what matters.",
    imageUrl: "https://images.unsplash.com/photo-1556912998-c57cc6b63cd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    company: "PropertyCare Pro",
    cta: "Learn More",
    url: "https://example.com/propertycare"
  }
];

const categories = [
  { id: 'all', name: 'All News', icon: 'globe-outline' },
  { id: 'technology', name: 'Technology', icon: 'hardware-chip-outline' },
  { id: 'finance', name: 'Finance', icon: 'cash-outline' },
  { id: 'real-estate', name: 'Real Estate', icon: 'home-outline' },
];

const CategoryButton = ({ category, isSelected, onPress, theme }) => (
  <Pressable
    style={[
      styles.categoryButton,
      isSelected && { backgroundColor: '#FF0000' },
      { borderColor: isSelected ? '#FF0000' : theme.colors.text },
    ]}
    onPress={onPress}>
    <Ionicons
      name={category.icon}
      size={16}
      color={isSelected ? '#FFFFFF' : theme.colors.text}
    />
    <Text
      style={[
        styles.categoryText,
        {
          color: isSelected ? '#FFFFFF' : theme.colors.text,
        },
      ]}>
      {category.name}
    </Text>
  </Pressable>
);

function SwipeableCard({
  item,
  onSwipe,
  index,
  totalCards,
  isAd = false,
  onBookmark,
  isBookmarked,
}: {
  item: Article | Ad;
  onSwipe: (direction: 'left' | 'right') => void;
  index: number;
  totalCards: number;
  isAd?: boolean;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}) {
  const { theme } = useTheme();
  const x = useSharedValue(0);
  const rotation = useSharedValue(0);
  const { speak, stopSpeech, isPlaying } = useTextToSpeech();

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this article: ${item.title}\n\n${item.description}`,
        title: item.title,
        url: `https://moneytreerealty.in/blog/${item.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAudioPlay = () => {
    if (isPlaying) {
      stopSpeech();
    } else {
      const textToRead = `${item.title}. ${item.description}`;
      speak(textToRead);
    }
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (index === 0) {
        x.value = event.translationX;
        rotation.value = event.translationX / 20;
      }
    })
    .onEnd((event) => {
      if (index === 0) {
        if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
          const direction = event.translationX > 0 ? 'right' : 'left';
          x.value = withSpring(direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH);
          runOnJS(onSwipe)(direction);
        } else {
          x.value = withSpring(0);
          rotation.value = withSpring(0);
        }
      }
    });

  const scale = interpolate(
    index,
    [0, 1, 2],
    [1, 0.95, 0.9]
  );

  const translateY = interpolate(
    index,
    [0, 1, 2],
    [0, 10, 20]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: index === 0 ? x.value : 0 },
      { rotate: index === 0 ? `${rotation.value}deg` : '0deg' },
      { scale },
      { translateY },
    ],
    opacity: interpolate(index, [0, VISIBLE_CARDS - 1, VISIBLE_CARDS], [1, 0.7, 0]),
  }));

  if (index >= VISIBLE_CARDS) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.card, animatedStyle, {
          backgroundColor: theme.colors.card,
          zIndex: totalCards - index,
          position: 'absolute',
        }]}>
        <Animated.Image
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            {isAd ? (
              <View style={styles.sponsoredTag}>
                <Ionicons name="megaphone-outline" size={16} color="#FFFFFF" />
                <Text style={styles.sponsoredText}>Sponsored</Text>
              </View>
            ) : (
              <>
                <View style={styles.categoryTag}>
                  <Ionicons
                    name={categories.find(cat => cat.id === (item as Article).category)?.icon || 'newspaper-outline'}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.categoryTagText}>
                    {(item as Article).category?.charAt(0).toUpperCase() + (item as Article).category?.slice(1)}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  {!isAd && (
                    <Pressable onPress={handleAudioPlay} style={styles.actionButton}>
                      <Ionicons 
                        name={isPlaying ? "stop-circle-outline" : "play-circle-outline"} 
                        size={24} 
                        color={isPlaying ? "#FF0000" : theme.colors.text} 
                      />
                    </Pressable>
                  )}
                  <Pressable onPress={handleShare} style={styles.actionButton}>
                    <Ionicons name="share-outline" size={24} color={theme.colors.text} />
                  </Pressable>
                  {onBookmark && (
                    <Pressable onPress={onBookmark} style={styles.actionButton}>
                      <Ionicons 
                        name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                        size={24} 
                        color={isBookmarked ? "#FF0000" : theme.colors.text} 
                      />
                    </Pressable>
                  )}
                </View>
              </>
            )}
          </View>
          
          <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text
            style={[styles.cardDescription, { color: theme.colors.text + '99' }]}
            numberOfLines={3}>
            {item.description}
          </Text>
          
          {isAd ? (
            <View style={[styles.cardFooter, styles.adFooter]}>
              <View style={styles.companyContainer}>
                <Ionicons name="business-outline" size={16} color="#FF0000" />
                <Text style={styles.companyName}>{(item as Ad).company}</Text>
              </View>
              <Pressable
                style={styles.ctaButton}
                onPress={() => Linking.openURL((item as Ad).url)}>
                <Text style={styles.ctaText}>{(item as Ad).cta}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.cardFooter}>
              <View style={styles.sourceContainer}>
                <Ionicons name="newspaper-outline" size={16} color="#FF0000" />
                <Text style={styles.source}>MoneyTree Realty</Text>
              </View>
              <View style={styles.dateContainer}>
                <Ionicons name="time-outline" size={16} color={theme.colors.text + '99'} />
                <Text style={[styles.date, { color: theme.colors.text + '99' }]}>
                  {(item as Article).date}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const savedBookmarks = await AsyncStorage.getItem('bookmarks');
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const toggleBookmark = async (articleId: number) => {
    try {
      const newBookmarks = bookmarks.includes(articleId)
        ? bookmarks.filter(id => id !== articleId)
        : [...bookmarks, articleId];
      
      setBookmarks(newBookmarks);
      await AsyncStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  };

  const filteredNews = selectedCategory === 'all'
    ? staticNews
    : staticNews.filter(article => article.category === selectedCategory);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    setCurrentIndex((prev) => (prev + 1) % (filteredNews.length + staticAds.length));
  }, [filteredNews.length]);

  const handleReadMore = useCallback((id: number) => {
    Linking.openURL(`https://moneytreerealty.in/blog/${id}`);
  }, []);

  const visibleItems = Array.from({ length: VISIBLE_CARDS }, (_, i) => {
    const totalItems = [...filteredNews, ...staticAds];
    const index = (currentIndex + i) % totalItems.length;
    return {
      item: totalItems[index],
      isAd: index >= filteredNews.length
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>      
      <View style={styles.mainContent}>
        <View style={styles.cardContainer}>
          {visibleItems.map(({ item, isAd }, index) => (
            <SwipeableCard
              key={`${item.id}-${index}-${isAd}`}
              item={item}
              onSwipe={handleSwipe}
              index={index}
              totalCards={visibleItems.length}
              isAd={isAd}
              onBookmark={!isAd ? () => toggleBookmark(item.id) : undefined}
              isBookmarked={!isAd && bookmarks.includes(item.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navButton}
            onPress={() => handleSwipe('left')}>
            <Ionicons name="close-circle" size={40} color="#FF4B4B" />
          </Pressable>
          <Pressable
            style={styles.readMoreButton}
            onPress={() => handleReadMore(visibleItems[0].item.id)}>
            <Text style={styles.readMoreText}>
              {visibleItems[0].isAd ? 'Learn More' : 'Read More'}
            </Text>
          </Pressable>
          <Pressable
            style={styles.navButton}
            onPress={() => handleSwipe('right')}>
            <Ionicons name="checkmark-circle" size={40} color="#4CAF50" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}>
          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              theme={theme}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  categoriesContainer: {
    maxHeight: 40,
    marginVertical: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.65,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '45%',
  },
  cardContent: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    gap: 6,
  },
  sponsoredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB100',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    gap: 6,
  },
  categoryTagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sponsoredText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 32,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  adFooter: {
    flexDirection: 'column',
    gap: 12,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  source: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  date: {
    fontSize: 14,
  },
  bottomSection: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#00000020',
    paddingTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
  },
  navButton: {
    padding: 10,
  },
  readMoreButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    height: 36,
    justifyContent: 'center',
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  readMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ctaButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  ctaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});