import { StreamChat } from "stream-chat";
export const chatClient = new StreamChat(process.env.STREAM_API_KEY!);
