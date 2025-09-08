import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {Toaster} from "@/components/ui/sonner";
import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {UserProvider} from "@/lib/AuthContext";
import {ThemeProvider} from "@/lib/ThemeContext";
import {LocationProvider} from "@/lib/LocationContext";
import {useEffect} from "react";
import {useUser} from "@/lib/AuthContext";
import {toast} from "sonner";

function PersistentWatchLimitToast() {
    const {isWatchTimeExceeded} = useUser();
    useEffect(() => {
        if (isWatchTimeExceeded) {
            toast.error("Upgrade plan for continued playback", {
                id: "watch-limit-toast",
                duration: Infinity,
                style: {background: '#fee2e2', color: '#b91c1c', border: '1px solid #b91c1c'},
                className: "font-semibold text-center",
                dismissible: false,
            });
        } else {
            toast.dismiss("watch-limit-toast");
        }
    }, [isWatchTimeExceeded]);
    return null;
}

export default function App({Component, pageProps}: AppProps) {
    return (
        <UserProvider>
            <LocationProvider>
                <ThemeProvider>
                    <div className="min-h-screen">
                        <title>Your-Tube Clone</title>
                        <Header/>
                        <Toaster/>
                        <PersistentWatchLimitToast/>
                        <div className="flex">
                            <Sidebar/>
                            <Component {...pageProps} />
                        </div>
                    </div>
                </ThemeProvider>
            </LocationProvider>
        </UserProvider>
    );
}
