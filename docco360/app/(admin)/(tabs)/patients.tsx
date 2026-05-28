import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminPatient } from '@/services/admin';
import { Avatar } from '@/components/Avatar';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';

export default function AdminPatientsScreen() {
  const insets = useSafeAreaInsets();
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      const data = await adminService.getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  if (loading) return <LoadingScreen />;

  const renderPatient = ({ item }: { item: AdminPatient }) => {
    const profile = item.patientProfile;
    return (
      <View style={[styles.card, Shadows.md]}>
        <View style={styles.cardHeader}>
          <Avatar name={item.name} size={52} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardEmail}>{item.email}</Text>
          </View>
        </View>

        <View style={styles.details}>
          {profile?.phone && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="call" size={14} color={Colors.primary} />
              </View>
              <Text style={styles.detailText}>{profile.phone}</Text>
            </View>
          )}
          {profile?.gender && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="person" size={14} color={Colors.accent} />
              </View>
              <Text style={styles.detailText}>{profile.gender}</Text>
            </View>
          )}
          {profile?.bloodGroup && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="water" size={14} color={Colors.danger} />
              </View>
              <Text style={styles.detailText}>{profile.bloodGroup}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="calendar" size={14} color={Colors.success} />
            </View>
            <Text style={styles.detailText}>{item._count?.patientAppointments || 0} bookings</Text>
          </View>
        </View>

        <Text style={styles.dateText}>
          Registered: {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Frameless Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.title}>Patients List</Text>
        <Text style={styles.subtitle}>{patients.length} patients registered</Text>
      </View>

      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        renderItem={renderPatient}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPatients();
            }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={<EmptyState title="No Patients" subtitle="No patient registrations yet" />}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.md,
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
  dateText: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
    fontWeight: '500',
  },
});

