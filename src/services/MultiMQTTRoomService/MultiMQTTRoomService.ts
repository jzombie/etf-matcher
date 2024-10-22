import { Store } from "@src/store";
import BaseStatePersistenceAdapter from "@src/store/BaseStatePersistenceAdapter";

import customLogger from "@utils/customLogger";
import getEnvVariable from "@utils/getEnvVariable";

import MQTTRoom from "./MQTTRoom";
import validateTopic from "./validateTopic";

export type MQTTRoomState = {
  rooms: Record<string, MQTTRoom>;
  connectedRooms: Record<string, MQTTRoom>;
  isConnecting: boolean;
  allRoomsInSync: boolean;
  totalParticipantsForAllRooms: number;
};

// TODO: On dispose, disconnect from all rooms (shouldn't ever need to be done)
export default class MultiMQTTRoomService extends BaseStatePersistenceAdapter<MQTTRoomState> {
  protected _autoReconnectAttempts: number = 0;
  protected _autoReconnectBaseDelay: number = 1000; // 1 second
  protected _autoReconnectPollingInterval: NodeJS.Timeout | null = null;
  protected _autoReconnectMaxDelay: number = 30000; // 30 seconds

  constructor(store: Store) {
    super(store, {
      rooms: {},
      connectedRooms: {},
      isConnecting: false,
      allRoomsInSync: false,
      totalParticipantsForAllRooms: 0,
    });

    window.addEventListener("online", this._attemptAutoReconnect.bind(this));
    window.addEventListener("focus", this._attemptAutoReconnect.bind(this));
    this.registerDisposeFunction(() => {
      window.removeEventListener(
        "online",
        this._attemptAutoReconnect.bind(this),
      );
      window.removeEventListener(
        "focus",
        this._attemptAutoReconnect.bind(this),
      );
    });
  }

  /**
   * The names of the rooms that are subscribed to but not connected.
   */
  get disconnectedSubscribedRoomNames(): string[] {
    const { subscribedMQTTRoomNames } = this._store.getState();
    const connectedRoomNames = Object.keys(this.state.connectedRooms);

    // Return the difference between subscribed rooms and connected rooms
    return subscribedMQTTRoomNames.filter(
      (roomName) => !connectedRoomNames.includes(roomName),
    );
  }

