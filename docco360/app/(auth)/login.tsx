import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';
import { ApiError } from '@/services/api';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      // Redirect happens via index.tsx
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Decorative Background Elements could go here */}

          {/* Main Auth Card */}
          <View style={styles.card}>
            {/* Header & Branding */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="medical" size={32} color={Colors.textInverse} />
              </View>
              <Text style={styles.appName}>Docco360</Text>
              <Text style={styles.tagline}>Sign in to your patient dashboard</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {errors.general && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                  <Text style={styles.errorBannerText}>{errors.general}</Text>
                </View>
              )}

              <Input
                label="Email Address"
                placeholder="name@example.com"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
              />

              <View style={styles.passwordContainer}>
                <View style={styles.passwordHeader}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Forgot?</Text>
                  </TouchableOpacity>
                </View>
                <Input
                  placeholder="••••••••"
                  icon="lock-closed-outline"
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                />
              </View>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                size="lg"
                style={styles.submitButton}
              />
            </View>

            {/* Register Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                New to Docco360?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Create an account</Text>
              </TouchableOpacity>
            </View>

            {/* Trust Badges */}
            <View style={styles.trustContainer}>
              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.trustText}>HIPAA COMPLIANT</Text>
              </View>
              <View style={styles.trustBadge}>
                <Ionicons name="lock-closed-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.trustText}>SECURE SSL</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryFaded, // Using the light bluish background from the design
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  appName: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  form: {
    marginBottom: Spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorBannerText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.danger,
    flex: 1,
    fontWeight: '500',
  },
  passwordContainer: {
    marginTop: Spacing.sm,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  inputLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
    color: Colors.text,
  },
  forgotPassword: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  footerText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Fonts.sizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  trustContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  trustText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
