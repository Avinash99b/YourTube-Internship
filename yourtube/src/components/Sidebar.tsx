import {
    Home,
    Compass,
    PlaySquare,
    Clock,
    ThumbsUp,
    History,
    User, LucidePhoneCall,
} from "lucide-react";
import Link from "next/link";
import React, {useState} from "react";
import {Button} from "./ui/button";
import Channeldialogue from "./channeldialogue";
import {useUser} from "@/lib/AuthContext";

const Sidebar = () => {
    const {user} = useUser();

    const [isdialogeopen, setisdialogeopen] = useState(false);
    return (
        <aside
            className="w-64 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] min-h-screen p-2 transition-colors duration-300">
            <nav className="space-y-1">
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
                                        className="w-full justify-start text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition-colors">
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
                                <Link href={`/channel/${user.id}`}>
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
                                </div>
                            )}
                        </div>
                    </>
                )}
            </nav>
            <Channeldialogue
                isopen={isdialogeopen}
                onclose={() => setisdialogeopen(false)}
                mode="create"
            />
        </aside>
    );
};

export default Sidebar;
