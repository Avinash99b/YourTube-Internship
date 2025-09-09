import React, { useRef, useState, useEffect, useContext } from "react";
import Peer from "peerjs";
import { ThemeContext } from "@/lib/ThemeContext";

const TURN_CONFIG = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "turn:your.turn.server:3478", username: "user", credential: "pass" },
    ],
};

const VideoCall: React.FC = () => {
    const { theme } = useContext(ThemeContext);
    const [peer, setPeer] = useState<Peer | null>(null);
    const [myPeerId, setMyPeerId] = useState("");
    const [friendPeerId, setFriendPeerId] = useState("");
    const [connected, setConnected] = useState(false);
    const [callObj, setCallObj] = useState<any>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [copied, setCopied] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Init Peer
    useEffect(() => {
        const p = new Peer({ config: TURN_CONFIG });
        setPeer(p);

        p.on("open", (id) => setMyPeerId(id));

        p.on("call", async (call) => {
            try {
                const userStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                    audio: true,
                });
                setStream(userStream);
                call.answer(userStream);
                setCallObj(call);
                call.on("stream", setRemoteStream);
                setConnected(true);
            } catch (err) {
                console.error("Error accessing camera/mic:", err);
            }
        });

        return () => p.destroy();
    }, []);

    useEffect(() => {
        if (stream && localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(() => {});
        }
    }, [stream]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(() => {});
        }
    }, [remoteStream]);

    const connectCall = async () => {
        if (!peer || !friendPeerId) return;
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: true,
            });
            setStream(userStream);
            const call = peer.call(friendPeerId, userStream);
            setCallObj(call);
            call.on("stream", setRemoteStream);
            setConnected(true);
        } catch (err) {
            console.error("Error accessing camera/mic:", err);
        }
    };

    const shareScreen = async () => {
        if (!callObj) return;
        if (!navigator.mediaDevices.getDisplayMedia) {
            alert("Screen sharing is not supported on this device/browser.");
            return;
        }
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const videoTrack = screenStream.getVideoTracks()[0];
            const sender = callObj.peerConnection
                .getSenders()
                .find((s: any) => s.track?.kind === "video");
            if (sender) sender.replaceTrack(videoTrack);

            videoTrack.onended = () => {
                if (stream) {
                    const originalTrack = stream.getVideoTracks()[0];
                    if (sender) sender.replaceTrack(originalTrack);
                }
            };
        } catch (err) {
            console.error("Screen sharing failed:", err);
        }
    };

    const startRecording = () => {
        if (!stream && !remoteStream) return;
        const combinedStream = new MediaStream([
            ...(stream ? stream.getTracks() : []),
            ...(remoteStream ? remoteStream.getTracks() : []),
        ]);
        const recorder = new MediaRecorder(combinedStream);
        setMediaRecorder(recorder);
        setRecordedChunks([]);
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
        };
        recorder.start();
        setRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
        }
    };

    const downloadRecording = () => {
        if (recordedChunks.length === 0) return;
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "session.webm";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(myPeerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    return (
        <div
            className={`min-h-screen flex flex-col items-center p-6 space-y-6 transition-colors duration-300 ${
                theme === "dark"
                    ? "bg-[#101014] text-[#f3f3f3]"
                    : "bg-[#f7f7fa] text-[#18181b]"
            }`}
        >
            <h1 className="text-2xl md:text-3xl font-bold text-center tracking-tight mb-2">
                PeerJS Video Call
            </h1>
            {/* Video section */}
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl">
                <div
                    className={`flex-1 flex flex-col items-center p-3 rounded-xl shadow-lg transition-all duration-300 ${
                        theme === "dark"
                            ? "bg-[#18181b] text-[#f3f3f3]"
                            : "bg-white text-[#18181b]"
                    }`}
                >
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full aspect-video max-h-72 bg-black rounded-lg border-2 border-primary shadow-md transition-all duration-300"
                    />
                    <span className="mt-2 text-muted-foreground text-sm opacity-80">You</span>
                </div>
                <div
                    className={`flex-1 flex flex-col items-center p-3 rounded-xl shadow-lg transition-all duration-300 ${
                        theme === "dark"
                            ? "bg-[#18181b] text-[#f3f3f3]"
                            : "bg-white text-[#18181b]"
                    }`}
                >
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full aspect-video max-h-72 bg-black rounded-lg border-2 border-secondary shadow-md transition-all duration-300"
                    />
                    <span className="mt-2 text-muted-foreground text-sm opacity-80">Friend</span>
                </div>
            </div>
            {/* Peer IDs */}
            <div className="flex flex-col md:flex-row items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 relative">
                    <span className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Your ID:</span>
                    <input
                        type="text"
                        value={myPeerId}
                        readOnly
                        className={`p-2 rounded border w-56 focus:outline-none transition-all duration-200 ${
                            theme === "dark"
                                ? "bg-[#23232b] border-[#333] text-white placeholder-gray-400"
                                : "bg-[#f3f3f3] border-[#ccc] text-black placeholder-gray-500"
                        }`}
                        aria-label="Your Peer ID"
                    />
                    <button
                        className={`px-3 py-1 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 relative ${
                            theme === "dark"
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-primary text-primary-foreground hover:bg-primary/80"
                        }`}
                        onClick={handleCopy}
                        aria-label="Copy your Peer ID"
                        tabIndex={0}
                    >
                        {copied ? "Copied!" : "Copy"}
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs text-green-500 font-semibold transition-opacity duration-200 opacity-0 pointer-events-none select-none" style={{ opacity: copied ? 1 : 0 }}>
                            Copied!
                        </span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Call with:</span>
                    <input
                        type="text"
                        placeholder="Enter Friend ID"
                        value={friendPeerId}
                        onChange={(e) => setFriendPeerId(e.target.value)}
                        className={`p-2 rounded border w-56 focus:outline-none transition-all duration-200 ${
                            theme === "dark"
                                ? "bg-[#23232b] border-[#333] text-white placeholder-gray-400"
                                : "bg-[#f3f3f3] border-[#ccc] text-black placeholder-gray-500"
                        }`}
                        aria-label="Enter Friend's Peer ID"
                    />
                    <button
                        className={`px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/60 ${
                            connected || !friendPeerId
                                ? "bg-secondary text-secondary-foreground opacity-60 cursor-not-allowed"
                                : theme === "dark"
                                ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                        onClick={connectCall}
                        disabled={connected || !friendPeerId}
                        aria-label="Connect to Friend"
                    >
                        Connect
                    </button>
                </div>
            </div>
            {/* Controls */}
            <div className="flex flex-wrap gap-3 justify-center mt-2">
                <button
                    onClick={shareScreen}
                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/60 ${
                        !connected
                            ? "bg-accent text-accent-foreground opacity-60 cursor-not-allowed"
                            : theme === "dark"
                            ? "bg-accent text-accent-foreground hover:bg-accent/90"
                            : "bg-accent text-accent-foreground hover:bg-accent/80"
                    }`}
                    disabled={!connected}
                    aria-label="Share your screen"
                    title="Share your screen"
                >
                    Share Screen
                </button>
                {!recording ? (
                    <button
                        onClick={startRecording}
                        className={`px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 ${
                            !connected
                                ? "bg-primary text-primary-foreground opacity-60 cursor-not-allowed"
                                : theme === "dark"
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-primary text-primary-foreground hover:bg-primary/80"
                        }`}
                        disabled={!connected}
                        aria-label="Start recording the session"
                        title="Start recording"
                    >
                        Start Recording
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="px-4 py-2 rounded-md font-medium bg-destructive text-white hover:bg-destructive/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-destructive/60"
                        aria-label="Stop recording the session"
                        title="Stop recording"
                    >
                        Stop Recording
                    </button>
                )}
                <button
                    onClick={downloadRecording}
                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-chart-2/60 ${
                        recordedChunks.length === 0
                            ? "bg-chart-2 text-white opacity-60 cursor-not-allowed"
                            : "bg-chart-2 text-white hover:bg-chart-2/90"
                    }`}
                    disabled={recordedChunks.length === 0}
                    aria-label="Download the recording"
                    title="Download recording"
                >
                    Download
                </button>
            </div>
        </div>
    );
};

export default VideoCall;
