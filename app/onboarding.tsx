import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { setItem, storageKeys } from '@/lib/storage';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    title: 'Welcome to Seeds of Word & Deed',
    subtitle: 'Plant seeds through prayer and action. Watch your spiritual garden grow.',
    color: ['#22c55e', '#16a34a'],
  },
  {
    title: 'Pray & Reflect',
    subtitle: 'Journal your prayers and spiritual reflections in a peaceful space.',
    color: ['#3b82f6', '#2563eb'],
  },
  {
    title: 'Plant Seeds',
    subtitle: 'Turn prayers into action. Commit to words of encouragement and acts of kindness.',
    color: ['#f59e0b', '#d97706'],
  },
  {
    title: 'Watch Your Garden Bloom',
    subtitle: 'As you complete seeds, your spiritual garden flourishes with beautiful plants.',
    color: ['#8b5cf6', '#7c3aed'],
  },
];

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const scale = useSharedValue(0);
  const breatheScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      false
    );
  }, [currentPage]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const breatheAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }],
  }));

  const handleContinue = async () => {
    if (currentPage < onboardingData.length - 1) {
      scale.value = 0;
      setCurrentPage(currentPage + 1);
    } else {
      await setItem(storageKeys.ONBOARDING_COMPLETED, true);
      router.replace('/(tabs)');
    }
  };

  const currentData = onboardingData[currentPage];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[currentData.color[0], currentData.color[1], '#ffffff']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>

        <View style={styles.content}>
          <View style={styles.circleContainer}>
            <Animated.View style={[styles.circle, animatedCircleStyle, breatheAnimatedStyle]}>
              <LinearGradient
                colors={[currentData.color[0], currentData.color[1]]}
                style={styles.circleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentData.title}</Text>
            <Text style={styles.subtitle}>{currentData.subtitle}</Text>

            <View style={styles.pagination}>
              {onboardingData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentPage && styles.activeDot,
                  ]}
                />
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleContinue}>
              <Text style={styles.buttonText}>
                {currentPage === onboardingData.length - 1 ? 'Get Started' : 'Continue'}
              </Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  circle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    overflow: 'hidden',
  },
  circleGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  textContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 50,
    minHeight: height * 0.4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#6b7280',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#22c55e',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
