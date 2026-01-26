import {
  type Participant,
  type RTCSignalingMessage,
  type SignalingAdapter,
  SignalingEventType,
} from "@lightning/signaling";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLatest } from "./use-latest";

interface UseSignalingOptions<T> {
  createAdapter: () => SignalingAdapter<T>;
  roomName: string;
  displayName: string;
  onSignal?: (message: RTCSignalingMessage) => void;
  onMessage?: (message: T) => void;
}

interface UseSignalingReturn<T> {
  participants: Participant[];
  isConnected: boolean;
  adapter: SignalingAdapter<T>;
  sendOffer: (target: string, offer: RTCSessionDescriptionInit) => void;
  sendAnswer: (target: string, answer: RTCSessionDescriptionInit) => void;
  sendIce: (target: string, candidate: RTCIceCandidateInit) => void;
  sendMessage: (target: string, message: T) => void;
}

/**
 * React hook for using a SignalAdapter
 */
export function useSignaling<T>({
  createAdapter,
  roomName,
  displayName,
  onSignal,
  onMessage,
}: UseSignalingOptions<T>): UseSignalingReturn<T> {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const adapterRef = useRef<SignalingAdapter<T> | null>(null);
  const onSignalRef = useLatest(onSignal);
  const onMessageRef = useLatest(onMessage);

  // Lazily create adapter once
  if (!adapterRef.current) {
    adapterRef.current = createAdapter();
  }

  const adapter = adapterRef.current;

  useEffect(() => {
    // Subscribe to events
    const unsubscribeConnect = adapter.on(SignalingEventType.CONNECT, () =>
      setIsConnected(true),
    );
    const unsubscribeDisconnect = adapter.on(
      SignalingEventType.DISCONNECT,
      () => setIsConnected(false),
    );
    const unsubscribeJoin = adapter.on(
      SignalingEventType.PARTICIPANT_JOINED,
      (participant) => {
        setParticipants((prev) => [...prev, participant]);
      },
    );
    const unsubscribeLeave = adapter.on(
      SignalingEventType.PARTICIPANT_LEAVE,
      (leftClientId) => {
        setParticipants((prev) => prev.filter((p) => p.id !== leftClientId.id));
      },
    );
    const unsubscribeSignal = adapter.on(
      SignalingEventType.SIGNAL,
      (message) => {
        onSignalRef.current?.(message);
      },
    );
    const unsubscribeMessage = adapter.on(
      SignalingEventType.MESSAGE,
      (message) => {
        onMessageRef.current?.(message);
      },
    );

    adapter.connect({ roomName, participantName: displayName }).then(() => {
      setParticipants(adapter.getParticipants());
    });

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeJoin();
      unsubscribeLeave();
      unsubscribeSignal();
      unsubscribeMessage();
      adapter.disconnect();
    };
  }, [adapter, roomName, displayName]);

  const sendOffer = useCallback(
    (target: string, offer: RTCSessionDescriptionInit) => {
      adapter.sendOffer(target, offer);
    },
    [adapter],
  );

  const sendAnswer = useCallback(
    (target: string, answer: RTCSessionDescriptionInit) => {
      adapter.sendAnswer(target, answer);
    },
    [adapter],
  );

  const sendIce = useCallback(
    (target: string, candidate: RTCIceCandidateInit) => {
      adapter.sendIceCandidate(target, candidate);
    },
    [adapter],
  );

  const sendMessage = useCallback(
    (target: string, message: T) => {
      adapter.sendMessage(target, message);
    },
    [adapter],
  );

  return {
    participants,
    isConnected,
    adapter,
    sendOffer,
    sendAnswer,
    sendIce,
    sendMessage,
  };
}
