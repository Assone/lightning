export type TransferSessionStatus =
  | "requesting"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed";

export interface TransferSession {
  id: string;
  from: string;
  to?: string;
  fileName?: string;
  fileSize?: number;
  note?: string;
  status: TransferSessionStatus;
  lastUpdatedAt: number;
  requestedAt?: number;
  acceptedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  progress?: {
    transferredBytes: number;
    totalBytes: number;
  };
}

type TransferRequestMessage = {
  type: "transfer:request";
  sessionId: string;
  from: string;
  to?: string;
  fileName?: string;
  fileSize?: number;
  note?: string;
  timestamp: string | number;
};

type TransferAcceptedMessage = {
  type: "transfer:accepted";
  sessionId: string;
  by: string;
  timestamp: string | number;
};

type TransferRejectedMessage = {
  type: "transfer:rejected";
  sessionId: string;
  by: string;
  reason?: string;
  timestamp: string | number;
};

type TransferProgressMessage = {
  type: "transfer:progress";
  sessionId: string;
  transferredBytes: number;
  totalBytes: number;
  timestamp: string | number;
};

type TransferCompletedMessage = {
  type: "transfer:completed";
  sessionId: string;
  timestamp: string | number;
};

export type TransferMessage =
  | TransferRequestMessage
  | TransferAcceptedMessage
  | TransferRejectedMessage
  | TransferProgressMessage
  | TransferCompletedMessage;

export const parseTransferMessage = (
  message: unknown,
): TransferMessage | null => {
  if (!isRecord(message)) {
    return null;
  }

  const type = message.type;
  if (typeof type !== "string") {
    return null;
  }

  switch (type) {
    case "transfer:request": {
      const sessionId = getString(message.sessionId);
      const from = getString(message.from);
      const timestamp = getTimestamp(message.timestamp);
      if (!(sessionId && from && timestamp)) {
        return null;
      }

      return {
        type,
        sessionId,
        from,
        to: getString(message.to),
        fileName: getString(message.fileName),
        fileSize: getNumber(message.fileSize),
        note: getString(message.note),
        timestamp,
      };
    }
    case "transfer:accepted": {
      const sessionId = getString(message.sessionId);
      const by = getString(message.by);
      const timestamp = getTimestamp(message.timestamp);
      if (!(sessionId && by && timestamp)) {
        return null;
      }

      return { type, sessionId, by, timestamp };
    }
    case "transfer:rejected": {
      const sessionId = getString(message.sessionId);
      const by = getString(message.by);
      const timestamp = getTimestamp(message.timestamp);
      if (!(sessionId && by && timestamp)) {
        return null;
      }

      return {
        type,
        sessionId,
        by,
        reason: getString(message.reason),
        timestamp,
      };
    }
    case "transfer:progress": {
      const sessionId = getString(message.sessionId);
      const transferredBytes = getNumber(message.transferredBytes);
      const totalBytes = getNumber(message.totalBytes);
      const timestamp = getTimestamp(message.timestamp);
      if (
        !(
          sessionId &&
          transferredBytes !== undefined &&
          totalBytes !== undefined &&
          timestamp
        )
      ) {
        return null;
      }

      return {
        type,
        sessionId,
        transferredBytes,
        totalBytes,
        timestamp,
      };
    }
    case "transfer:completed": {
      const sessionId = getString(message.sessionId);
      const timestamp = getTimestamp(message.timestamp);
      if (!(sessionId && timestamp)) {
        return null;
      }

      return { type, sessionId, timestamp };
    }
    default:
      return null;
  }
};

export const updateTransferSessions = (
  sessions: TransferSession[],
  message: TransferMessage,
): TransferSession[] => {
  const existing = sessions.find((session) => session.id === message.sessionId);
  const fallbackTimestamp = resolveTimestamp(message.timestamp);
  const baseSession: TransferSession = existing ?? {
    id: message.sessionId,
    from: "Unknown",
    status: "requesting",
    lastUpdatedAt: fallbackTimestamp,
    requestedAt: fallbackTimestamp,
  };

  let nextSession = baseSession;

  switch (message.type) {
    case "transfer:request": {
      const requestedAt = resolveTimestamp(message.timestamp);
      nextSession = {
        ...baseSession,
        id: message.sessionId,
        from: message.from,
        to: message.to ?? baseSession.to,
        fileName: message.fileName ?? baseSession.fileName,
        fileSize: message.fileSize ?? baseSession.fileSize,
        note: message.note ?? baseSession.note,
        status: "requesting",
        requestedAt,
        lastUpdatedAt: requestedAt,
      };
      break;
    }
    case "transfer:accepted": {
      nextSession = {
        ...baseSession,
        status: "accepted",
        acceptedBy: message.by,
        lastUpdatedAt: resolveTimestamp(message.timestamp),
      };
      break;
    }
    case "transfer:rejected": {
      nextSession = {
        ...baseSession,
        status: "rejected",
        rejectedBy: message.by,
        rejectionReason: message.reason ?? baseSession.rejectionReason,
        lastUpdatedAt: resolveTimestamp(message.timestamp),
      };
      break;
    }
    case "transfer:progress": {
      nextSession = {
        ...baseSession,
        status: "in_progress",
        progress: {
          transferredBytes: message.transferredBytes,
          totalBytes: message.totalBytes,
        },
        lastUpdatedAt: resolveTimestamp(message.timestamp),
      };
      break;
    }
    case "transfer:completed": {
      nextSession = {
        ...baseSession,
        status: "completed",
        lastUpdatedAt: resolveTimestamp(message.timestamp),
      };
      break;
    }
    default:
      break;
  }

  return [
    nextSession,
    ...sessions.filter((session) => session.id !== nextSession.id),
  ];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const getNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const getTimestamp = (value: unknown): string | number | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return undefined;
};

const resolveTimestamp = (value: string | number): number => {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() : parsed;
};
