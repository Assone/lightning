import type { Participant } from "@lightning/signaling";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";

interface RoomParticipantsProps {
  participants: Participant[];
  currentParticipantId: string;
}

const isCurrentParticipant = (
  participantId: string,
  currentParticipantId: string
): boolean => participantId === currentParticipantId;

export const RoomParticipants = ({
  participants,
  currentParticipantId,
}: RoomParticipantsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
        <CardDescription>
          {participants.length} participant
          {participants.length === 1 ? "" : "s"} in this room.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <Empty>
            <EmptyTitle>No one is here yet.</EmptyTitle>
            <EmptyDescription>
              Share the room name to invite others.
            </EmptyDescription>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {participants.map((participant) => (
              <li
                className="flex items-center justify-between rounded-none border border-border/60 px-3 py-2"
                key={participant.id}
              >
                <span className="font-medium">{participant.name}</span>
                <span className="text-muted-foreground text-xs">
                  {isCurrentParticipant(participant.id, currentParticipantId)
                    ? "You"
                    : "Guest"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
