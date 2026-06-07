import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC, {
  type IAgoraRTCClient,
  type ILocalVideoTrack,
  type ILocalAudioTrack,
  type IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';
import { api } from '../../services/api';
import { type CallTokenResponse } from '../../types/appointment';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, User, 
  Loader2, Maximize2, Minimize2, Monitor, Info, X, 
  Wifi, ShieldAlert, Clock, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

AgoraRTC.setLogLevel(4); // suppress verbose logs

interface VideoCallProps {
  role: 'patient' | 'doctor';
}

type Corner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

const VideoCall = ({ role }: VideoCallProps) => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ILocalVideoTrack | null>(null);
  const localAudioTrackRef = useRef<ILocalAudioTrack | null>(null);
  const screenTrackRef = useRef<any | null>(null);
  const remoteUserUidRef = useRef<number | undefined>(undefined);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const [callInfo, setCallInfo] = useState<CallTokenResponse | null>(null);
  const [patientDetails, setPatientDetails] = useState<any | null>(null);
  const [isJoining, setIsJoining] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteUser, setRemoteUser] = useState<IAgoraRTCRemoteUser | null>(null);
  const [localTrackReady, setLocalTrackReady] = useState(false);

  // Premium Features State
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [networkQuality, setNetworkQuality] = useState<number>(1); // 1 = Excellent, 2 = Good, etc.
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pipCorner, setPipCorner] = useState<Corner>('bottom-right');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [peerVolume, setPeerVolume] = useState(0); // 0 to 100 representing audio volume

  const appointmentsPath = role === 'doctor' ? '/doctor-dashboard/appointments' : '/patient-dashboard/appointments';

  // Live Timer
  useEffect(() => {
    if (isJoining) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isJoining]);

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${hrs > 0 ? pad(hrs) + ':' : ''}${pad(mins)}:${pad(secs)}`;
  };

  // Load Patient Profile if current user is Doctor
  useEffect(() => {
    if (isJoining || role !== 'doctor' || !callInfo?.appointment?.patientId) return;

    const fetchPatientProfile = async () => {
      try {
        const res = await api.get(`/patient/profile`); // Patient profile endpoint
        if (res.data?.success) {
          setPatientDetails(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load patient health metrics for sidebar:', err);
      }
    };
    fetchPatientProfile();
  }, [isJoining, role, callInfo]);

  // Agora SDK Integration
  useEffect(() => {
    let cancelled = false;

    const doJoin = async () => {
      if (!appointmentId) return;
      try {
        const endpoint =
          role === 'doctor'
            ? `/doctor/appointments/${appointmentId}/join`
            : `/patient/appointments/${appointmentId}/join`;

        const res = await api.get(endpoint);
        if (!res.data.success) throw new Error('Failed to get call token');
        if (cancelled) return;

        const data: CallTokenResponse = res.data.data;
        setCallInfo(data);

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        // Subscribe to events
        client.on('user-published', async (remUser, mediaType) => {
          await client.subscribe(remUser, mediaType);
          if (cancelled) return;
          if (mediaType === 'video') {
            remoteUserUidRef.current = remUser.uid as number;
            setRemoteUser(remUser);
          }
          if (mediaType === 'audio') {
            remUser.audioTrack?.play();
          }
        });

        client.on('user-unpublished', (_remUser, mediaType) => {
          if (mediaType === 'video' && !cancelled) {
            remoteUserUidRef.current = undefined;
            setRemoteUser(null);
          }
        });

        client.on('user-left', () => {
          if (!cancelled) {
            remoteUserUidRef.current = undefined;
            setRemoteUser(null);
          }
        });

        // Network Quality Indicator Event
        client.on('network-quality', (stats) => {
          if (!cancelled) {
            setNetworkQuality(stats.downlinkNetworkQuality);
          }
        });

        // Volume Indicator Event (Audio levels)
        client.enableAudioVolumeIndicator();
        client.on('volume-indicator', (volumes) => {
          if (cancelled) return;
          const currentRemoteUid = remoteUserUidRef.current;
          const remoteVol = currentRemoteUid != null
            ? volumes.find((v) => v.uid === currentRemoteUid)
            : undefined;
          if (remoteVol) {
            setPeerVolume(remoteVol.level);
          } else {
            setPeerVolume(0);
          }
        });

        await client.join(data.appId, data.channelName, data.token, data.uid);
        if (cancelled) { await client.leave(); return; }

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        if (cancelled) {
          audioTrack.stop(); audioTrack.close();
          videoTrack.stop(); videoTrack.close();
          await client.leave();
          return;
        }

        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;
        await client.publish([audioTrack, videoTrack]);

        setIsJoining(false);
        setLocalTrackReady(true);
      } catch (err: unknown) {
        if (!cancelled) {
          console.error('Failed to join call:', err);
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          setError(e.response?.data?.message || e.message || 'Failed to join the call.');
          setIsJoining(false);
        }
      }
    };

    doJoin();

    return () => {
      cancelled = true;
      localVideoTrackRef.current?.stop();
      localVideoTrackRef.current?.close();
      localVideoTrackRef.current = null;
      localAudioTrackRef.current?.stop();
      localAudioTrackRef.current?.close();
      localAudioTrackRef.current = null;
      screenTrackRef.current?.stop();
      screenTrackRef.current?.close();
      screenTrackRef.current = null;
      void clientRef.current?.leave();
      clientRef.current = null;
    };
  }, [appointmentId, role]);

  // Play local/remote tracks
  useEffect(() => {
    if (localTrackReady && localVideoRef.current && localVideoTrackRef.current) {
      localVideoTrackRef.current.play(localVideoRef.current);
    }
  }, [localTrackReady]);

  useEffect(() => {
    if (remoteUser?.videoTrack && remoteVideoRef.current) {
      remoteUser.videoTrack.play(remoteVideoRef.current);
    }
  }, [remoteUser, localTrackReady]);

  const toggleMic = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!isMicOn);
      setIsMicOn(prev => !prev);
    }
  };

  const toggleCam = async () => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setEnabled(!isCamOn);
      setIsCamOn(prev => !prev);
    }
  };

  // Screen sharing logic
  const toggleScreenShare = async () => {
    if (!clientRef.current) return;

    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: '1080p_1',
        }, 'auto') as any;
        
        screenTrackRef.current = screenTrack;
        
        // Unpublish camera, publish screen
        if (localVideoTrackRef.current) {
          await clientRef.current.unpublish(localVideoTrackRef.current);
        }
        await clientRef.current.publish(screenTrack);

        // Bind local preview to screen share
        if (localVideoRef.current) {
          screenTrack.play(localVideoRef.current);
        }

        // Handle track ended event (e.g. if user stops sharing via browser bar)
        screenTrack.on('track-ended', () => {
          stopScreenSharing();
        });

        setIsScreenSharing(true);
      } else {
        await stopScreenSharing();
      }
    } catch (err) {
      console.error('Failed to share screen:', err);
    }
  };

  const stopScreenSharing = async () => {
    if (!clientRef.current || !screenTrackRef.current) return;
    
    try {
      await clientRef.current.unpublish(screenTrackRef.current);
      screenTrackRef.current.stop();
      screenTrackRef.current.close();
      screenTrackRef.current = null;

      // Republic camera track
      if (localVideoTrackRef.current) {
        await clientRef.current.publish(localVideoTrackRef.current);
        if (localVideoRef.current) {
          localVideoTrackRef.current.play(localVideoRef.current);
        }
      }
      setIsScreenSharing(false);
    } catch (err) {
      console.error('Failed to stop screen share:', err);
    }
  };

  // Fullscreen controller
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const cleanup = async () => {
    localVideoTrackRef.current?.stop();
    localVideoTrackRef.current?.close();
    localVideoTrackRef.current = null;
    localAudioTrackRef.current?.stop();
    localAudioTrackRef.current?.close();
    localAudioTrackRef.current = null;
    screenTrackRef.current?.stop();
    screenTrackRef.current?.close();
    screenTrackRef.current = null;
    await clientRef.current?.leave();
    clientRef.current = null;
  };

  const leaveCall = async () => {
    await cleanup();
    navigate(appointmentsPath);
  };

  const endConsultation = async () => {
    setIsEnding(true);
    setShowEndConfirm(false);
    try {
      const endpoint =
        role === 'doctor'
          ? `/doctor/appointments/${appointmentId}/end`
          : `/patient/appointments/${appointmentId}/end`;
      await api.patch(endpoint);
    } catch (err) {
      console.error('Error ending consultation:', err);
    } finally {
      await cleanup();
      navigate(appointmentsPath);
    }
  };

  // Network Quality Helper
  const getNetworkLabel = (quality: number) => {
    switch (quality) {
      case 1:
      case 2:
        return { label: 'Excellent', color: 'text-green-400 bg-green-500/10 border-green-500/20' };
      case 3:
        return { label: 'Good', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
      case 4:
      case 5:
        return { label: 'Poor Connection', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      default:
        return { label: 'Reconnecting', color: 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse' };
    }
  };

  // Cycle corners for local PiP
  const cyclePipCorner = () => {
    const corners: Corner[] = ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
    const currentIndex = corners.indexOf(pipCorner);
    const nextIndex = (currentIndex + 1) % corners.length;
    setPipCorner(corners[nextIndex]);
  };

  const getPipClass = (corner: Corner) => {
    switch (corner) {
      case 'bottom-right': return 'bottom-24 right-6';
      case 'bottom-left': return 'bottom-24 left-6';
      case 'top-right': return 'top-6 right-6';
      case 'top-left': return 'top-6 left-6';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-3xl p-10 text-center max-w-md border border-zinc-800 space-y-6">
          <div className="h-16 w-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <PhoneOff className="h-8 w-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-white font-extrabold text-xl">Connection Failed</h2>
            <p className="text-zinc-400 text-sm">{error}</p>
          </div>
          <Button onClick={() => navigate(appointmentsPath)} className="w-full bg-primary hover:bg-orange-600 font-bold rounded-xl h-12">
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-zinc-400 font-semibold tracking-wide">Connecting to Secure Server...</p>
        </div>
      </div>
    );
  }

  const peerName = role === 'doctor'
    ? callInfo?.appointment?.patient?.name
    : callInfo?.appointment?.doctor?.name;
  const peerLabel = role === 'doctor' ? 'Patient' : 'Dr.';
  const netStats = getNetworkLabel(networkQuality);

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans overflow-hidden select-none">
      
      {/* Video workspace area */}
      <div className="flex-1 flex flex-col relative h-screen">
        
        {/* Transparent Float Header overlay */}
        <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-none">
          
          {/* Channel / Peer Info */}
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-zinc-800/80 pointer-events-auto flex items-center gap-3">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            <div>
              <p className="text-white font-black text-sm tracking-tight">{peerLabel} {peerName}</p>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{role} view</p>
            </div>
          </div>

          {/* Indicators: Quality, Fullscreen, Sidebar */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${netStats.color}`}>
              <Wifi size={12} /> {netStats.label}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold border border-zinc-800 bg-zinc-900/80 text-zinc-300 flex items-center gap-1.5">
              <Clock size={12} /> {formatTimer(secondsElapsed)}
            </span>
            <button 
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white transition-colors"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button 
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className={`p-2.5 rounded-xl border transition-all ${isSidebarOpen ? 'border-primary bg-primary/10 text-primary' : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white'}`}
              title="Consultation Details"
            >
              <Info size={16} />
            </button>
          </div>
        </div>

        {/* Video Screens */}
        <div className="flex-1 relative bg-zinc-950 flex items-center justify-center p-4">
          
          {/* Main Remote Feed */}
          <div
            ref={remoteVideoRef}
            className="w-full h-full rounded-3xl bg-zinc-900 border border-zinc-850 overflow-hidden flex items-center justify-center relative shadow-inner"
          >
            {/* Audio Pulse Ring Visualizer (if speaking) */}
            {remoteUser && peerVolume > 10 && (
              <div className="absolute inset-0 border-[6px] border-primary/20 rounded-3xl pointer-events-none animate-pulse z-20" />
            )}

            {!remoteUser && (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-zinc-850 border border-zinc-800 flex items-center justify-center mx-auto relative">
                  <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" style={{ animationDuration: '4s' }} />
                  <User size={44} className="text-zinc-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-400 font-extrabold text-lg">Waiting for {peerLabel} {peerName} to join...</p>
                  <p className="text-zinc-600 text-xs font-semibold">Consultation will begin automatically once connected.</p>
                </div>
              </div>
            )}
          </div>

          {/* Local PIP Feed */}
          <div
            onClick={cyclePipCorner}
            ref={localVideoRef}
            className={`absolute ${getPipClass(pipCorner)} w-48 h-32 rounded-2xl bg-zinc-800 overflow-hidden border-2 border-zinc-700/80 shadow-2xl transition-all duration-300 z-30 cursor-pointer group`}
            title="Click to cycle corner"
          >
            {!isCamOn && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
                <VideoOff size={24} className="text-zinc-600 mb-1" />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Camera Muted</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold text-zinc-400 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              Click to Move
            </div>
          </div>
        </div>

        {/* Floating Glassmorphism Control Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 px-6 py-4 rounded-2xl shadow-2xl">
          
          {/* Mute Mic */}
          <button
            onClick={toggleMic}
            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
              isMicOn
                ? 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50'
                : 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30'
            }`}
            title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Mute Camera */}
          <button
            onClick={toggleCam}
            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
              isCamOn
                ? 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50'
                : 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30'
            }`}
            title={isCamOn ? 'Mute Camera' : 'Unmute Camera'}
          >
            {isCamOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
              isScreenSharing
                ? 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50'
            }`}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <Monitor size={20} />
          </button>

          <div className="w-px h-6 bg-zinc-800" />

          {/* Disconnect/Leave Button */}
          <button
            onClick={() => setShowEndConfirm(true)}
            disabled={isEnding}
            className="h-12 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 transition-all font-bold text-sm shadow-lg shadow-red-650/20"
          >
            {isEnding ? <Loader2 className="animate-spin h-5 w-5" /> : <PhoneOff size={18} />}
            Leave Call
          </button>
        </div>

      </div>

      {/* Expandable Medical Context Side Panel */}
      {isSidebarOpen && (
        <div className="w-80 h-screen bg-zinc-900 border-l border-zinc-800/80 flex flex-col z-40 relative">
          
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-white font-extrabold text-base flex items-center gap-2">
              <ShieldAlert size={18} className="text-primary" /> Case Details
            </h3>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="text-zinc-500 hover:text-white rounded-lg p-1.5 hover:bg-zinc-850"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Appointment general stats */}
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Time Window</span>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2">
                <p className="text-zinc-300 text-sm font-semibold">Date: {callInfo?.appointment?.timeSlot?.date}</p>
                <p className="text-zinc-400 text-xs font-semibold">
                  Hours: {callInfo?.appointment?.timeSlot?.startTime} - {callInfo?.appointment?.timeSlot?.endTime}
                </p>
                {callInfo?.appointment?.notes && (
                  <p className="text-zinc-500 text-xs italic border-t border-zinc-900 pt-2">
                    Note: "{callInfo.appointment.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Doctor View: Displays Patient clinical metrics */}
            {role === 'doctor' && (
              <>
                {patientDetails ? (
                  <div className="space-y-4">
                    <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Patient Health Profile</span>
                    
                    {/* General Demographics */}
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2.5">
                      {patientDetails.profile?.gender && (
                        <p className="text-zinc-300 text-xs font-semibold">Gender: <span className="text-zinc-400">{patientDetails.profile.gender}</span></p>
                      )}
                      {patientDetails.profile?.bloodGroup && (
                        <p className="text-zinc-300 text-xs font-semibold">Blood Group: <span className="text-zinc-400">{patientDetails.profile.bloodGroup}</span></p>
                      )}
                      {patientDetails.profile?.dateOfBirth && (
                        <p className="text-zinc-300 text-xs font-semibold">DOB: <span className="text-zinc-400">{new Date(patientDetails.profile.dateOfBirth).toLocaleDateString()}</span></p>
                      )}
                    </div>

                    {/* Allergies list */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Allergies List</span>
                      {patientDetails.profile?.allergies?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {patientDetails.profile.allergies.map((a: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/20">
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-600 text-xs italic">No allergies registered.</p>
                      )}
                    </div>

                    {/* Medical history */}
                    {patientDetails.profile?.medicalHistory && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Clinical History</span>
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                          <p className="text-zinc-400 text-xs leading-relaxed font-medium whitespace-pre-line">
                            {patientDetails.profile.medicalHistory}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-zinc-500 text-xs">
                    <Loader2 className="animate-spin h-4 w-4" /> Fetching patient metrics...
                  </div>
                )}
              </>
            )}

            {/* Patient View: Displays Doctor specializations & qualifications */}
            {role === 'patient' && callInfo?.appointment?.doctor && (
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Doctor Information</span>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3">
                  <div>
                    <h4 className="text-zinc-300 font-extrabold text-sm">{callInfo.appointment.doctor.name}</h4>
                    <p className="text-zinc-500 text-xs">{callInfo.appointment.doctor.email}</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Secure indicator */}
          <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 bg-green-500 rounded-full" /> Encrypted RTC Channel
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-zinc-900 rounded-3xl p-8 max-w-sm w-full border border-zinc-800 text-center space-y-6 shadow-2xl">
            <div className="h-16 w-16 bg-red-950/40 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-white font-extrabold text-xl tracking-tight">Disconnect Consultation?</h3>
              <p className="text-zinc-400 text-sm font-semibold leading-relaxed">
                Choose to leave temporarily (you can rejoin later) or end the session completely.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={leaveCall}
                className="w-full h-12 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white font-extrabold transition-all border border-zinc-700/50"
              >
                Leave Temporarily
              </button>
              <button
                onClick={endConsultation}
                className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold transition-all shadow-lg shadow-red-650/20"
              >
                End Session Completely
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="w-full h-10 rounded-xl bg-transparent text-zinc-500 hover:text-zinc-300 font-bold transition-all text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VideoCall;
