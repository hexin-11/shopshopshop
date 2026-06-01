"use client";

import { useState } from "react";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { useEditor } from "@/editor/use-editor";
import { DEFAULTS } from "@/timeline/defaults";
import { buildTextElement } from "@/timeline/element-utils";
import type { MediaTime } from "@/wasm";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { cn } from "@/utils/ui";

const EMOJI_CATALOG = {
	"常用": ["🔥", "✨", "🌟", "🎉", "😂", "🤣", "👍", "❤️", "💥", "💡", "⚠️", "✅", "❌", "💯", "👀"],
	"表情": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😋", "😜", "🤪", "😎", "🤩", "🥳", "😏", "😒", "😔", "😢", "😭", "😤", "😠", "😡", "🤯", "😳", "😱", "🤔", "🤫", "🥱", "😴"],
	"手势": ["👋", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "💪"],
	"物品": ["👑", "🎩", "🎒", "💼", "🕶️", "🎨", "🎬", "🎤", "🎧", "🎹", "🎮", "🎯", "⚽", "🏀", "🚗", "🚀", "🛸", "💡", "💰", "💎", "🔑", "🔒", "✉️", "📦", "📚", "📝", "📢", "🔔"],
	"媒体": ["⚡", "🔥", "💥", "✨", "🌟", "⭐", "🎈", "🎉", "🎊", "🎵", "🎶", "⚠️", "🚫", "✅", "❌", "❓", "❗", "💯", "❤️", "💔", "💕", "💞", "💓", "💗"]
};

type EmojiCategory = keyof typeof EMOJI_CATALOG;

export function EmojiView() {
	const editor = useEditor();
	const [activeCategory, setActiveCategory] = useState<EmojiCategory>("常用");

	const handleAddToTimeline = (emoji: string, currentTime: MediaTime) => {
		const activeScene = editor.scenes.getActiveScene();
		if (!activeScene) return;

		const element = buildTextElement({
			raw: {
				name: emoji,
				params: {
					...DEFAULTS.text.element.params,
					content: emoji,
					fontSize: 40, // Nice large emoji sticker size
					color: "#ffffff",
					textAlign: "center",
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
		<PanelView title="表情贴纸">
			<div className="flex flex-col h-full overflow-hidden">
				{/* Category selectors */}
				<div className="flex gap-1.5 px-1 py-2 border-b overflow-x-auto scrollbar-none shrink-0">
					{(Object.keys(EMOJI_CATALOG) as EmojiCategory[]).map((cat) => (
						<button
							key={cat}
							type="button"
							onClick={() => setActiveCategory(cat)}
							className={cn(
								"text-xs px-2.5 py-1 rounded-full border transition whitespace-nowrap shrink-0",
								activeCategory === cat
									? "bg-primary text-primary-foreground border-primary"
									: "bg-muted/50 text-muted-foreground hover:bg-muted"
							)}
						>
							{cat}
						</button>
					))}
				</div>

				{/* Grid */}
				<div className="flex-1 overflow-y-auto p-1.5 min-h-0">
					<div className="grid grid-cols-4 gap-2.5">
						{EMOJI_CATALOG[activeCategory].map((emoji, index) => (
							<DraggableItem
								key={`${emoji}-${index}`}
								name={emoji}
								preview={
									<div className="bg-accent/30 hover:bg-accent/60 flex size-full items-center justify-center rounded border text-3xl select-none transition">
										{emoji}
									</div>
								}
								dragData={{
									id: `emoji-${emoji}`,
									type: "text",
									name: emoji,
									content: emoji,
									params: {
										content: emoji,
										fontSize: 40,
										color: "#ffffff",
										textAlign: "center",
									}
								} as any}
								aspectRatio={1}
								onAddToTimeline={({ currentTime }) => handleAddToTimeline(emoji, currentTime)}
								shouldShowLabel={false}
							/>
						))}
					</div>
				</div>
			</div>
		</PanelView>
	);
}
