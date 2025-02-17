import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type NewsCardProps = {
  title: string;
  description: string;
  imageUrl: string;
  sourceName: string;
  date: Date;
  onPress: () => void;
};

export function NewsCard({
  title,
  description,
  imageUrl,
  sourceName,
  date,
  onPress,
}: NewsCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.text }]} numberOfLines={3}>
            {description}
          </Text>
          <View style={styles.footer}>
            <Text style={[styles.source, { color: '#FF0000' }]}>{sourceName}</Text>
            <Text style={[styles.date, { color: theme.colors.text }]}>
              {date.toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
  },
});