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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { patientService } from '@/services/patient';
import { AppointmentCard } from '@/components/AppointmentCard';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';
import type { Appointment } from '@/services/doctor';

type TabType = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export default function PatientAppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('CONFIRMED');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await patientService.getAppointments();
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
      const callData = await patientService.joinCall(id);
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
      await patientService.endCall(id);
      Alert.alert('Call Ended', 'The appointment has been marked as completed.');
      fetchAppointments();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to end call');
    }
  };

  const filteredAppointments = appointments.filter((a) => a.status === activeTab);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>Appointments</Text>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <Ionicons name="funnel-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <View style={styles.segmentedControl}>
          {(['CONFIRMED', 'COMPLETED', 'CANCELLED'] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === 'CONFIRMED' ? 'Upcoming' : tab === 'COMPLETED' ? 'Completed' : 'Cancelled';
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  isActive && styles.tabButtonActive,
                  isActive && Shadows.sm,
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            role="patient"
            onPress={() => router.push(`/(patient)/appointment/${item.id}`)}
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
            title={activeTab === 'CONFIRMED' ? 'No Upcoming Appointments' : activeTab === 'COMPLETED' ? 'No Completed Appointments' : 'No Cancelled Appointments'}
            subtitle={activeTab === 'CONFIRMED' ? 'Book your next consultation by browsing doctors' : 'Your session history will appear here'}
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryFaded,
    borderRadius: Radii.lg,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.md - 2,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
});
