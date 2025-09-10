import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {Toaster} from "@/components/ui/sonner";
import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {UserProvider} from "@/lib/AuthContext";
import {ThemeProvider} from "@/lib/ThemeContext";
import {LocationProvider} from "@/lib/LocationContext";
import {useEffect, useState} from "react";
import {useUser} from "@/lib/AuthContext";
import {toast} from "sonner";
import {useRouter} from "next/router";

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
    // Sidebar open state for mobile
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    // Close sidebar on route change (mobile)
    useEffect(() => {
        const handleRouteChange = () => setSidebarOpen(false);
        router.events.on("routeChangeStart", handleRouteChange);
        return () => {
            router.events.off("routeChangeStart", handleRouteChange);
        };
    }, [router]);
    return (
        <UserProvider>
            <LocationProvider>
                <ThemeProvider>
                    <div className="min-h-screen flex flex-col">
                        <title>Your-Tube Clone</title>
                        <Header onMenuClick={() => setSidebarOpen(true)} />
                        <Toaster/>
                        <PersistentWatchLimitToast/>
                        <div className="flex-1 flex flex-col md:flex-row">
                            <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
                            <main className="flex-1 p-2 md:p-4 w-full">
                                <Component {...pageProps} />
                            </main>
                        </div>
                    </div>
                </ThemeProvider>
            </LocationProvider>
        </UserProvider>
    );
}
