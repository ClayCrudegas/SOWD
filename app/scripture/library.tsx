import { View, ScrollView, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { Search, BookOpen, Heart, X, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { getItem, storageKeys } from '@/lib/storage';

interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

const SAMPLE_VERSES = [
  {
    reference: 'John 3:16',
    book: 'John',
    chapter: 3,
    verse: 16,
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
  },
  {
    reference: 'Philippians 4:13',
    book: 'Philippians',
    chapter: 4,
    verse: 13,
    text: 'I can do all this through him who gives me strength.',
  },
  {
    reference: 'Proverbs 3:5-6',
    book: 'Proverbs',
    chapter: 3,
    verse: 5,
    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
  },
  {
    reference: 'Jeremiah 29:11',
    book: 'Jeremiah',
    chapter: 29,
    verse: 11,
    text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
  },
  {
    reference: 'Romans 8:28',
    book: 'Romans',
    chapter: 8,
    verse: 28,
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
  },
  {
    reference: 'Psalm 23:1',
    book: 'Psalms',
    chapter: 23,
    verse: 1,
    text: 'The Lord is my shepherd, I lack nothing.',
  },
  {
    reference: 'Matthew 11:28',
    book: 'Matthew',
    chapter: 11,
    verse: 28,
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
  },
  {
    reference: 'Isaiah 40:31',
    book: 'Isaiah',
    chapter: 40,
    verse: 31,
    text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
  },
];

export default function ScriptureLibraryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<typeof SAMPLE_VERSES>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const filtered = SAMPLE_VERSES.filter(v =>
        v.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
      setLoading(false);
    }, 500);
  };

  const handleSaveFavorite = async (verse: typeof SAMPLE_VERSES[0]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const guestId = await getItem<string>(storageKeys.GUEST_ID);

      const { error } = await supabase.from('scripture_favorites').insert({
        user_id: user?.id,
        guest_id: !user ? guestId : null,
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
      });

      if (error) throw error;

      setFavorites([...favorites, verse.reference]);
      Alert.alert('Saved', 'Verse added to your favorites');
    } catch (error) {
      console.error('Error saving favorite:', error);
      Alert.alert('Error', 'Failed to save verse');
    }
  };

  const isFavorite = (reference: string) => favorites.includes(reference);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffffff" />
          </Pressable>
          <View style={styles.headerContent}>
            <BookOpen size={32} color="#ffffff" />
            <Text style={styles.headerTitle}>Scripture Library</Text>
            <Text style={styles.headerSubtitle}>
              Search and save your favorite verses
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for verses..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => {
                setSearchQuery('');
                setResults([]);
              }}>
                <X size={20} color="#6b7280" />
              </Pressable>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : results.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {results.length} verse{results.length !== 1 ? 's' : ''} found
            </Text>
            {results.map((verse, index) => (
              <View key={index} style={styles.verseCard}>
                <View style={styles.verseHeader}>
                  <Text style={styles.verseReference}>{verse.reference}</Text>
                  <Pressable
                    style={styles.favoriteButton}
                    onPress={() => handleSaveFavorite(verse)}>
                    <Heart
                      size={24}
                      color={isFavorite(verse.reference) ? '#ef4444' : '#9ca3af'}
                      fill={isFavorite(verse.reference) ? '#ef4444' : 'transparent'}
                    />
                  </Pressable>
                </View>
                <Text style={styles.verseText}>{verse.text}</Text>
              </View>
            ))}
          </View>
        ) : searchQuery.length > 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No verses found</Text>
            <Text style={styles.emptySubtext}>
              Try a different search term
            </Text>
          </View>
        ) : (
          <View style={styles.popularContainer}>
            <Text style={styles.popularTitle}>Popular Verses</Text>
            {SAMPLE_VERSES.slice(0, 5).map((verse, index) => (
              <View key={index} style={styles.verseCard}>
                <View style={styles.verseHeader}>
                  <Text style={styles.verseReference}>{verse.reference}</Text>
                  <Pressable
                    style={styles.favoriteButton}
                    onPress={() => handleSaveFavorite(verse)}>
                    <Heart
                      size={24}
                      color={isFavorite(verse.reference) ? '#ef4444' : '#9ca3af'}
                      fill={isFavorite(verse.reference) ? '#ef4444' : 'transparent'}
                    />
                  </Pressable>
                </View>
                <Text style={styles.verseText}>{verse.text}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔗 Bible API Integration</Text>
          <Text style={styles.infoText}>
            This demo uses sample verses. In a production app, integrate with Bible APIs like:
            {'\n\n'}• Bible API (bible-api.com)
            {'\n'}• ESV Bible API
            {'\n'}• Bible Search API
            {'\n\n'}
            These provide access to full Bible text in multiple translations.
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerGradient: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  resultsContainer: {
    padding: 24,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 16,
  },
  popularContainer: {
    padding: 24,
  },
  popularTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  verseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verseReference: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366f1',
  },
  favoriteButton: {
    padding: 4,
  },
  verseText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  infoCard: {
    marginHorizontal: 24,
    padding: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
});
