import { chatbotConfig } from "@/features/chatbot/config";
import { handleChatRequest } from "@/features/chatbot/server/handler";

// Site chat assistant. All logic lives in src/features/chatbot.
export const maxDuration = 60;

export async function POST(request: Request) {
  return handleChatRequest(request, chatbotConfig);
}
