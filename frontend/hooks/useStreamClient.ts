import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { disconnectStreamClient, initStreamClient } from "@/lib/stream";
import { StreamChat, Channel } from "stream-chat";
import type { StreamVideoClient, Call } from "@stream-io/video-react-sdk";
import { ISession } from "@/types/model";
import { toast } from "sonner";

const useStreamClient = (
  session: ISession,
  loadingSession: boolean,
  isHost: boolean,
  isParticipant: boolean
) => {
  const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    let videoCall: Call | null = null;
    let chatClientInstance: StreamChat | null = null;

    const clearState = () => {
      setChannel(null);
      setChatClient(null);
      setCall(null);
      setStreamClient(null);
    };

    const initCall = async () => {
      if (loadingSession) return;

      if (!session?.callId || (!isHost && !isParticipant)) {
        clearState();
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const res = await api.get("/chat/token");
        const { token, userId, image, name } = res.data.data;
        const user = { id: userId, image, name };

        const videoClient = await initStreamClient(user, token);
        if (cancelled) return;
        setStreamClient(videoClient);

        videoCall = videoClient.call("default", session.callId);
        await videoCall.join({ create: true });
        if (cancelled) {
          await videoCall.leave();
          return;
        }
        setCall(videoCall);

        chatClientInstance = StreamChat.getInstance(
          process.env.NEXT_PUBLIC_STREAM_API_KEY!
        );

        // optional safety: connect only if needed
        if (chatClientInstance.userID !== user.id) {
          await chatClientInstance.connectUser(user, token);
        }

        if (cancelled) {
          await chatClientInstance.disconnectUser();
          return;
        }

        setChatClient(chatClientInstance);

        const nextChannel = chatClientInstance.channel("messaging", session.callId);
        await nextChannel.watch();

        if (cancelled) return;

        setChannel(nextChannel);
      } catch (error) {
        clearState();
        toast.error("Failed to initialize Stream client.");
        console.error("Error initializing Stream client:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    initCall();

    return () => {
      cancelled = true;

      // unmount UI first
      clearState();

      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Error during Stream client cleanup:", error);
        }
      })();
    };
  }, [session?.callId, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isLoading,
  };
};

export default useStreamClient;