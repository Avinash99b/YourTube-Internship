import {
    Home,
    Compass,
    PlaySquare,
    Clock,
    ThumbsUp,
    History,
    User, LucidePhoneCall
} from "lucide-react";
import Link from "next/link";
import React, {useState} from "react";
import {Button} from "./ui/button";
import Channeldialogue from "./channeldialogue";
import {useUser} from "@/lib/AuthContext";

// Accept mobileOpen and setMobileOpen as props
const Sidebar = ({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (open: boolean) => void }) => {
    const {user} = useUser();
    const [isdialogeopen, setisdialogeopen] = useState(false);
    return (
        <>
            {/* Sidebar for all devices, toggled by mobileOpen */}
            <aside
                className={`fixed z-40 top-0 left-0 h-full bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] p-2 transition-transform duration-300 w-56 sm:w-64 md:w-72 overflow-y-auto ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} min-h-screen`}
                style={{ minHeight: '100vh' }}
                aria-label="Sidebar"
            >
                {/* Close button always visible when sidebar is open */}
                <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close sidebar">
                        ✕
                    </Button>
                </div>
                <nav className="space-y-1 sm:space-y-2 md:space-y-3">
                    <Link href="/">
                        <Button variant="ghost"
                                className="w-full justify-start text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-colors">
                            <Home className="w-5 h-5 mr-3"/>
                            Home
                        </Button>
                    </Link>
                    <Link href="/explore">
                        <Button variant="ghost"
                                className="w-full justify-start text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-colors">
                            <Compass className="w-5 h-5 mr-3"/>
                            Explore
                        </Button>
                    </Link>
                    <Link href="/subscriptions">
                        <Button variant="ghost"
                                className="w-full justify-start text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-colors">
                            <PlaySquare className="w-5 h-5 mr-3"/>
                            Subscriptions
                        </Button>
                    </Link>
                    <Link href="/call">
                        <Button variant="ghost"
                                className="w-full justify-start text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-colors">
                            <LucidePhoneCall className="w-5 h-5 mr-3"/>
                            Call Friend
                        </Button>
                    </Link>
                    {user && (
                        <>
                            <div className="border-t border-[var(--sidebar-border)] pt-2 mt-2">
                                <Link href="/history">
                                    <Button variant="ghost"
                                            className="w-full justify-start text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-colors">
                                        <History className="w-5 h-5 mr-3"/>
                                        History
                                    </Button>
                                </Link>
                                <Link href="/liked">
                                    <Button variant="ghost"
                                            className="w-full justify-start text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-colors">
                                        <ThumbsUp className="w-5 h-5 mr-3"/>
                                        Liked videos
                                    </Button>
                                </Link>
                                <Link href="/watch-later">
                                    <Button variant="ghost"
                                            className="w-full justify-start text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground] transition-colors">
                                        <Clock className="w-5 h-5 mr-3"/>
                                        Watch later
                                    </Button>
                                </Link>
                                <Link href="/profile">
                                    <Button variant="ghost"
                                            className="w-full justify-start text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-colors">
                                        <User className="w-5 h-5 mr-3"/>
                                        Profile
                                    </Button>
                                </Link>
                                {user?.channelname ? (
                                    <Link href={`/channel/${user.channelname}`}>
                                        <Button variant="ghost"
                                                className="w-full justify-start text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-colors">
                                            <User className="w-5 h-5 mr-3"/>
                                            Your channel
                                        </Button>
                                    </Link>
                                ) : (
                                    <div className="px-2 py-1.5">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => setisdialogeopen(true)}
                                        >
                                            Create Channel
                                        </Button>
                                        <Channeldialogue isopen={isdialogeopen} onclose={() => setisdialogeopen(false)} />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </nav>
            </aside>
            {/* Overlay for sidebar when open, on all devices */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-30" onClick={() => setMobileOpen(false)}></div>
            )}
        </>
    );
};

export default Sidebar;
