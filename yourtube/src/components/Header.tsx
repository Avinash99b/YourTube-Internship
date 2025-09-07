import { Bell, Menu, Mic, Search, User, VideoIcon } from "lucide-react";
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
import Channeldialogue from "./channeldialogue";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import { Dialog, DialogContent } from "./ui/dialog";
import LoginWithOtp from "./LoginWithOtp";
import { useTheme } from "@/lib/ThemeContext";

const Header = () => {
  const { user, logout } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };
  return (
    <header className={`flex items-center justify-between px-4 py-2 border-b transition-colors duration-300 ${theme === "light" ? "bg-white border-gray-200" : "bg-zinc-900 border-zinc-800"}`}>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Menu className={`w-6 h-6 ${theme === "light" ? "text-gray-900" : "text-gray-100"}`} />
        </Button>
        <Link href="/" className="flex items-center gap-1">
          <div className="bg-red-600 p-1 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className={`text-xl font-medium ${theme === "light" ? "text-gray-900" : "text-gray-100"}`}>
            YourTube
          </span>
          <span className="text-xs text-gray-400 ml-1">IN</span>
        </Link>
      </div>
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 flex-1 max-w-2xl mx-4"
      >
        <div className="flex flex-1">
          <Input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onKeyDown={handleKeypress}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`rounded-l-full border-r-0 focus-visible:ring-0 ${theme === "light" ? "bg-gray-50 text-gray-900" : "bg-zinc-800 text-gray-100"}`}
          />
          <Button
            type="submit"
            className={`rounded-r-full px-6 border border-l-0 ${theme === "light" ? "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200" : "bg-zinc-800 hover:bg-zinc-700 text-gray-100 border-zinc-700"}`}
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Mic className={`w-5 h-5 ${theme === "light" ? "text-gray-900" : "text-gray-100"}`} />
        </Button>
      </form>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Button variant="ghost" size="icon">
              <VideoIcon className={`w-6 h-6 ${theme === "light" ? "text-gray-900" : "text-gray-100"}`} />
            </Button>
            <Button variant="ghost" size="icon">
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
              <DropdownMenuContent className={`w-56 ${theme === "light" ? "bg-white text-gray-900" : "bg-zinc-900 text-gray-100"}`} align="end" forceMount>
                {user?.channelname ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/channel/${user?._id}`}>Your channel</Link>
                  </DropdownMenuItem>
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
                <DropdownMenuItem asChild>
                  <Link href="/history">History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/liked">Liked videos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/watch-later">Watch later</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button
              className={`flex items-center gap-2 ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-zinc-800 text-gray-100"}`}
              onClick={() => setLoginDialogOpen(true)}
            >
              <User className="w-4 h-4" />
              Sign in
            </Button>
            <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
              <DialogContent showCloseButton>
                <LoginWithOtp />
              </DialogContent>
            </Dialog>
          </>
        )} {" "}
      </div>
      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </header>
  );
};

export default Header;
