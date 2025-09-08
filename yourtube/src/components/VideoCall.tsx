import React, { useRef, useState, useEffect } from "react";
import Peer from "peerjs";

const TURN_CONFIG = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "turn:your.turn.server:3478", username: "user", credential: "pass" },
    ],
};

const VideoCall: React.FC = () => {
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

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Detect mobile
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Initialize Peer
    useEffect(() => {
        const p = new Peer({ config: TURN_CONFIG });
        setPeer(p);

        p.on("open", (id) => setMyPeerId(id));

        p.on("call", async (call) => {
            try {
                const userStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                    audio: true
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

        // Mobile browsers may not support getDisplayMedia
        if (!navigator.mediaDevices.getDisplayMedia) {
            alert("Screen sharing is not supported on this device/browser.");
            return;
        }

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const videoTrack = screenStream.getVideoTracks()[0];
            const sender = callObj.peerConnection.getSenders().find((s: any) => s.track?.kind === "video");
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

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-center">PeerJS Video Call</h1>

            <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
                <div className="flex-1 flex flex-col items-center bg-gray-800 p-2 rounded-lg">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-60 md:h-72 bg-black rounded-lg"
                    />
                    <span className="mt-2 text-gray-300">You</span>
                </div>

                <div className="flex-1 flex flex-col items-center bg-gray-800 p-2 rounded-lg">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-60 md:h-72 bg-black rounded-lg"
                    />
                    <span className="mt-2 text-gray-300">Friend</span>
                </div>
            </div>

            {/* Peer IDs */}
            <div className="flex flex-col md:flex-row items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <span>Your ID:</span>
                    <input
                        type="text"
                        value={myPeerId}
                        readOnly
                        className="p-2 rounded text-black w-56"
                    />
                    <button
                        className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700"
                        onClick={() => navigator.clipboard.writeText(myPeerId)}
                    >
                        Copy
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Enter Friend ID"
                        value={friendPeerId}
                        onChange={(e) => setFriendPeerId(e.target.value)}
                        className="p-2 rounded text-black w-56"
                    />
                    <button
                        className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                        onClick={connectCall}
                        disabled={connected || !friendPeerId}
                    >
                        Connect
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2 justify-center">
                <button
                    onClick={shareScreen}
                    className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
                    disabled={!connected}
                >
                    Share Screen
                </button>
                {!recording ? (
                    <button
                        onClick={startRecording}
                        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                        disabled={!connected}
                    >
                        Start Recording
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                    >
                        Stop Recording
                    </button>
                )}
                <button
                    onClick={downloadRecording}
                    className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
                    disabled={recordedChunks.length === 0}
                >
                    Download
                </button>
            </div>
        </div>
    );
};

export default VideoCall;
