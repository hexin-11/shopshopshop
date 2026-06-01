import type { ElementType } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
	ArrowRightDoubleIcon,
	ClosedCaptionIcon,
	Happy01Icon,
	HeadphonesIcon,
	MagicWand05Icon,
	TextIcon,
	Settings01Icon,
	SlidersHorizontalIcon,
	ColorsIcon,
	Video01Icon,
	Image02Icon,
	MusicNote03Icon,
	TextFontIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

export const TAB_KEYS = [
	"video",
	"image",
	"audio",
	"text",
	"text-style",
	"emoji",
	"shape",
	"effects",
	"transitions",
	"captions",
	"generate-media",
	"sounds",
	"adjustment",
	"settings",
] as const;

export type Tab = (typeof TAB_KEYS)[number];

const createHugeiconsIcon =
	({ icon }: { icon: IconSvgElement }) =>
	({ className }: { className?: string }) => (
		<HugeiconsIcon icon={icon} className={className} />
	);

export const tabs = {
	video: {
		icon: createHugeiconsIcon({ icon: Video01Icon }),
		label: "视频",
	},
	image: {
		icon: createHugeiconsIcon({ icon: Image02Icon }),
		label: "图片",
	},
	audio: {
		icon: createHugeiconsIcon({ icon: MusicNote03Icon }),
		label: "音频",
	},
	text: {
		icon: createHugeiconsIcon({ icon: TextIcon }),
		label: "文本",
	},
	"text-style": {
		icon: createHugeiconsIcon({ icon: TextFontIcon }),
		label: "样式",
	},
	emoji: {
		icon: createHugeiconsIcon({ icon: Happy01Icon }),
		label: "表情",
	},
	shape: {
		icon: createHugeiconsIcon({ icon: ColorsIcon }),
		label: "形状",
	},
	effects: {
		icon: createHugeiconsIcon({ icon: MagicWand05Icon }),
		label: "特效",
	},
	transitions: {
		icon: createHugeiconsIcon({ icon: ArrowRightDoubleIcon }),
		label: "转场",
	},
	captions: {
		icon: createHugeiconsIcon({ icon: ClosedCaptionIcon }),
		label: "字幕",
	},
	"generate-media": {
		icon: createHugeiconsIcon({ icon: MagicWand05Icon }),
		label: "AI 生成",
	},
	sounds: {
		icon: createHugeiconsIcon({ icon: HeadphonesIcon }),
		label: "音效",
	},
	adjustment: {
		icon: createHugeiconsIcon({ icon: SlidersHorizontalIcon }),
		label: "调整",
	},
	settings: {
		icon: createHugeiconsIcon({ icon: Settings01Icon }),
		label: "设置",
	},
} satisfies Record<
	Tab,
	{ icon: ElementType<{ className?: string }>; label: string }
>;

export type MediaViewMode = "grid" | "list";
export type MediaSortKey = "name" | "type" | "duration" | "size";
export type MediaSortOrder = "asc" | "desc";

interface AssetsPanelStore {
	activeTab: Tab;
	setActiveTab: (tab: Tab) => void;
	highlightMediaId: string | null;
	requestRevealMedia: (mediaId: string, type?: "video" | "image" | "audio") => void;
	clearHighlight: () => void;

	/* Media */
	mediaViewMode: MediaViewMode;
	setMediaViewMode: (mode: MediaViewMode) => void;
	mediaSortBy: MediaSortKey;
	mediaSortOrder: MediaSortOrder;
	setMediaSort: (args: { key: MediaSortKey; order: MediaSortOrder }) => void;
}

export const useAssetsPanelStore = create<AssetsPanelStore>()(
	persist(
		(set) => ({
			activeTab: "video",
			setActiveTab: (tab) => set({ activeTab: tab }),
			highlightMediaId: null,
			requestRevealMedia: (mediaId, type) =>
				set({ activeTab: type || "video", highlightMediaId: mediaId }),
			clearHighlight: () => set({ highlightMediaId: null }),
			mediaViewMode: "grid",
			setMediaViewMode: (mode) => set({ mediaViewMode: mode }),
			mediaSortBy: "name",
			mediaSortOrder: "asc",
			setMediaSort: ({ key, order }) =>
				set({ mediaSortBy: key, mediaSortOrder: order }),
		}),
		{
			name: "assets-panel",
			partialize: (state) => ({
				mediaViewMode: state.mediaViewMode,
				mediaSortBy: state.mediaSortBy,
				mediaSortOrder: state.mediaSortOrder,
			}),
		},
	),
);
