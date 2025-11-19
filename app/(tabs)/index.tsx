import { View, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { Sprout, BookOpen, Plus, Sparkles, Wind, BookHeart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getItem, storageKeys } from '@/lib/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { DailyDevotional } from '@/components/DailyDevotional';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName] = useState('Friend');
  const breatheScale = useSharedValue(1);

  useEffect(() => {
    checkOnboarding();
    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  const checkOnboarding = async () => {
    const completed = await getItem<boolean>(storageKeys.ONBOARDING_COMPLETED);
    if (!completed) {
      router.replace('/onboarding');
    }
    setIsLoading(false);
  };

  const breatheAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }],
  }));

  if (isLoading) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good day, {userName}</Text>
          <Text style={styles.subtitle}>How would you like to grow today?</Text>
        </View>

        <Animated.View style={[styles.heroCard, breatheAnimatedStyle]}>
          <LinearGradient
            colors={['#22c55e', '#16a34a']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <View style={styles.heroContent}>
              <Sprout size={48} color="#ffffff" strokeWidth={1.5} />
              <Text style={styles.heroTitle}>Plant a Seed</Text>
              <Text style={styles.heroSubtitle}>
                Start with a prayer, watch your garden bloom
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <DailyDevotional />

        <View style={styles.actionsGrid}>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => router.push('/prayers/new' as any)}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <View style={styles.iconCircle}>
                <BookOpen size={28} color="#ffffff" />
              </View>
              <Text style={styles.actionTitle}>Journal Prayer</Text>
              <Text style={styles.actionDescription}>
                Write your thoughts and prayers
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => router.push('/seeds/new' as any)}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <View style={styles.iconCircle}>
                <Plus size={28} color="#ffffff" />
              </View>
              <Text style={styles.actionTitle}>Plant Seed</Text>
              <Text style={styles.actionDescription}>
                Commit to a word or deed
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => router.push('/meditation/breathe' as any)}>
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <View style={styles.iconCircle}>
                <Wind size={28} color="#ffffff" />
              </View>
              <Text style={styles.actionTitle}>Breathe</Text>
              <Text style={styles.actionDescription}>
                Meditate and find peace
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => router.push('/prayers/guided' as any)}>
            <LinearGradient
              colors={['#ec4899', '#f43f5e']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <View style={styles.iconCircle}>
                <BookHeart size={28} color="#ffffff" />
              </View>
              <Text style={styles.actionTitle}>Guided Prayer</Text>
              <Text style={styles.actionDescription}>
                Follow prompts to pray
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.inspirationCard}>
          <View style={styles.inspirationIcon}>
            <Sparkles size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.inspirationText}>
            "Faith is taking the first step even when you don't see the whole staircase."
          </Text>
          <Text style={styles.inspirationAuthor}>- Martin Luther King Jr.</Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#6b7280',
  },
  heroCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heroGradient: {
    padding: 32,
    minHeight: 180,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  actionCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  actionGradient: {
    padding: 20,
    minHeight: 160,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  actionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
  },
  inspirationCard: {
    marginHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inspirationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  inspirationText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  inspirationAuthor: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  spacer: {
    height: 40,
  },
});
