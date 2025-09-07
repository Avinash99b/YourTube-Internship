import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Define the shape of location data
interface LocationData {
  state?: string;
  country?: string;
  city?: string;
  loading: boolean;
  error?: string;
}

const LocationContext = createContext<LocationData>({ loading: true });

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<LocationData>({ loading: true });

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
      } catch (err) {
        setLocation({ loading: false, error: "Failed to fetch location" });
      }
    };
    fetchLocation();
  }, []);

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

