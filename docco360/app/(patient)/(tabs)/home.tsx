import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { patientService, DoctorListing } from '@/services/patient';
import { DoctorCard } from '@/components/DoctorCard';
import { Avatar } from '@/components/Avatar';
import { LoadingScreen, EmptyState } from '@/components/LoadingScreen';
import { Colors, Fonts, Spacing, Radii, Gradients, Shadows } from '@/constants/theme';
import type { Appointment } from '@/services/doctor';

const CATEGORIES = [
  { id: 'cardio', name: 'Cardiology', icon: 'heart', color: Colors.danger, bg: Colors.dangerLight },
  { id: 'dentist', name: 'Dentist', icon: 'medical', color: Colors.primary, bg: Colors.primaryFaded },
  { id: 'general', name: 'General', icon: 'fitness', color: Colors.warning, bg: Colors.warningLight },
  { id: 'surgeon', name: 'Surgeon', icon: 'pulse', color: Colors.success, bg: Colors.successLight },
];

export default function PatientHomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [doctors, setDoctors] = useState<DoctorListing[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorListing[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [docsData, apptsData] = await Promise.all([
        patientService.getAllDoctors(),
        patientService.getAppointments(),
      ]);
      setDoctors(docsData);
      setFilteredDoctors(docsData);
      setAppointments(apptsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let result = doctors;

    // Apply search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.user.name.toLowerCase().includes(q) ||
          d.profile?.specializations?.some((s) => s.toLowerCase().includes(q)),
      );
    }

    // Apply category selection filter
    if (selectedCategory) {
      const cat = selectedCategory.toLowerCase();
      result = result.filter((d) =>
        d.profile?.specializations?.some((s) => {
          const spec = s.toLowerCase();
          if (cat === 'cardio') return spec.includes('cardio');
          if (cat === 'dentist') return spec.includes('dent') || spec.includes('dental');
          if (cat === 'general') return spec.includes('gen') || spec.includes('physician');
          if (cat === 'surgeon') return spec.includes('surg');
          return false;
        })
      );
    }

    setFilteredDoctors(result);
  }, [search, selectedCategory, doctors]);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const upcomingAppointment = appointments.find((a) => a.status === 'CONFIRMED');

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerLeft}>
          <Avatar name={user?.name || 'P'} size={48} />
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.subtitle}>How is your health?</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
            {upcomingAppointment && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content body */}
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.user.id}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, Shadows.sm]}>
              <Ionicons name="search" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search doctors, specializations..."
                placeholderTextColor={Colors.textTertiary}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.textTertiary}
                  onPress={() => setSearch('')}
                />
              )}
            </View>

            {/* Upcoming Schedule Card */}
            {upcomingAppointment && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
                  <TouchableOpacity onPress={() => router.push('/(patient)/(tabs)/appointments')}>
                    <Text style={styles.seeAll}>See All</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.upcomingCard, Shadows.lg]}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/(patient)/appointment/${upcomingAppointment.id}`)}
                >
                  <LinearGradient
                    colors={Gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.upcomingGradient}
                  >
                    <View style={styles.upcomingInfo}>
                      <View style={styles.upcomingDoctor}>
                        <Text style={styles.upcomingName}>Dr. {upcomingAppointment.doctor?.name}</Text>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      </View>
                      <Text style={styles.upcomingSpecialty}>
                        {upcomingAppointment.doctor?.doctorProfile?.specializations?.join(', ') || 'Specialist'}
                      </Text>
                      <View style={styles.upcomingTimeContainer}>
                        <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.upcomingTime}>
                          {upcomingAppointment.timeSlot?.date ? new Date(upcomingAppointment.timeSlot.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                          , {upcomingAppointment.timeSlot?.startTime}
                        </Text>
                      </View>
                    </View>
                    <Avatar name={upcomingAppointment.doctor?.name || 'D'} size={60} color="rgba(255,255,255,0.2)" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryBtn,
                        isActive && { backgroundColor: Colors.primary },
                      ]}
                      onPress={() => handleCategoryPress(cat.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.categoryIconWrap, { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : cat.bg }]}>
                        <Ionicons
                          name={cat.icon as any}
                          size={24}
                          color={isActive ? '#fff' : cat.color}
                        />
                      </View>
                      <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Top Doctors Label */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Doctors</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            onPress={() => router.push(`/(patient)/doctor/${item.user.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No Doctors Found"
            subtitle={search || selectedCategory ? 'Try a different search term or category' : 'No approved doctors available yet'}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.lg,
    height: 48,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAll: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  upcomingCard: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  upcomingGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingDoctor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  upcomingName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: '#fff',
  },
  upcomingSpecialty: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  upcomingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.sm,
    alignSelf: 'flex-start',
  },
  upcomingTime: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: '#fff',
  },
  categoriesScroll: {
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: Spacing.sm,
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
