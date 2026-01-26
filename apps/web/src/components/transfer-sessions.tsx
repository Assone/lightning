import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import type {
  TransferSession,
  TransferSessionStatus,
} from "@/lib/transfer-sessions";

interface TransferSessionsProps {
  sessions: TransferSession[];
}

const STATUS_LABELS: Record<TransferSessionStatus, string> = {
  requesting: "Requesting",
  accepted: "Accepted",
  rejected: "Rejected",
  in_progress: "In progress",
  completed: "Completed",
};

const STATUS_STYLES: Record<TransferSessionStatus, string> = {
  requesting: "bg-amber-500/10 text-amber-700",
  accepted: "bg-emerald-500/10 text-emerald-700",
  rejected: "bg-rose-500/10 text-rose-700",
  in_progress: "bg-sky-500/10 text-sky-700",
  completed: "bg-slate-500/10 text-slate-700",
};

const formatBytes = (bytes?: number): string => {
  if (!bytes && bytes !== 0) {
    return "-";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"] as const;
  let remaining = bytes;
  let unitIndex = -1;

  while (remaining >= 1024 && unitIndex < units.length - 1) {
    remaining /= 1024;
    unitIndex += 1;
  }

  return `${remaining.toFixed(1)} ${units[unitIndex]}`;
};

const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) {
    return "-";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
};

const formatProgress = (progress?: TransferSession["progress"]): string => {
  if (!progress) {
    return "-";
  }

  const { transferredBytes, totalBytes } = progress;
  if (totalBytes <= 0) {
    return `${formatBytes(transferredBytes)} transferred`;
  }

  const percent = Math.min(100, (transferredBytes / totalBytes) * 100);
  return `${formatBytes(transferredBytes)} / ${formatBytes(totalBytes)} (${Math.round(
    percent
  )}%)`;
};

export const TransferSessions = ({ sessions }: TransferSessionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Sessions</CardTitle>
        <CardDescription>
          Transfer requests and file exchange activity for this room.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <Empty>
            <EmptyTitle>No transfer sessions yet.</EmptyTitle>
            <EmptyDescription>
              Incoming transfer requests will appear here.
            </EmptyDescription>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3 text-sm">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="rounded-none border border-border/60 px-3 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Session
                    </span>
                    <span className="font-medium">{session.id}</span>
                  </div>
                  <span
                    className={`rounded-none px-2 py-1 text-xs font-medium ${
                      STATUS_STYLES[session.status]
                    }`}
                  >
                    {STATUS_LABELS[session.status]}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <div>
                    <span className="text-foreground">From:</span> {session.from}
                  </div>
                  <div>
                    <span className="text-foreground">To:</span>{" "}
                    {session.to ?? "Everyone"}
                  </div>
                  <div>
                    <span className="text-foreground">Requested:</span>{" "}
                    {formatTimestamp(session.requestedAt)}
                  </div>
                  <div>
                    <span className="text-foreground">Last update:</span>{" "}
                    {formatTimestamp(session.lastUpdatedAt)}
                  </div>
                  <div>
                    <span className="text-foreground">File:</span>{" "}
                    {session.fileName ?? "-"}
                  </div>
                  <div>
                    <span className="text-foreground">Size:</span>{" "}
                    {formatBytes(session.fileSize)}
                  </div>
                  <div>
                    <span className="text-foreground">Progress:</span>{" "}
                    {formatProgress(session.progress)}
                  </div>
                  <div>
                    <span className="text-foreground">Accepted by:</span>{" "}
                    {session.acceptedBy ?? "-"}
                  </div>
                  <div>
                    <span className="text-foreground">Rejected by:</span>{" "}
                    {session.rejectedBy ?? "-"}
                  </div>
                  <div>
                    <span className="text-foreground">Reason:</span>{" "}
                    {session.rejectionReason ?? "-"}
                  </div>
                </div>
                {session.note ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    <span className="text-foreground">Note:</span> {session.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
