import { View, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { Heart, MessageCircle, Sparkles, User } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface Prayer {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name: string;
  };
  prayer_supports?: {
    id: string;
    type: string;
  }[];
  prayer_comments?: {
    id: string;
  }[];
}

export default function CommunityScreen() {
  const router = useRouter();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadPrayers();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadPrayers = async () => {
    try {
      const { data, error } = await supabase
        .from('prayers')
        .select(`
          *,
          profiles (display_name),
          prayer_supports (id, type),
          prayer_comments (id)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setPrayers((data as any) || []);
    } catch (error) {
      console.error('Error loading prayers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPrayers();
  };

  const handleSupport = async (prayerId: string, type: 'like' | 'pray') => {
    if (!currentUserId) return;

    try {
      const prayer = prayers.find(p => p.id === prayerId);
      const existingSupport = prayer?.prayer_supports?.find(
        s => s.type === type
      );

      if (existingSupport) {
        await supabase
          .from('prayer_supports')
          .delete()
          .eq('prayer_id', prayerId)
          .eq('user_id', currentUserId)
          .eq('type', type);
      } else {
        await supabase
          .from('prayer_supports')
          .insert({
            prayer_id: prayerId,
            user_id: currentUserId,
            type,
          });
      }

      await loadPrayers();
    } catch (error) {
      console.error('Error toggling support:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getPrayCount = (prayer: Prayer) => {
    return prayer.prayer_supports?.filter(s => s.type === 'pray').length || 0;
  };

  const getLikeCount = (prayer: Prayer) => {
    return prayer.prayer_supports?.filter(s => s.type === 'like').length || 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Sparkles size={48} color="#22c55e" />
          <Text style={styles.loadingText}>Loading community...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Pray together, grow together</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>

        {prayers.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Sparkles size={64} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No public prayers yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to share a prayer with the community
            </Text>
          </View>
        ) : (
          prayers.map((prayer) => (
            <View key={prayer.id} style={styles.prayerCard}>
              <View style={styles.prayerHeader}>
                <View style={styles.userAvatar}>
                  <User size={20} color="#22c55e" />
                </View>
                <View style={styles.prayerHeaderText}>
                  <Text style={styles.userName}>
                    {prayer.profiles?.display_name || 'Anonymous'}
                  </Text>
                  <Text style={styles.timeAgo}>
                    {formatTimeAgo(prayer.created_at)}
                  </Text>
                </View>
              </View>

              <Text style={styles.prayerTitle}>{prayer.title}</Text>
              <Text style={styles.prayerContent} numberOfLines={4}>
                {prayer.content}
              </Text>

              <View style={styles.prayerActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={() => handleSupport(prayer.id, 'pray')}>
                  <LinearGradient
                    colors={['#8b5cf6', '#7c3aed']}
                    style={styles.actionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}>
                    <Sparkles size={18} color="#ffffff" />
                    <Text style={styles.actionText}>
                      Pray {getPrayCount(prayer) > 0 && `(${getPrayCount(prayer)})`}
                    </Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={() => handleSupport(prayer.id, 'like')}>
                  <View style={styles.secondaryAction}>
                    <Heart
                      size={18}
                      color="#f43f5e"
                      fill={getLikeCount(prayer) > 0 ? '#f43f5e' : 'none'}
                    />
                    <Text style={styles.secondaryActionText}>
                      {getLikeCount(prayer) > 0 ? getLikeCount(prayer) : 'Support'}
                    </Text>
                  </View>
                </Pressable>

                <View style={styles.commentCount}>
                  <MessageCircle size={18} color="#9ca3af" />
                  <Text style={styles.commentCountText}>
                    {prayer.prayer_comments?.length || 0}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },
  prayerCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prayerHeaderText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 13,
    color: '#9ca3af',
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  prayerContent: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  prayerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    gap: 6,
  },
  secondaryActionText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  commentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 6,
  },
  commentCountText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  spacer: {
    height: 40,
  },
});
