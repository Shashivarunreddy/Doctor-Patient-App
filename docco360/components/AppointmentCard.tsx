import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
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
      className="bg-card rounded-2xl p-6 mb-3 border border-[#c2c6d5]/30 shadow-md"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          <Avatar name={userName} size={44} />
          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-textMain">{userName}</Text>
            <Text className="text-xs text-textSecondary mt-0.5">{userLabel}</Text>
          </View>
        </View>
        <Badge
          label={appointment.status}
          variant={getStatusBadgeVariant(appointment.status)}
        />
      </View>

      <View className="h-[1px] bg-borderLight my-3" />

      <View className="flex-row flex-wrap gap-4">
        <View className="flex-row items-center gap-1">
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
          <Text className="text-sm text-textSecondary font-medium">{formattedDate}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Ionicons name="time-outline" size={16} color={Colors.primary} />
          <Text className="text-sm text-textSecondary font-medium">
            {startTime} - {endTime}
          </Text>
        </View>
        {appointment.amount > 0 && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="cash-outline" size={16} color={Colors.success} />
            <Text className="text-sm text-textSecondary font-medium">₹{appointment.amount}</Text>
          </View>
        )}
      </View>

      {appointment.notes && (
        <View className="mt-3 bg-primaryFaded rounded-lg p-3">
          <Text className="text-xs font-semibold text-textSecondary mb-1">Notes:</Text>
          <Text className="text-sm text-textMain leading-tight" numberOfLines={2}>
            {appointment.notes}
          </Text>
        </View>
      )}

      {(canJoin || canEnd || (role === 'admin' && appointment.status === 'CONFIRMED')) && (
        <View className="flex-row gap-3 mt-4">
          {canJoin && onJoinCall && (
            <TouchableOpacity className="flex-row items-center justify-center gap-1 bg-primary px-6 py-3 rounded-xl flex-1" onPress={onJoinCall}>
              <Ionicons name="videocam" size={16} color={Colors.textInverse} />
              <Text className="text-white text-sm font-semibold">Join Call</Text>
            </TouchableOpacity>
          )}
          {canEnd && onEndCall && (
            <TouchableOpacity className="flex-row items-center justify-center gap-1 bg-danger px-6 py-3 rounded-xl flex-1" onPress={onEndCall}>
              <Ionicons name="call" size={16} color={Colors.textInverse} />
              <Text className="text-white text-sm font-semibold">End Call</Text>
            </TouchableOpacity>
          )}
          {role === 'admin' && appointment.status === 'CONFIRMED' && onCancel && (
            <TouchableOpacity className="flex-row items-center justify-center px-6 py-3 rounded-xl border-[1.5px] border-danger flex-1" onPress={onCancel}>
              <Text className="text-danger text-sm font-semibold">Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
