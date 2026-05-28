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
import { doctorService, DoctorWithProfile } from '@/services/doctor';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { Badge, getStatusBadgeVariant } from '@/components/Badge';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';

export default function DoctorProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profileData, setProfileData] = useState<DoctorWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [specializations, setSpecializations] = useState('');
  const [experience, setExperience] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const data = await doctorService.getProfile();
      setProfileData(data);
      if (data.profile) {
        setSpecializations(data.profile.specializations?.join(', ') || '');
        setExperience(data.profile.experience?.toString() || '');
        setQualifications(data.profile.qualifications?.join(', ') || '');
        setBio(data.profile.bio || '');
        setConsultationFee(data.profile.consultationFee?.toString() || '');
        setAvailableFrom(data.profile.availableFrom || '');
        setAvailableTo(data.profile.availableTo || '');
        setLicenseNumber(data.profile.licenseNumber || '');
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
      await doctorService.updateProfile({
        specializations: specializations
          ? specializations.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        experience: experience ? parseInt(experience) : 0,
        qualifications: qualifications
          ? qualifications.split(',').map((q) => q.trim()).filter(Boolean)
          : [],
        bio: bio || null,
        consultationFee: consultationFee ? parseFloat(consultationFee) : null,
        availableFrom: availableFrom || null,
        availableTo: availableTo || null,
        licenseNumber: licenseNumber || null,
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

  const approvalStatus = profileData?.profile?.approvalStatus || 'PENDING';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Profile Section */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.avatarWrapper}>
          <Avatar name={user?.name || 'D'} size={88} />
          <TouchableOpacity
            style={[styles.editAvatarBtn, Shadows.md]}
            onPress={() => setEditing(!editing)}
            activeOpacity={0.8}
          >
            <Ionicons name={editing ? 'close' : 'create'} size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>Dr. {user?.name}</Text>
        <Text style={styles.email}>Doctor ID: #DOC-{user?.id?.slice(-4).toUpperCase()}</Text>
        <Badge
          label={approvalStatus}
          variant={getStatusBadgeVariant(approvalStatus)}
          style={{ marginTop: Spacing.sm }}
        />
        {profileData?.profile?.rejectionReason && (
          <View style={[styles.rejectionBanner, Shadows.sm]}>
            <Ionicons name="alert-circle" size={20} color={Colors.danger} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rejectionTitle}>Verification Rejected</Text>
              <Text style={styles.rejectionText}>{profileData.profile.rejectionReason}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>{editing ? 'Edit Profile Information' : 'My Information'}</Text>
          {!editing ? (
            <TouchableOpacity onPress={() => setEditing(true)} activeOpacity={0.7} style={styles.editLinkButton}>
              <Ionicons name="create-outline" size={16} color={Colors.primary} />
              <Text style={styles.editLinkText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => { setEditing(false); fetchProfile(); }} activeOpacity={0.7}>
              <Text style={styles.cancelLink}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {editing ? (
          // Edit Mode Form
          <View style={styles.editForm}>
            <View style={[styles.card, Shadows.md]}>
              <Text style={styles.cardHeaderTitle}>Professional Details</Text>
              <Input
                label="Specializations (comma separated)"
                placeholder="e.g. Cardiology, Neurology"
                icon="briefcase-outline"
                value={specializations}
                onChangeText={setSpecializations}
              />
              <Input
                label="Experience (years)"
                placeholder="e.g. 5"
                icon="trending-up-outline"
                keyboardType="numeric"
                value={experience}
                onChangeText={setExperience}
              />
              <Input
                label="Qualifications (comma separated)"
                placeholder="e.g. MBBS, MD Cardiology"
                icon="school-outline"
                value={qualifications}
                onChangeText={setQualifications}
              />
              <Input
                label="Bio"
                placeholder="Tell patients about yourself..."
                icon="document-text-outline"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                style={{ minHeight: 85, textAlignVertical: 'top' }}
              />
            </View>

            <View style={[styles.card, Shadows.md]}>
              <Text style={styles.cardHeaderTitle}>Consultation Settings</Text>
              <Input
                label="Consultation Fee (₹)"
                placeholder="e.g. 500"
                icon="cash-outline"
                keyboardType="numeric"
                value={consultationFee}
                onChangeText={setConsultationFee}
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

            <View style={[styles.card, Shadows.md]}>
              <Text style={styles.cardHeaderTitle}>Practice License</Text>
              <Input
                label="License / Registration Number"
                placeholder="e.g. MCI-1234567"
                icon="card-outline"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                autoCapitalize="characters"
              />
            </View>

            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.sm }}
            />
          </View>
        ) : (
          // View Mode (Elegant layout)
          <View style={styles.viewLayout}>
            {/* Stats Summary Panel */}
            <View style={styles.statsCardContainer}>
              <View style={[styles.miniStatCard, Shadows.sm]}>
                <Text style={styles.miniStatNum}>{experience || '0'} yrs</Text>
                <Text style={styles.miniStatLabel}>Experience</Text>
              </View>
              <View style={[styles.miniStatCard, Shadows.sm]}>
                <Text style={styles.miniStatNum}>₹{consultationFee || '0'}</Text>
                <Text style={styles.miniStatLabel}>Consultation</Text>
              </View>
              <View style={[styles.miniStatCard, Shadows.sm]}>
                <Text style={styles.miniStatNum}>{availableFrom ? `${availableFrom}-${availableTo}` : 'N/A'}</Text>
                <Text style={styles.miniStatLabel}>Working Hours</Text>
              </View>
            </View>

            {/* Profile Info Cards */}
            <View style={[styles.card, Shadows.md]}>
              <Text style={styles.cardHeaderTitle}>Professional Info</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="medical" size={18} color={Colors.primary} />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Specializations</Text>
                  <Text style={styles.infoValue}>{specializations || 'Not specified'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="school" size={18} color={Colors.primary} />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Qualifications</Text>
                  <Text style={styles.infoValue}>{qualifications || 'Not specified'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="document-text" size={18} color={Colors.primary} />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Bio</Text>
                  <Text style={styles.infoValueBio}>{bio || 'No professional bio provided yet.'}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, Shadows.md]}>
              <Text style={styles.cardHeaderTitle}>Practice & License</Text>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Registration / License Number</Text>
                  <Text style={styles.infoValue}>{licenseNumber || 'Not specified'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    borderColor: '#fff',
  },
  name: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  email: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rejectionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.dangerLight + '20',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.dangerLight,
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
    lineHeight: Fonts.lineHeights.xs,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionHeading: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  editLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editLinkText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  cancelLink: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  editForm: {
    gap: Spacing.xs,
  },
  viewLayout: {
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  cardHeaderTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  statsCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  miniStatNum: {
    fontSize: Fonts.sizes.md,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
  },
  miniStatLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  infoValueBio: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Fonts.lineHeights.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: Colors.dangerLight,
  },
  logoutText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.danger,
  },
});

