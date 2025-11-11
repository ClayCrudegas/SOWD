import { View, ScrollView, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { Sprout, Flower2, TreeDeciduous, Sparkles, Eye } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { RivePlant } from '@/components/RivePlant';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Seed {
  id: string;
  type: 'word' | 'deed';
  description: string;
  completed: boolean;
}

const PlantComponent = ({ index, seed }: { index: number; seed: Seed }) => {
  const scale = useSharedValue(0);
  const sway = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8 });
    sway.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000 + index * 200 }),
        withTiming(-5, { duration: 2000 + index * 200 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${sway.value}deg` },
    ],
  }));

  const getPlantIcon = () => {
    if (!seed.completed) {
      return <Sprout size={32} color="#94a3b8" />;
    }
    return <RivePlant size={60} autoplay={true} />;
  };

  const leftPercent = `${(index % 3) * 30 + 10}%` as `${number}%`;
  const topValue = Math.floor(index / 3) * 100 + 20;

  return (
    <Animated.View style={[styles.plant, { left: leftPercent, top: topValue }, animatedStyle]}>
      {getPlantIcon()}
    </Animated.View>
  );
};

export default function GardenScreen() {
  const router = useRouter();
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadSeeds();
  }, []);

  const loadSeeds = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('seeds')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const seedsData = (data || []) as Seed[];
      setSeeds(seedsData);
      setCompletedCount(seedsData.filter(s => s.completed).length);
    } catch (error) {
      console.error('Error loading seeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeedCompletion = async (seedId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('seeds')
        .update({
          completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq('id', seedId);

      if (error) throw error;

      await loadSeeds();
    } catch (error) {
      console.error('Error updating seed:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Sparkles size={48} color="#22c55e" />
          <Text style={styles.loadingText}>Loading your garden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Your Spiritual Garden</Text>
            <Text style={styles.subtitle}>
              {completedCount} seeds blooming
            </Text>
          </View>
          <Pressable
            style={styles.showcaseButton}
            onPress={() => router.push('/garden/plant-showcase' as any)}>
            <Eye size={20} color="#22c55e" />
          </Pressable>
        </View>

        <LinearGradient
          colors={['#e0f2fe', '#bae6fd', '#7dd3fc']}
          style={styles.gardenContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}>
          <View style={styles.ground}>
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              style={styles.groundGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </View>

          {seeds.length === 0 ? (
            <View style={styles.emptyState}>
              <Sprout size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Plant your first seed</Text>
              <Text style={styles.emptySubtitle}>
                Go to the Home tab to start your journey
              </Text>
            </View>
          ) : (
            <View style={styles.plantsContainer}>
              {seeds.map((seed, index) => (
                <PlantComponent key={seed.id} index={index} seed={seed} />
              ))}
            </View>
          )}
        </LinearGradient>

        <View style={styles.seedsList}>
          <Text style={styles.seedsListTitle}>Your Seeds</Text>

          {seeds.map((seed) => (
            <Pressable
              key={seed.id}
              style={({ pressed }) => [
                styles.seedCard,
                pressed && styles.seedCardPressed,
              ]}
              onPress={() => toggleSeedCompletion(seed.id, seed.completed)}>
              <View style={styles.seedCardContent}>
                <View style={[
                  styles.seedCheckbox,
                  seed.completed && styles.seedCheckboxCompleted,
                ]}>
                  {seed.completed && (
                    <Sparkles size={16} color="#ffffff" />
                  )}
                </View>

                <View style={styles.seedInfo}>
                  <View style={styles.seedTypeRow}>
                    <View style={[
                      styles.seedTypeBadge,
                      seed.type === 'word' ? styles.wordBadge : styles.deedBadge,
                    ]}>
                      <Text style={styles.seedTypeText}>
                        {seed.type === 'word' ? 'Word' : 'Deed'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.seedDescription,
                    seed.completed && styles.seedDescriptionCompleted,
                  ]}>
                    {seed.description}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 17,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  showcaseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#22c55e',
    fontWeight: '500',
  },
  gardenContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    minHeight: 300,
    position: 'relative',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  groundGradient: {
    flex: 1,
  },
  plantsContainer: {
    flex: 1,
    position: 'relative',
    paddingVertical: 40,
  },
  plant: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  seedsList: {
    paddingHorizontal: 24,
  },
  seedsListTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  seedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  seedCardPressed: {
    opacity: 0.8,
  },
  seedCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  seedCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  seedCheckboxCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  seedInfo: {
    flex: 1,
  },
  seedTypeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  seedTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  wordBadge: {
    backgroundColor: '#fef3c7',
  },
  deedBadge: {
    backgroundColor: '#f3e8ff',
  },
  seedTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  seedDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  seedDescriptionCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  spacer: {
    height: 40,
  },
});
