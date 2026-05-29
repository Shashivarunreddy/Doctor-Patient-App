import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  StyleSheet
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { patientService } from '@/services/patient';
import { doctorService } from '@/services/doctor';
import { Colors } from '@/constants/theme';

type CallParams = {
  appointmentId: string;
  channelName: string;
  token: string;
  appId: string;
  uid: string;
  role: string; // 'patient' | 'doctor'
  remoteName: string;
  remoteRole: string;
  appointmentDate: string;
  appointmentTime: string;
};

export default function CallScreen() {
  const params = useLocalSearchParams<CallParams>();
  const insets = useSafeAreaInsets();
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  // Simulate connection after a short delay
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const connectTimer = setTimeout(() => {
      setIsConnected(true);
    }, 1500);

    return () => clearTimeout(connectTimer);
  }, []);

  // Pulse animation for connecting state
  useEffect(() => {
    if (!isConnected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isConnected]);

  // Connected dot blink
  useEffect(() => {
    if (isConnected) {
      const blink = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      blink.start();
      return () => blink.stop();
    }
  }, [isConnected]);

  // Call timer
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    setIsEnding(true);
    try {
      if (params.role === 'patient') {
        await patientService.endCall(params.appointmentId);
      } else {
        await doctorService.endCall(params.appointmentId);
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to end call');
      setIsEnding(false);
    }
  };

  const confirmEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Call', style: 'destructive', onPress: handleEndCall },
      ],
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View className="flex-1 bg-[#0a1628]">
      <LinearGradient
        colors={['#0a1628', '#0d2137', '#0a1628']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Bar */}
      <Animated.View
        className="flex-row justify-between items-center px-6 pb-4"
        style={{ paddingTop: insets.top + 12, opacity: fadeIn }}
      >
        <View className="flex-row items-center gap-2">
          <Animated.View
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: isConnected ? '#10B981' : '#f59e0b',
              opacity: isConnected ? dotAnim : 1,
            }}
          />
          <Text className="text-white/70 text-sm font-medium">
            {isConnected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>

        {isConnected && (
          <View className="flex-row items-center gap-1 bg-white/10 px-4 py-1.5 rounded-full">
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text className="text-white text-sm font-bold tabular-nums">{formatTime(elapsed)}</Text>
          </View>
        )}
      </Animated.View>

      {/* Main Content */}
      <Animated.View
        className="flex-1 justify-center items-center px-6"
        style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}
      >
        {/* Remote User Avatar */}
        <Animated.View
          className="mb-8 relative"
          style={!isConnected ? { transform: [{ scale: pulseAnim }] } : {}}
        >
          <LinearGradient
            colors={isConnected ? ['#0058bc', '#004494'] : ['#374151', '#1f2937']}
            className="w-[120px] h-[120px] rounded-full justify-center items-center"
          >
            <Text className="text-[40px] font-bold text-white">
              {getInitials(params.remoteName || 'U')}
            </Text>
          </LinearGradient>
          {isConnected && (
            <View className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-[64px] border-2 border-[#0058bc]/40" />
          )}
        </Animated.View>

        {/* Remote User Info */}
        <Text className="text-3xl font-bold text-white mb-2 text-center">
          {params.remoteRole === 'doctor' ? 'Dr. ' : ''}
          {params.remoteName || 'Unknown'}
        </Text>
        <View className="bg-[#0058bc]/25 px-6 py-1 rounded-full mb-6">
          <Text className="text-[#adc6ff] text-xs font-semibold uppercase tracking-[1px]">
            {params.remoteRole === 'doctor' ? 'Doctor' : 'Patient'}
          </Text>
        </View>

        {/* Appointment Info */}
        <View className="flex-row items-center gap-2 mb-6">
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.5)" />
            <Text className="text-white/50 text-sm font-medium">{params.appointmentDate}</Text>
          </View>
          <View className="w-[3px] h-[3px] rounded-[1.5px] bg-white/30" />
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.5)" />
            <Text className="text-white/50 text-sm font-medium">{params.appointmentTime}</Text>
          </View>
        </View>

        {/* Status Message */}
        {!isConnected && (
          <Text className="text-white/40 text-sm font-normal">
            Setting up secure connection...
          </Text>
        )}
        {isConnected && elapsed < 5 && (
          <Text className="text-white/40 text-sm font-normal">
            Call connected successfully
          </Text>
        )}
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View
        className="px-6 items-center"
        style={{ paddingBottom: insets.bottom + 24, opacity: fadeIn }}
      >
        {/* Channel info (subtle) */}
        <Text className="text-white/15 text-xs mb-8 tabular-nums">
          Channel: {params.channelName}
        </Text>

        <View className="flex-row items-center justify-center gap-10">
          {/* Mute Button */}
          <TouchableOpacity
            className={`items-center gap-2 ${isMuted ? 'opacity-100' : ''}`}
            onPress={() => setIsMuted(!isMuted)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color={isMuted ? Colors.danger : '#fff'}
            />
            <Text className={`text-xs font-medium ${isMuted ? 'text-danger' : 'text-white/60'}`}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            className="items-center gap-2"
            onPress={confirmEndCall}
            activeOpacity={0.7}
            disabled={isEnding}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              className="w-16 h-16 rounded-full justify-center items-center"
            >
              <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
            </LinearGradient>
            <Text className="text-white/60 text-xs font-medium">End</Text>
          </TouchableOpacity>

          {/* Speaker Button */}
          <TouchableOpacity
            className={`items-center gap-2 ${!isSpeaker ? 'opacity-100' : ''}`}
            onPress={() => setIsSpeaker(!isSpeaker)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSpeaker ? 'volume-high' : 'volume-mute'}
              size={24}
              color={!isSpeaker ? Colors.danger : '#fff'}
            />
            <Text className={`text-xs font-medium ${!isSpeaker ? 'text-danger' : 'text-white/60'}`}>
              {isSpeaker ? 'Speaker' : 'Muted'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
