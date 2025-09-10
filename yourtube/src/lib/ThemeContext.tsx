import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // South Indian states
    const southStates = [
      "Tamil nadu", "Tamil Nadu", "Kerala", "Karnataka", "Andhra", "Andhra Pradesh", "Telangana"
    ];
    // Get current hour (0-23)
    const now = new Date();
    const hour = now.getHours();
    // Check if time is between 10 AM and 12 PM
    const isMorning = hour >= 10 && hour < 12;
    // Get saved state from localStorage
    const savedState = localStorage.getItem("userState") || "";
    // Check if savedState is south India
    const isSouth = southStates.some(
      s => savedState.toLowerCase().includes(s.toLowerCase())
    );
    if (isMorning || isSouth) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }, []); // Only run on mount

  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export { ThemeContext };
