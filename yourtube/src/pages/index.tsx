import CategoryTabs from "@/components/category-tabs";
import Videogrid from "@/components/Videogrid";
import { Suspense } from "react";
import { useTheme } from "@/lib/ThemeContext";

export default function Home() {
  const { theme } = useTheme();
  return (
    <main className={`flex-1 p-4 min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-[var(--card)] text-[var(--card-foreground)]" : "bg-white text-black"}`}>
      <CategoryTabs />
      <Suspense fallback={<div>Loading videos...</div>}>
        <Videogrid />
      </Suspense>
    </main>
  );
}
