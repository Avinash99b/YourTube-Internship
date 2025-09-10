import React, {useState, useEffect, useRef} from "react";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import axiosInstance from "@/lib/axiosinstance";
import {signInWithPopup} from "firebase/auth";
import {provider, auth} from "@/lib/firebase";
import {useLocation} from "@/lib/LocationContext";
import {useUser} from "@/lib/AuthContext";
import {useRouter} from "next/router";
import {User} from "@firebase/auth";
import { useTheme } from "@/lib/ThemeContext";

const southernStates = [
    "Tamil nadu",
    "Kerala",
    "Karnataka",
    "Andhra Pradesh",
    "Telangana",
];

// List of all Indian states and union territories
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const LoginWithOtp: React.FC = () => {
    const {setUser} = useUser();
    const router = useRouter();
    const location = useLocation();
    const { setCurrentState } = location;
    const { theme } = useTheme();
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [manualState, setManualState] = useState("");
    const [otp, setOtp] = useState("");
    const [verificationId, setVerificationId] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpChannel, setOtpChannel] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [firebaseUser, setFirebaseUser] = useState<User>()
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Prefer context state, fallback to manual
    const state = manualState || location.state || "";
    const isSouthern = southernStates.map(s => s.toLowerCase()).includes((state || "").toLowerCase());

    // Google sign-in
    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const googleUser = result.user;
            setFirebaseUser(googleUser)
            setEmail(googleUser.email as string)
            setName(googleUser.displayName as string)
        } catch (err: any) {
            setError(err?.response?.data?.message || "Google sign-in failed");
        } finally {
            setLoading(false);
        }
    };

    // Normal login (email/mobile)
    const handleSendOtp = async () => {
        setError("");
        setLoading(true);
        try {
            const res = await axiosInstance.post("/auth/login", {
                email,
                name,
                state,
                mobile: isSouthern ? undefined : mobile,
            });
            setVerificationId(res.data.verificationId);
            setOtpChannel(res.data.channel);
            setOtpSent(true);
            startResendTimer();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError("");
        setLoading(true);
        try {
            const res = await axiosInstance.post("/auth/verifyOtp", {
                email,
                verificationId,
                otp,
            });
            if (res.data.user && res.data.token) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userState", state); // Save user state on login
                setUser(res.data.user);
                router.push("/");
                window.location.reload()
            } else {
                setError("Invalid OTP");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResendMessage("");
        setResendLoading(true);
        try {
            const res = await axiosInstance.post("/auth/resend-otp", {
                email,
                state,
                mobile: isSouthern ? undefined : mobile,
            });
            setVerificationId(res.data.verificationId);
            setOtpChannel(res.data.channel);
            setResendMessage(res.data.message || "OTP resent");
            startResendTimer();
        } catch (err: any) {
            setResendMessage(err?.response?.data?.message || "Failed to resend OTP");
        } finally {
            setResendLoading(false);
        }
    };

    // Start or reset the resend timer
    const startResendTimer = () => {
        setResendTimer(60);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // When OTP is sent or resent, start the timer
    useEffect(() => {
        if (otpSent) startResendTimer();
        // eslint-disable-next-line
    }, [otpSent, verificationId]);

    return (
        <div style={{maxWidth: 400, margin: "0 auto", padding: 24}}>
            <h2>Login</h2>
            {location.loading && <div>Detecting your location...</div>}
            {!otpSent && !location.loading && (
                <>
                    <Input
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        type="email"
                        style={{marginBottom: 12}}
                    />
                    <Input
                        placeholder="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        type="text"
                        style={{marginBottom: 12}}
                    />
                    {/* State selection: dropdown for India, text input otherwise */}
                    {location.country === "India" ? (
                      <select
                        value={state}
                        onChange={e => {
                          setManualState(e.target.value);
                          setCurrentState(e.target.value);
                        }}
                        className={`w-full rounded-md border px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${theme === "light" ? "bg-gray-50 text-gray-900 border-gray-200" : "bg-zinc-800 text-gray-100 border-zinc-700"}`}
                        style={{marginBottom: 12}}
                      >
                        <option value="">Select State</option>
                        {indianStates.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        placeholder="State"
                        value={state}
                        onChange={e => {
                          setManualState(e.target.value);
                          setCurrentState(e.target.value);
                        }}
                        type="text"
                        style={{marginBottom: 12}}
                      />
                    )}
                    {!isSouthern && (
                        <Input
                            placeholder="Mobile number (required for non-southern states)"
                            value={mobile}
                            onChange={e => setMobile(e.target.value)}
                            type="tel"
                            style={{marginBottom: 12}}
                        />
                    )}
                    <Button
                        onClick={handleSendOtp}
                        disabled={loading || !email || !state || (!isSouthern && !mobile)}
                        style={{marginRight: 8}}
                    >
                        Send OTP
                    </Button>
                    {!firebaseUser && (<Button
                        onClick={handleGoogleSignIn}
                    >
                        Sign in with Google
                    </Button>)}
                </>
            )}
            {otpSent && (
                <div style={{marginTop: 24}}>
                    <div style={{marginBottom: 8}}>
                        {otpChannel === "email"
                            ? `OTP sent to email: ${email}`
                            : `OTP sent to mobile: ${mobile}`}
                    </div>
                    <Input
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        style={{marginBottom: 12}}
                    />
                    <Button onClick={handleVerifyOtp} disabled={loading || !otp}>
                        Verify OTP
                    </Button>
                    <Button
                        onClick={handleResendOtp}
                        disabled={resendLoading || loading || resendTimer > 0}
                        style={{marginLeft: 8}}
                        variant="outline"
                    >
                        {resendLoading
                            ? "Resending..."
                            : resendTimer > 0
                                ? `Resend OTP (${resendTimer}s)`
                                : "Resend OTP"}
                    </Button>
                    {resendMessage && <div style={{
                        color: resendMessage.includes('resent') ? 'green' : 'red',
                        marginTop: 8
                    }}>{resendMessage}</div>}
                </div>
            )}
            {error && <div style={{color: "red", marginTop: 12}}>{error}</div>}
        </div>
    );
};

export default LoginWithOtp;
