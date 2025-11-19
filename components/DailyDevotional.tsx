import { View, StyleSheet, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { Text } from './ui';
import { BookOpen, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface Devotional {
  id: string;
  title: string;
  content: string;
  scripture_reference: string;
  scripture_text: string;
}

export function DailyDevotional() {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const scale = useSharedValue(1);

  useEffect(() => {
    loadTodaysDevotional();
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  const loadTodaysDevotional = async () => {
    try {
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
      );

      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('day_of_year', ((dayOfYear - 1) % 3) + 1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDevotional(data);
      }
    } catch (error) {
      console.error('Error loading devotional:', error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!devotional) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
        onPress={() => setIsExpanded(!isExpanded)}>
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed'] as [string, string]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <BookOpen size={24} color="#ffffff" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.label}>TODAY'S DEVOTIONAL</Text>
              <Text style={styles.title}>{devotional.title}</Text>
            </View>
            <ChevronRight
              size={24}
              color="#ffffff"
              style={{
                transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
              }}
            />
          </View>

          {isExpanded && (
            <View style={styles.content}>
              <Text style={styles.scripture}>
                {devotional.scripture_reference}
              </Text>
              <Text style={styles.scriptureText}>
                "{devotional.scripture_text}"
              </Text>
              <Text style={styles.devotionalContent}>
                {devotional.content}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  pressable: {
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.95,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  content: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  scripture: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  scriptureText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
    marginBottom: 16,
  },
  devotionalContent: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 24,
  },
});
