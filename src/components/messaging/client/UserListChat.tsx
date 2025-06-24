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
import { BiMessage, BiVideo } from "react-icons/bi";

interface StoredUser {
  uid: string;
  fullName: string;
  profilePicture?: string;
}

interface ChannelMember {
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function UserListChat() {
  const [loading, setLoading] = useState(true);
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

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

        chatClient.on((event) => {
          if (
            event.type === "message.new" &&
            event.message?.user?.id !== storedUser.uid
          ) {
            setHasUnreadMessages(true);
          }
        });

        const filters = {
          type: "messaging",
          members: { $in: [storedUser.uid] },
          last_message_at: { $exists: true },
        };

        const channels = await chatClient.queryChannels(
          filters,
          { last_message_at: -1 },
          { watch: true, state: true, message_limit: 1 }
        );

        setChannels(channels);
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

  const startVideoCall = async () => {
    if (!activeChannel || !storedUser) return;

    const otherMembers = Object.values(activeChannel.state.members)
      .filter((member: any) => member.user.id !== storedUser.uid)
      .map((member: any) => member.user);

    if (otherMembers.length === 0) return;

    const recipient = otherMembers[0];
    setSelectedUser({ userId: recipient.id, name: recipient.name });

    // Send call invitation message
    const callId = `${storedUser.uid}-${recipient.id}`;
    const callLink = `https://getstream.io/video/demos/join/${callId}?id=${callId}`;

    try {
      await activeChannel.sendMessage({
        text: `Incoming video call from ${storedUser.fullName}. Join here: ${callLink}`,
      });
      setShowVideoCall(true);
    } catch (error) {
      console.error("Failed to send call invitation:", error);
    }
  };

  useEffect(() => {
    if (showChat) {
      setHasUnreadMessages(false);
    }
  }, [showChat]);

  useEffect(() => {
    const audio = new Audio("/sounds/notification.mp3");

    const handleNewMessage = (event: any) => {
      if (
        event.type === "message.new" &&
        event.message?.user?.id !== storedUser?.uid
      ) {
        setHasUnreadMessages(true);
        audio.play();
      }
    };

    chatClient.on(handleNewMessage);
    return () => {
      chatClient.off(handleNewMessage);
    };
  }, [storedUser]);

  if (loading) return null;

  return (
    <>
      <button
        onClick={() => setShowChat(true)}
        className={`fixed flex items-center gap-2 bottom-12 right-12 rounded-xl py-3 px-6 shadow-lg z-40 
    ${
      hasUnreadMessages
        ? "bg-red-500 hover:bg-red-600 text-white"
        : "bg-gray-200 hover:bg-gray-300"
    }`}
      >
        <span className="font-bold text-xl">Chat</span>
        <div className="relative">
          <BiMessage size={24} />
          {hasUnreadMessages && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-600 rounded-full border border-white" />
          )}
        </div>
      </button>

      {showChat && (
        <div className="fixed inset-0 bg-opacity-50 flex justify-end items-center pe-16 z-50 bg-black/40">
          <div className="bg-white w-11/12 md:w-3/4 lg:w-1/2 h-4/5 rounded-lg shadow-lg relative flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="font-bold text-xl">Messages</h2>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/3 border-r border-gray-200 overflow-auto">
                <Chat client={chatClient}>
                  <ChannelList
                    filters={{
                      type: "messaging",
                      members: { $in: [storedUser?.uid || ""] },
                      last_message_at: { $exists: true }, // Excludes channels with no messages
                    }}
                    sort={{ last_message_at: -1 }}
                    options={{ watch: true, state: true, message_limit: 1 }}
                    Preview={(props) => {
                      const { channel } = props;
                      const members = Object.values(channel.state.members)
                        .filter(
                          (member: any) => member.user.id !== storedUser?.uid
                        )
                        .map((member: any) => member.user);
                      const member = members[0];

                      const lastMessage =
                        channel.state.messages[
                          channel.state.messages.length - 1
                        ];
                      const lastMessageText =
                        lastMessage?.text || "No messages yet";
                      const lastMessageDate = lastMessage?.created_at;

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
                          className={`flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer ${
                            activeChannel?.id === channel.id
                              ? "bg-gray-100"
                              : ""
                          }`}
                          onClick={() => setActiveChannel(channel)}
                        >
                          <Avatar image={member?.image} name={member?.name} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-semibold truncate max-w-28">
                                {member?.name}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatDate(lastMessageDate)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {lastMessageText}
                            </p>
                          </div>
                        </div>
                      );
                    }}
                  />
                </Chat>
              </div>

              <div className="flex-1 flex flex-col pb-4">
                {activeChannel ? (
                  <Chat client={chatClient} theme="messaging light">
                    <Channel channel={activeChannel}>
                      <Window>
                        <div className="flex justify-between items-center p-2 border-b border-gray-200">
                          <ChannelHeader />
                          <button
                            onClick={startVideoCall}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                            title="Start Video Call"
                          >
                            <BiVideo size={20} />
                            <span>Call</span>
                          </button>
                        </div>
                        <MessageList />
                        <MessageInput />
                      </Window>
                    </Channel>
                  </Chat>
                ) : (
                  <div className="flex items-center justify-center flex-1">
                    Select a chat to start messaging
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
