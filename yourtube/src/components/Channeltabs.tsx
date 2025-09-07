import React from "react";
import { Button } from "./ui/button";
const tabs = [
	{ id: "home", label: "Home" },
	{ id: "videos", label: "Videos" },
	{ id: "downloads", label: "Downloads" },
	{ id: "shorts", label: "Shorts" },
	{ id: "playlists", label: "Playlists" },
	{ id: "community", label: "Community" },
	{ id: "about", label: "About" },
];
const Channeltabs = ({
	activeTab,
	setActiveTab,
}: {
	activeTab: string;
	setActiveTab: (tab: string) => void;
}) => {
	return (
		<div className="border-b border-gray-200 dark:border-zinc-700 px-4 bg-white dark:bg-zinc-900 transition-colors duration-300">
			<div className="flex gap-8 overflow-x-auto">
				{tabs.map((tab) => (
					<Button
						key={tab.id}
						variant="ghost"
						className={`px-0 py-4 border-b-2 rounded-none transition-colors duration-200 ${
							activeTab === tab.id
								? "border-black dark:border-white text-black dark:text-white font-semibold"
								: "border-transparent text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
						}`}
						onClick={() => setActiveTab(tab.id)}
					>
						{tab.label}
					</Button>
				))}
			</div>
		</div>
	);
};

export default Channeltabs;
