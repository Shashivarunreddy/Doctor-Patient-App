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

type Role = 'PATIENT' | 'DOCTOR';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('PATIENT');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (phone.trim().length < 7) newErrors.phone = 'Enter a valid phone number';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      newErrors.password = 'Must contain uppercase, lowercase, and number';
    if (role === 'DOCTOR' && !specialization.trim())
      newErrors.specialization = 'Please enter your medical specialization';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: 'Enter a password', color: Colors.border };
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
      const { requiresApproval } = await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        role,
        phone.trim(),
        role === 'DOCTOR' ? specialization.trim() : undefined,
      );
      if (requiresApproval) {
        // Doctor — navigate to the waiting screen, do NOT log them in
        router.replace('/(auth)/pending-approval');
      } else {
        // Patient — tokens are stored, route through index to the dashboard
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
          {/* Top Navbar Header */}
          <View style={styles.topHeader}>
            <View style={styles.topHeaderLeft}>
              <Ionicons name="medical" size={24} color={Colors.primary} />
              <Text style={styles.topHeaderTitle}>Docco360</Text>
            </View>
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Main Auth Card */}
          <View style={styles.card}>
            {/* Header & Branding */}
            <View style={styles.header}>
              <Text style={styles.appName}>Create Account</Text>
              <Text style={styles.tagline}>Your journey to serenity starts here.</Text>
            </View>

            {/* Role Selection Tabs */}
            <View style={styles.roleTabsContainer}>
              <TouchableOpacity
                style={[styles.roleTab, role === 'PATIENT' && styles.roleTabActive]}
                onPress={() => setRole('PATIENT')}
              >
                <Text style={[styles.roleTabText, role === 'PATIENT' && styles.roleTabTextActive]}>Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleTab, role === 'DOCTOR' && styles.roleTabActive]}
                onPress={() => setRole('DOCTOR')}
              >
                <Text style={[styles.roleTabText, role === 'DOCTOR' && styles.roleTabTextActive]}>Doctor</Text>
              </TouchableOpacity>
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
                label="Full Name"
                placeholder="John Doe"
                icon="person-outline"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
                error={errors.name}
              />

              <Input
                label="Email Address"
                placeholder="name@email.com"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
              />

              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                icon="call-outline"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                error={errors.phone}
              />

              <View style={styles.passwordContainer}>
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
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarsRow}>
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              i <= strength.level ? strength.color : Colors.borderLight,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.level > 0 ? strength.color : Colors.textTertiary }]}>
                    {strength.label}
                  </Text>
                </View>
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

              {/* Terms Checkbox placeholder - visual only for matching design */}
              <View style={styles.termsContainer}>
                <Ionicons name="checkbox" size={20} color={Colors.primary} />
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>.
                </Text>
              </View>

              <Button
                title="Register Account"
                onPress={handleRegister}
                loading={loading}
                fullWidth
                size="lg"
                style={styles.submitButton}
              />
            </View>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.footerLink}>Log in</Text>
              </TouchableOpacity>
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
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  topHeaderTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  helpButton: {
    padding: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  appName: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  roleTabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryFaded,
    borderRadius: Radii.md,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  roleTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.sm,
    alignItems: 'center',
  },
  roleTabActive: {
    backgroundColor: '#2e72da', // primary-container from design
    ...Shadows.sm,
  },
  roleTabText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleTabTextActive: {
    color: Colors.surface,
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
    marginBottom: Spacing.md,
  },
  strengthContainer: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  strengthBarsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    height: 4,
    marginBottom: Spacing.xs,
  },
  strengthBar: {
    flex: 1,
    borderRadius: Radii.full,
  },
  strengthLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  termsText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  footerText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Fonts.sizes.md,
    color: Colors.primary,
    fontWeight: '700',
  },
});
