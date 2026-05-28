import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { doctorService } from '@/services/doctor';
import { Button } from '@/components/Button';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';
import type { TimeSlot } from '@/services/doctor';

export default function DoctorScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [createdSlots, setCreatedSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate().toString(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  // Generate time options (every 30 min from 06:00 to 22:00)
  const timeOptions = Array.from({ length: 33 }, (_, i) => {
    const h = Math.floor(i / 2) + 6;
    const m = (i % 2) * 30;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  });

  const handleCreateSlots = async () => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please select a date first');
      return;
    }
    if (startTime >= endTime) {
      Alert.alert('Invalid Time', 'End time must be after start time');
      return;
    }
    setLoading(true);
    try {
      const slots = await doctorService.createTimeSlots(selectedDate, startTime, endTime);
      setCreatedSlots(slots);
      Alert.alert('Success', `${slots.length} time slot(s) created for ${selectedDate}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create time slots');
    } finally {
      setLoading(false);
    }
  };

  // Gate: if appointments not enabled, show contact-admin message
  const canTakeAppointments = user?.doctorProfile?.canTakeAppointments;
  if (canTakeAppointments === false) {
    return (
      <View style={[styles.container, styles.gateContainer]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <Text style={styles.title}>Manage Schedule</Text>
          <Text style={styles.subtitle}>Configure your available time slots</Text>
        </View>
        <View style={styles.gateContent}>
          <View style={styles.gateIconRing}>
            <Ionicons name="lock-closed" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.gateTitle}>Appointment Booking Not Enabled</Text>
          <Text style={styles.gateText}>
            Your profile is verified, but appointment booking has not been enabled for your account yet.
            Please contact admin for more information or approval.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Frameless Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.title}>Manage Schedule</Text>
        <Text style={styles.subtitle}>Configure your available time slots</Text>
      </View>

      {/* Date Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScrollContainer}>
          {dates.map((d) => {
            const isActive = selectedDate === d.full;
            return (
              <TouchableOpacity
                key={d.full}
                style={[
                  styles.dateChip,
                  isActive && styles.dateChipActive,
                  isActive && Shadows.sm,
                ]}
                onPress={() => {
                  setSelectedDate(d.full);
                  setCreatedSlots([]);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.dateDay, isActive && styles.dateDayActive]}>
                  {d.day}
                </Text>
                <Text style={[styles.dateNum, isActive && styles.dateNumActive]}>
                  {d.date}
                </Text>
                <Text style={[styles.dateMonth, isActive && styles.dateMonthActive]}>
                  {d.month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Time Range */}
      <View style={[styles.card, Shadows.md]}>
        <Text style={styles.cardSectionTitle}>Working Hours</Text>
        <Text style={styles.helperText}>
          Slots will be auto-generated in 30-minute intervals
        </Text>

        <View style={styles.timeRow}>
          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>Start Time</Text>
            <View style={styles.timePickerContainer}>
              <ScrollView style={styles.timePicker} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {timeOptions.map((t) => (
                  <TouchableOpacity
                    key={`start-${t}`}
                    style={[styles.timeOption, startTime === t && styles.timeOptionActive]}
                    onPress={() => setStartTime(t)}
                  >
                    <Text
                      style={[styles.timeText, startTime === t && styles.timeTextActive]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.timeDivider}>
            <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
          </View>

          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>End Time</Text>
            <View style={styles.timePickerContainer}>
              <ScrollView style={styles.timePicker} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {timeOptions.map((t) => (
                  <TouchableOpacity
                    key={`end-${t}`}
                    style={[styles.timeOption, endTime === t && styles.timeOptionActive]}
                    onPress={() => setEndTime(t)}
                  >
                    <Text
                      style={[styles.timeText, endTime === t && styles.timeTextActive]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={styles.summary}>
          <Ionicons name="time" size={18} color={Colors.primary} />
          <Text style={styles.summaryText}>
            {selectedDate
              ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '(select date)'}{' '}
            • {startTime} → {endTime}
          </Text>
        </View>

        <Button
          title="Create Time Slots"
          onPress={handleCreateSlots}
          loading={loading}
          fullWidth
          size="lg"
          disabled={!selectedDate}
        />
      </View>

      {/* Created Slots */}
      {createdSlots.length > 0 && (
        <View style={[styles.card, Shadows.md]}>
          <Text style={styles.cardSectionTitle}>
            Created Slots ({createdSlots.length})
          </Text>
          <View style={styles.slotsGrid}>
            {createdSlots.map((slot) => (
              <View
                key={slot.id}
                style={[
                  styles.slotChip,
                  slot.isBooked ? styles.slotBooked : styles.slotAvailable,
                ]}
              >
                <Text
                  style={[
                    styles.slotTime,
                    slot.isBooked ? styles.slotTimeBooked : styles.slotTimeAvailable,
                  ]}
                >
                  {slot.startTime} - {slot.endTime}
                </Text>
                {slot.isBooked && (
                  <Ionicons name="lock-closed" size={12} color={Colors.textTertiary} />
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  cardSectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  helperText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },

  gateContainer: {
    justifyContent: 'flex-start',
  },
  gateContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    marginTop: 40,
  },
  gateIconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  gateTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  gateText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Fonts.lineHeights.sm,
  },

  dateScrollContainer: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  dateChip: {
    width: 64,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: Colors.surface,
  },
  dateChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateDay: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dateDayActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dateNum: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '800',
    color: Colors.text,
    marginVertical: 2,
  },
  dateNumActive: {
    color: '#fff',
  },
  dateMonth: {
    fontSize: 9,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  dateMonthActive: {
    color: 'rgba(255, 255, 255, 0.7)',
  },

  timeRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  timeCol: {
    flex: 1,
  },
  timeDivider: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
  },
  timeLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  timePickerContainer: {
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  timePicker: {
    maxHeight: 160,
  },
  timeOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  timeOptionActive: {
    backgroundColor: Colors.primaryFaded,
  },
  timeText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  timeTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.primaryFaded,
    borderRadius: Radii.md,
  },
  summaryText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },

  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  slotChip: {
    width: '47.5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1.5,
  },
  slotAvailable: {
    backgroundColor: Colors.successLight + '20',
    borderColor: Colors.successLight,
  },
  slotBooked: {
    backgroundColor: Colors.surface,
    borderColor: '#e2e8f0',
  },
  slotTime: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
  },
  slotTimeAvailable: {
    color: Colors.success,
  },
  slotTimeBooked: {
    color: Colors.textTertiary,
  },
});

