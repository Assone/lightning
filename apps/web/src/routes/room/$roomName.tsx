import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { SupabaseSignalingAdapter } from "@lightning/signaling";
import { getRoomSession } from "@/functions/room";
import { useSignaling } from "@/hooks/use-signaling";
import { supabaseClient } from "@/lib/supabase-client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { RoomParticipants } from "@/components/room-participants";

export const Route = createFileRoute("/room/$roomName")({
	component: RouteComponent,
	beforeLoad: async () => {
		const roomSession = await getRoomSession();

		return roomSession;
	},
	loader: ({ context, params }) => {
		const { clientId, displayName } = context;

		if (!(clientId && displayName)) {
			throw redirect({
				to: "/room",
				search: {
					roomName: params.roomName,
				},
				replace: true,
			});
		}

		return {
			clientId,
			displayName,
		};
	},
});

function RouteComponent() {
	const { roomName } = Route.useParams();
	const { clientId, displayName } = Route.useLoaderData();

	const adapter = useMemo(
		() =>
			new SupabaseSignalingAdapter({
				supabase: supabaseClient,
				clientId,
			}),
		[clientId]
	);

	const connection = useMemo(
		() => ({
			roomName,
			participantName: displayName,
		}),
		[displayName, roomName]
	);

	const { connected, participants, error } = useSignaling({
		adapter,
		connection,
	});

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
			<Card>
				<CardHeader>
					<CardTitle>Room: {roomName}</CardTitle>
					<CardDescription>
						{connected ? "Connected to signaling." : "Connecting to signaling..."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error ? (
						<p className="text-destructive text-xs">
							{error.message || "Unable to connect to signaling."}
						</p>
					) : null}
				</CardContent>
			</Card>

			<RoomParticipants
				participants={participants}
				currentParticipantId={clientId}
			/>
		</div>
	);
}
