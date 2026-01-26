import type { Discard } from "../../shared/src/types";
import type { RTCSignalingMessage, SignalingMessageBuilder } from "./type";

export interface Participant {
	id: string;
	name: string;
}

export type SignalingMessage<T = string, P = never> = SignalingMessageBuilder<
	T,
	P
>;

// biome-ignore lint/suspicious/noConstEnum: use const enum for performance
export const enum SignalingEventType {
	CONNECT = "connect",
	DISCONNECT = "disconnect",
	PARTICIPANT_JOINED = "participant_joined",
	PARTICIPANT_LEAVE = "participant_leave",
	SIGNAL = "signal",
	MESSAGE = "message",
}

export interface SignalingEmitEventMap<T> {
	[SignalingEventType.CONNECT]: [];
	[SignalingEventType.DISCONNECT]: [];
	[SignalingEventType.PARTICIPANT_JOINED]: [Participant];
	[SignalingEventType.PARTICIPANT_LEAVE]: [Participant];
	[SignalingEventType.SIGNAL]: [RTCSignalingMessage];
	[SignalingEventType.MESSAGE]: [T];
}

export interface ConnectionOptions {
	roomName: string;
	participantName: string;
}

export interface SignalingAdapter<T extends SignalingMessage> {
	clientId: string;

	isConnected(): boolean;
	getParticipants(): Participant[];

	connect(options: ConnectionOptions): Promise<void>;
	disconnect(): Promise<void>;

	sendOffer(to: string, offer: RTCSessionDescriptionInit): Promise<void>;
	sendAnswer(to: string, answer: RTCSessionDescriptionInit): Promise<void>;
	sendIceCandidate(to: string, candidate: RTCIceCandidateInit): Promise<void>;
	sendMessage(to: string, message: Discard<T, "form">): Promise<void>;

	on<E extends SignalingEventType>(
		event: E,
		handler: (...args: SignalingEmitEventMap<T>[E]) => void
	): VoidFunction;
}
