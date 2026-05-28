import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { patientService } from '@/services/patient';
import { Avatar } from '@/components/Avatar';
import { Badge, getStatusBadgeVariant } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';
import type { Appointment } from '@/services/doctor';

export default function PatientAppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await patientService.getAppointments();
        const found = data.find((a) => a.id === id);
        setAppointment(found || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      const callData = await patientService.joinCall(id!);
      Alert.alert(
        'Call Connected 📞',
        `Channel: ${callData.channelName}\nRole: ${callData.role}\nExpires in: ${callData.expiresIn}s`,
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    setActionLoading(true);
    try {
      await patientService.endCall(id!);
      Alert.alert('Call Ended', 'Appointment marked as completed.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!appointment) return <LoadingScreen message="Appointment not found" />;

  const doctor = appointment.doctor;
  const slot = appointment.timeSlot;
  const canJoin = appointment.status === 'CONFIRMED' && appointment.callStatus !== 'COMPLETED';
  const canEnd = appointment.callStatus === 'IN_PROGRESS';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Info</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badges */}
        <View style={styles.statusRow}>
          <Badge label={`Status: ${appointment.status}`} variant={getStatusBadgeVariant(appointment.status)} />
          <Badge label={`Call: ${appointment.callStatus}`} variant={getStatusBadgeVariant(appointment.callStatus)} />
          <Badge label={`Payment: ${appointment.paymentStatus}`} variant={getStatusBadgeVariant(appointment.paymentStatus)} />
        </View>

        {/* Doctor Info Card */}
        {doctor && (
          <View style={[styles.card, Shadows.md]}>
            <View style={styles.doctorInfoRow}>
              <Avatar name={doctor.name} size={60} />
              <View style={styles.doctorText}>
                <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
                <Text style={styles.doctorEmail}>{doctor.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Schedule */}
        <View style={[styles.card, Shadows.md]}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.infoRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="calendar" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.infoText}>
              {slot?.date ? new Date(slot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="time" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.infoText}>{slot?.startTime} - {slot?.endTime}</Text>
          </View>
        </View>

        {/* Payment */}
        <View style={[styles.card, Shadows.md]}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="cash" size={18} color={Colors.success} />
            </View>
            <Text style={styles.infoText}>₹{appointment.amount}</Text>
          </View>
          {appointment.paymentId && (
            <View style={styles.infoRow}>
              <View style={styles.iconWrap}>
                <Ionicons name="receipt" size={18} color={Colors.textSecondary} />
              </View>
              <Text style={styles.infoText}>TXN: {appointment.paymentId}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {appointment.notes && (
          <View style={[styles.card, Shadows.md]}>
            <Text style={styles.sectionTitle}>Symptoms/Notes</Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {canJoin && (
            <Button
              title="Join Video Call"
              onPress={handleJoin}
              loading={actionLoading}
              fullWidth
              size="lg"
              icon={<Ionicons name="videocam" size={20} color="#fff" />}
            />
          )}
          {canEnd && (
            <Button
              title="End Call"
              onPress={handleEnd}
              loading={actionLoading}
              fullWidth
              size="lg"
              variant="danger"
              icon={<Ionicons name="call" size={20} color="#fff" />}
            />
          )}
        </View>
      </ScrollView>
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
  content: {
    padding: Spacing.xl,
    paddingBottom: 60,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  doctorName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  doctorEmail: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  notesText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    lineHeight: Fonts.lineHeights.md,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
});
