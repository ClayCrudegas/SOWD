import { View, ScrollView, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { BookHeart, ChevronRight, Check, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface Template {
  id: string;
  title: string;
  category: string;
  prompts: string[];
  estimated_duration: number;
}

export default function GuidedPrayersScreen() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('guided_prayer_templates')
        .select('*')
        .order('category');

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const startPrayer = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentPromptIndex(0);
    setResponses([]);
    setCurrentResponse('');
  };

  const handleNext = () => {
    if (!selectedTemplate) return;

    const newResponses = [...responses, currentResponse];
    setResponses(newResponses);

    if (currentPromptIndex < selectedTemplate.prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
      setCurrentResponse('');
    } else {
      handleComplete(newResponses);
    }
  };

  const handleComplete = (finalResponses: string[]) => {
    if (!selectedTemplate) return;

    const prayerText = selectedTemplate.prompts
      .map((prompt, i) => `${prompt}\n${finalResponses[i]}`)
      .join('\n\n');

    Alert.alert(
      'Prayer Complete! 🙏',
      'Your guided prayer has been completed. Would you like to save it?',
      [
        {
          text: 'Discard',
          style: 'cancel',
          onPress: () => {
            setSelectedTemplate(null);
            setCurrentPromptIndex(0);
            setResponses([]);
            setCurrentResponse('');
          },
        },
        {
          text: 'Save',
          onPress: () => {
            savePrayer(prayerText);
          },
        },
      ]
    );
  };

  const savePrayer = async (content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('prayers').insert({
        user_id: user?.id,
        title: `${selectedTemplate?.title} Prayer`,
        content: content,
        is_public: false,
      });

      if (error) throw error;

      Alert.alert('Saved!', 'Your prayer has been saved to your journal');
      router.back();
    } catch (error) {
      console.error('Error saving prayer:', error);
      Alert.alert('Error', 'Failed to save prayer');
    }
  };

  const handleBack = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
      setCurrentResponse(responses[currentPromptIndex - 1] || '');
      setResponses(responses.slice(0, -1));
    } else {
      setSelectedTemplate(null);
    }
  };

  if (selectedTemplate) {
    const currentPrompt = selectedTemplate.prompts[currentPromptIndex];
    const progress = ((currentPromptIndex + 1) / selectedTemplate.prompts.length) * 100;

    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#ec4899', '#f43f5e']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>

          <View style={styles.prayerHeader}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color="#ffffff" />
            </Pressable>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {currentPromptIndex + 1} of {selectedTemplate.prompts.length}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <ScrollView style={styles.prayerContent} showsVerticalScrollIndicator={false}>
            <View style={styles.promptCard}>
              <Text style={styles.promptText}>{currentPrompt}</Text>
            </View>

            <View style={styles.responseCard}>
              <TextInput
                style={styles.responseInput}
                placeholder="Write your response..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={currentResponse}
                onChangeText={setCurrentResponse}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {responses.length > 0 && (
              <View style={styles.previousResponses}>
                <Text style={styles.previousTitle}>Previous Reflections</Text>
                {responses.map((response, index) => (
                  <View key={index} style={styles.previousCard}>
                    <Text style={styles.previousPrompt}>
                      {selectedTemplate.prompts[index]}
                    </Text>
                    <Text style={styles.previousResponse}>{response}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[
                styles.nextButton,
                !currentResponse.trim() && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!currentResponse.trim()}>
              <Text style={styles.nextButtonText}>
                {currentPromptIndex < selectedTemplate.prompts.length - 1
                  ? 'Next'
                  : 'Complete'}
              </Text>
              {currentPromptIndex < selectedTemplate.prompts.length - 1 ? (
                <ChevronRight size={24} color="#ffffff" />
              ) : (
                <Check size={24} color="#ffffff" />
              )}
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BookHeart size={32} color="#ec4899" />
        <Text style={styles.headerTitle}>Guided Prayers</Text>
        <Text style={styles.headerSubtitle}>
          Follow prompts to deepen your prayer life
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading templates...</Text>
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No templates available</Text>
          </View>
        ) : (
          <View style={styles.templatesList}>
            {templates.map(template => (
              <Pressable
                key={template.id}
                style={({ pressed }) => [
                  styles.templateCard,
                  pressed && styles.templateCardPressed,
                ]}
                onPress={() => startPrayer(template)}>
                <LinearGradient
                  colors={['#ec4899', '#f43f5e']}
                  style={styles.templateGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <View style={styles.templateContent}>
                    <Text style={styles.templateCategory}>{template.category.toUpperCase()}</Text>
                    <Text style={styles.templateTitle}>{template.title}</Text>
                    <Text style={styles.templateDuration}>
                      {template.estimated_duration} minutes • {template.prompts.length} prompts
                    </Text>
                  </View>
                  <ChevronRight size={24} color="rgba(255, 255, 255, 0.8)" />
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💭 How it Works</Text>
          <Text style={styles.infoText}>
            Select a prayer template and follow the guided prompts. Take your time to reflect on each question. Your responses will be saved as a personal prayer that you can revisit anytime.
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
    backgroundColor: '#f9fafb',
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  templatesList: {
    padding: 24,
    gap: 16,
  },
  templateCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  templateCardPressed: {
    opacity: 0.9,
  },
  templateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  templateContent: {
    flex: 1,
  },
  templateCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  templateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  templateDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  infoCard: {
    marginHorizontal: 24,
    padding: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 24,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
  prayerContent: {
    flex: 1,
    paddingTop: 24,
  },
  promptCard: {
    marginHorizontal: 24,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 20,
  },
  promptText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 28,
  },
  responseCard: {
    marginHorizontal: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  responseInput: {
    fontSize: 16,
    color: '#ffffff',
    minHeight: 120,
  },
  previousResponses: {
    marginTop: 32,
    marginHorizontal: 24,
  },
  previousTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  previousCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  previousPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  previousResponse: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ec4899',
  },
});
