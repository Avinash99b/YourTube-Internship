import SearchResult from "@/components/SearchResult";
import { useRouter } from "next/router";
import React, { Suspense } from "react";
import { useTheme } from "@/lib/ThemeContext";

const index = () => {
  const router = useRouter();
  const { q } = router.query;
  const { theme } = useTheme();
  return (
    <div className={`flex-1 p-4 min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-[var(--card)] text-[var(--card-foreground)]" : "bg-white text-black"}`}>
      <div className="max-w-6xl">
        {q && (
          <div className="mb-6">
            <h1 className="text-xl font-medium mb-4">
              Search results for "{q}"
            </h1>
          </div>
        )}
        <Suspense fallback={<div>Loading search results...</div>}>
          <SearchResult query={q || ""} />
        </Suspense>
      </div>
    </div>
  );
};

export default index;
