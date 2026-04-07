import { api } from '@/lib/api'
import React, { useEffect, useState } from 'react'
import { disconnectStreamClient, initStreamClient } from '@/lib/stream'
import { StreamChat } from "stream-chat";
import { ISession } from '@/types/model';
import { toast } from 'sonner';

const useStreamClient = (session: ISession, loadingSession: boolean, isHost: boolean, isParticipant: boolean) => {
  const [streamClient, setStreamClient] = useState<any>(null)
  const [call, setCall] = useState<any>(null)
  const [chatClient, setChatClient] = useState<any>(null)
  const [channel, setChannel] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      if (!session?.callId) return;

      // not the user of session
      if (!isHost && !isParticipant) return;

      try {
        const res = await api.get(`/chat/token`);
        console.log("Stream token response:", res);
        const {
          token,
          userId,
          image,
          name,
        } = res.data.data;
        const user = { id: userId, image, name };
        const client = await initStreamClient(user, token)
        setStreamClient(client);

        videoCall = client.call("default", session.callId);
        await videoCall.join({ create: true });
        setCall(videoCall);

        chatClientInstance = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);
        await chatClientInstance.connectUser(user, token);
        setChatClient(chatClientInstance);

        const channel = chatClientInstance.channel("messaging", session.callId);
        await channel.watch();
        setChannel(channel);
      } catch (error) {
        toast.error("Failed to initialize Stream client.");
        console.error("Error initializing Stream client:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (session && !loadingSession) {
      initCall();
    }
    // cleanup method
    return () => {
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Error during Stream client cleanup:", error);
        }
      }
      )();
    }
  }, [session, loadingSession, isHost, isParticipant])
  return {
    streamClient,
    call,
    chatClient,
    channel,
    isLoading,
  }
}

export default useStreamClient