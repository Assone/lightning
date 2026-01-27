import { useCallback, useMemo, useState } from "react";
import {
  parseTransferMessage,
  type TransferMessage,
  type TransferSession,
  updateTransferSessions,
} from "@/lib/transfer-sessions";

interface UseTransferSessionsResult {
  sessions: TransferSession[];
  handleMessage: (message: unknown) => void;
  addMessage: (message: TransferMessage) => void;
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

  const addMessage = useCallback((message: TransferMessage) => {
    setSessions((prev) => updateTransferSessions(prev, message));
  }, []);

  const orderedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt),
    [sessions],
  );

  return {
    sessions: orderedSessions,
    handleMessage,
    addMessage,
  };
};
