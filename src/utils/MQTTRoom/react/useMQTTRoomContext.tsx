import { useContext } from "react";

import { MQTTRoomContext } from "./MQTTRoomProvider";

export default function useMQTTRoomContext() {
  const context = useContext(MQTTRoomContext);
  if (!context) {
    throw new Error(
      "useMQTTRoomContext must be used within a MQTTRoomProvider",
    );
  }
  return context;
}
