import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {Toaster} from "@/components/ui/sonner";
import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {UserProvider} from "@/lib/AuthContext";
import {ThemeProvider} from "@/lib/ThemeContext";
import {LocationProvider} from "@/lib/LocationContext";

export default function App({Component, pageProps}: AppProps) {
    return (
        <UserProvider>
            <LocationProvider>
                <ThemeProvider>
                    <div className="min-h-screen">
                        <title>Your-Tube Clone</title>
                        <Header/>
                        <Toaster/>
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
