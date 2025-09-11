import CategoryTabs from "@/components/category-tabs";
import Videogrid from "@/components/Videogrid";
import { Suspense } from "react";
import { useTheme } from "@/lib/ThemeContext";

export default function Home() {
  const { theme } = useTheme();
  return (
    <main className={`flex-1 min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-[var(--card)] text-[var(--card-foreground)]" : "bg-white text-black"}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 w-full">
        <CategoryTabs />
        <Suspense fallback={<div>Loading videos...</div>}>
          <Videogrid />
        </Suspense>
      </div>
    </main>
  );
}
