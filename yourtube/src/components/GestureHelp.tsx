import React from "react";
import { Pause, FastForward, RotateCcw, ArrowRightCircle, ArrowLeftCircle, SkipForward } from "lucide-react";

const gestures = [
	{
		icon: <RotateCcw className="inline w-5 h-5 mr-2" />,
		title: "Double-tap Left",
		desc: "Rewind 10 seconds",
	},
	{
		icon: <Pause className="inline w-5 h-5 mr-2" />,
		title: "Single-tap Center",
		desc: "Pause/Play video",
	},
	{
		icon: <FastForward className="inline w-5 h-5 mr-2" />,
		title: "Double-tap Right",
		desc: "Forward 10 seconds",
	},
	{
		icon: <ArrowLeftCircle className="inline w-5 h-5 mr-2" />,
		title: "Triple-tap Left",
		desc: "Show comments section",
	},
	{
		icon: <ArrowRightCircle className="inline w-5 h-5 mr-2" />,
		title: "Triple-tap Right",
		desc: "Close website",
	},
	{
		icon: <SkipForward className="inline w-5 h-5 mr-2" />,
		title: "Triple-tap Center",
		desc: "Next video",
	},
];

const GestureHelp = ({ onShowWalkthrough }: { onShowWalkthrough?: () => void }) => (
	<div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-lg shadow p-4 mb-4 transition-colors duration-300">
		<div className="flex items-center justify-between mb-2">
			<h3 className="text-lg font-semibold">Gesture Controls</h3>
			{onShowWalkthrough && (
				<button
					className="text-xs underline text-primary hover:text-primary-foreground"
					onClick={onShowWalkthrough}
				>
					Show Walkthrough
				</button>
			)}
		</div>
		<ul className="space-y-2">
			{gestures.map((g, i) => (
				<li key={i} className="flex items-center">
					{g.icon}
					<span className="font-medium mr-2">{g.title}:</span>
					<span className="text-sm text-[var(--muted-foreground)]">{g.desc}</span>
				</li>
			))}
		</ul>
	</div>
);

export default GestureHelp;
