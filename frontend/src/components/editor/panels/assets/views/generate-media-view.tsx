"use client";

import { useState } from "react";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useEditor } from "@/editor/use-editor";
import { mediaTimeFromSeconds } from "@/wasm";
import { DEFAULT_NEW_ELEMENT_DURATION } from "@/timeline/creation";
import { buildElementFromMedia } from "@/timeline/element-utils";
import { cn } from "@/utils/ui";
import { MagicWand05Icon, Video01Icon, Image02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const STYLES = [
	{ id: "realistic", label: "写实风格 (Realistic)" },
	{ id: "3d-render", label: "3D 渲染 (3D Render)" },
	{ id: "anime", label: "动漫风格 (Anime)" },
	{ id: "cinematic", label: "电影质感 (Cinematic)" },
];

const MODELS = [
	{ id: "twick-gen-v2", label: "Twick Generative v2" },
	{ id: "sd-v3", label: "Stable Diffusion v3" },
	{ id: "sora-v1", label: "Sora Video v1" },
];

// Curated high quality mock media assets
const MOCK_ASSETS = {
	image: [
		{
			url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280",
			thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
			name: "AI_Generated_Abstract_3D.png",
		},
		{
			url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1280",
			thumbnailUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200",
			name: "AI_Generated_Gradient_Fluid.png",
		},
		{
			url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1280",
			thumbnailUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=200",
			name: "AI_Generated_Forest_Mist.png",
		}
	],
	video: [
		{
			url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
			thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200",
			name: "AI_Generated_Blazes.mp4",
			duration: 15,
		},
		{
			url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
			thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200",
			name: "AI_Generated_Fun.mp4",
			duration: 15,
		}
	]
};

export function GenerateMediaView() {
	const editor = useEditor();
	const activeProject = useEditor((e) => e.project.getActive());

	const [mode, setMode] = useState<"image" | "video">("image");
	const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
	const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
	const [prompt, setPrompt] = useState("");
	
	const [isGenerating, setIsGenerating] = useState(false);
	const [progress, setProgress] = useState(0);

	const handleGenerate = async () => {
		if (!prompt.trim()) {
			toast.error("请输入描述词 (Prompt)");
			return;
		}
		if (!activeProject) {
			toast.error("无活跃项目");
			return;
		}

		setIsGenerating(true);
		setProgress(0);

		// Simulate generating over 3.5 seconds
		const duration = 3500;
		const intervalTime = 50;
		const steps = duration / intervalTime;
		let currentStep = 0;

		const timer = setInterval(() => {
			currentStep++;
			const currentProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
			setProgress(currentProgress);

			if (currentStep >= steps) {
				clearInterval(timer);
				completeGeneration();
			}
		}, intervalTime);
	};

	const completeGeneration = async () => {
		try {
			// Select a mock asset randomly based on the mode
			const list = MOCK_ASSETS[mode];
			const selectedMock = list[Math.floor(Math.random() * list.length)] as any;

			const file = new File([], selectedMock.name, {
				type: mode === "image" ? "image/png" : "video/mp4",
			});

			const asset = {
				name: selectedMock.name,
				type: mode,
				file,
				url: selectedMock.url,
				thumbnailUrl: selectedMock.thumbnailUrl,
				duration: mode === "video" ? selectedMock.duration : undefined,
				width: 1280,
				height: 720,
				fps: 30,
			};

			// 1. Add to editor assets state
			const addedAsset = await editor.media.addMediaAsset({
				projectId: activeProject.metadata.id,
				asset,
			});

			if (!addedAsset) {
				throw new Error("Failed to add generated asset to editor");
			}

			// 2. Insert to playhead timeline position
			const currentTime = editor.project.getTimelineViewState().playheadTime;
			const elementDuration = mode === "video" && selectedMock.duration
				? mediaTimeFromSeconds({ seconds: selectedMock.duration })
				: DEFAULT_NEW_ELEMENT_DURATION;

			const element = buildElementFromMedia({
				mediaId: addedAsset.id,
				mediaType: addedAsset.type,
				name: addedAsset.name,
				duration: elementDuration,
				startTime: currentTime,
			});

			editor.timeline.insertElement({
				element,
				placement: { mode: "auto" },
			});

			toast.success(`AI ${mode === "image" ? "生图" : "生成视频"} 成功！已自动插入到时间轴`);
			setPrompt("");
		} catch (error) {
			console.error("AI Generation simulator failed:", error);
			toast.error("生成失败，请重试");
		} finally {
			setIsGenerating(false);
			setProgress(0);
		}
	};

	return (
		<PanelView title="AI 创意生成">
			<div className="flex flex-col h-full overflow-hidden p-3 gap-4">
				{/* Generation Mode Toggles */}
				<div className="grid grid-cols-2 gap-2 bg-muted/30 p-1 rounded border shrink-0">
					<button
						type="button"
						onClick={() => setMode("image")}
						disabled={isGenerating}
						className={cn(
							"flex items-center justify-center gap-1.5 py-1.5 rounded-sm text-sm font-medium transition",
							mode === "image"
								? "bg-background shadow-sm border text-foreground"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						<HugeiconsIcon icon={Image02Icon} className="size-4" />
						AI 生图
					</button>
					<button
						type="button"
						onClick={() => setMode("video")}
						disabled={isGenerating}
						className={cn(
							"flex items-center justify-center gap-1.5 py-1.5 rounded-sm text-sm font-medium transition",
							mode === "video"
								? "bg-background shadow-sm border text-foreground"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						<HugeiconsIcon icon={Video01Icon} className="size-4" />
						AI 视频
					</button>
				</div>

				{/* Configuration settings */}
				<div className="flex flex-col gap-3 shrink-0">
					<div className="flex flex-col gap-1.5">
						<label className="text-xs font-semibold text-muted-foreground">大模型模型</label>
						<select
							value={selectedModel}
							onChange={(e) => setSelectedModel(e.target.value)}
							disabled={isGenerating}
							className="flex h-9 w-full rounded border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
						>
							{MODELS.map((model) => (
								<option key={model.id} value={model.id}>
									{model.label}
								</option>
							))}
						</select>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-xs font-semibold text-muted-foreground">画面风格</label>
						<select
							value={selectedStyle}
							onChange={(e) => setSelectedStyle(e.target.value)}
							disabled={isGenerating}
							className="flex h-9 w-full rounded border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
						>
							{STYLES.map((style) => (
								<option key={style.id} value={style.id}>
									{style.label}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Text Prompt */}
				<div className="flex-1 flex flex-col gap-1.5 min-h-[100px]">
					<label className="text-xs font-semibold text-muted-foreground shrink-0">提示词 (Prompt)</label>
					<Textarea
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						disabled={isGenerating}
						placeholder={
							mode === "image"
								? "输入你想生成的图像画面，例如：A magical neon floating bubble in digital cyberpunk style..."
								: "输入你想生成的视频场景描述，例如：A slow-motion close up of waves crashing on a futuristic beach at night..."
						}
						className="flex-1 resize-none text-sm"
					/>
				</div>

				{/* Progress/Generate action */}
				<div className="flex flex-col gap-2.5 shrink-0 mt-auto">
					{isGenerating && (
						<div className="flex flex-col gap-1.5">
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>模型运算中...</span>
								<span>{progress}%</span>
							</div>
							<Progress value={progress} className="h-1.5" />
						</div>
					)}

					<Button
						type="button"
						onClick={handleGenerate}
						disabled={isGenerating}
						className="w-full flex items-center justify-center gap-2"
					>
						{isGenerating ? (
							<HugeiconsIcon icon={MagicWand05Icon} className="size-4 animate-spin" />
						) : (
							<HugeiconsIcon icon={mode === "video" ? Video01Icon : Image02Icon} className="size-4" />
						)}
						{isGenerating ? "生成中..." : "开始生成"}
					</Button>
				</div>
			</div>
		</PanelView>
	);
}
