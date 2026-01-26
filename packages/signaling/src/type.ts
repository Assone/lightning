interface SignalingMessagePart {
  to: string;
  form: string;
}

type SignalingMessageBuilderWithoutPayload<T> = SignalingMessagePart & {
  type: T;
};

type SignalingMessageBuilderWithPayload<T, P> = SignalingMessagePart & {
  type: T;
  payload: P;
};

export type SignalingMessageBuilder<T, P = never> = [P] extends [never]
  ? SignalingMessageBuilderWithoutPayload<T>
  : SignalingMessageBuilderWithPayload<T, P>;

// biome-ignore lint/suspicious/noConstEnum: use const enum for performance
export const enum RTCSignalingMessageType {
  OFFER = "offer",
  ANSWER = "answer",
  ICE_CANDIDATE = "ice_candidate",
}

export type RTCSignalingMessage =
  | SignalingMessageBuilder<
      RTCSignalingMessageType.OFFER,
      { offer: RTCSessionDescriptionInit }
    >
  | SignalingMessageBuilder<
      RTCSignalingMessageType.ANSWER,
      { answer: RTCSessionDescriptionInit }
    >
  | SignalingMessageBuilder<
      RTCSignalingMessageType.ICE_CANDIDATE,
      { candidate: RTCIceCandidateInit }
    >;
