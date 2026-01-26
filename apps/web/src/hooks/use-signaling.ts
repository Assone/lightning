import { useCallback, useEffect, useMemo, useState } from "react";
import type {
	ConnectionOptions,
	Participant,
	SignalingAdapter,
	SignalingMessage,
} from "@lightning/signaling";
import { SignalingEventType } from "@lightning/signaling";
import type { RTCSignalingMessage } from "@lightning/signaling";
import type { Discard } from "@lightning/shared/types";

interface UseSignalingHandlers<T extends SignalingMessage> {
	onConnect?: () => void;
	onDisconnect?: () => void;
	onParticipantJoined?: (participant: Participant) => void;
	onParticipantLeave?: (participant: Participant) => void;
	onSignal?: (message: RTCSignalingMessage) => void;
	onMessage?: (message: T) => void;
}

interface UseSignalingOptions<T extends SignalingMessage>
	extends UseSignalingHandlers<T> {
	adapter: SignalingAdapter<T> | null;
	connection: ConnectionOptions | null;
	enabled?: boolean;
}

interface UseSignalingState<T extends SignalingMessage> {
	connected: boolean;
	participants: Participant[];
	lastMessage: T | null;
	lastSignal: RTCSignalingMessage | null;
	error: Error | null;
}

interface UseSignalingActions<T extends SignalingMessage> {
	connect: () => Promise<void>;
	disconnect: () => Promise<void>;
	sendOffer: (to: string, offer: RTCSessionDescriptionInit) => Promise<void>;
	sendAnswer: (to: string, answer: RTCSessionDescriptionInit) => Promise<void>;
	sendIceCandidate: (
		to: string,
		candidate: RTCIceCandidateInit
	) => Promise<void>;
	sendMessage: (to: string, message: Discard<T, "form">) => Promise<void>;
	adapter: SignalingAdapter<T> | null;
}

const createMissingAdapterError = (): Error =>
	new Error("Signaling adapter is not available.");

export const useSignaling = <T extends SignalingMessage>(
	options: UseSignalingOptions<T>
): UseSignalingState<T> & UseSignalingActions<T> => {
	const {
		adapter,
		connection,
		enabled = true,
		onConnect,
		onDisconnect,
		onParticipantJoined,
		onParticipantLeave,
		onSignal,
		onMessage,
	} = options;

	const [connected, setConnected] = useState<boolean>(
		adapter?.isConnected() ?? false
	);
	const [participants, setParticipants] = useState<Participant[]>(
		adapter?.getParticipants() ?? []
	);
	const [lastMessage, setLastMessage] = useState<T | null>(null);
	const [lastSignal, setLastSignal] = useState<RTCSignalingMessage | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const connectionOptions = useMemo<ConnectionOptions | null>(() => {
		if (!connection) {
			return null;
		}

		return {
			roomName: connection.roomName,
			participantName: connection.participantName,
		};
	}, [connection?.participantName, connection?.roomName]);

	useEffect(() => {
		if (!adapter) {
			setConnected(false);
			setParticipants([]);
			return;
		}

		const unsubscribeConnect = adapter.on(
			SignalingEventType.CONNECT,
			() => {
				setConnected(true);
				setParticipants(adapter.getParticipants());
				onConnect?.();
			}
		);

		const unsubscribeDisconnect = adapter.on(
			SignalingEventType.DISCONNECT,
			() => {
				setConnected(false);
				setParticipants([]);
				onDisconnect?.();
			}
		);

		const unsubscribeJoin = adapter.on(
			SignalingEventType.PARTICIPANT_JOINED,
			(participant) => {
				setParticipants(adapter.getParticipants());
				onParticipantJoined?.(participant);
			}
		);

		const unsubscribeLeave = adapter.on(
			SignalingEventType.PARTICIPANT_LEAVE,
			(participant) => {
				setParticipants(adapter.getParticipants());
				onParticipantLeave?.(participant);
			}
		);

		const unsubscribeSignal = adapter.on(
			SignalingEventType.SIGNAL,
			(message) => {
				setLastSignal(message);
				onSignal?.(message);
			}
		);

		const unsubscribeMessage = adapter.on(
			SignalingEventType.MESSAGE,
			(message) => {
				setLastMessage(message);
				onMessage?.(message);
			}
		);

		return () => {
			unsubscribeConnect();
			unsubscribeDisconnect();
			unsubscribeJoin();
			unsubscribeLeave();
			unsubscribeSignal();
			unsubscribeMessage();
		};
	}, [
		adapter,
		onConnect,
		onDisconnect,
		onMessage,
		onParticipantJoined,
		onParticipantLeave,
		onSignal,
	]);

	const connect = useCallback(async () => {
		if (!adapter) {
			throw createMissingAdapterError();
		}
		if (!connectionOptions) {
			throw new Error("Signaling connection options are missing.");
		}
		setError(null);
		await adapter.connect(connectionOptions);
	}, [adapter, connectionOptions]);

	const disconnect = useCallback(async () => {
		if (!adapter) {
			throw createMissingAdapterError();
		}
		setError(null);
		await adapter.disconnect();
	}, [adapter]);

	useEffect(() => {
		if (!adapter || !connectionOptions || !enabled) {
			return undefined;
		}

		let isActive = true;

		const runConnect = async () => {
			try {
				await adapter.connect(connectionOptions);
			} catch (caught) {
				if (!isActive) {
					return;
				}
				setError(caught instanceof Error ? caught : new Error(String(caught)));
			}
		};

		void runConnect();

		return () => {
			isActive = false;
			void adapter.disconnect();
		};
	}, [
		adapter,
		connectionOptions,
		enabled,
	]);

	const sendOffer = useCallback(
		async (to: string, offer: RTCSessionDescriptionInit) => {
			if (!adapter) {
				throw createMissingAdapterError();
			}
			await adapter.sendOffer(to, offer);
		},
		[adapter]
	);

	const sendAnswer = useCallback(
		async (to: string, answer: RTCSessionDescriptionInit) => {
			if (!adapter) {
				throw createMissingAdapterError();
			}
			await adapter.sendAnswer(to, answer);
		},
		[adapter]
	);

	const sendIceCandidate = useCallback(
		async (to: string, candidate: RTCIceCandidateInit) => {
			if (!adapter) {
				throw createMissingAdapterError();
			}
			await adapter.sendIceCandidate(to, candidate);
		},
		[adapter]
	);

	const sendMessage = useCallback(
		async (to: string, message: Discard<T, "form">) => {
			if (!adapter) {
				throw createMissingAdapterError();
			}
			await adapter.sendMessage(to, message);
		},
		[adapter]
	);

	return useMemo(
		() => ({
			connected,
			participants,
			lastMessage,
			lastSignal,
			error,
			connect,
			disconnect,
			sendOffer,
			sendAnswer,
			sendIceCandidate,
			sendMessage,
			adapter,
		}),
		[
			adapter,
			connected,
			connect,
			disconnect,
			error,
			lastMessage,
			lastSignal,
			participants,
			sendAnswer,
			sendIceCandidate,
			sendMessage,
			sendOffer,
		]
	);
};
