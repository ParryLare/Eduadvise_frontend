import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, 
  User, Maximize2, Minimize2
} from "lucide-react";

const VideoCall = ({ 
  callId, 
  bookingId, 
  callType = "video", 
  otherUserName, 
  otherUserPhoto,
  isIncoming = false,
  onEnd 
}) => {
  const { user } = useAuth();
  const [callStatus, setCallStatus] = useState(isIncoming ? "ringing" : "initiating");
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === "video");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [iceConfig, setIceConfig] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const wsRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // Default ICE config
  const defaultIceConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  // Fetch TURN server config on mount
  useEffect(() => {
    const fetchTurnConfig = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/webrtc/config`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIceConfig(res.data);
      } catch (err) {
        console.error("Failed to fetch TURN config, using fallback STUN servers");
        setIceConfig(defaultIceConfig);
      }
    };
    fetchTurnConfig();
  }, []);

  // Helper functions (not hooks, so order doesn't matter)
  const startLocalStream = async () => {
    try {
      const constraints = {
        video: callType === "video",
        audio: true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      toast.error("Could not access camera/microphone");
      throw err;
    }
  };

  const sendSignal = async (type, data) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/calls/${callId}/signal`, {
        type,
        data
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Error sending signal:", err);
    }
  };

  const createPeerConnection = () => {
    const configuration = iceConfig || defaultIceConfig;
    const pc = new RTCPeerConnection(configuration);
    
    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal("ice-candidate", event.candidate);
      }
    };
    
    // Handle remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setCallStatus("active");
    };
    
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        toast.info("Call disconnected");
        cleanup();
        onEnd?.();
      }
    };
    
    peerConnectionRef.current = pc;
    return pc;
  };

  const createOffer = async () => {
    try {
      const pc = peerConnectionRef.current;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal("offer", offer);
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  };

  const handleSignal = async (data) => {
    let pc = peerConnectionRef.current;
    
    if (data.signal_type === "offer") {
      if (!pc) {
        await startLocalStream();
        pc = createPeerConnection();
      }
      await pc.setRemoteDescription(new RTCSessionDescription(data.data));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal("answer", answer);
    } else if (data.signal_type === "answer") {
      await pc?.setRemoteDescription(new RTCSessionDescription(data.data));
    } else if (data.signal_type === "ice-candidate") {
      try {
        await pc?.addIceCandidate(new RTCIceCandidate(data.data));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    }
  };

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  }, []);

  // Initialize WebSocket and call
  useEffect(() => {
    if (!user) return;

    const initCall = async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.post(`${API}/calls/initiate`, {
          booking_id: bookingId,
          call_type: callType
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCallStatus("ringing");
      } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to start call");
        onEnd?.();
      }
    };
    
    const wsUrl = process.env.REACT_APP_BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(`${wsUrl}/ws/${user.user_id}`);
    
    ws.onopen = () => {
      console.log("WebSocket connected for call");
      if (!isIncoming) {
        initCall();
      }
    };
    
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "call_answered") {
        setCallStatus("connecting");
        await startLocalStream();
        createPeerConnection();
        createOffer();
      } else if (data.type === "call_rejected" || data.type === "call_ended") {
        toast.info("Call ended");
        cleanup();
        onEnd?.();
      } else if (data.type === "webrtc_signal") {
        handleSignal(data);
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Connection error");
    };
    
    wsRef.current = ws;
    
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  // Duration timer
  useEffect(() => {
    if (callStatus === "active") {
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [callStatus]);

  const answerCall = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/calls/${callId}/answer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCallStatus("connecting");
      await startLocalStream();
      createPeerConnection();
    } catch (err) {
      toast.error("Failed to answer call");
    }
  };

  const rejectCall = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/calls/${callId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      cleanup();
      onEnd?.();
    } catch (err) {
      toast.error("Failed to reject call");
    }
  };

  const endCall = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/calls/${callId}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Error ending call:", err);
    }
    cleanup();
    onEnd?.();
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Incoming call UI
  if (isIncoming && callStatus === "ringing") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" data-testid="incoming-call">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full mx-4">
          <div className="mb-6">
            {otherUserPhoto ? (
              <img src={otherUserPhoto} alt="" className="w-24 h-24 rounded-full mx-auto object-cover" />
            ) : (
              <div className="w-24 h-24 bg-teal-100 rounded-full mx-auto flex items-center justify-center">
                <User className="w-12 h-12 text-teal-700" />
              </div>
            )}
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2">{otherUserName}</h2>
          <p className="text-muted-foreground mb-8">
            Incoming {callType} call...
          </p>
          <div className="flex justify-center gap-6">
            <button
              onClick={rejectCall}
              className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              data-testid="reject-call"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
            <button
              onClick={answerCall}
              className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors animate-pulse"
              data-testid="answer-call"
            >
              <Phone className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed ${isFullscreen ? 'inset-0' : 'bottom-6 right-6 w-[400px] h-[300px]'} bg-gray-900 rounded-2xl overflow-hidden shadow-2xl z-50 transition-all duration-300`}
      data-testid="video-call"
    >
      {/* Remote Video */}
      <div className="absolute inset-0 bg-gray-800">
        {callType === "video" ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white">
            {otherUserPhoto ? (
              <img src={otherUserPhoto} alt="" className="w-32 h-32 rounded-full object-cover mb-4" />
            ) : (
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <p className="text-xl font-semibold">{otherUserName}</p>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      {callType === "video" && (
        <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
      )}

      {/* Status Overlay */}
      {callStatus !== "active" && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-lg">
            {callStatus === "initiating" && "Initiating call..."}
            {callStatus === "ringing" && "Ringing..."}
            {callStatus === "connecting" && "Connecting..."}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="font-semibold">{otherUserName}</p>
            {callStatus === "active" && (
              <p className="text-sm text-white/70">{formatDuration(duration)}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
            }`}
            data-testid="toggle-audio"
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>
          
          {callType === "video" && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
              }`}
              data-testid="toggle-video"
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </button>
          )}
          
          <button
            onClick={endCall}
            className="p-4 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            data-testid="end-call"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
