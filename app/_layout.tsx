import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useThemeStore } from '@/stores/theme-store';
import { useColorScheme } from 'react-native';
import './global.css';

export default function RootLayout() {
  useFrameworkReady();

  const systemColorScheme = useColorScheme();
  const { theme, setActiveColorScheme, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  useEffect(() => {
    if (theme === 'auto') {
      setActiveColorScheme(systemColorScheme);
    } else {
      setActiveColorScheme(theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme, systemColorScheme, setActiveColorScheme]);

  const statusBarStyle = theme === 'dark' || (theme === 'auto' && systemColorScheme === 'dark')
    ? 'light'
    : 'dark';

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="prayers/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="seeds/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={statusBarStyle} />
    </>
  );
}
