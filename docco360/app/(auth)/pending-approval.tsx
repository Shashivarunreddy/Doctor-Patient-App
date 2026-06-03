import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingApprovalScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-primaryFaded">
      <View className="flex-1 justify-center items-center p-6">
        <View className="bg-surface rounded-2xl p-6 items-center w-full max-w-[400px] shadow-lg">
          <View className="w-20 h-20 rounded-full bg-warningLight justify-center items-center mb-6">
            <Ionicons name="time-outline" size={48} color={Colors.warning} />
          </View>
          
          <Text className="text-2xl font-bold text-textMain mb-4 text-center">
            Account Pending Approval
          </Text>
          
          <Text className="text-base text-textSecondary text-center leading-6 mb-4">
            Thank you for registering as a doctor on Docco360. Your application is currently under review by our administration team.
          </Text>
          
          <Text className="text-sm text-textTertiary text-center leading-5 mb-8">
            This process typically takes 1-2 business days. We will notify you via email once your account has been approved and activated.
          </Text>
          
          <Button
            title="Back to Login"
            onPress={handleLogout}
            className="w-full"
            variant="outline"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
