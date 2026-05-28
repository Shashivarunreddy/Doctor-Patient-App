import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { doctorService } from '@/services/doctor';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors, Fonts, Spacing, Radii, Gradients, Shadows } from '@/constants/theme';

export default function SubmitDetailsScreen() {
  const { user, logout, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Form state
  const [specializations, setSpecializations] = useState('');
  const [experience, setExperience] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [availableFrom, setAvailableFrom] = useState('09:00');
  const [availableTo, setAvailableTo] = useState('17:00');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isResubmit = user?.doctorProfile?.approvalStatus === 'PHASE2_REJECTED';
  const phase2Reason = user?.doctorProfile?.phase2RejectionReason;

  // Pre-fill from existing profile
  const loadProfile = useCallback(async () => {
    try {
      const data = await doctorService.getProfile();
      if (data.profile) {
        setSpecializations(data.profile.specializations?.join(', ') || '');
        setExperience(data.profile.experience?.toString() || '');
        setQualifications(data.profile.qualifications?.join(', ') || '');
        setBio(data.profile.bio || '');
        setConsultationFee(data.profile.consultationFee?.toString() || '');
        setAvailableFrom(data.profile.availableFrom || '09:00');
        setAvailableTo(data.profile.availableTo || '17:00');
        setLicenseNumber(data.profile.licenseNumber || '');
      }
    } catch {
      // silently ignore
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!specializations.trim()) newErrors.specializations = 'Specialization is required';
    if (!experience.trim() || isNaN(Number(experience)) || Number(experience) < 0)
      newErrors.experience = 'Enter valid years of experience';
    if (!qualifications.trim()) newErrors.qualifications = 'Qualifications are required';
    if (!licenseNumber.trim() || licenseNumber.trim().length < 2)
      newErrors.licenseNumber = 'License/registration number is required';
    if (!consultationFee.trim() || isNaN(Number(consultationFee)) || Number(consultationFee) < 0)
      newErrors.consultationFee = 'Enter a valid consultation fee';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await doctorService.updateProfile({
        specializations: specializations.split(',').map((s) => s.trim()).filter(Boolean),
        experience: parseInt(experience) || 0,
        qualifications: qualifications.split(',').map((q) => q.trim()).filter(Boolean),
        bio: bio || null,
        consultationFee: consultationFee ? parseFloat(consultationFee) : null,
        availableFrom: availableFrom || null,
        availableTo: availableTo || null,
        licenseNumber: licenseNumber.trim(),
      });
      // Refresh user state so the router sees PHASE2_PENDING
      await refreshUser();
      router.replace('/(doctor)/verification-pending' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}
        >
          <View style={styles.headerIcon}>
            <Ionicons name="document-text" size={28} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>
            {isResubmit ? 'Re-submit Your Details' : 'Complete Your Profile'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Step 2 of 2 — Professional verification
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Step indicator */}
          <View style={styles.stepRow}>
            <View style={styles.stepDone}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepActive}>
              <Text style={styles.stepActiveText}>2</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: Colors.borderLight }]} />
            <View style={styles.stepLocked}>
              <Ionicons name="lock-closed" size={14} color={Colors.textTertiary} />
            </View>
          </View>
          <View style={styles.stepLabels}>
            <Text style={[styles.stepLabel, { color: Colors.success, fontWeight: '700' }]}>Account</Text>
            <Text style={[styles.stepLabel, { color: Colors.primary, fontWeight: '700' }]}>Details</Text>
            <Text style={[styles.stepLabel, { color: Colors.textTertiary }]}>Practice</Text>
          </View>

          {/* Rejection banner (re-submit flow) */}
          {isResubmit && phase2Reason && (
            <View style={[styles.rejectionBanner, Shadows.sm]}>
              <Ionicons name="alert-circle" size={22} color={Colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rejectionTitle}>Previous Submission Rejected</Text>
                <Text style={styles.rejectionText}>{phase2Reason}</Text>
              </View>
            </View>
          )}

          {/* Info banner */}
          {!isResubmit && (
            <View style={styles.infoBanner}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
              <Text style={styles.infoBannerText}>
                Your information will be reviewed by our admin team. Once approved, you can start receiving patients.
              </Text>
            </View>
          )}

          {/* Professional Details */}
          <View style={[styles.card, Shadows.md]}>
            <Text style={styles.sectionTitle}>Professional Details</Text>

            <Input
              label="Specializations"
              placeholder="e.g. Cardiology, Neurology"
              icon="briefcase-outline"
              value={specializations}
              onChangeText={setSpecializations}
              error={errors.specializations}
              autoCapitalize="words"
            />
            <Input
              label="Years of Experience"
              placeholder="e.g. 5"
              icon="trending-up-outline"
              keyboardType="numeric"
              value={experience}
              onChangeText={setExperience}
              error={errors.experience}
            />
            <Input
              label="Qualifications"
              placeholder="e.g. MBBS, MD Cardiology"
              icon="school-outline"
              value={qualifications}
              onChangeText={setQualifications}
              error={errors.qualifications}
              autoCapitalize="words"
            />
            <Input
              label="Bio (optional)"
              placeholder="Tell patients about yourself..."
              icon="document-text-outline"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              style={{ minHeight: 72, textAlignVertical: 'top' }}
            />
          </View>

          {/* License */}
          <View style={[styles.card, Shadows.md]}>
            <Text style={styles.sectionTitle}>Practice License</Text>
            <View style={styles.licenseNote}>
              <Ionicons name="information-circle" size={18} color={Colors.primary} />
              <Text style={styles.licenseNoteText}>
                Enter your medical council registration or license number. Document upload will be available in a future update.
              </Text>
            </View>
            <Input
              label="License / Registration Number"
              placeholder="e.g. MCI-1234567 or State-2023-XYZ"
              icon="card-outline"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              error={errors.licenseNumber}
              autoCapitalize="characters"
            />
          </View>

          {/* Consultation Settings */}
          <View style={[styles.card, Shadows.md]}>
            <Text style={styles.sectionTitle}>Consultation Settings</Text>
            <Input
              label="Consultation Fee (₹)"
              placeholder="e.g. 500"
              icon="cash-outline"
              keyboardType="numeric"
              value={consultationFee}
              onChangeText={setConsultationFee}
              error={errors.consultationFee}
            />
            <Input
              label="Available From (HH:mm)"
              placeholder="e.g. 09:00"
              icon="time-outline"
              value={availableFrom}
              onChangeText={setAvailableFrom}
            />
            <Input
              label="Available To (HH:mm)"
              placeholder="e.g. 17:00"
              icon="time-outline"
              value={availableTo}
              onChangeText={setAvailableTo}
            />
          </View>

          <Button
            title={isResubmit ? 'Re-submit for Approval' : 'Submit for Approval'}
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          />

          <Button
            title="Logout"
            onPress={handleLogout}
            variant="ghost"
            fullWidth
            size="md"
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.textInverse,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },

  content: {
    padding: Spacing.xl,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  stepDone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActiveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  stepLocked: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.success,
    maxWidth: 48,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  stepLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryFaded,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoBannerText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: '500',
    lineHeight: Fonts.lineHeights.sm,
  },

  rejectionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.dangerLight + '20',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.dangerLight,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  rejectionTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.danger,
    marginBottom: 2,
  },
  rejectionText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.danger,
    lineHeight: Fonts.lineHeights.sm,
  },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },

  licenseNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryFaded,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  licenseNoteText: {
    flex: 1,
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    lineHeight: Fonts.lineHeights.sm,
  },
});

