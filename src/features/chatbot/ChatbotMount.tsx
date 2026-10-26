import { chatbotConfig } from "./config";
import ChatWidget from "./ChatWidget";

// Server component: hands the widget only the client-safe part of the
// config. Drop <ChatbotMount /> into the root layout to install.
export default function ChatbotMount() {
  return <ChatWidget ui={chatbotConfig.ui} />;
}
