import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';
import { Avatar } from './Avatar';
import { Badge, getStatusBadgeVariant } from './Badge';
import type { Appointment } from '@/services/doctor';

interface AppointmentCardProps {
  appointment: Appointment;
  role: 'patient' | 'doctor' | 'admin';
  onPress?: () => void;
  onJoinCall?: () => void;
  onEndCall?: () => void;
  onCancel?: () => void;
}

export function AppointmentCard({
  appointment,
  role,
  onPress,
  onJoinCall,
  onEndCall,
  onCancel,
}: AppointmentCardProps) {
  const otherUser =
    role === 'patient'
      ? appointment.doctor
      : appointment.patient;
  const userName = otherUser?.name || 'Unknown';
  const userLabel = role === 'patient' ? 'Doctor' : 'Patient';

  const date = appointment.timeSlot?.date || '';
  const startTime = appointment.timeSlot?.startTime || '';
  const endTime = appointment.timeSlot?.endTime || '';

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const canJoin =
    appointment.status === 'CONFIRMED' &&
    (appointment.callStatus === 'SCHEDULED' || appointment.callStatus === 'IN_PROGRESS');
  const canEnd = appointment.callStatus === 'IN_PROGRESS';

  return (
    <TouchableOpacity
      style={[styles.card, Shadows.md]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar name={userName} size={44} />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.label}>{userLabel}</Text>
          </View>
        </View>
        <Badge
          label={appointment.status}
          variant={getStatusBadgeVariant(appointment.status)}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
          <Text style={styles.detailText}>{formattedDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={Colors.primary} />
          <Text style={styles.detailText}>
            {startTime} - {endTime}
          </Text>
        </View>
        {appointment.amount > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color={Colors.success} />
            <Text style={styles.detailText}>₹{appointment.amount}</Text>
          </View>
        )}
      </View>

      {appointment.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText} numberOfLines={2}>
            {appointment.notes}
          </Text>
        </View>
      )}

      {(canJoin || canEnd || (role === 'admin' && appointment.status === 'CONFIRMED')) && (
        <View style={styles.actions}>
          {canJoin && onJoinCall && (
            <TouchableOpacity style={styles.joinButton} onPress={onJoinCall}>
              <Ionicons name="videocam" size={16} color={Colors.textInverse} />
              <Text style={styles.joinText}>Join Call</Text>
            </TouchableOpacity>
          )}
          {canEnd && onEndCall && (
            <TouchableOpacity style={styles.endButton} onPress={onEndCall}>
              <Ionicons name="call" size={16} color={Colors.textInverse} />
              <Text style={styles.endText}>End Call</Text>
            </TouchableOpacity>
          )}
          {role === 'admin' && appointment.status === 'CONFIRMED' && onCancel && (
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  name: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  label: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryFaded,
    borderRadius: Radii.sm,
    padding: Spacing.md,
  },
  notesLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  notesText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    lineHeight: Fonts.lineHeights.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    flex: 1,
  },
  joinText: {
    color: Colors.textInverse,
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.danger,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    flex: 1,
  },
  endText: {
    color: Colors.textInverse,
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    flex: 1,
  },
  cancelText: {
    color: Colors.danger,
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
  },
});
