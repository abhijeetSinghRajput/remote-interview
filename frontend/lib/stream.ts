import { StreamVideoClient } from "@stream-io/video-react-sdk";

type StreamUserProps = {
  id: string;
  name?: string;
  image?: string;
};

let client: StreamVideoClient | null = null;
let currentUserId: string | null = null;

export const initStreamClient = async (
  user: StreamUserProps,
  token: string
): Promise<StreamVideoClient> => {
  if (client && currentUserId === user.id) return client;

  if (client) {
    await disconnectStreamClient();
  }

  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  if (!apiKey) throw new Error("Stream API key is not defined");

  client = new StreamVideoClient({
    apiKey,
    user,
    token,
  });

  currentUserId = user.id;

  return client;
};

export const disconnectStreamClient = async (): Promise<void> => {
  if (!client) return;

  try {
    await client.disconnectUser();
  } catch (error) {
    console.error("Error disconnecting Stream client:", error);
  } finally {
    client = null;
    currentUserId = null;
  }
};