import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
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
import { Colors, Gradients } from '@/constants/theme';
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

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.user.name.toLowerCase().includes(q) ||
          d.profile?.specializations?.some((s) => s.toLowerCase().includes(q)),
      );
    }

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
    <View className="flex-1 bg-background">
      {/* Header bar */}
      <View className="flex-row justify-between items-center px-6 pb-4 bg-background" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center gap-4">
          <Avatar name={user?.name || 'P'} size={48} />
          <View className="justify-center">
            <Text className="text-xl font-bold text-textMain">Hi, {user?.name?.split(' ')[0]}</Text>
            <Text className="text-sm text-textSecondary mt-0.5">How is your health?</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="w-11 h-11 rounded-full bg-surface justify-center items-center relative" activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
            {upcomingAppointment && <View className="absolute top-3 right-3 w-2 h-2 rounded-full bg-danger" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content body */}
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.user.id}
        ListHeaderComponent={
          <View className="pt-3">
            {/* Search Bar */}
            <View className="flex-row items-center bg-[#F1F5F9] rounded-md px-5 h-12 gap-3 mb-6 mx-6 shadow-sm">
              <Ionicons name="search" size={20} color={Colors.textSecondary} />
              <TextInput
                className="flex-1 text-base text-textMain"
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
              <View className="mb-6 px-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold text-textMain">Upcoming Schedule</Text>
                  <TouchableOpacity onPress={() => router.push('/(patient)/(tabs)/appointments')}>
                    <Text className="text-sm font-bold text-primary">See All</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  className="rounded-xl overflow-hidden shadow-lg"
                  activeOpacity={0.9}
                  onPress={() => router.push(`/(patient)/appointment/${upcomingAppointment.id}`)}
                >
                  <LinearGradient
                    colors={Gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="flex-row justify-between items-center p-6"
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-lg font-bold text-white">Dr. {upcomingAppointment.doctor?.name}</Text>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      </View>
                      <Text className="text-sm text-white/80 mt-0.5 mb-4">
                        {upcomingAppointment.doctor?.doctorProfile?.specializations?.join(', ') || 'Specialist'}
                      </Text>
                      <View className="flex-row items-center gap-1.5 bg-white/20 px-4 py-1.5 rounded self-start">
                        <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                        <Text className="text-xs font-semibold text-white">
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
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4 px-6">
                <Text className="text-lg font-bold text-textMain">Categories</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-4 pb-1 px-6"
              >
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      className={`flex-row items-center bg-surface px-4 py-3 rounded-md border gap-3 ${isActive ? 'bg-primary border-primary' : 'border-[#e2e8f0]'}`}
                      onPress={() => handleCategoryPress(cat.id)}
                      activeOpacity={0.8}
                    >
                      <View className={`w-9 h-9 rounded justify-center items-center`} style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : cat.bg }}>
                        <Ionicons
                          name={cat.icon as any}
                          size={24}
                          color={isActive ? '#fff' : cat.color}
                        />
                      </View>
                      <Text className={`text-sm font-semibold ${isActive ? 'text-white font-bold' : 'text-textSecondary'}`}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Top Doctors Label */}
            <View className="flex-row justify-between items-center mb-4 px-6">
              <Text className="text-lg font-bold text-textMain">Top Doctors</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-6">
            <DoctorCard
              doctor={item}
              onPress={() => router.push(`/(patient)/doctor/${item.user.id}`)}
            />
          </View>
        )}
        contentContainerClassName="pb-10"
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
          <View className="px-6">
            <EmptyState
              title="No Doctors Found"
              subtitle={search || selectedCategory ? 'Try a different search term or category' : 'No approved doctors available yet'}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
