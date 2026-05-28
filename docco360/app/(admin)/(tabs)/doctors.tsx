import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminDoctor, DoctorApprovalStatus } from '@/services/admin';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';

type RejectModalType = { id: string; phase: 1 | 2 } | null;

function getPhaseLabel(status: DoctorApprovalStatus): { label: string; color: string; bgColor: string } {
  switch (status) {
    case 'PHASE1_PENDING': return { label: 'Phase 1 — Pending', color: Colors.warning, bgColor: Colors.warningLight };
    case 'PHASE1_APPROVED': return { label: 'Phase 1 APPROVED', color: Colors.primary, bgColor: Colors.primaryFaded };
    case 'REJECTED': return { label: 'Rejected', color: Colors.danger, bgColor: Colors.dangerLight };
    case 'PHASE2_PENDING': return { label: 'Phase 2 — Under Review', color: '#7c3aed', bgColor: '#EDE9FE' };
    case 'PHASE2_APPROVED': return { label: 'Fully Verified ✓', color: Colors.success, bgColor: Colors.successLight };
    case 'PHASE2_REJECTED': return { label: 'Phase 2 — Rejected', color: Colors.danger, bgColor: Colors.dangerLight };
  }
}

export default function AdminDoctorsScreen() {
  const insets = useSafeAreaInsets();
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectModal, setRejectModal] = useState<RejectModalType>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      const data = await adminService.getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  // ── Phase 1 ──
  const handleApprovePhase1 = async (id: string) => {
    setActionLoading(id);
    try {
      await adminService.approvePhase1(id);
      Alert.alert('✓ Phase 1 Approved', 'Doctor can now log in and submit their professional details.');
      fetchDoctors();
    } catch (error: any) { Alert.alert('Error', error.message); }
    finally { setActionLoading(null); }
  };

  // ── Phase 2 ──
  const handleApprovePhase2 = async (id: string) => {
    setActionLoading(id);
    try {
      await adminService.approvePhase2(id);
      Alert.alert('✓ Phase 2 Approved', 'Doctor is fully verified. Enable appointments to let them start practising.');
      fetchDoctors();
    } catch (error: any) { Alert.alert('Error', error.message); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    try {
      if (rejectModal.phase === 1) {
        await adminService.rejectPhase1(rejectModal.id, rejectReason);
        Alert.alert('Done', 'Doctor Phase 1 application rejected.');
      } else {
        await adminService.rejectPhase2(rejectModal.id, rejectReason);
        Alert.alert('Done', 'Doctor Phase 2 details rejected. They can re-submit.');
      }
      setRejectModal(null);
      setRejectReason('');
      fetchDoctors();
    } catch (error: any) { Alert.alert('Error', error.message); }
    finally { setActionLoading(null); }
  };

  // ── Phase 3 ──
  const handleToggleAppointments = async (id: string, currentValue: boolean) => {
    const newValue = !currentValue;
    if (!newValue) {
      Alert.alert(
        'Disable Appointments',
        'This doctor will no longer appear in patient searches or receive bookings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => doToggle(id, newValue),
          },
        ],
      );
    } else {
      doToggle(id, newValue);
    }
  };

  const doToggle = async (id: string, value: boolean) => {
    setActionLoading(id + '-toggle');
    try {
      await adminService.toggleAppointments(id, value);
      fetchDoctors();
    } catch (error: any) { Alert.alert('Error', error.message); }
    finally { setActionLoading(null); }
  };

  // ── Account ──
  const handleDeactivate = async (id: string) => {
    Alert.alert('Deactivate Account', 'This will block the doctor from logging in entirely.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(id);
          try { await adminService.deactivateDoctor(id); Alert.alert('Done', 'Doctor deactivated'); fetchDoctors(); }
          catch (error: any) { Alert.alert('Error', error.message); }
          finally { setActionLoading(null); }
        },
      },
    ]);
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try { await adminService.activateDoctor(id); Alert.alert('Success', 'Doctor account reactivated'); fetchDoctors(); }
    catch (error: any) { Alert.alert('Error', error.message); }
    finally { setActionLoading(null); }
  };

  if (loading) return <LoadingScreen />;

  const renderDoctor = ({ item }: { item: AdminDoctor }) => {
    const status = (item.doctorProfile?.approvalStatus || 'PHASE1_PENDING') as DoctorApprovalStatus;
    const phaseInfo = getPhaseLabel(status);
    const isPhase1Pending = status === 'PHASE1_PENDING';
    const isPhase2Pending = status === 'PHASE2_PENDING';
    const isPhase2Approved = status === 'PHASE2_APPROVED';
    const toggleLoading = actionLoading === item.id + '-toggle';

    return (
      <View style={[styles.card, Shadows.md]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Avatar name={item.name} size={52} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>Dr. {item.name}</Text>
            <Text style={styles.cardEmail}>{item.email}</Text>
            {item.doctorProfile?.phone && (
              <Text style={styles.cardPhone}>{item.doctorProfile.phone}</Text>
            )}
          </View>
          <View style={[styles.phaseBadge, { backgroundColor: phaseInfo.bgColor }]}>
            <Text style={[styles.phaseBadgeText, { color: phaseInfo.color }]}>{phaseInfo.label}</Text>
          </View>
        </View>

        {/* Profile details (when available) */}
        {item.doctorProfile && (
          <View style={styles.details}>
            {item.doctorProfile.specializations?.length > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  <Ionicons name="briefcase" size={14} color={Colors.primary} />
                </View>
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.doctorProfile.specializations.join(', ')}
                </Text>
              </View>
            )}
            {item.doctorProfile.experience > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  <Ionicons name="trending-up" size={14} color={Colors.success} />
                </View>
                <Text style={styles.detailText}>{item.doctorProfile.experience} yrs exp</Text>
              </View>
            )}
            {item.doctorProfile.consultationFee != null && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  <Ionicons name="cash" size={14} color={Colors.warning} />
                </View>
                <Text style={styles.detailText}>₹{item.doctorProfile.consultationFee}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="calendar" size={14} color={Colors.accent} />
              </View>
              <Text style={styles.detailText}>{item._count?.doctorAppointments || 0} bookings</Text>
            </View>

            {/* License number (Phase 2+) */}
            {item.doctorProfile.licenseNumber && (
              <View style={[styles.detailRow, styles.licenseRow]}>
                <View style={styles.detailIconWrap}>
                  <Ionicons name="card" size={14} color={Colors.primary} />
                </View>
                <Text style={styles.licenseText}>License: {item.doctorProfile.licenseNumber}</Text>
              </View>
            )}
          </View>
        )}

        {/* Rejection reasons */}
        {status === 'REJECTED' && item.doctorProfile?.rejectionReason && (
          <View style={[styles.reasonBanner, Shadows.sm]}>
            <Ionicons name="warning" size={14} color={Colors.danger} />
            <Text style={styles.reasonText}>Phase 1 rejected: {item.doctorProfile.rejectionReason}</Text>
          </View>
        )}
        {status === 'PHASE2_REJECTED' && item.doctorProfile?.phase2RejectionReason && (
          <View style={[styles.reasonBanner, Shadows.sm]}>
            <Ionicons name="warning" size={14} color={Colors.danger} />
            <Text style={styles.reasonText}>Phase 2 rejected: {item.doctorProfile.phase2RejectionReason}</Text>
          </View>
        )}

        {/* Phase 3: Appointment Toggle */}
        {isPhase2Approved && (
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons
                name={item.doctorProfile?.canTakeAppointments ? 'calendar' : 'calendar-outline'}
                size={18}
                color={item.doctorProfile?.canTakeAppointments ? Colors.success : Colors.textSecondary}
              />
              <Text style={[styles.toggleLabel, { color: item.doctorProfile?.canTakeAppointments ? Colors.success : Colors.textSecondary }]}>
                {item.doctorProfile?.canTakeAppointments ? 'Accepting Appointments' : 'Appointments Disabled'}
              </Text>
            </View>
            <Switch
              value={!!item.doctorProfile?.canTakeAppointments}
              onValueChange={() => handleToggleAppointments(item.id, !!item.doctorProfile?.canTakeAppointments)}
              disabled={toggleLoading}
              trackColor={{ false: Colors.border, true: Colors.success }}
              thumbColor={item.doctorProfile?.canTakeAppointments ? '#fff' : Colors.textTertiary}
            />
          </View>
        )}

        {/* Account active status */}
        <View style={styles.statusRow}>
          <View style={[styles.activeChip, { backgroundColor: item.isActive ? Colors.successLight + '20' : Colors.dangerLight + '20', borderColor: item.isActive ? Colors.successLight : Colors.dangerLight }]}>
            <View style={[styles.activeDot, { backgroundColor: item.isActive ? Colors.success : Colors.danger }]} />
            <Text style={[styles.activeText, { color: item.isActive ? Colors.success : Colors.danger }]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {/* Phase 1 actions */}
          {isPhase1Pending && (
            <>
              <Button
                title="Approve Phase 1"
                onPress={() => handleApprovePhase1(item.id)}
                variant="primary"
                size="sm"
                loading={actionLoading === item.id}
              />
              <Button
                title="Reject"
                onPress={() => setRejectModal({ id: item.id, phase: 1 })}
                variant="danger"
                size="sm"
              />
            </>
          )}

          {/* Phase 2 actions */}
          {isPhase2Pending && (
            <>
              <Button
                title="Approve Phase 2"
                onPress={() => handleApprovePhase2(item.id)}
                variant="primary"
                size="sm"
                loading={actionLoading === item.id}
              />
              <Button
                title="Reject Details"
                onPress={() => setRejectModal({ id: item.id, phase: 2 })}
                variant="danger"
                size="sm"
              />
            </>
          )}

          {/* Account deactivate/activate (separate from appointment toggle) */}
          {isPhase2Approved && item.isActive && (
            <Button
              title="Deactivate Account"
              onPress={() => handleDeactivate(item.id)}
              variant="ghost"
              size="sm"
              style={styles.deactivateBtn}
            />
          )}
          {!item.isActive && (
            <Button
              title="Activate Account"
              onPress={() => handleActivate(item.id)}
              variant="secondary"
              size="sm"
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Frameless Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.title}>Manage Doctors</Text>
        <Text style={styles.subtitle}>{doctors.length} doctors registered</Text>
      </View>

      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={renderDoctor}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDoctors();
            }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={<EmptyState title="No Doctors" subtitle="No doctor registrations yet" />}
        showsVerticalScrollIndicator={false}
      />

      {/* Reject Modal */}
      <Modal visible={!!rejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, Shadows.xl]}>
            <Text style={styles.modalTitle}>
              {rejectModal?.phase === 1 ? 'Reject Phase 1 Application' : 'Reject Phase 2 Details'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {rejectModal?.phase === 1
                ? 'The doctor will not be able to log in.'
                : 'The doctor can re-submit their professional details.'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Reason for rejection (optional)..."
              placeholderTextColor={Colors.textTertiary}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => { setRejectModal(null); setRejectReason(''); }} variant="ghost" size="sm" />
              <Button title="Reject" onPress={handleReject} variant="danger" size="sm" loading={!!actionLoading} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  cardName: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  cardEmail: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardPhone: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  phaseBadge: {
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  phaseBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailIconWrap: {
    width: 24,
    height: 24,
    borderRadius: Radii.xs,
    backgroundColor: Colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  licenseRow: {
    width: '100%',
    marginTop: Spacing.xs,
  },
  licenseText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
  reasonBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: Colors.dangerLight + '20',
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  reasonText: {
    flex: 1,
    fontSize: Fonts.sizes.xs,
    color: Colors.danger,
    fontWeight: '600',
    lineHeight: Fonts.lineHeights.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusRow: {
    marginTop: Spacing.md,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radii.full,
    borderWidth: 1.5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  deactivateBtn: {
    borderColor: Colors.dangerLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.lg,
    lineHeight: Fonts.lineHeights.sm,
  },
  modalInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
});

