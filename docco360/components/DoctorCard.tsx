import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Avatar } from './Avatar';
import type { DoctorListing } from '@/services/patient';

interface DoctorCardProps {
  doctor: DoctorListing;
  onPress: () => void;
}

export function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const profile = doctor.profile;
  const specializations = profile?.specializations?.slice(0, 2) || [];

  return (
    <TouchableOpacity
      className="bg-card rounded-2xl p-4 mb-3 shadow-md"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center">
        <Avatar name={doctor.user.name} size={56} />
        <View className="flex-1 ml-4 mr-2">
          <Text className="text-base font-bold text-textMain">Dr. {doctor.user.name}</Text>
          {specializations.length > 0 && (
            <Text className="text-sm text-primary mt-0.5 font-medium" numberOfLines={1}>
              {specializations.join(' • ')}
            </Text>
          )}
          <View className="flex-row flex-wrap gap-3 mt-2">
            {profile?.experience != null && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="briefcase-outline" size={13} color={Colors.primary} />
                <Text className="text-xs text-textSecondary font-medium">{profile.experience} yrs</Text>
              </View>
            )}
            {profile?.consultationFee != null && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="cash-outline" size={13} color={Colors.success} />
                <Text className="text-xs text-textSecondary font-medium">₹{profile.consultationFee}</Text>
              </View>
            )}
            {profile?.availableFrom && profile?.availableTo && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={13} color={Colors.accent} />
                <Text className="text-xs text-textSecondary font-medium">
                  {profile.availableFrom}-{profile.availableTo}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}
