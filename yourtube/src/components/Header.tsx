import { Bell, Menu, User, VideoIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "@/lib/AuthContext";
import { Dialog, DialogContent } from "./ui/dialog";
import LoginWithOtp from "./LoginWithOtp";
import { useTheme } from "@/lib/ThemeContext";

const Header = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user, logout } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <header className={`w-full border-b transition-colors duration-300 ${theme === "light" ? "bg-white border-gray-200" : "bg-zinc-900 border-zinc-800"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 px-2 py-2 sm:px-4 sm:py-2">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick} aria-label="Open sidebar">
            <Menu className={`w-6 h-6 ${theme === "light" ? "text-gray-900" : "text-gray-100"}`} />
          </Button>
          <Link href="/" className="flex items-center gap-1 min-w-0">
            <div className="bg-red-600 p-1 rounded">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <span className={`text-base sm:text-lg md:text-xl font-medium truncate ${theme === "light" ? "text-gray-900" : "text-gray-100"}`}>YourTube</span>
            <span className="text-xs text-gray-400 ml-1 hidden sm:inline">IN</span>
          </Link>
        </div>
        {/* Center: Responsive search input only, no button */}
        <div className="flex-1 flex items-center min-w-0 order-3 md:order-none w-full md:w-auto justify-center">
          <Input
            type="search"
            placeholder={
              typeof window !== 'undefined' && window.innerWidth < 400 ? '' : 'Search (coming soon)'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`rounded-full focus-visible:ring-0 w-full min-w-0 text-sm sm:text-base md:text-lg max-w-[120px] xs:max-w-[180px] sm:max-w-md md:max-w-lg transition-all duration-200 ${theme === "light" ? "bg-gray-50 text-gray-900" : "bg-zinc-800 text-gray-100"}`}
            disabled
            style={{ minWidth: 0 }}
          />
        </div>
        {/* Right: User actions, stack on mobile */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <VideoIcon className={`w-6 h-6 ${theme === "light" ? "text-gray-900" : "text-gray-100"}`} />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <Bell className={`w-6 h-6 ${theme === "light" ? "text-gray-900" : "text-gray-100"}`} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className={theme === "light" ? "bg-gray-200 text-gray-900" : "bg-zinc-700 text-gray-100"}>{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="inline-flex"
                onClick={() => setLoginDialogOpen(true)}
              >
                <User className="w-4 h-4 mr-1" /> Sign in
              </Button>
              <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
                <DialogContent className="max-w-xs w-full">
                  <LoginWithOtp />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
