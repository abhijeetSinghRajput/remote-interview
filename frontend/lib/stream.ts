import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { IUser } from "./types.js";


let client = null;

export const initStreamClient = (user: IUser, token: string) => {
  if(client && client?.user?.id === user.id) return client;
  if(client) disconnectStreamClient();
  
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY
  if (!apiKey) throw new Error("Stream API key is not defined");

  client = new StreamVideoClient({
    apiKey,
    user,
    token,
  });

  return client;
}

export const disconnectStreamClient = async () => {
    if(!client) return;

    try{
        await client.disconnectUser();
        client = null;
    } catch(error) {
        console.error("Error disconnecting Stream client:", error);
    }
}