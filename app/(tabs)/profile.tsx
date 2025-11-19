import { View, ScrollView, Switch, StyleSheet, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { User, Moon, LogOut, Sparkles, Bell, ChevronRight, BookOpen } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme-store';
import { useColorScheme } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const { theme, setTheme, setActiveColorScheme } = useThemeStore();
  const [profile, setProfile] = useState<{ display_name: string; bio?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);

  const isDarkMode = theme === 'dark' || (theme === 'auto' && systemColorScheme === 'dark');

  useEffect(() => {
    if (theme === 'auto') {
      setActiveColorScheme(systemColorScheme);
    } else {
      setActiveColorScheme(theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme, systemColorScheme, setActiveColorScheme]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setProfile({ display_name: 'Guest User', bio: 'Exploring SOWD' });
        setIsGuest(true);
        setLoading(false);
        return;
      }

      setIsGuest(false);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
      } else {
        setProfile({ display_name: user.email || 'User', bio: undefined });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile({ display_name: 'Guest User', bio: undefined });
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/auth/login' as any);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Your settings and preferences</Text>
        </View>

        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#22c55e', '#16a34a']}
            style={styles.profileGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <View style={styles.avatarContainer}>
              <User size={40} color="#ffffff" strokeWidth={2} />
            </View>
            <Text style={styles.profileName}>
              {profile?.display_name || 'Loading...'}
            </Text>
            {profile?.bio && (
              <Text style={styles.profileBio}>{profile.bio}</Text>
            )}
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Moon size={20} color="#22c55e" />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Easier on the eyes</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeToggle}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={isDarkMode ? '#22c55e' : '#f3f4f6'}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => router.push('/settings/reminders' as any)}>
            <View style={styles.actionIcon}>
              <Bell size={20} color="#3b82f6" />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Prayer Reminders</Text>
              <Text style={styles.actionDescription}>Set daily prayer reminders</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => router.push('/scripture/library' as any)}>
            <View style={styles.actionIcon}>
              <BookOpen size={20} color="#6366f1" />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Scripture Library</Text>
              <Text style={styles.actionDescription}>Search and save Bible verses</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
        </View>

        {!isGuest && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>

            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={handleSignOut}>
              <View style={styles.actionIcon}>
                <LogOut size={20} color="#ef4444" />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Sign Out</Text>
                <Text style={styles.actionDescription}>See you soon</Text>
              </View>
            </Pressable>
          </View>
        )}

        <View style={styles.footer}>
          <Sparkles size={24} color="#22c55e" />
          <Text style={styles.footerText}>SOWD v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Made with grace for those who struggle
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
  profileCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  profileGradient: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#9ca3af',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  actionCardPressed: {
    opacity: 0.7,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: '#9ca3af',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 12,
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 13,
    color: '#d1d5db',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  spacer: {
    height: 40,
  },
});
