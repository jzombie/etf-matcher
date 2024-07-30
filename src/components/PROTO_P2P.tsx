import React from "react";

import { Button } from "@mui/material";

import store from "@src/store";
import { Buffer } from "buffer";

import MQTTRoom from "@utils/MQTTRoom";

const BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL;

export default function ProtoP2P() {
  return (
    <div>
      <Button
        onClick={() => {
          // TODO: Refactor as necessary
          const room = new MQTTRoom(BROKER_URL, "test-room2");
          room.on("message", (data) => {
            console.log("message", data);
          });

          room.once("connect", () => {
            room.send("hello!");
            room.send({ foo: "bar" });
            room.send(store.getState(["tickerBuckets"]));
            room.send(Buffer.from("Hello"));

            room.on("peersupdate", () => {
              console.log("peers", room.peers);
            });
          });

          // setTimeout(() => {
          //   console.warn("Automatically closing");

          //   room.close();
          // }, 10000);
        }}
      >
        Proto::new MQTTRoom()
      </Button>
    </div>
  );

  // const { clientRef, selfId, messages, totalPeers } = useMQTTRoom();

  // const [messageContent, setMessageContent] = useState<string>("");

  // const handleSendMessage = () => {
  //   const client = clientRef.current;

  //   if (client) {
  //     client.publish(
  //       "test_room_etf_matcher/messages",
  //       JSON.stringify({ message: messageContent, peerId: selfId }),
  //       { qos: 1 },
  //     );
  //     console.log("Message sent: ", messageContent);
  //     setMessageContent(""); // Clear the input field after sending
  //   }
  // };

  // return (
  //   <div>
  //     <TextField
  //       label="Message Content"
  //       variant="outlined"
  //       value={messageContent}
  //       onChange={(e) => setMessageContent(e.target.value)}
  //     />
  //     <Button onClick={handleSendMessage}>Send Message</Button>
  //     <div>Total Peers: {totalPeers}</div>
  //     <div>
  //       <Typography variant="h6">Messages:</Typography>
  //       {messages.map((message, index) => (
  //         <Typography key={index} variant="body1">
  //           <strong>{message.peerId}:</strong> {message.content}
  //         </Typography>
  //       ))}
  //     </div>
  //   </div>
  // );
}
