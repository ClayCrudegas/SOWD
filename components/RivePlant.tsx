import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { useEffect, useRef, useState } from 'react';

interface RivePlantProps {
  size?: number;
  stateMachine?: string;
  autoplay?: boolean;
  interactive?: boolean;
  variant?: 'default' | 'small' | 'large';
}

export function RivePlant({
  size = 200,
  stateMachine = 'State Machine 1',
  autoplay = true,
  interactive = false,
  variant = 'default'
}: RivePlantProps) {
  if (Platform.OS === 'web') {
    return <WebPlantFallback size={size} variant={variant} />;
  }

  return <NativePlant size={size} stateMachine={stateMachine} autoplay={autoplay} interactive={interactive} />;
}

function WebPlantFallback({ size, variant }: { size: number; variant: 'default' | 'small' | 'large' }) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.placeholder, getVariantStyles(variant)]}>
        <View style={styles.stem} />
        <View style={styles.leaf1} />
        <View style={styles.leaf2} />
      </View>
    </View>
  );
}

function NativePlant({
  size,
  stateMachine,
  autoplay,
  interactive
}: {
  size: number;
  stateMachine: string;
  autoplay: boolean;
  interactive: boolean;
}) {
  const Rive = require('rive-react-native').default;
  const { RiveRef, Fit, Alignment } = require('rive-react-native');

  const riveRef = useRef<any>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (autoplay && riveRef.current) {
      riveRef.current.play();
    }
  }, [autoplay]);

  const handlePress = () => {
    if (interactive && riveRef.current) {
      riveRef.current.fireState(stateMachine, 'hover');
    }
  };

  const content = (
    <Rive
      ref={riveRef}
      url="https://public.rive.app/hosted/40979/59838/UtbY5pWnW0CvJTZ49qfbew.riv"
      stateMachineName={stateMachine}
      fit={Fit.Contain}
      alignment={Alignment.Center}
      autoplay={autoplay}
      style={styles.rive}
    />
  );

  if (interactive) {
    return (
      <Pressable
        style={[styles.container, { width: size, height: size }]}
        onPress={handlePress}
        onPressIn={() => setIsHovered(true)}
        onPressOut={() => setIsHovered(false)}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {content}
    </View>
  );
}

function getVariantStyles(variant: 'default' | 'small' | 'large') {
  switch (variant) {
    case 'small':
      return { transform: [{ scale: 0.7 }] };
    case 'large':
      return { transform: [{ scale: 1.3 }] };
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rive: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  stem: {
    width: 8,
    height: '60%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  leaf1: {
    width: 40,
    height: 60,
    backgroundColor: '#16a34a',
    borderRadius: 20,
    position: 'absolute',
    bottom: '40%',
    left: '30%',
    transform: [{ rotate: '-30deg' }],
  },
  leaf2: {
    width: 40,
    height: 60,
    backgroundColor: '#15803d',
    borderRadius: 20,
    position: 'absolute',
    bottom: '50%',
    right: '30%',
    transform: [{ rotate: '30deg' }],
  },
});
