import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Fonts, Spacing, Radii, Shadows } from '@/constants/theme';

export default function ContactAdminScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser } = useAuth();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

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

  const handleRefresh = async () => {
    await refreshUser();
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#FFF7ED', '#FFFBEB', Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Icon */}
        <Animated.View style={[styles.iconRing, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['#6366f1', Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name="headset" size={52} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Text style={styles.title}>Contact Admin</Text>
        <Text style={styles.subtitle}>Your profile is verified!</Text>

        {/* Status card */}
        <View style={[styles.card, Shadows.md]}>
          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.statusText}>Account & documents fully verified</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statusRow}>
            <Ionicons name="pause-circle" size={20} color={Colors.warning} />
            <Text style={styles.statusText}>Appointment booking is not yet enabled</Text>
          </View>
        </View>

        {/* Explanation */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What does this mean?</Text>
          <Text style={styles.infoText}>
            Your doctor profile has been fully verified. However, an admin needs to enable appointment
            booking for your account before patients can book sessions with you.
          </Text>
          <Text style={[styles.infoText, { marginTop: Spacing.sm }]}>
            This is usually done within 24 hours of verification. You can contact support to expedite this.
          </Text>
        </View>

        {/* Doctor info */}
        {user && (
          <View style={styles.profileChip}>
            <Ionicons name="person-circle" size={20} color={Colors.primary} />
            <Text style={styles.profileText}>Dr. {user.name} • {user.email}</Text>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
          <Text style={styles.refreshButtonText}>Check Status Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },

  iconRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99,102,241,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },

  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.success,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: Spacing.xl,
  },

  card: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: Spacing.sm,
  },

  infoCard: {
    width: '100%',
    backgroundColor: Colors.primaryFaded,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    lineHeight: Fonts.lineHeights.sm,
  },

  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(194, 198, 213, 0.3)',
  },
  profileText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    fontWeight: '500',
  },

  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    marginBottom: Spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.primary,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.full,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.danger,
  },
});

