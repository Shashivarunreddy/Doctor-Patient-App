import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text className="mt-4 text-sm text-textSecondary">{message}</Text>
    </View>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center px-12">
      <View className="w-20 h-20 rounded-full bg-primaryFaded justify-center items-center mb-6">
        <Text className="text-4xl">📋</Text>
      </View>
      <Text className="text-base font-bold text-text text-center mb-2">{title}</Text>
      {subtitle && <Text className="text-sm text-textSecondary text-center leading-5">{subtitle}</Text>}
      {action && <View className="mt-6">{action}</View>}
    </View>
  );
}


