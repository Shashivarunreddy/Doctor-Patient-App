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
import { doctorService } from '@/services/doctor';
import { Avatar } from '@/components/Avatar';
import { Badge, getStatusBadgeVariant } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';
import type { Appointment } from '@/services/doctor';

export default function DoctorAppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await doctorService.getAppointments();
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
      const callData = await doctorService.joinCall(id!);
      router.push({
        pathname: '/call',
        params: {
          appointmentId: id!,
          channelName: callData.channelName,
          token: callData.token,
          appId: callData.appId,
          uid: String(callData.uid),
          role: callData.role,
          remoteName: appointment?.patient?.name || 'Patient',
          remoteRole: 'patient',
          appointmentDate: appointment?.timeSlot?.date || '',
          appointmentTime: `${appointment?.timeSlot?.startTime || ''} - ${appointment?.timeSlot?.endTime || ''}`,
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    setActionLoading(true);
    try {
      await doctorService.endCall(id!);
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

  const patient = appointment.patient;
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
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badges */}
        <View style={styles.statusRow}>
          <Badge label={`Status: ${appointment.status}`} variant={getStatusBadgeVariant(appointment.status)} />
          <Badge label={`Call: ${appointment.callStatus}`} variant={getStatusBadgeVariant(appointment.callStatus)} />
          <Badge label={`Payment: ${appointment.paymentStatus}`} variant={getStatusBadgeVariant(appointment.paymentStatus)} />
        </View>

        {/* Patient Info Card */}
        {patient && (
          <View style={[styles.card, Shadows.md]}>
            <View style={styles.patientInfoRow}>
              <Avatar name={patient.name} size={60} />
              <View style={styles.patientText}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientEmail}>{patient.email}</Text>
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
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="cash" size={18} color={Colors.success} />
            </View>
            <Text style={styles.infoText}>Consultation Fee: ₹{appointment.amount}</Text>
          </View>
          {appointment.paymentId && (
            <View style={styles.infoRow}>
              <View style={styles.iconWrap}>
                <Ionicons name="receipt" size={18} color={Colors.textSecondary} />
              </View>
              <Text style={styles.infoText}>TXN ID: {appointment.paymentId}</Text>
            </View>
          )}
        </View>

        {/* Symptoms/Notes */}
        {appointment.notes && (
          <View style={[styles.card, Shadows.md]}>
            <Text style={styles.sectionTitle}>Patient Symptoms / Notes</Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        )}

        {/* Action Buttons */}
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
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 40,
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
  patientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  patientText: {
    flex: 1,
  },
  patientName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  patientEmail: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
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
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Fonts.lineHeights.md,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
});

