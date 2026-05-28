import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { doctorService } from '@/services/doctor';
import { AppointmentCard } from '@/components/AppointmentCard';
import { StatCard } from '@/components/StatCard';
import { Avatar } from '@/components/Avatar';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Gradients, Shadows } from '@/constants/theme';
import type { Appointment } from '@/services/doctor';

export default function DoctorDashboardScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await doctorService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleJoinCall = async (id: string) => {
    try {
      const callData = await doctorService.joinCall(id);
      Alert.alert(
        'Call Started',
        `Connected to channel: ${callData.channelName}\nRole: ${callData.role}\nToken received successfully.`,
      );
      fetchAppointments();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join call');
    }
  };

  const handleEndCall = async (id: string) => {
    try {
      await doctorService.endCall(id);
      Alert.alert('Call Ended', 'The appointment has been marked as completed.');
      fetchAppointments();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to end call');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(
    (a) => a.timeSlot?.date === today && a.status === 'CONFIRMED',
  );
  const upcomingCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  if (loading) return <LoadingScreen />;

  const doctorName = user?.name || 'Doctor';
  const displayTitle = user?.doctorProfile?.specializations?.join(', ') || 'Medical Specialist';

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerLeft}>
          <Avatar name={doctorName} size={48} />
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>Dr. {doctorName.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>{displayTitle}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
            {todayAppointments.length > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={appointments.filter((a) => a.status === 'CONFIRMED')}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Today's Schedule Banner */}
            <View style={[styles.bannerCard, Shadows.lg]}>
              <LinearGradient
                colors={Gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bannerGradient}
              >
                <View style={styles.bannerInfo}>
                  <Text style={styles.bannerTitle}>Today's Schedule</Text>
                  <Text style={styles.bannerSubtitle}>
                    {todayAppointments.length > 0
                      ? `You have ${todayAppointments.length} appointment(s) scheduled for today.`
                      : 'No appointments scheduled for today.'}
                  </Text>
                </View>
                <View style={styles.bannerIconWrap}>
                  <Ionicons name="today" size={28} color="#fff" />
                </View>
              </LinearGradient>
            </View>

            {/* Stats Bento Grid */}
            <View style={styles.statsRow}>
              <StatCard
                title="Upcoming Appointments"
                value={upcomingCount}
                icon="calendar"
                gradient={Gradients.primary}
              />
              <StatCard
                title="Completed Calls"
                value={completedCount}
                icon="checkmark-circle"
                color={Colors.success}
              />
            </View>

            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            role="doctor"
            onJoinCall={() => handleJoinCall(item.id)}
            onEndCall={() => handleEndCall(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAppointments();
            }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No Upcoming Appointments"
            subtitle="Set up your time slots in the Schedule tab to start receiving bookings"
          />
        }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerInfo: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  listHeader: {
    paddingTop: Spacing.sm,
  },
  bannerCard: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  bannerGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  bannerInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  bannerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: '#fff',
  },
  bannerSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    lineHeight: Fonts.lineHeights.sm,
  },
  bannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
});

