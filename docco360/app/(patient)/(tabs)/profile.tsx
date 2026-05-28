import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { patientService, PatientWithProfile } from '@/services/patient';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';

export default function PatientProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profileData, setProfileData] = useState<PatientWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const data = await patientService.getProfile();
      setProfileData(data);
      if (data.profile) {
        setPhone(data.profile.phone || '');
        setGender((data.profile.gender as any) || '');
        setBloodGroup(data.profile.bloodGroup || '');
        setAddress(data.profile.address || '');
        setAllergies(data.profile.allergies?.join(', ') || '');
        setMedicalHistory(data.profile.medicalHistory || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await patientService.updateProfile({
        phone: phone || null,
        gender: gender ? (gender as 'MALE' | 'FEMALE' | 'OTHER') : null,
        bloodGroup: bloodGroup || null,
        address: address || null,
        allergies: allergies
          ? allergies.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
        medicalHistory: medicalHistory || null,
      });
      setEditing(false);
      fetchProfile();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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

  if (loading) return <LoadingScreen />;

  const genderOptions: Array<'MALE' | 'FEMALE' | 'OTHER'> = ['MALE', 'FEMALE', 'OTHER'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.avatarWrapper}>
          <Avatar name={user?.name || 'U'} size={88} />
          <TouchableOpacity
            style={[styles.editAvatarBtn, Shadows.md]}
            onPress={() => setEditing(!editing)}
            activeOpacity={0.8}
          >
            <Ionicons name={editing ? 'close' : 'create'} size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>Patient ID: #PAT-{user?.id?.slice(-4).toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        {editing ? (
          // Edit Mode Form
          <View style={styles.editForm}>
            <View style={styles.editHeaderRow}>
              <Text style={styles.sectionTitle}>Edit Profile Info</Text>
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text style={styles.cancelLink}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.card, Shadows.sm]}>
              <Input
                label="Phone"
                placeholder="Enter phone number"
                icon="call-outline"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {genderOptions.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderOption, gender === g && styles.genderActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text
                      style={[styles.genderText, gender === g && styles.genderTextActive]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Blood Group"
                placeholder="e.g. A+, B-, O+"
                icon="water-outline"
                value={bloodGroup}
                onChangeText={setBloodGroup}
              />

              <Input
                label="Address"
                placeholder="Enter your address"
                icon="location-outline"
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>

            <View style={[styles.card, Shadows.sm]}>
              <Text style={styles.cardSubTitle}>Medical & Health Details</Text>
              <Input
                label="Allergies"
                placeholder="Comma separated (e.g. Peanuts, Penicillin)"
                icon="alert-circle-outline"
                value={allergies}
                onChangeText={setAllergies}
              />

              <Input
                label="Medical History"
                placeholder="Any relevant medical history"
                icon="document-text-outline"
                value={medicalHistory}
                onChangeText={setMedicalHistory}
                multiline
                numberOfLines={4}
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />
            </View>

            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              fullWidth
              size="lg"
            />
          </View>
        ) : (
          // View Mode (Bento Grid)
          <View style={styles.bentoContainer}>
            {/* Personal Information Bento Grid */}
            <Text style={styles.bentoSectionTitle}>Personal Information</Text>
            <View style={styles.bentoGrid}>
              {/* Email Card */}
              <View style={[styles.bentoCard, Shadows.sm]}>
                <View style={styles.bentoIconWrap}>
                  <Ionicons name="mail" size={20} color={Colors.primary} />
                </View>
                <View style={styles.bentoInfo}>
                  <Text style={styles.bentoLabel}>Email</Text>
                  <Text style={styles.bentoValue} numberOfLines={1}>{user?.email}</Text>
                </View>
              </View>

              {/* Phone Card */}
              <View style={[styles.bentoCard, Shadows.sm]}>
                <View style={styles.bentoIconWrap}>
                  <Ionicons name="call" size={20} color={Colors.primary} />
                </View>
                <View style={styles.bentoInfo}>
                  <Text style={styles.bentoLabel}>Phone</Text>
                  <Text style={styles.bentoValue}>{phone || 'Not provided'}</Text>
                </View>
              </View>

              {/* Gender Card */}
              <View style={[styles.bentoCard, Shadows.sm]}>
                <View style={styles.bentoIconWrap}>
                  <Ionicons name="person" size={20} color={Colors.primary} />
                </View>
                <View style={styles.bentoInfo}>
                  <Text style={styles.bentoLabel}>Gender</Text>
                  <Text style={styles.bentoValue}>{gender || 'Not provided'}</Text>
                </View>
              </View>

              {/* Address Card */}
              <View style={[styles.bentoCard, Shadows.sm, { width: '100%' }]}>
                <View style={styles.bentoIconWrap}>
                  <Ionicons name="location" size={20} color={Colors.primary} />
                </View>
                <View style={styles.bentoInfo}>
                  <Text style={styles.bentoLabel}>Address</Text>
                  <Text style={styles.bentoValue}>{address || 'Not provided'}</Text>
                </View>
              </View>
            </View>

            {/* Medical Overview Bento Card */}
            <Text style={styles.bentoSectionTitle}>Medical Overview</Text>
            <View style={styles.medicalRow}>
              <View style={[styles.medicalItem, Shadows.sm, { backgroundColor: Colors.primaryFaded }]}>
                <Text style={styles.medicalLabel}>Blood Group</Text>
                <Text style={[styles.medicalValue, { color: Colors.primary }]}>{bloodGroup || 'N/A'}</Text>
              </View>
              <View style={[styles.medicalItem, Shadows.sm, { backgroundColor: Colors.dangerLight }]}>
                <Text style={[styles.medicalLabel, { color: Colors.danger }]}>Allergies</Text>
                <Text style={[styles.medicalValue, { color: Colors.danger }]} numberOfLines={1}>
                  {allergies || 'None'}
                </Text>
              </View>
            </View>

            {/* Medical History */}
            {medicalHistory ? (
              <View style={[styles.historyCard, Shadows.sm]}>
                <Text style={styles.historyTitle}>Past Medical History</Text>
                <Text style={styles.historyText}>{medicalHistory}</Text>
              </View>
            ) : null}

            {/* Settings & Action Card */}
            <Text style={styles.bentoSectionTitle}>Account Settings</Text>
            <View style={[styles.settingsCard, Shadows.md]}>
              <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
                <View style={styles.settingsLabelWrap}>
                  <View style={styles.settingsIconWrap}>
                    <Ionicons name="card-outline" size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.settingsLabel}>Payment Methods</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
              <View style={styles.settingsDivider} />
              <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
                <View style={styles.settingsLabelWrap}>
                  <View style={styles.settingsIconWrap}>
                    <Ionicons name="lock-closed-outline" size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.settingsLabel}>Privacy & Security</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
              <View style={styles.settingsDivider} />
              <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7} onPress={handleLogout}>
                <View style={styles.settingsLabelWrap}>
                  <View style={[styles.settingsIconWrap, { backgroundColor: Colors.dangerLight }]}>
                    <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
                  </View>
                  <Text style={[styles.settingsLabel, { color: Colors.danger }]}>Log Out</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.background,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  name: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '800',
    color: Colors.text,
  },
  email: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  editForm: {
    marginBottom: Spacing.xl,
  },
  editHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cancelLink: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  cardSubTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  fieldLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  genderOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  genderActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  genderTextActive: {
    color: Colors.textInverse,
  },
  bentoContainer: {
    marginBottom: Spacing.xl,
  },
  bentoSectionTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  bentoCard: {
    width: '47.5%',
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  bentoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoInfo: {
    flex: 1,
  },
  bentoLabel: {
    fontSize: Fonts.sizes.xs - 1,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  bentoValue: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  medicalRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  medicalItem: {
    flex: 1,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  medicalValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '800',
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  historyTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  historyText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Fonts.lineHeights.md,
  },
  settingsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  settingsLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.xl + 36 + Spacing.md,
  },
});
