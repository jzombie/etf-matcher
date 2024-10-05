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
  }

  async connectToRoom(roomName: string): Promise<void> {
    if (!validateTopic(roomName) || this.state.rooms[roomName]) {
      throw new Error(`Invalid or already connected room name: ${roomName}`);
    }

    const newRoom = new MQTTRoom(BROKER_URL, roomName);

    this.setState((prevState) => ({
      rooms: { ...prevState.rooms, [roomName]: newRoom },
    }));

    const handleConnectingStateChange = () => {
      this.setState((prevState) => ({
        isConnecting: Object.values(prevState.rooms).some(
          (room) => room.isConnecting,
        ),
      }));
    };

    newRoom.on("connectingstateupdate", handleConnectingStateChange);

    newRoom.on("connect", () => {
      this.setState((prevState) => ({
        connectedRooms: { ...prevState.connectedRooms, [roomName]: newRoom },
      }));

      this.calculateTotalParticipants();
    });

    newRoom.on("peersupdate", this.calculateTotalParticipants.bind(this));

    const handleSyncUpdate = () => {
      this.setState((prevState) => ({
        allRoomsInSync: Object.values(prevState.rooms).every(
          (room) => room.isInSync,
        ),
      }));
    };

    newRoom.on("syncupdate", handleSyncUpdate);

    newRoom.on("close", () => {
      this.setState((prevState) => {
        const { [roomName]: _, ...remainingRooms } = prevState.rooms;
        const { [roomName]: __, ...remainingConnectedRooms } =
          prevState.connectedRooms;
        return {
          rooms: remainingRooms,
          connectedRooms: remainingConnectedRooms,
        };
      });
      this.calculateTotalParticipants();
    });
  }

  async disconnectFromRoom(roomName: string): Promise<void> {
    const room = this.state.rooms[roomName];
    if (room) {
      await room.close();
    }
  }

  calculateTotalParticipants() {
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
    // Implement any initialization logic if needed
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
    this.setState({
      rooms: {},
      connectedRooms: {},
      isConnecting: false,
      allRoomsInSync: false,
      totalParticipantsForAllRooms: 0,
    });
  }
}
