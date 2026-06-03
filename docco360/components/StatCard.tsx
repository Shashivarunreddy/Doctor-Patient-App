import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  gradient?: readonly [string, string, ...string[]];
}

export function StatCard({ title, value, icon, color, gradient }: StatCardProps) {
  const iconColor = color || Colors.primary;

  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-4 flex-1 min-w-[140px] shadow-md"
      >
        <View className="w-10 h-10 rounded-xl justify-center items-center mb-3 bg-white/20">
          <Ionicons name={icon} size={22} color={Colors.textInverse} />
        </View>
        <Text className="text-2xl font-extrabold text-white">{value}</Text>
        <Text className="text-xs font-medium mt-1 text-white/85">{title}</Text>
      </LinearGradient>
    );
  }

  return (
    <View className="rounded-2xl p-4 flex-1 min-w-[140px] shadow-md bg-card">
      <View className="w-10 h-10 rounded-xl justify-center items-center mb-3" style={{ backgroundColor: iconColor + '15' }}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text className="text-2xl font-extrabold text-textMain">{value}</Text>
      <Text className="text-xs text-textSecondary font-medium mt-1">{title}</Text>
    </View>
  );
}
