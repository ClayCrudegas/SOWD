import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { getItem, storageKeys } from '@/lib/storage';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.6;

const BREATH_PATTERNS = [
  { name: '4-7-8 Relaxing Breath', inhale: 4, hold: 7, exhale: 8 },
  { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4 },
  { name: 'Simple Breath', inhale: 4, hold: 0, exhale: 6 },
];

export default function BreatheScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0.3);

  const pattern = BREATH_PATTERNS[selectedPattern];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }

      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);

      startBreathCycle();
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentPhase, selectedPattern]);

  const startBreathCycle = () => {
    const runCycle = () => {
      scale.value = withSequence(
        withTiming(1, {
          duration: pattern.inhale * 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: pattern.hold * 1000,
        }),
        withTiming(0.5, {
          duration: pattern.exhale * 1000,
          easing: Easing.inOut(Easing.ease),
        })
      );

      opacity.value = withSequence(
        withTiming(0.9, {
          duration: pattern.inhale * 1000,
        }),
        withTiming(0.9, {
          duration: pattern.hold * 1000,
        }),
        withTiming(0.3, {
          duration: pattern.exhale * 1000,
        })
      );

      setTimeout(() => {
        setCurrentPhase('inhale');
      }, 0);

      setTimeout(() => {
        if (pattern.hold > 0) {
          setCurrentPhase('hold');
        }
      }, pattern.inhale * 1000);

      setTimeout(() => {
        setCurrentPhase('exhale');
      }, (pattern.inhale + pattern.hold) * 1000);
    };

    runCycle();
    const totalCycleTime = (pattern.inhale + pattern.hold + pattern.exhale) * 1000;
    const cycleInterval = setInterval(runCycle, totalCycleTime);

    return () => clearInterval(cycleInterval);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = async () => {
    setIsPlaying(false);
    setCurrentPhase('inhale');
    setSeconds(0);
    scale.value = 0.5;
    opacity.value = 0.3;

    if (sessionStartTime && seconds > 10) {
      await saveSession();
    }
    setSessionStartTime(null);
  };

  const saveSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const guestId = await getItem<string>(storageKeys.GUEST_ID);

      await supabase.from('meditation_sessions').insert({
        user_id: user?.id,
        guest_id: !user ? guestId : null,
        duration: seconds,
        type: 'breathing',
      });
    } catch (error) {
      console.error('Error saving meditation session:', error);
    }
  };

  const changePattern = (index: number) => {
    if (!isPlaying) {
      setSelectedPattern(index);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
    }
  };

  const getPhaseCount = () => {
    switch (currentPhase) {
      case 'inhale':
        return pattern.inhale;
      case 'hold':
        return pattern.hold;
      case 'exhale':
        return pattern.exhale;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Breathe & Meditate</Text>
          <Text style={styles.headerSubtitle}>
            Take a moment to center yourself
          </Text>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>

        <View style={styles.breathContainer}>
          <Animated.View style={[styles.breathCircle, animatedStyle]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.circleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          <View style={styles.phaseIndicator}>
            <Text style={styles.phaseText}>{getPhaseText()}</Text>
            {isPlaying && (
              <Text style={styles.phaseCount}>{getPhaseCount()}s</Text>
            )}
          </View>
        </View>

        <View style={styles.patternSelector}>
          {BREATH_PATTERNS.map((p, index) => (
            <Pressable
              key={index}
              style={[
                styles.patternButton,
                selectedPattern === index && styles.patternButtonActive,
                isPlaying && styles.patternButtonDisabled,
              ]}
              onPress={() => changePattern(index)}
              disabled={isPlaying}>
              <Text
                style={[
                  styles.patternButtonText,
                  selectedPattern === index && styles.patternButtonTextActive,
                ]}>
                {p.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.controls}>
          <Pressable
            style={styles.controlButton}
            onPress={handleReset}
            disabled={!isPlaying && seconds === 0}>
            <RotateCcw size={28} color={seconds > 0 ? '#ffffff' : '#9ca3af'} />
          </Pressable>

          <Pressable
            style={styles.playButton}
            onPress={handleTogglePlay}>
            <LinearGradient
              colors={['#ffffff', '#f3f4f6']}
              style={styles.playButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              {isPlaying ? (
                <Pause size={40} color="#3b82f6" />
              ) : (
                <Play size={40} color="#3b82f6" />
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.controlButton} />
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Tips for Better Meditation</Text>
          <Text style={styles.tipsText}>
            • Find a quiet, comfortable space{'\n'}
            • Close your eyes or soften your gaze{'\n'}
            • Let thoughts pass without judgment{'\n'}
            • Focus on the rhythm of your breath
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  breathContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  breathCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: 'hidden',
  },
  circleGradient: {
    flex: 1,
    borderRadius: CIRCLE_SIZE / 2,
  },
  phaseIndicator: {
    position: 'absolute',
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  phaseCount: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  patternSelector: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  patternButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patternButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#ffffff',
  },
  patternButtonDisabled: {
    opacity: 0.5,
  },
  patternButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  patternButtonTextActive: {
    color: '#ffffff',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  controlButton: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tips: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
});
