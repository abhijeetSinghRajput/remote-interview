import { StreamClient } from "@stream-io/node-sdk";
import { StreamChat } from "stream-chat";
import { ENV } from "../config/env.js";

// will be used for chat
export const streamChat = StreamChat.getInstance(
  ENV.STREAM_API_KEY,
  ENV.STREAM_API_SECRET,
);

// will be used for video calls
export const streamClient = new StreamClient(
    ENV.STREAM_API_KEY, 
    ENV.STREAM_API_SECRET
);

export const upsertStreamUser = async (user) => {
    const { clerkId, name, email, image } = user;
    try {
        await streamChat.upsertUser({
            id: clerkId,
            name,
            email,
            image,
        });
        console.log(`Stream user ${clerkId} upserted successfully.`);
    } catch (error) {
        console.error("Error upserting Stream user:", error);
    }
}

export const deleteStreamUser = async (userId) => {
    try {
        await streamChat.deleteUser(userId, { mark_messages_deleted: true });
        console.log(`Stream user ${userId} deleted successfully.`);
    } catch (error) {
        console.error("Error deleting Stream user:", error);
    }
}

// todo add another method to generate token