  async connectToDisconnectedSubscribedRooms(): Promise<void> {
    const connectPromises = this.disconnectedSubscribedRoomNames.map(
      (roomName) =>
        this.connectToRoom(roomName).catch((error) => {
          // TODO: Route to UI notification
          customLogger.warn(`Failed to connect to room: ${roomName}`, error);
          return Promise.reject(error); // Ensure the promise is rejected
        }),
    );

    const results = await Promise.allSettled(connectPromises);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const roomName = this.disconnectedSubscribedRoomNames[index];
        // TODO: Route to UI notification
        customLogger.warn(`Connection attempt failed for room: ${roomName}`);
      }
    });
  }

  protected _calculateBackoffDelay(): number {
    // Calculate the delay using exponential backoff
    return Math.min(
      this._autoReconnectMaxDelay,
      this._autoReconnectBaseDelay * Math.pow(2, this._autoReconnectAttempts),
    );
  }

  protected _scheduleAutoReconnectWithBackoff(): void {
    this._autoReconnectAttempts++;
    const delay = this._calculateBackoffDelay();
    customLogger.warn(`Scheduling reconnect attempt in ${delay}ms.`);

    if (this._autoReconnectPollingInterval) {
      this.clearTimeout(this._autoReconnectPollingInterval);
    }
    this._autoReconnectPollingInterval = this.setTimeout(
      () => this._attemptAutoReconnect(),
      delay,
    );
  }

  protected async _attemptAutoReconnect(): Promise<void> {
    if (this.isDisposed || !this.disconnectedSubscribedRoomNames.length) {
      return;
    }

    customLogger.debug("Attempting auto reconnect");
    if (!this.state.isConnecting) {
      await this.connectToDisconnectedSubscribedRooms();
    } else {
      this._scheduleAutoReconnectWithBackoff();
    }
  }

  async connectToRoom(roomName: string): Promise<void> {
    if (!validateTopic(roomName) || this.state.rooms[roomName]) {
      throw new Error(`Invalid or already connected room name: ${roomName}`);
    }

    const newRoom = new MQTTRoom(
      getEnvVariable("VITE_MQTT_BROKER_URL"),
      roomName,
    );

    this._store.addMQTTRoomSubscription(newRoom);

    // Register room with service
    this.setState((prevState) => ({
      rooms: { ...prevState.rooms, [roomName]: newRoom },
    }));

    newRoom.on(
      "connectingstateupdate",
      this._onRoomConnectingStateChange.bind(this),
    );

    // TODO: Handle
    newRoom.on("error", this._onRoomError.bind(this, newRoom));

    newRoom.on("connect", this._onRoomConnected.bind(this, newRoom));

    newRoom.on("peersupdate", this._calculateTotalParticipants.bind(this));

    newRoom.on("syncupdate", this._onRoomSyncUpdate.bind(this));

    newRoom.on("close", this._onRoomClosed.bind(this, newRoom));
  }

  protected _onRoomConnected(newRoom: MQTTRoom) {
    this._autoReconnectAttempts = 0; // Reset attempts on successful connection

    this._store.addMQTTRoomSubscription(newRoom);

    this.setState((prevState) => ({
      connectedRooms: {
        ...prevState.connectedRooms,
        [newRoom.roomName]: newRoom,
      },
    }));

    this._calculateTotalParticipants();
  }

  async disconnectFromRoom(
    roomName: string,
    unregisterSubscription = true,
  ): Promise<void> {
    const room = this.state.rooms[roomName];
    if (room) {
      if (unregisterSubscription) {
        // Unregister room subscription on *manual* disconnect
        this._store.removeMQTTRoomSubscription(room);
      }

      await room.close();
    }
  }

  protected _onRoomError(room: MQTTRoom, err: Error) {
    customLogger.error("MQTTRoom error", { err });
  }

  protected _onRoomClosed(room: MQTTRoom) {
    this.setState((prevState) => {
      // Destructure the room to be removed from the rooms object
      // `remainingRooms` contains all rooms except the disconnected one
      const { [room.roomName]: __, ...remainingRooms } = prevState.rooms;

      // Destructure the room to be removed from the connectedRooms object
      // `remainingConnectedRooms` contains all connected rooms except the disconnected one
      const { [room.roomName]: ___, ...remainingConnectedRooms } =
        prevState.connectedRooms;

      // Regardless of the reason for disconnection, schedule the next auto reconnect attempt
      // (if this room was explicitly disconnected it won't try to reconnect it)
      this._scheduleAutoReconnectWithBackoff();

      // Return the updated state with the disconnected room removed
      return { rooms: remainingRooms, connectedRooms: remainingConnectedRooms };
    });

    // Call `onRoomSyncUpdate` to determine if any additional state updates are
    // needed to be relayed to the UI
    this._onRoomSyncUpdate();
  }

  protected _onRoomConnectingStateChange() {
    this.setState((prevState) => ({
      isConnecting: Object.values(prevState.rooms).some(
        (room) => room.isConnecting,
      ),
    }));
  }

  protected _onRoomSyncUpdate() {
    const totalRooms = Object.keys(this.state.rooms).length;

    this.setState((prevState) => ({
      allRoomsInSync: !totalRooms
        ? false
        : Object.values(prevState.rooms).every((room) => room.isInSync),
    }));
  }

  /**
   * Calculates the total number of participants across all rooms.
   *
   * @remarks
   * This method iterates over all rooms and sums up the number of participants
   * by adding one for the room itself and the number of peers in each room.
   */
  protected _calculateTotalParticipants() {
    const totalParticipants = Object.values(this.state.rooms).reduce(
      (total, room) => {
        if (room.isConnected) {
          return total + 1 + room.peers.length;
        }
        return total;
      },
      0,
    );

    this.setState({ totalParticipantsForAllRooms: totalParticipants });
  }

  protected async _onReady(): Promise<void> {
    // TODO: Implement any initialization logic (perhaps determine if the worker has loaded)
  }

  protected async _onGetAllKeys(): Promise<(keyof MQTTRoomState)[]> {
    return Object.keys(this.state) as (keyof MQTTRoomState)[];
  }

  protected async _onGetAllValues(): Promise<
    Array<MQTTRoomState[keyof MQTTRoomState]>
  > {
    return Object.values(this.state);
  }

  protected async _onGetItem<K extends keyof MQTTRoomState>(
    key: K,
  ): Promise<MQTTRoomState[K] | undefined> {
    return this.state[key];
  }

  protected async _onSetItem<K extends keyof MQTTRoomState>(
    key: K,
    value: MQTTRoomState[K],
  ): Promise<void> {
    this.setState({ [key]: value });
  }

  protected async _onRemoveItem<K extends keyof MQTTRoomState>(
    key: K,
  ): Promise<void> {
    const { [key]: _, ...remainingState } = this.state;
    this.setState(remainingState as MQTTRoomState);
  }

  protected async _onClear(): Promise<void> {
    // TODO: Wipe the room states, then remove the store MQTT subscriptions
    throw new Error("`clear` is not currently implemented");
  }
}
