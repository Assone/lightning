import { auth } from "@lightning/auth";
import { env } from "@lightning/env/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, useSession } from "@tanstack/react-start/server";
import { z } from "zod";

export interface RoomSession {
  clientId: string;
  displayName: string;
}

const useRoomSession = () => {
  return useSession<RoomSession>({
    name: "room:session",
    password: env.SESSION_SECRET,
    cookie: {
      httpOnly: true,
    },
  });
};

const setRoomSessionSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(32, "Display name must be at most 32 characters"),
});

export const setRoomSession = createServerFn({ method: "POST" })
  .inputValidator(setRoomSessionSchema)
  .handler(async ({ data }) => {
    const session = await useRoomSession();
    const request = getRequest();
    const authSession = await auth.api.getSession(request);
    const clientId =
      authSession?.session.userId ??
      session.data.clientId ??
      crypto.randomUUID();
    const displayName = data.displayName.trim();

    const payload: RoomSession = {
      clientId,
      displayName,
    };

    await session.update(payload);

    return {
      clientId,
      displayName,
    };
  });

export const getRoomSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useRoomSession();
    const request = getRequest();
    const authSession = await auth.api.getSession(request);
    const clientId = authSession?.session.userId ?? session.data.clientId;
    const displayName = session.data.displayName ?? authSession?.user.name;

    return {
      clientId,
      displayName,
    };
  }
);
