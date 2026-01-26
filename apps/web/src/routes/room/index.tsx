import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { JoinRoom } from "@/components/join-room";
import { getRoomSession } from "@/functions/room";

const searchSchema = z.object({
  roomName: z.string().optional(),
});

export const Route = createFileRoute("/room/")({
  component: RouteComponent,
  validateSearch: searchSchema,
  loader: async () => {
    const roomSession = await getRoomSession();

    return roomSession;
  },
});

function RouteComponent() {
  const { roomName } = Route.useSearch();
  const { displayName } = Route.useLoaderData();

  return (
    <div>
      <JoinRoom displayName={displayName} roomName={roomName} />
    </div>
  );
}
