import { useContext } from "react";

import { MQTTRoomContext } from "./MultiMQTTRoomProvider";

export default function useMultiMQTTRoomContext() {
  const context = useContext(MQTTRoomContext);
  if (!context) {
    throw new Error(
      "useMultiMQTTRoomContext must be used within a MultiMQTTRoomProvider",
    );
  }
  return context;
}
