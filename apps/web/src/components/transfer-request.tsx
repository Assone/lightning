import { useMemo, useRef, useState, type ChangeEvent } from "react";
import type { Participant } from "@lightning/signaling";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatBytes } from "@/lib/file-size";
import type { TransferMessage } from "@/lib/transfer-sessions";

interface TransferRequestProps {
  participants: Participant[];
  currentParticipantId: string;
  displayName: string;
  sendMessage: (target: string, message: TransferMessage) => void;
  addMessage: (message: TransferMessage) => void;
}

const ALL_RECIPIENTS = "everyone";

export const TransferRequest = ({
  participants,
  currentParticipantId,
  displayName,
  sendMessage,
  addMessage,
}: TransferRequestProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [targetId, setTargetId] = useState(ALL_RECIPIENTS);

  const availableRecipients = useMemo(
    () => participants.filter((participant) => participant.id !== currentParticipantId),
    [participants, currentParticipantId],
  );

  const canSend = selectedFiles.length > 0 && availableRecipients.length > 0;

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
  };

  const handleSend = () => {
    if (!canSend) {
      return;
    }

    const recipients =
      targetId === ALL_RECIPIENTS
        ? availableRecipients
        : availableRecipients.filter((participant) => participant.id === targetId);

    const noteValue = note.trim();
    const timestamp = new Date().toISOString();

    for (const file of selectedFiles) {
      const message: TransferMessage = {
        type: "transfer:request",
        sessionId: crypto.randomUUID(),
        from: displayName,
        to:
          targetId === ALL_RECIPIENTS
            ? undefined
            : recipients[0]?.name ?? "Unknown",
        fileName: file.name,
        fileSize: file.size,
        note: noteValue.length > 0 ? noteValue : undefined,
        timestamp,
      };

      for (const recipient of recipients) {
        sendMessage(recipient.id, message);
      }

      addMessage(message);
    }

    setSelectedFiles([]);
    setNote("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Files</CardTitle>
        <CardDescription>
          Select multiple files and send transfer requests to other participants.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="space-y-2">
          <Label htmlFor="transfer-recipient">Recipient</Label>
          <select
            id="transfer-recipient"
            className="h-8 w-full rounded-none border border-input bg-transparent px-2.5 text-xs focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
            disabled={availableRecipients.length === 0}
            onChange={(event) => setTargetId(event.target.value)}
            value={targetId}
          >
            <option value={ALL_RECIPIENTS}>Everyone</option>
            {availableRecipients.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
          {availableRecipients.length === 0 ? (
            <p className="text-muted-foreground">
              Waiting for another participant to join the room.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="transfer-files">Files</Label>
          <Input
            ref={fileInputRef}
            id="transfer-files"
            type="file"
            multiple
            onChange={handleFilesChange}
          />
          {selectedFiles.length > 0 ? (
            <ul className="space-y-1 text-muted-foreground">
              {selectedFiles.map((file) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`}>
                  {file.name} ({formatBytes(file.size)})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No files selected.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="transfer-note">Note (optional)</Label>
          <Textarea
            id="transfer-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a message for the recipient."
          />
        </div>

        <Button type="button" onClick={handleSend} disabled={!canSend}>
          Send transfer request
        </Button>
      </CardContent>
    </Card>
  );
};
