import { View, ScrollView, Pressable, StyleSheet, Switch, TextInput, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { Bell, Plus, Trash2, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { getItem, storageKeys } from '@/lib/storage';

interface Reminder {
  id: string;
  time_of_day: string;
  days_of_week: string[];
  message: string;
  is_active: boolean;
}

const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export default function RemindersScreen() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTime, setNewTime] = useState('09:00');
  const [newMessage, setNewMessage] = useState('Time to pray 🙏');
  const [selectedDays, setSelectedDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const guestId = await getItem<string>(storageKeys.GUEST_ID);

      const query = supabase
        .from('prayer_reminders')
        .select('*')
        .order('time_of_day');

      if (user) {
        query.eq('user_id', user.id);
      } else if (guestId) {
        query.eq('guest_id', guestId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleAddReminder = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const guestId = await getItem<string>(storageKeys.GUEST_ID);

      const { error } = await supabase.from('prayer_reminders').insert({
        user_id: user?.id,
        guest_id: !user ? guestId : null,
        time_of_day: newTime,
        days_of_week: selectedDays,
        message: newMessage,
        is_active: true,
      });

      if (error) throw error;

      setShowAddForm(false);
      setNewTime('09:00');
      setNewMessage('Time to pray 🙏');
      setSelectedDays(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
      loadReminders();

      Alert.alert('Success', 'Reminder created! Note: Push notifications require native build.');
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Error', 'Failed to create reminder');
    }
  };

  const toggleReminder = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('prayer_reminders')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      setReminders(prev =>
        prev.map(r => r.id === id ? { ...r, is_active: !currentState } : r)
      );
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prayer_reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDays = (days: string[]) => {
    if (days.length === 7) return 'Every day';
    return days.map(d => DAYS.find(day => day.key === d)?.label).join(', ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Prayer Reminders</Text>
          <Text style={styles.headerSubtitle}>
            Set daily reminders for your prayer time
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No reminders yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first prayer reminder to stay consistent
            </Text>
          </View>
        ) : (
          <View style={styles.remindersList}>
            {reminders.map(reminder => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderContent}>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderTime}>
                      {formatTime(reminder.time_of_day)}
                    </Text>
                    <Text style={styles.reminderMessage}>{reminder.message}</Text>
                    <Text style={styles.reminderDays}>
                      {formatDays(reminder.days_of_week)}
                    </Text>
                  </View>
                  <View style={styles.reminderActions}>
                    <Switch
                      value={reminder.is_active}
                      onValueChange={() => toggleReminder(reminder.id, reminder.is_active)}
                      trackColor={{ false: '#d1d5db', true: '#86efac' }}
                      thumbColor={reminder.is_active ? '#22c55e' : '#f3f4f6'}
                    />
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => deleteReminder(reminder.id)}>
                      <Trash2 size={20} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formLabel}>Time</Text>
            <TextInput
              style={styles.timeInput}
              value={newTime}
              onChangeText={setNewTime}
              placeholder="09:00"
            />

            <Text style={styles.formLabel}>Message</Text>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Time to pray 🙏"
            />

            <Text style={styles.formLabel}>Days</Text>
            <View style={styles.daysGrid}>
              {DAYS.map(day => (
                <Pressable
                  key={day.key}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(day.key) && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(day.key)}>
                  <Text
                    style={[
                      styles.dayButtonText,
                      selectedDays.includes(day.key) && styles.dayButtonTextActive,
                    ]}>
                    {day.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.formButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowAddForm(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.saveButton}
                onPress={handleAddReminder}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {!showAddForm && (
        <View style={styles.footer}>
          <Pressable
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}>
            <Plus size={24} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Reminder</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  remindersList: {
    padding: 24,
    gap: 16,
  },
  reminderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reminderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  reminderMessage: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  reminderDays: {
    fontSize: 14,
    color: '#9ca3af',
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 8,
  },
  addForm: {
    margin: 24,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  dayButtonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  dayButtonTextActive: {
    color: '#ffffff',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});
