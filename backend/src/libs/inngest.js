import { connectDB } from "../config/db.js";
import { ENV } from "../config/env.js";
import User from "../models/User.model.js";
import { Inngest } from "inngest";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({
  id: "remote-interview",
  signingKey: ENV.INNGEST_SIGNING_KEY,
});

const syncUser = inngest.createFunction(
  {
    id: "sync-user",
    triggers: [{ event: "clerk/user.created" }],
  },
  async ({ event }) => {
    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;
    const newUser = {
      clearId: id,
      email: email_addresses[0]?.email_address || "",
      name: `${first_name} ${last_name}`,
      image: image_url,
    };
    await User.create(newUser);
    await upsertStreamUser(newUser);
  },
);

const deleteUserFromDB = inngest.createFunction(
  {
    id: "delete-user",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;
    await User.deleteOne({ clearId: id });
    await deleteStreamUser(id);
  },
);

const updateUserInDB = inngest.createFunction(
  {
    id: "update-user",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;
    const updateData = {
      email: email_addresses[0]?.email_address || "",
      name: `${first_name} ${last_name}`,
      image: image_url,
    };
    await User.updateOne({ clearId: id }, updateData);
    await upsertStreamUser({ ...updateData, clearId: id });
  },
);

export const functions = [syncUser, deleteUserFromDB, updateUserInDB];
