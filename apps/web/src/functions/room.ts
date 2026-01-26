import { env } from "@lightning/env/server";
import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

const useRoomSession = () => {
	return useSession<{ clientId: string; displayName: string }>({
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
		const clientId = session.data.clientId ?? crypto.randomUUID();
		const displayName = data.displayName.trim();

		await session.update({
			clientId,
			displayName,
		});

		return {
			clientId,
			displayName,
		};
	});

export const getRoomSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await useRoomSession();
		return session.data;
	}
);
