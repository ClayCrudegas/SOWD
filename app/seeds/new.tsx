import { View, TextInput, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui';
import { X, MessageSquare, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';

type SeedType = 'word' | 'deed';

export default function NewSeedScreen() {
  const router = useRouter();
  const [type, setType] = useState<SeedType>('word');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!description.trim()) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.back();
        return;
      }

      const { error } = await supabase
        .from('seeds')
        .insert([
          {
            user_id: user.id,
            type,
            description: description.trim(),
          },
        ]);

      if (error) throw error;

      router.back();
    } catch (error) {
      console.error('Error saving seed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={type === 'word' ? ['#f59e0b', '#d97706', '#ffffff'] : ['#8b5cf6', '#7c3aed', '#ffffff']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}>

        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
            onPress={() => router.back()}>
            <X size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.headerTitle}>Plant a Seed</Text>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
              isSaving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving || !description.trim()}>
            <Text style={styles.saveText}>Plant</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">

            <View style={styles.inputContainer}>
              <Text style={styles.sectionTitle}>Choose your seed type</Text>

              <View style={styles.typeSelector}>
                <Pressable
                  style={({ pressed }) => [
                    styles.typeButton,
                    type === 'word' && styles.typeButtonActive,
                    pressed && styles.typeButtonPressed,
                  ]}
                  onPress={() => setType('word')}>
                  <View style={[
                    styles.typeIcon,
                    type === 'word' && styles.typeIconActive,
                  ]}>
                    <MessageSquare
                      size={24}
                      color={type === 'word' ? '#ffffff' : '#f59e0b'}
                    />
                  </View>
                  <Text style={[
                    styles.typeLabel,
                    type === 'word' && styles.typeLabelActive,
                  ]}>
                    Word
                  </Text>
                  <Text style={styles.typeDescription}>
                    Encouragement, prayer, kind words
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.typeButton,
                    type === 'deed' && styles.typeButtonActive,
                    pressed && styles.typeButtonPressed,
                  ]}
                  onPress={() => setType('deed')}>
                  <View style={[
                    styles.typeIcon,
                    type === 'deed' && styles.typeIconActive,
                  ]}>
                    <Heart
                      size={24}
                      color={type === 'deed' ? '#ffffff' : '#8b5cf6'}
                    />
                  </View>
                  <Text style={[
                    styles.typeLabel,
                    type === 'deed' && styles.typeLabelActive,
                  ]}>
                    Deed
                  </Text>
                  <Text style={styles.typeDescription}>
                    Action, service, kindness
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.sectionTitle}>What will you do?</Text>

              <TextInput
                style={styles.descriptionInput}
                placeholder={
                  type === 'word'
                    ? 'e.g., Send an encouraging message to a friend'
                    : 'e.g., Volunteer at local community center'
                }
                placeholderTextColor="#9ca3af"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />

              <Text style={styles.hint}>
                Commit to something specific and achievable
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    minHeight: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  typeButtonPressed: {
    opacity: 0.8,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typeIconActive: {
    backgroundColor: '#22c55e',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  typeLabelActive: {
    color: '#22c55e',
  },
  typeDescription: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
  descriptionInput: {
    fontSize: 17,
    color: '#374151',
    lineHeight: 26,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
