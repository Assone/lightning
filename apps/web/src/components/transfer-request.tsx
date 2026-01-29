import type { Participant } from "@lightning/signaling";
import {
  type ChangeEvent,
  type DragEvent,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const [note, setNote] = useState("");
  const [targetId, setTargetId] = useState(ALL_RECIPIENTS);

  const availableRecipients = useMemo(
    () =>
      participants.filter(
        (participant) => participant.id !== currentParticipantId
      ),
    [participants, currentParticipantId]
  );

  const canSend = selectedFiles.length > 0 && availableRecipients.length > 0;

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (event: DragEvent<HTMLButtonElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }
    setIsDragging(false);
  };

  const handleSend = () => {
    if (!canSend) {
      return;
    }

    const recipients =
      targetId === ALL_RECIPIENTS
        ? availableRecipients
        : availableRecipients.filter(
            (participant) => participant.id === targetId
          );

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
            : (recipients[0]?.name ?? "Unknown"),
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
          Select multiple files and send transfer requests to other
          participants.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="space-y-2">
          <Label htmlFor="transfer-recipient">Recipient</Label>
          <select
            className="h-8 w-full rounded-none border border-input bg-transparent px-2.5 text-xs focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
            disabled={availableRecipients.length === 0}
            id="transfer-recipient"
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
            className="sr-only"
            id="transfer-files"
            multiple
            onChange={handleFilesChange}
            ref={fileInputRef}
            type="file"
          />
          <button
            aria-describedby="transfer-files-help"
            className={`flex w-full flex-col items-center justify-center gap-1 rounded-none border border-dashed px-3 py-4 text-xs transition-colors ${
              isDragging
                ? "border-primary bg-primary/10 text-primary"
                : "border-input text-muted-foreground hover:border-primary/60"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            type="button"
          >
            <span className="font-medium text-foreground">
              Drag and drop files here
            </span>
            <span className="text-muted-foreground">or click to browse</span>
          </button>
          <p className="text-muted-foreground" id="transfer-files-help">
            You can also select multiple files from the file picker.
          </p>
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
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a message for the recipient."
            value={note}
          />
        </div>

        <Button disabled={!canSend} onClick={handleSend} type="button">
          Send transfer request
        </Button>
      </CardContent>
    </Card>
  );
};
