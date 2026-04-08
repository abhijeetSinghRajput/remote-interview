"use client";
import "stream-chat-react/dist/css/v2/index.css";

import type { StreamChat, Channel as StreamChannel } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
} from "stream-chat-react";

type ChatPanelProps = {
  chatClient: StreamChat | null;
  channel: StreamChannel | null;
};

const ChatPanel = ({ chatClient, channel }: ChatPanelProps) => {
  if (!chatClient || !channel) return null;

  // Ensure the channel's client matches the provided chat client
  if (channel.getClient?.() !== chatClient) return null;

  return (
    <div className="h-full">
      <Chat client={chatClient} theme="app-chat-theme">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPanel;