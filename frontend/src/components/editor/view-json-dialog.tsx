"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useEditor } from "@/editor/use-editor";
import { convertProjectToTwickJSON } from "@/types/twick-schema";
import { CopyIcon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function ViewJsonDialog({
	isOpen,
	onOpenChange,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const editor = useEditor();
	const [jsonString, setJsonString] = useState("");
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (isOpen) {
			try {
				const activeProject = editor.project.getActiveOrNull();
				if (!activeProject) {
					setJsonString(JSON.stringify({ error: "无活跃项目" }, null, 2));
					return;
				}

				// Build the latest project state including the current scenes
				const scenes = editor.scenes.getScenes();
				const currentProjectState = {
					...activeProject,
					scenes,
				};

				const twickJson = convertProjectToTwickJSON(currentProjectState);
				setJsonString(JSON.stringify(twickJson, null, 2));
			} catch (err) {
				console.error(err);
				setJsonString(JSON.stringify({ error: "转换 JSON 失败", message: String(err) }, null, 2));
			}
		}
	}, [isOpen, editor]);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(jsonString);
			setCopied(true);
			toast.success("已成功复制 JSON 状态树到剪贴板");
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			toast.error("复制失败，请手动选择复制");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] max-w-3xl flex-col p-0">
				<DialogHeader className="border-b px-6 py-4">
					<DialogTitle>Twick JSON 状态树</DialogTitle>
				</DialogHeader>

				<DialogBody className="grow overflow-y-auto p-6 font-mono text-xs bg-slate-50 dark:bg-slate-900 border-b">
					<pre className="whitespace-pre-wrap break-all select-all text-slate-800 dark:text-slate-200">
						{jsonString}
					</pre>
				</DialogBody>

				<DialogFooter className="px-6 py-4 flex justify-between items-center gap-2">
					<div className="text-xs text-muted-foreground">
						此 JSON 数据可直接传输至 Twick 后端进行 FFmpeg 渲染与合成
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={handleCopy} className="flex items-center gap-1.5">
							<HugeiconsIcon icon={copied ? Tick01Icon : CopyIcon} className="size-4" />
							{copied ? "已复制" : "复制 JSON"}
						</Button>
						<Button variant="default" onClick={() => onOpenChange(false)}>
							关闭
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
