"use client";

import { Separator } from "@/components/ui/separator";
import { type Tab, useAssetsPanelStore } from "@/components/editor/panels/assets/assets-panel-store";
import { TabBar } from "./tabbar";
import { Captions } from "@/subtitles/components/assets-view";
import { SettingsView } from "./views/settings";
import { SoundsView } from "@/sounds/components/assets-view";
import { TextView } from "@/text/components/assets-view";
import { EffectsView } from "@/effects/components/assets-view";

import { VideoView } from "./views/video-view";
import { ImageView } from "./views/image-view";
import { AudioView } from "./views/audio-view";
import { TextStyleView } from "./views/text-style-view";
import { EmojiView } from "./views/emoji-view";
import { ShapeView } from "./views/shape-view";
import { GenerateMediaView } from "./views/generate-media-view";

export function AssetsPanel() {
	const { activeTab } = useAssetsPanelStore();

	const viewMap: Record<Tab, React.ReactNode> = {
		video: <VideoView />,
		image: <ImageView />,
		audio: <AudioView />,
		text: <TextView />,
		"text-style": <TextStyleView />,
		emoji: <EmojiView />,
		shape: <ShapeView />,
		effects: <EffectsView />,
		transitions: (
			<div className="text-muted-foreground p-4">
				转场功能即将推出...
			</div>
		),
		captions: <Captions />,
		"generate-media": <GenerateMediaView />,
		sounds: <SoundsView />,
		adjustment: (
			<div className="text-muted-foreground p-4">
				调整层功能即将推出...
			</div>
		),
		settings: <SettingsView />,
	};

	return (
		<div className="panel bg-background flex h-full rounded-sm border overflow-hidden">
			<TabBar />
			<Separator orientation="vertical" />
			<div className="flex-1 overflow-hidden">{viewMap[activeTab]}</div>
		</div>
	);
}
