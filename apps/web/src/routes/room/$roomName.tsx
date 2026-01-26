import { SupabaseSignalingAdapter } from "@lightning/signaling/adapter/supabase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { RoomParticipants } from "@/components/room-participants";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getRoomSession } from "@/functions/room";
import { useSignaling } from "@/hooks/use-signaling";
import { supabaseClient } from "@/lib/supabase-client";

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

  const { isConnected, participants } = useSignaling({
    createAdapter: () =>
      new SupabaseSignalingAdapter({
        supabase: supabaseClient,
        clientId,
      }),
    displayName,
    roomName,
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Room: {roomName}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-1">
              {!isConnected && <Spinner />}
              {isConnected ? "Connected." : "Connecting..."}
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      <RoomParticipants
        participants={participants}
        currentParticipantId={clientId}
      />
    </div>
  );
}
