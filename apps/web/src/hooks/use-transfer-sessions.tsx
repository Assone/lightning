import { useCallback, useMemo, useState } from "react";
import {
  parseTransferMessage,
  type TransferSession,
  updateTransferSessions,
} from "@/lib/transfer-sessions";

interface UseTransferSessionsResult {
  sessions: TransferSession[];
  handleMessage: (message: unknown) => void;
}

export const useTransferSessions = (): UseTransferSessionsResult => {
  const [sessions, setSessions] = useState<TransferSession[]>([]);

  const handleMessage = useCallback((message: unknown) => {
    const parsedMessage = parseTransferMessage(message);
    if (!parsedMessage) {
      return;
    }

    setSessions((prev) => updateTransferSessions(prev, parsedMessage));
  }, []);

  const orderedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt),
    [sessions]
  );

  return {
    sessions: orderedSessions,
    handleMessage,
  };
};
