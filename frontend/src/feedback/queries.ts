import { generateUUID } from "@/utils/id";
import type { FeedbackEntry, SubmitFeedbackInput } from "./types";

export async function submitFeedback({
	message,
}: SubmitFeedbackInput): Promise<FeedbackEntry> {
	const id = generateUUID();
	const now = new Date();

	// Mock DB insert
	console.log("Feedback submitted:", message);

	return { id, message, createdAt: now.toISOString() };
}
