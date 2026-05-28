import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { patientService, DoctorListing } from '@/services/patient';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';
import type { TimeSlot } from '@/services/doctor';

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [doctor, setDoctor] = useState<DoctorListing | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate().toString(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data = await patientService.getDoctorById(id!);
        setDoctor(data);
      } catch (error) {
        console.error('Failed to fetch doctor:', error);
        Alert.alert('Error', 'Failed to load doctor details');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const fetchSlots = useCallback(
    async (date: string) => {
      setSlotsLoading(true);
      setSelectedSlot(null);
      try {
        const data = await patientService.getDoctorSlots(id!, date);
        setSlots(data.slots || []);
      } catch (error: any) {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    },
    [id],
  );

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    fetchSlots(date);
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      const result = await patientService.bookAppointment(selectedSlot.id, notes || undefined);
      Alert.alert(
        'Appointment Booked! 🎉',
        `Payment: ₹${result.payment.amount} ${result.payment.status}\nTransaction ID: ${result.payment.transactionId}`,
        [{ text: 'View Appointments', onPress: () => router.replace('/(patient)/(tabs)/appointments') }],
      );
    } catch (error: any) {
      Alert.alert('Booking Failed', error.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!doctor) return null;

  const profile = doctor.profile;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Details</Text>
        <TouchableOpacity style={styles.favBtn} activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Doctor Info Header Card */}
        <View style={styles.doctorProfileCard}>
          <View style={styles.avatarWrapper}>
            <Avatar name={doctor.user.name} size={96} />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.doctorName}>Dr. {doctor.user.name}</Text>
          {profile?.specializations && (
            <Text style={styles.specialization}>{profile.specializations.join(' • ')}</Text>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, Shadows.sm]}>
            <View style={[styles.statIconWrap, { backgroundColor: Colors.primaryFaded }]}>
              <Ionicons name="people" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>1000+</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={[styles.statCard, Shadows.sm]}>
            <View style={[styles.statIconWrap, { backgroundColor: Colors.dangerLight }]}>
              <Ionicons name="ribbon" size={20} color={Colors.danger} />
            </View>
            <Text style={styles.statValue}>{profile?.experience || 0} yrs+</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={[styles.statCard, Shadows.sm]}>
            <View style={[styles.statIconWrap, { backgroundColor: Colors.warningLight }]}>
              <Ionicons name="star" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Ratings</Text>
          </View>
        </View>

        {/* About */}
        {profile?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Doctor</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Working Hours */}
        {profile?.availableFrom && profile?.availableTo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Working Time</Text>
            <Text style={styles.workingTimeText}>
              Mon - Sat ({profile.availableFrom} - {profile.availableTo})
            </Text>
          </View>
        )}

        {/* Date Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
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
                  onPress={() => handleDateSelect(d.full)}
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

        {/* Available Slots */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Slots</Text>
            {slotsLoading ? (
              <Text style={styles.helperText}>Loading slots...</Text>
            ) : slots.length === 0 ? (
              <Text style={styles.noSlotsText}>No available slots for this date</Text>
            ) : (
              <View style={styles.slotsGrid}>
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.slotChip,
                        isSelected && styles.slotChipActive,
                      ]}
                      onPress={() => setSelectedSlot(slot)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.slotTime, isSelected && styles.slotTimeActive]}>
                        {slot.startTime}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        {selectedSlot && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symptoms/Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Describe your symptoms or reason for visit..."
              placeholderTextColor={Colors.textTertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={500}
            />
          </View>
        )}
      </ScrollView>

      {/* Book Button Fixed Bar */}
      <View style={[styles.bookBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Consultation Fee</Text>
          <Text style={styles.priceValue}>₹{profile?.consultationFee || 0}</Text>
        </View>
        <Button
          title={selectedSlot ? "Book Appointment" : "Select Time Slot"}
          onPress={handleBook}
          loading={booking}
          disabled={!selectedSlot}
          size="lg"
          style={{ flex: 1, marginLeft: Spacing.xl }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  favBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
  },
  doctorProfileCard: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  doctorName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '800',
    color: Colors.text,
  },
  specialization: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  bioText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Fonts.lineHeights.md,
  },
  workingTimeText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  dateScroll: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  dateChip: {
    width: 60,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: Colors.surface,
    marginRight: Spacing.sm,
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
  helperText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    paddingVertical: Spacing.md,
  },
  noSlotsText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textTertiary,
    paddingVertical: Spacing.md,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  slotChip: {
    width: '30.5%',
    paddingVertical: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaded,
  },
  slotTime: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  slotTimeActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  notesInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: Spacing.xl,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  bookBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
});
