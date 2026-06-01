"use client";

import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { useEditor } from "@/editor/use-editor";
import { buildGraphicElement } from "@/timeline/element-utils";
import type { MediaTime } from "@/wasm";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";

interface ShapePreset {
	id: string;
	name: string;
	definitionId: string;
	params?: Record<string, any>;
	svgIcon: React.ReactNode;
}

const PRESETS: ShapePreset[] = [
	{
		id: "rectangle",
		name: "矩形",
		definitionId: "rectangle",
		params: { fill: "#3b82f6" },
		svgIcon: (
			<svg className="size-12" viewBox="0 0 100 100" fill="currentColor">
				<rect x="15" y="25" width="70" height="50" rx="4" />
			</svg>
		)
	},
	{
		id: "circle",
		name: "圆形",
		definitionId: "ellipse",
		params: { fill: "#10b981" },
		svgIcon: (
			<svg className="size-12" viewBox="0 0 100 100" fill="currentColor">
				<circle cx="50" cy="50" r="30" />
			</svg>
		)
	},
	{
		id: "triangle",
		name: "三角形",
		definitionId: "polygon",
		params: { sides: 3, fill: "#f59e0b" },
		svgIcon: (
			<svg className="size-12" viewBox="0 0 100 100" fill="currentColor">
				<polygon points="50,20 80,75 20,75" />
			</svg>
		)
	},
	{
		id: "hexagon",
		name: "六边形",
		definitionId: "polygon",
		params: { sides: 6, fill: "#8b5cf6" },
		svgIcon: (
			<svg className="size-12" viewBox="0 0 100 100" fill="currentColor">
				<polygon points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5" />
			</svg>
		)
	},
	{
		id: "star",
		name: "五角星",
		definitionId: "star",
		params: { fill: "#ec4899" },
		svgIcon: (
			<svg className="size-12" viewBox="0 0 100 100" fill="currentColor">
				<polygon points="50,15 63,38 89,40 69,57 75,83 50,69 25,83 31,57 11,40 37,38" />
			</svg>
		)
	}
];

export function ShapeView() {
	const editor = useEditor();

	const handleAddToTimeline = (preset: ShapePreset, currentTime: MediaTime) => {
		const activeScene = editor.scenes.getActiveScene();
		if (!activeScene) return;

		const element = buildGraphicElement({
			definitionId: preset.definitionId,
			name: preset.name,
			startTime: currentTime,
			params: preset.params,
		});

		editor.timeline.insertElement({
			element,
			placement: { mode: "auto" },
		});
	};

	return (
		<PanelView title="形状库">
			<div className="grid grid-cols-2 gap-3 p-1">
				{PRESETS.map((preset) => (
					<DraggableItem
						key={preset.id}
						name={preset.name}
						preview={
							<div
								className="bg-accent/40 hover:bg-accent/60 flex size-full items-center justify-center rounded border p-4 select-none transition"
								style={{ color: preset.params?.fill || "#3b82f6" }}
							>
								{preset.svgIcon}
							</div>
						}
						dragData={{
							id: `shape-${preset.id}`,
							type: "graphic",
							name: preset.name,
							definitionId: preset.definitionId,
							params: preset.params
						}}
						aspectRatio={1}
						onAddToTimeline={({ currentTime }) => handleAddToTimeline(preset, currentTime)}
						shouldShowLabel={true}
					/>
				))}
			</div>
		</PanelView>
	);
}
