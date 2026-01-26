import {
  REALTIME_LISTEN_TYPES,
  REALTIME_PRESENCE_LISTEN_EVENTS,
  REALTIME_SUBSCRIBE_STATES,
  type RealtimeChannel,
  type SupabaseClient,
} from "@supabase/supabase-js";
import {
  AbstractSignalingAdapter,
  SignalingInternalMessageType,
  type SignalingSendMessage,
} from "../base";
import type { ConnectionOptions, Participant } from "../interface";
import type { RTCSignalingMessage } from "../type";

interface SupabaseAdapterConfig {
  supabase: SupabaseClient;
  clientId: string;
}

export class SupabaseSignalingAdapter<T> extends AbstractSignalingAdapter<T> {
  override clientId: string;
  private readonly supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;

  constructor(config: SupabaseAdapterConfig) {
    super();
    this.supabase = config.supabase;
    this.clientId = config.clientId;
  }

  private handleSignalBroadcast(payload: {
    payload: RTCSignalingMessage;
  }): void {
    const message = payload.payload;
    if (message.to === this.clientId) {
      this.handleMessage(message);
    }
  }

  private handlePresenceSync(): void {
    const state = this.channel?.presenceState<Participant>();
    if (!state) {
      return;
    }

    this.participants = Object.entries(state).map(([id, presences]) => ({
      id,
      name: presences[0]?.name ?? "Unknown",
    }));
  }

  private handlePresenceJoin(key: string, newPresences: Participant[]): void {
    const participant: Participant = {
      id: key,
      name: newPresences[0]?.name ?? "Unknown",
    };
    this.handleMessage({
      type: SignalingInternalMessageType.JOIN,
      participant,
    });
  }

  private handlePresenceLeave(key: string, leftPresences: Participant[]): void {
    const participant: Participant = {
      id: key,
      name: leftPresences[0]?.name ?? "Unknown",
    };
    this.handleMessage({
      type: SignalingInternalMessageType.LEAVE,
      participant,
    });
  }

  override async connect(options: ConnectionOptions): Promise<void> {
    const { roomName, participantName } = options;

    this.channel = this.supabase.channel(`room:${roomName}`, {
      config: {
        broadcast: { ack: true, self: false },
        presence: { key: this.clientId },
      },
    });

    // Listen for signal messages
    this.channel
      .on(
        REALTIME_LISTEN_TYPES.BROADCAST,
        { event: "signal" },
        (payload: { payload: RTCSignalingMessage }) => {
          this.handleSignalBroadcast(payload);
        }
      )

      // Listen for presence sync (get all participants)
      .on(
        REALTIME_LISTEN_TYPES.PRESENCE,
        { event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC },
        () => {
          this.handlePresenceSync();
        }
      )

      // Listen for participant join
      .on<Participant>(
        REALTIME_LISTEN_TYPES.PRESENCE,
        { event: REALTIME_PRESENCE_LISTEN_EVENTS.JOIN },
        ({ key, newPresences }) => {
          this.handlePresenceJoin(key, newPresences);
        }
      )

      // Listen for participant leave
      .on<Participant>(
        REALTIME_LISTEN_TYPES.PRESENCE,
        { event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE },
        ({ key, leftPresences }) => {
          this.handlePresenceLeave(key, leftPresences);
        }
      );

    // Subscribe and track presence
    await new Promise<void>((resolve, reject) => {
      const currentChannel = this.channel;
      if (!currentChannel) {
        reject(new Error("Channel not initialized"));
        return;
      }

      currentChannel.subscribe(async (status: string) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          await currentChannel.track({
            id: this.clientId,
            name: participantName,
          });
          this.onConnected();
          resolve();
        } else if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          reject(new Error("Failed to connect to Supabase Realtime"));
        }
      });
    });
  }
  override disconnect(): Promise<void> {
    if (this.channel) {
      this.channel.untrack();
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.onDisconnected();

    return Promise.resolve();
  }

  override async sendImpl(message: SignalingSendMessage<T>): Promise<void> {
    await this.channel?.send({
      type: REALTIME_LISTEN_TYPES.BROADCAST,
      event: "signal",
      payload: message,
    });
  }
}
