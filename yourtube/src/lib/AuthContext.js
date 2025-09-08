import { onAuthStateChanged, signOut } from "firebase/auth";
import { useState, useEffect, useContext, createContext } from "react";
import { auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

const PLAN_LIMITS = {
  free: { downloads: 1, watch: 300 },
  bronze: { downloads: Infinity, watch: 420 },
  silver: { downloads: Infinity, watch: 600 },
  gold: { downloads: Infinity, watch: null },
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadsToday, setDownloadsToday] = useState(0);
  const [watchTimeToday, setWatchTimeToday] = useState(0);
  const [isWatchTimeExceeded, setIsWatchTimeExceeded] = useState(false);

  // On mount, check localStorage for user and token
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Fetch usage and check if watch time exceeded
  const refreshUsage = async (u = user) => {
    if (!u?._id) return;
    try {
      const res = await axiosInstance.get(`/auth/usage?userId=${u._id}`);
      const downloads = res.data.downloadsToday || 0;
      const watch = res.data.watchTimeToday || 0;
      setDownloadsToday(downloads);
      setWatchTimeToday(watch);
      const plan = u.plan || "free";
      const planLimit = PLAN_LIMITS[plan];
      const overLimit = planLimit.watch !== null && watch >= planLimit.watch;
      setIsWatchTimeExceeded(overLimit);
    } catch {
      setDownloadsToday(0);
      setWatchTimeToday(0);
      setIsWatchTimeExceeded(false);
    }
  };

  // Refresh usage when user changes
  useEffect(() => {
    if (user?._id) {
      refreshUsage(user);
    } else {
      setDownloadsToday(0);
      setWatchTimeToday(0);
      setIsWatchTimeExceeded(false);
    }
  }, [user]);

  // Login: set user and store in localStorage (and token)
  const login = (userdata, token) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
    if (token) localStorage.setItem("token", token);
    // Refresh usage on login
    setTimeout(() => refreshUsage(userdata), 0);
  };

  // Logout: clear user and localStorage, sign out from Firebase
  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  // Optionally, refresh user from backend
  const refreshUser = async () => {
    if (!user?.email) return;
    try {
      const res = await axiosInstance.get(`/auth/user?email=${user.email}`);
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        // Refresh usage after user refresh
        refreshUsage(res.data.user);
      }
    } catch (err) {
      // ignore
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser: login,
      login,
      logout,
      refreshUser,
      loading,
      downloadsToday,
      watchTimeToday,
      isWatchTimeExceeded,
      refreshUsage,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
