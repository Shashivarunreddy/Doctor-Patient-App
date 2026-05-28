import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { patientService } from '@/services/patient';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors, Fonts, Spacing, Radii, Shadows, Gradients } from '@/constants/theme';

type Gender = 'MALE' | 'FEMALE' | 'OTHER';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDER_OPTIONS: Gender[] = ['MALE', 'FEMALE', 'OTHER'];

export default function CompleteProfileScreen() {
  const { user, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);

  // Form state
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [weight, setWeight] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) newErrors.dateOfBirth = 'Use YYYY-MM-DD format';
    if (!gender) newErrors.gender = 'Please select your gender';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await patientService.updateProfile({
        dateOfBirth: dateOfBirth || null,
        gender: gender ? (gender as Gender) : null,
        bloodGroup: bloodGroup || null,
        address: address || null,
        allergies: allergies ? allergies.split(',').map((a) => a.trim()).filter(Boolean) : [],
        medicalHistory: medicalHistory || null,
        emergencyContact: emergencyContact || null,
      });
      // Refresh user so the router picks up the filled profile
      await refreshUser();
      router.replace('/(patient)/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
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
            <Ionicons name="heart" size={28} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <Text style={styles.headerSubtitle}>
            Help us personalise your healthcare experience
          </Text>
          <View style={styles.welcomeRow}>
            <Ionicons name="person-circle-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.welcomeText}>Welcome, {user?.name}!</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Info banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoBannerText}>
              Your health information is private and secure. This helps doctors provide better care.
            </Text>
          </View>

          {/* Basic Info */}
          <View style={[styles.card, Shadows.md]}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <Input
              label="Date of Birth"
              placeholder="YYYY-MM-DD (e.g. 1995-06-15)"
              icon="calendar-outline"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              error={errors.dateOfBirth}
              keyboardType="numbers-and-punctuation"
            />

            {/* Gender */}
            <Text style={styles.fieldLabel}>Gender *</Text>
            <View style={styles.optionRow}>
              {GENDER_OPTIONS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.optionChip, gender === g && styles.optionChipActive]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={g === 'MALE' ? 'male' : g === 'FEMALE' ? 'female' : 'person'}
                    size={16}
                    color={gender === g ? Colors.textInverse : Colors.textSecondary}
                  />
                  <Text style={[styles.optionText, gender === g && styles.optionTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

            {/* Blood Group */}
            <Text style={styles.fieldLabel}>Blood Group (optional)</Text>
            <View style={styles.optionRowWrap}>
              {BLOOD_GROUPS.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[styles.bloodChip, bloodGroup === bg && styles.bloodChipActive]}
                  onPress={() => setBloodGroup(bloodGroup === bg ? '' : bg)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.bloodChipText, bloodGroup === bg && styles.bloodChipTextActive]}>
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Weight (kg) — optional"
              placeholder="e.g. 70"
              icon="barbell-outline"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />

            <Input
              label="Address (optional)"
              placeholder="Your home address"
              icon="location-outline"
              value={address}
              onChangeText={setAddress}
              multiline
            />

            <Input
              label="Emergency Contact (optional)"
              placeholder="Name & phone number"
              icon="call-outline"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              keyboardType="phone-pad"
            />
          </View>

          {/* Medical Info */}
          <View style={[styles.card, Shadows.md]}>
            <Text style={styles.sectionTitle}>Health Information</Text>
            <Text style={styles.sectionSubtitle}>
              This helps doctors understand your medical background before your appointment.
            </Text>

            <Input
              label="Known Allergies (optional)"
              placeholder="e.g. Peanuts, Penicillin (comma separated)"
              icon="alert-circle-outline"
              value={allergies}
              onChangeText={setAllergies}
            />

            <Input
              label="Past Health Issues / Medical History (optional)"
              placeholder="e.g. Diabetes, Hypertension, previous surgeries..."
              icon="document-text-outline"
              value={medicalHistory}
              onChangeText={setMedicalHistory}
              multiline
              numberOfLines={4}
              style={{ minHeight: 90, textAlignVertical: 'top' }}
            />
          </View>

          <Button
            title="Save & Continue"
            onPress={handleSave}
            loading={saving}
            fullWidth
            size="lg"
          />

          <Text style={styles.skipNote}>
            * Required fields. You can update all other details later from your profile.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  headerIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  headerTitle: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.textInverse, textAlign: 'center' },
  headerSubtitle: { fontSize: Fonts.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radii.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  welcomeText: { fontSize: Fonts.sizes.sm, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  content: { padding: Spacing.xl },

  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.primaryFaded, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.lg },
  infoBannerText: { flex: 1, fontSize: Fonts.sizes.sm, color: Colors.primary, fontWeight: '500', lineHeight: Fonts.lineHeights.sm },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
  sectionSubtitle: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: Fonts.lineHeights.sm },

  fieldLabel: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  errorText: { fontSize: Fonts.sizes.xs, color: Colors.danger, marginBottom: Spacing.md },

  optionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  optionChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs,
    paddingVertical: Spacing.md, borderRadius: Radii.md, borderWidth: 1, borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceAlt,
  },
  optionChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionText: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textSecondary },
  optionTextActive: { color: Colors.textInverse },

  optionRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  bloodChip: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radii.md, borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: Colors.surfaceAlt },
  bloodChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  bloodChipText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.textSecondary },
  bloodChipTextActive: { color: '#fff' },

  skipNote: { fontSize: Fonts.sizes.xs, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.md, lineHeight: Fonts.lineHeights.sm },
});
