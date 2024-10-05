import store from "@src/store";
import BaseStatePersistenceAdapter from "@src/store/BaseStatePersistenceAdapter";

import MQTTRoom from "./MQTTRoom";
import validateTopic from "./validateTopic";

const BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL;

export type MQTTRoomState = {
  rooms: Record<string, MQTTRoom>;
  connectedRooms: Record<string, MQTTRoom>;
  isConnecting: boolean;
  allRoomsInSync: boolean;
  totalParticipantsForAllRooms: number;
};

// TODO: On dispose, disconnect from all rooms (shouldn't ever need to be done)
export default class MultiMQTTRoomService extends BaseStatePersistenceAdapter<MQTTRoomState> {
  constructor() {
    super({
      rooms: {},
      connectedRooms: {},
      isConnecting: false,
      allRoomsInSync: false,
      totalParticipantsForAllRooms: 0,
    });

    // TODO: Don't even use store here, just register the service itself in the store, and bind the events there
    //
    // FIXME: This is assuming this service is instantiated before the store has
    // finished restoring the IndexedDB state. A better approach would be to watch
    // for the "isIndexedDBReady" state property and then proceed accordingly.
    // The underlying `StateEmitter` class could be extended with a once-like method
    // which looks at an existing state property as well as a condtion and either
    // runs it immediately or waits for the condition to be met.
    store.once("persistent-session-restore", () => {
      const { subscribedMQTTRoomNames } = store.getState([
        "subscribedMQTTRoomNames",
        "isIndexedDBReady",
      ]);

      for (const roomName of subscribedMQTTRoomNames) {
        this.connectToRoom(roomName);
      }
    });
  }

  async connectToRoom(roomName: string): Promise<void> {
    if (!validateTopic(roomName) || this.state.rooms[roomName]) {
      throw new Error(`Invalid or already connected room name: ${roomName}`);
    }

    const newRoom = new MQTTRoom(BROKER_URL, roomName);

    store.addMQTTRoomSubscription(newRoom);

    // Register room with service
    this.setState((prevState) => ({
      rooms: { ...prevState.rooms, [roomName]: newRoom },
    }));

    newRoom.on(
      "connectingstateupdate",
      this._onRoomConnectingStateChange.bind(this),
    );

    newRoom.on("connect", () => this._onRoomConnected(newRoom));

    newRoom.on("peersupdate", this._calculateTotalParticipants.bind(this));

    newRoom.on("syncupdate", this._onRoomSyncUpdate.bind(this));

    newRoom.on("close", () => this._onRoomDisconnected(newRoom));
  }

  async disconnectFromRoom(
    roomName: string,
    unregisterSubscription = true,
  ): Promise<void> {
    const room = this.state.rooms[roomName];
    if (room) {
      if (unregisterSubscription) {
        // Unregister room subscription on manual disconnect
        store.removeMQTTRoomSubscription(room);
      }

      await room.close();
    }
  }

  protected _onRoomConnected(newRoom: MQTTRoom) {
    store.addMQTTRoomSubscription(newRoom);

    this.setState((prevState) => ({
      connectedRooms: {
        ...prevState.connectedRooms,
        [newRoom.roomName]: newRoom,
      },
    }));

    this._calculateTotalParticipants();
  }

  protected _onRoomDisconnected(room: MQTTRoom) {
    store.removeMQTTRoomSubscription(room);

    this.setState((prevState) => {
      const { [room.roomName]: __, ...remainingRooms } = prevState.rooms;
      const { [room.roomName]: ___, ...remainingConnectedRooms } =
        prevState.connectedRooms;
      return { rooms: remainingRooms, connectedRooms: remainingConnectedRooms };
    });
  }

  protected _onRoomConnectingStateChange() {
    this.setState((prevState) => ({
      isConnecting: Object.values(prevState.rooms).some(
        (room) => room.isConnecting,
      ),
    }));
  }

  protected _onRoomSyncUpdate() {
    this.setState((prevState) => ({
      allRoomsInSync: Object.values(prevState.rooms).every(
        (room) => room.isInSync,
      ),
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

  protected async _handleReady(): Promise<void> {
    // TODO: Implement any initialization logic (perhaps determine if the worker has loaded)
  }

  protected async _handleGetAllKeys(): Promise<(keyof MQTTRoomState)[]> {
    return Object.keys(this.state) as (keyof MQTTRoomState)[];
  }

  protected async _handleGetAllValues(): Promise<
    Array<MQTTRoomState[keyof MQTTRoomState]>
  > {
    return Object.values(this.state);
  }

  protected async _handleGetItem<K extends keyof MQTTRoomState>(
    key: K,
  ): Promise<MQTTRoomState[K] | undefined> {
    return this.state[key];
  }

  protected async _handleSetItem<K extends keyof MQTTRoomState>(
    key: K,
    value: MQTTRoomState[K],
  ): Promise<void> {
    this.setState({ [key]: value });
  }

  protected async _handleRemoveItem<K extends keyof MQTTRoomState>(
    key: K,
  ): Promise<void> {
    const { [key]: _, ...remainingState } = this.state;
    this.setState(remainingState as MQTTRoomState);
  }

  protected async _handleClear(): Promise<void> {
    // TODO: Wipe the room states, then remove the store MQTT subscriptions
    throw new Error("`clear` is not currently implemented");
  }
}
