import { onAuthStateChanged, signOut } from "firebase/auth";
import { useState, useEffect, useContext, createContext } from "react";
import { auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check localStorage for user and token
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Firebase auth state listener (optional, for Google sign-in)
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  //     if (firebaseUser) {
  //       // Optionally, fetch user data from backend if needed
  //       setUser((prev) => prev || {
  //         email: firebaseUser.email,
  //         name: firebaseUser.displayName,
  //         image: firebaseUser.photoURL || "https://github.com/shadcn.png",
  //       });
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []);

  // Login: set user and store in localStorage (and token)
  const login = (userdata, token) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
    if (token) localStorage.setItem("token", token);
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
      }
    } catch (err) {
      // ignore
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: login, login, logout, refreshUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
