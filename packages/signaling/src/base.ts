import {
  type ConnectionOptions,
  type Participant,
  type SignalingAdapter,
  type SignalingEmitEventMap,
  SignalingEventType,
} from "./interface";
import {
  type RTCSignalingMessage,
  RTCSignalingMessageType,
  type SignalingMessageBuilder,
} from "./type";

// biome-ignore lint/suspicious/noConstEnum: use const enum for performance
export const enum SignalingInternalMessageType {
  MESSAGE = "message",
  PARTICIPANTS = "participants",
  JOIN = "join",
  LEAVE = "leave",
}

type SignalingInternalMessage =
  | RTCSignalingMessage
  | SignalingMessageBuilder<SignalingInternalMessageType.MESSAGE, unknown>
  | {
      type: SignalingInternalMessageType.PARTICIPANTS;
      participants: Participant[];
    }
  | { type: SignalingInternalMessageType.JOIN; participant: Participant }
  | { type: SignalingInternalMessageType.LEAVE; participant: Participant };

export type SignalingSendMessage<T> =
  | SignalingMessageBuilder<SignalingInternalMessageType.MESSAGE, unknown>
  | RTCSignalingMessage
  | T;

export abstract class AbstractSignalingAdapter<T>
  implements SignalingAdapter<T>
{
  private readonly eventTarget = new EventTarget();
  protected participants: Participant[] = [];
  protected connected = false;

  abstract clientId: string;

  isConnected(): boolean {
    return this.connected;
  }

  getParticipants(): Participant[] {
    return [...this.participants];
  }

  abstract connect(options: ConnectionOptions): Promise<void>;
  abstract disconnect(): Promise<void>;

  sendOffer(to: string, offer: RTCSessionDescriptionInit): Promise<void> {
    return this.send({
      type: RTCSignalingMessageType.OFFER,
      form: this.clientId,
      to,
      payload: { offer },
    });
  }
  sendAnswer(to: string, answer: RTCSessionDescriptionInit): Promise<void> {
    return this.send({
      type: RTCSignalingMessageType.ANSWER,
      form: this.clientId,
      to,
      payload: { answer },
    });
  }
  sendIceCandidate(to: string, candidate: RTCIceCandidateInit): Promise<void> {
    return this.send({
      type: RTCSignalingMessageType.ICE_CANDIDATE,
      form: this.clientId,
      to,
      payload: { candidate },
    });
  }
  sendMessage(to: string, message: T): Promise<void> {
    return this.send({
      type: SignalingInternalMessageType.MESSAGE,
      form: this.clientId,
      to,
      payload: message,
    });
  }

  private emit<E extends SignalingEventType>(
    event: E,
    ...args: SignalingEmitEventMap<T>[E]
  ): void {
    this.eventTarget.dispatchEvent(
      new CustomEvent<SignalingEmitEventMap<T>[E]>(event, {
        detail: args,
      })
    );
  }

  on<E extends SignalingEventType>(
    event: E,
    handler: (...args: SignalingEmitEventMap<T>[E]) => void
  ): VoidFunction {
    const callback = (evt: Event) => {
      const customEvent = evt as CustomEvent<SignalingEmitEventMap<T>[E]>;

      handler(...customEvent.detail);
    };

    this.eventTarget.addEventListener(event, callback);

    return () => {
      this.eventTarget.removeEventListener(event, callback);
    };
  }

  protected onConnected(): void {
    this.connected = true;
    this.emit(SignalingEventType.CONNECT);
  }

  protected onDisconnected(): void {
    this.connected = false;
    this.participants = [];
    this.emit(SignalingEventType.DISCONNECT);
  }

  abstract sendImpl(message: SignalingSendMessage<T>): Promise<void>;

  protected send(message: SignalingSendMessage<T>): Promise<void> {
    if (!this.connected) {
      throw new Error("Signaling adapter is not connected.");
    }

    return this.sendImpl(message);
  }

  protected handleMessage(message: SignalingInternalMessage) {
    switch (message.type) {
      case SignalingInternalMessageType.PARTICIPANTS: {
        this.participants = message.participants;
        break;
      }
      case SignalingInternalMessageType.JOIN: {
        this.participants.push(message.participant);
        this.emit(SignalingEventType.PARTICIPANT_JOINED, message.participant);
        break;
      }
      case SignalingInternalMessageType.LEAVE: {
        this.participants = this.participants.filter(
          (p) => p.id !== message.participant.id
        );
        this.emit(SignalingEventType.PARTICIPANT_LEAVE, message.participant);
        break;
      }
      case SignalingInternalMessageType.MESSAGE: {
        this.emit(SignalingEventType.MESSAGE, message as T);
        break;
      }

      case RTCSignalingMessageType.ANSWER:
      case RTCSignalingMessageType.OFFER:
      case RTCSignalingMessageType.ICE_CANDIDATE: {
        this.emit(SignalingEventType.SIGNAL, message);
        break;
      }

      default: {
        break;
      }
    }
  }
}
