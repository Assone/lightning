import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRoomSession } from "@/functions/room";

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
	return <div>Hello "/room/$roomName"!</div>;
}
