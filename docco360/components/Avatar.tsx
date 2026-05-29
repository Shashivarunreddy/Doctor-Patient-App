import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/theme';

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export function Avatar({ name, size = 48, color }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = color || getColorForName(name);

  return (
    <View
      className="justify-center items-center"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text className="text-white font-bold" style={[{ fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

function getColorForName(name: string): string {
  const colors = [
    '#1A6FEF',
    '#0D47A1',
    '#4FC3F7',
    '#10B981',
    '#8B5CF6',
    '#F59E0B',
    '#EC4899',
    '#06B6D4',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}


