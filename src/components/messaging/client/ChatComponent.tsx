"use client";

import { useState, useEffect } from "react";
import {
  Chat,
  Channel,
  MessageList,
  ChannelList,
  MessageInput,
  Window,
  ChannelHeader,
  Avatar,
} from "stream-chat-react";
import { chatClient } from "@/utils/streamClient";
import axios from "axios";
import "stream-chat-react/dist/css/v2/index.css";

interface StoredUser {
  uid: string;
  fullName: string;
  profilePicture?: string;
}

export default function UserListChat() {
  const [loading, setLoading] = useState(true);
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      setStoredUser({
        uid: u.uid,
        fullName: u.fullName,
        profilePicture: u.profilePicture,
      });
    }
  }, []);

  useEffect(() => {
    const initChat = async () => {
      if (!storedUser) return;

      try {
        const tokenRes = await axios.post("/api/generateToken", {
          userId: storedUser.uid,
        });

        await chatClient.connectUser(
          {
            id: storedUser.uid,
            name: storedUser.fullName,
            image: storedUser.profilePicture || undefined,
          },
          tokenRes.data.token
        );

        // Create a channel for each user (or use existing ones)
        const { users } = await chatClient.queryUsers({
          id: { $ne: storedUser.uid },
        } as any);

        // Create or get channels for each user
        const userChannels = await Promise.all(
          users.map(async (user) => {
            const channel = chatClient.channel("messaging", {
              members: [storedUser.uid, user.id],
            });
            await channel.watch();
            return channel;
          })
        );

        setChannels(userChannels);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing chat:", error);
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [storedUser]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex h-5/6">
      <div className="w-3/12 border-r border-gray-200 overflow-auto">
        <h2 className="py-2 font-bold mx-4 px-2 text-2xl border-b border-gray-200">
          Chat
        </h2>
        <Chat client={chatClient}>
          <ChannelList
            filters={{ members: { $in: [storedUser?.uid || ""] } }}
            Preview={(props) => {
              const { channel } = props;
              const members = Object.values(channel.state.members).filter(
                ({ user }: any) => user.id !== storedUser?.uid
              );
              const member = members[0] as any;

              // Get the last message and its timestamp
              const lastMessage =
                channel.state.messages[channel.state.messages.length - 1];
              const lastMessageText = lastMessage?.text || "No messages yet";
              const lastMessageDate = lastMessage?.created_at;

              // Format the date
              const formatDate = (dateString: string | Date) => {
                if (!dateString) return "";
                const date = new Date(dateString);
                return date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              };

              return (
                <div
                  className={`flex flex-col hover:bg-gray-100 duration-75 rounded-lg px-4 py-3 gap-1 border-b border-gray-200 mx-2 ${
                    activeChannel?.id === channel.id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setActiveChannel(channel)}
                >
                  <div className="flex flex-row items-center gap-3">
                    <Avatar
                      image={member?.user?.image}
                      name={member?.user?.name}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold truncate">
                          {member?.user?.name}
                        </p>
                        {lastMessageDate && (
                          <span className="text-xs text-gray-500">
                            {formatDate(lastMessageDate)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessageText}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </Chat>
      </div>
      <div className="flex-1 flex flex-col">
        {activeChannel ? (
          <Chat client={chatClient} theme="messaging light">
            <Channel channel={activeChannel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
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
