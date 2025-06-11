"use client";

import { useState, useEffect } from "react";
import { Chat, Channel, MessageList, MessageInput } from "stream-chat-react";
import { chatClient } from "@/utils/streamClient";
import axios from "axios";
import "stream-chat-react/dist/css/v2/index.css";

interface StoredUser {
  uid: string;
  fullName: string;
}

export default function UserListChat() {
  const [loading, setLoading] = useState(true);
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      setStoredUser({ uid: u.uid, fullName: u.fullName });
    }
  }, []);

  useEffect(() => {
    const initChat = async () => {
      if (!storedUser) return;
      const tokenRes = await axios.post("/api/generateToken", {
        userId: storedUser.uid,
      });
      await chatClient.connectUser(
        { id: storedUser.uid, name: storedUser.fullName },
        tokenRes.data.token
      );

      const { users } = await chatClient.queryUsers({
        id: { $ne: storedUser.uid },
      } as any);

      setUsers(users);
      setLoading(false);
    };
    initChat();
  }, [storedUser]);

  if (loading) return <div>Loading chat...</div>;

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r overflow-auto">
        <h2 className="px-4 py-2 text-lg">Start Chat</h2>
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={async () => {
                  const channel = chatClient.channel("messaging", {
                    members: [storedUser?.uid, u.id],
                  });
                  await channel.watch();
                  setActiveChannel(channel);
                }}
              >
                {u.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col">
        {activeChannel ? (
          <Chat client={chatClient} theme="messaging light">
            <Channel channel={activeChannel}>
              <div className="flex flex-col w-full pb-5">
                <MessageList />
                <MessageInput />
              </div>
            </Channel>
          </Chat>
        ) : (
          <div className="flex items-center justify-center h-full">
            Select a user to chat with
          </div>
        )}
      </div>
    </div>
  );
}
