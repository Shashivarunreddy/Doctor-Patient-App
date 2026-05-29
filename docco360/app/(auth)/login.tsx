import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';
import { ApiError } from '@/services/api';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errors) {
          setErrors(error.errors);
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setErrors({ general: 'Connection failed. Please check your network.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="grow justify-center p-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[480px] self-center">
            {/* Header & Branding */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 bg-surface rounded-full justify-center items-center mb-4 shadow-sm border border-borderLight">
                <Ionicons name="leaf" size={32} color={Colors.primary} />
              </View>
              <Text className="text-3xl font-bold text-textMain mb-1 tracking-tight">Docco360</Text>
              <Text className="text-base text-textSecondary font-normal text-center">Welcome back. Secure access to your health portal.</Text>
            </View>

            {/* Form */}
            <View className="mb-6">
              {errors.general && (
                <View className="flex-row items-center bg-dangerLight rounded-md p-4 mb-6 gap-2">
                  <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                  <Text className="text-sm text-danger flex-1 font-medium">{errors.general}</Text>
                </View>
              )}

              <Input
                label="Email Address"
                placeholder="patient@example.com"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
              />

              <View className="mt-2">
                <View className="flex-row justify-between items-end mb-1 px-1">
                  <Text className="text-sm font-semibold text-textMain">Password</Text>
                  <TouchableOpacity>
                    <Text className="text-sm text-primary font-medium">Forgot?</Text>
                  </TouchableOpacity>
                </View>
                <Input
                  placeholder="••••••••"
                  icon="key-outline"
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                />
              </View>

              <TouchableOpacity 
                className="flex-row items-center gap-2 mt-4 mb-4 px-1"
                activeOpacity={0.7}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View className={`w-5 h-5 rounded border-2 justify-center items-center ${rememberMe ? 'bg-primary border-primary' : 'bg-surface border-border'}`}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text className="text-sm text-textSecondary">Remember me</Text>
              </TouchableOpacity>

              <Button
                title="Sign In to Portal"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                size="lg"
                className="mt-2"
              />
            </View>

            {/* Divider */}
            <View className="flex-row items-center py-4">
              <View className="flex-1 h-[1px] bg-borderLight" />
              <Text className="mx-4 text-xs text-textTertiary">or continue with</Text>
              <View className="flex-1 h-[1px] bg-borderLight" />
            </View>

            {/* Social Logins */}
            <View className="flex-row gap-4 mb-8">
              <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-surface py-4 rounded-lg border border-borderLight shadow-sm" activeOpacity={0.7}>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text className="text-sm font-medium text-textMain">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-surface py-4 rounded-lg border border-borderLight shadow-sm" activeOpacity={0.7}>
                <Ionicons name="logo-apple" size={20} color="#000" />
                <Text className="text-sm font-medium text-textMain">Apple ID</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center items-center mb-8">
              <Text className="text-base text-textSecondary">
                {"Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-base text-primary font-semibold underline">Sign up for free</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
