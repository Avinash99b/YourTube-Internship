import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Define the shape of location data
interface LocationData {
  state?: string;
  country?: string;
  city?: string;
  loading: boolean;
  error?: string;
}

interface LocationContextType extends LocationData {
  currentState?: string;
  setCurrentState: (state: string) => void;
}

const LocationContext = createContext<LocationContextType>({ loading: true, setCurrentState: () => {} });

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<LocationData>({ loading: true });
  const [currentState, setCurrentState] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Example: Use a public IP geolocation API (replace with your preferred API)
    const fetchLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setLocation({
          state: data.region,
          country: data.country_name,
          city: data.city,
          loading: false,
        });
        setCurrentState(data.region); // Set detected state as default
      } catch (err) {
        setLocation({ loading: false, error: "Failed to fetch location" });
      }
    };
    fetchLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ ...location, currentState, setCurrentState }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
