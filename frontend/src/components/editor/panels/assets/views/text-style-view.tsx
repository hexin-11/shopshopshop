"use client";

import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { useEditor } from "@/editor/use-editor";
import { DEFAULTS } from "@/timeline/defaults";
import { buildTextElement } from "@/timeline/element-utils";
import type { MediaTime } from "@/wasm";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";

interface TextStylePreset {
	id: string;
	name: string;
	content: string;
	color: string;
	fontSize: number;
	fontWeight: "normal" | "bold";
	fontStyle: "normal" | "italic";
	backgroundEnabled: boolean;
	backgroundColor: string;
	backgroundCornerRadius: number;
	backgroundPaddingX: number;
	backgroundPaddingY: number;
}

const PRESETS: TextStylePreset[] = [
	{
		id: "classic-subtitle",
		name: "经典字幕",
		content: "经典字幕样式",
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "normal",
		fontStyle: "normal",
		backgroundEnabled: false,
		backgroundColor: "#000000",
		backgroundCornerRadius: 0,
		backgroundPaddingX: 12,
		backgroundPaddingY: 6,
	},
	{
		id: "minimal-subtitle",
		name: "极简字幕",
		content: "极简字幕样式",
		color: "#e2e8f0",
		fontSize: 15,
		fontWeight: "normal",
		fontStyle: "italic",
		backgroundEnabled: false,
		backgroundColor: "#000000",
		backgroundCornerRadius: 0,
		backgroundPaddingX: 12,
		backgroundPaddingY: 6,
	},
	{
		id: "bold-caption",
		name: "粗体字幕",
		content: "粗体字幕样式",
		color: "#fcd34d",
		fontSize: 18,
		fontWeight: "bold",
		fontStyle: "normal",
		backgroundEnabled: false,
		backgroundColor: "#000000",
		backgroundCornerRadius: 0,
		backgroundPaddingX: 12,
		backgroundPaddingY: 6,
	},
	{
		id: "bar-caption",
		name: "条状背景字幕",
		content: "条状背景字幕样式",
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "bold",
		fontStyle: "normal",
		backgroundEnabled: true,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		backgroundCornerRadius: 4,
		backgroundPaddingX: 16,
		backgroundPaddingY: 8,
	},
	{
		id: "big-title",
		name: "巨大标题",
		content: "巨大标题",
		color: "#ffffff",
		fontSize: 32,
		fontWeight: "bold",
		fontStyle: "normal",
		backgroundEnabled: false,
		backgroundColor: "#000000",
		backgroundCornerRadius: 0,
		backgroundPaddingX: 12,
		backgroundPaddingY: 6,
	},
	{
		id: "minimal-title",
		name: "极简标题",
		content: "极简标题",
		color: "#cbd5e1",
		fontSize: 28,
		fontWeight: "normal",
		fontStyle: "normal",
		backgroundEnabled: false,
		backgroundColor: "#000000",
		backgroundCornerRadius: 0,
		backgroundPaddingX: 12,
		backgroundPaddingY: 6,
	},
	{
		id: "highlight-title",
		name: "高亮背景标题",
		content: "高亮背景标题",
		color: "#ffffff",
		fontSize: 24,
		fontWeight: "bold",
		fontStyle: "normal",
		backgroundEnabled: true,
		backgroundColor: "#3b82f6",
		backgroundCornerRadius: 4,
		backgroundPaddingX: 20,
		backgroundPaddingY: 10,
	},
	{
		id: "outline-title",
		name: "描边效果标题",
		content: "描边效果标题",
		color: "#facc15",
		fontSize: 24,
		fontWeight: "bold",
		fontStyle: "normal",
		backgroundEnabled: true,
		backgroundColor: "#1e293b",
		backgroundCornerRadius: 6,
		backgroundPaddingX: 16,
		backgroundPaddingY: 8,
	},
	{
		id: "handle-chip",
		name: "用户卡片",
		content: "@username",
		color: "#ffffff",
		fontSize: 14,
		fontWeight: "bold",
		fontStyle: "normal",
		backgroundEnabled: true,
		backgroundColor: "#0f172a",
		backgroundCornerRadius: 999,
		backgroundPaddingX: 14,
		backgroundPaddingY: 6,
	},
	{
		id: "cta-pill",
		name: "行动召唤胶囊",
		content: "立即购买",
		color: "#000000",
		fontSize: 15,
		fontWeight: "bold",
		fontStyle: "normal",
		backgroundEnabled: true,
		backgroundColor: "#22c55e",
		backgroundCornerRadius: 999,
		backgroundPaddingX: 18,
		backgroundPaddingY: 8,
	},
];

export function TextStyleView() {
	const editor = useEditor();

	const handleAddToTimeline = (preset: TextStylePreset, currentTime: MediaTime) => {
		const activeScene = editor.scenes.getActiveScene();
		if (!activeScene) return;

		const element = buildTextElement({
			raw: {
				name: preset.name,
				params: {
					...DEFAULTS.text.element.params,
					content: preset.content,
					fontSize: preset.fontSize,
					color: preset.color,
					fontWeight: preset.fontWeight,
					fontStyle: preset.fontStyle,
					"background.enabled": preset.backgroundEnabled,
					"background.color": preset.backgroundColor,
					"background.cornerRadius": preset.backgroundCornerRadius,
					"background.paddingX": preset.backgroundPaddingX,
					"background.paddingY": preset.backgroundPaddingY,
				},
			},
			startTime: currentTime,
		});

		editor.timeline.insertElement({
			element,
			placement: { mode: "auto" },
		});
	};

	return (
		<PanelView title="文字样式">
			<div className="grid grid-cols-2 gap-3 p-1">
				{PRESETS.map((preset) => (
					<DraggableItem
						key={preset.id}
						name={preset.name}
						preview={
							<div className="bg-accent/40 flex size-full flex-col items-center justify-center rounded border p-2 overflow-hidden select-none">
								<span
									className="text-center truncate max-w-full"
									style={{
										color: preset.color,
										fontSize: preset.id === "big-title" || preset.id === "minimal-title" ? "14px" : "12px",
										fontWeight: preset.fontWeight,
										fontStyle: preset.fontStyle,
										backgroundColor: preset.backgroundEnabled ? preset.backgroundColor : "transparent",
										borderRadius: preset.backgroundEnabled ? `${preset.backgroundCornerRadius / 3}px` : "0px",
										padding: preset.backgroundEnabled ? `${preset.backgroundPaddingY / 3}px ${preset.backgroundPaddingX / 3}px` : "0px",
									}}
								>
									{preset.content}
								</span>
							</div>
						}
						dragData={{
							id: `text-style-${preset.id}`,
							type: "text",
							name: preset.name,
							content: preset.content,
							params: {
								content: preset.content,
								fontSize: preset.fontSize,
								color: preset.color,
								fontWeight: preset.fontWeight,
								fontStyle: preset.fontStyle,
								"background.enabled": preset.backgroundEnabled,
								"background.color": preset.backgroundColor,
								"background.cornerRadius": preset.backgroundCornerRadius,
								"background.paddingX": preset.backgroundPaddingX,
								"background.paddingY": preset.backgroundPaddingY,
							}
						} as any}
						aspectRatio={1}
						onAddToTimeline={({ currentTime }) => handleAddToTimeline(preset, currentTime)}
						shouldShowLabel={true}
					/>
				))}
			</div>
		</PanelView>
	);
}
