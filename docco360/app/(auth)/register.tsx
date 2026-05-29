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

type Role = 'PATIENT' | 'DOCTOR';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('PATIENT');
  const [specialization, setSpecialization] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim() || firstName.trim().length < 2) newErrors.firstName = 'Required';
    if (!lastName.trim() || lastName.trim().length < 2) newErrors.lastName = 'Required';
    if (!phone.trim()) newErrors.phone = 'Required';
    else if (phone.trim().length < 7) newErrors.phone = 'Invalid';
    if (!email.trim()) newErrors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Required';
    else if (password.length < 8) newErrors.password = 'Must be at least 8 chars';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      newErrors.password = 'Too weak';
    if (role === 'DOCTOR' && !specialization.trim())
      newErrors.specialization = 'Required';
    if (!agreed) newErrors.agreed = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: Colors.border };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: 'Weak', color: Colors.danger };
    if (score <= 3) return { level: 2, label: 'Fair', color: Colors.warning };
    if (score <= 4) return { level: 3, label: 'Good', color: Colors.primary };
    return { level: 4, label: 'Strong', color: Colors.success };
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const { requiresApproval } = await register(
        fullName,
        email.trim().toLowerCase(),
        password,
        role,
        phone.trim(),
        role === 'DOCTOR' ? specialization.trim() : undefined,
      );
      if (requiresApproval) {
        router.replace('/(auth)/pending-approval');
      } else {
        router.replace('/');
      }
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

  const strength = getPasswordStrength();

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Mobile Top Header */}
      <View className="flex-row justify-center items-center py-4 border-b border-transparent bg-background">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-bold text-primary">Docco360</Text>
        </View>
      </View>

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
              <Text className="text-2xl font-bold text-textMain mb-1">Create an account</Text>
              <Text className="text-base text-textSecondary font-normal text-center">Please complete your profile to continue</Text>
            </View>

            {/* Role Selection Tabs */}
            <View className="flex-row bg-borderLight rounded-md p-1 mb-8">
              <TouchableOpacity
                className={`flex-1 py-4 rounded items-center ${role === 'PATIENT' ? 'bg-surface shadow-sm' : ''}`}
                onPress={() => setRole('PATIENT')}
              >
                <Text className={`text-sm font-semibold ${role === 'PATIENT' ? 'text-primary' : 'text-textSecondary'}`}>Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-4 rounded items-center ${role === 'DOCTOR' ? 'bg-surface shadow-sm' : ''}`}
                onPress={() => setRole('DOCTOR')}
              >
                <Text className={`text-sm font-semibold ${role === 'DOCTOR' ? 'text-primary' : 'text-textSecondary'}`}>Doctor</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View className="mb-6">
              {errors.general && (
                <View className="flex-row items-center bg-dangerLight rounded-md p-4 mb-6 gap-2">
                  <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                  <Text className="text-sm text-danger flex-1 font-medium">{errors.general}</Text>
                </View>
              )}

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Input
                    label="First Name"
                    placeholder="Jane"
                    autoCapitalize="words"
                    value={firstName}
                    onChangeText={setFirstName}
                    error={errors.firstName}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    autoCapitalize="words"
                    value={lastName}
                    onChangeText={setLastName}
                    error={errors.lastName}
                  />
                </View>
              </View>

              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                icon="call-outline"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                error={errors.phone}
              />

              <Input
                label="Email Address"
                placeholder="jane.doe@example.com"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
              />

              <View className="mb-1">
                <Input
                  label="Password"
                  placeholder="••••••••"
                  icon="lock-closed-outline"
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                />
                {/* Strength Meter */}
                {password.length > 0 && (
                  <View className="mt-1 px-1">
                    <View className="flex-row gap-1 h-1.5 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <View
                          key={i}
                          className="flex-1 rounded-full"
                          style={{
                            backgroundColor:
                              i <= strength.level ? strength.color : Colors.borderLight,
                          }}
                        />
                      ))}
                    </View>
                    <Text className="text-[10px] font-semibold text-right text-textTertiary">
                      {strength.label}
                    </Text>
                  </View>
                )}
              </View>

              {role === 'DOCTOR' && (
                <Input
                  label="Medical Specialization"
                  placeholder="e.g. Cardiologist, Dermatologist"
                  icon="briefcase-outline"
                  autoCapitalize="words"
                  value={specialization}
                  onChangeText={setSpecialization}
                  error={errors.specialization}
                />
              )}

              <TouchableOpacity 
                className="flex-row items-start gap-2 mt-4 mb-6 px-1"
                activeOpacity={0.7}
                onPress={() => setAgreed(!agreed)}
              >
                <View className={`w-[18px] h-[18px] rounded border-[1.5px] justify-center items-center mt-0.5 ${agreed ? 'bg-primary border-primary' : 'bg-surfaceAlt border-border'} ${errors.agreed ? 'border-danger' : ''}`}>
                  {agreed && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text className="flex-1 text-sm text-textSecondary leading-5">
                  I agree to the <Text className="text-primary font-medium">Terms of Service</Text> and <Text className="text-primary font-medium">Privacy Policy</Text>.
                </Text>
              </TouchableOpacity>

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                fullWidth
                size="lg"
                className="mt-1"
              />
            </View>

            {/* Divider */}
            <View className="flex-row items-center py-6">
              <View className="flex-1 h-[1px] bg-borderLight" />
              <Text className="mx-4 text-xs text-textTertiary">Or register with</Text>
              <View className="flex-1 h-[1px] bg-borderLight" />
            </View>

            {/* Social Logins */}
            <View className="flex-row gap-4 mb-8">
              <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-surface py-4 rounded-lg border border-borderLight" activeOpacity={0.7}>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text className="text-sm font-medium text-textMain">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 bg-surface py-4 rounded-lg border border-borderLight" activeOpacity={0.7}>
                <Ionicons name="logo-apple" size={20} color="#000" />
                <Text className="text-sm font-medium text-textMain">Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center items-center mb-8">
              <Text className="text-base text-textSecondary">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-base text-primary font-semibold underline">Sign in</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
