import { useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { IAgoraRTCClient, ILocalVideoTrack, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import axios from "axios";
import "./App.css";

const APP_ID = "6c4f19540f3a4fafb0356bc71c2e7cbc"; // 🔥 replace this
const client: IAgoraRTCClient = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

function App() {
  const [joined, setJoined] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ILocalVideoTrack | null>(null);

  const joinCall = async () => {
  const channel = "test";

  // 🔗 get token from backend
  const res = await axios.get(
    `http://localhost:5000/get-token?channel=${channel}`
  );

  const token = res.data.token;

  // join agora
  const uid = await client.join(APP_ID, channel, token, null);

  // 🔥 HANDLE EXISTING USERS (FIX)
  client.remoteUsers.forEach(async (user) => {
    if (user.videoTrack) {
      await client.subscribe(user, "video");
      user.videoTrack.play("remote-player");
    }
    if (user.audioTrack) {
      await client.subscribe(user, "audio");
      user.audioTrack.play();
    }
  });

  // listen for NEW users
  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
      user.videoTrack?.play("remote-player");
    }

    if (mediaType === "audio") {
      user.audioTrack?.play();
    }
  });

  // create tracks
  const [audioTrack, videoTrack] =
    await AgoraRTC.createMicrophoneAndCameraTracks();

  setLocalVideoTrack(videoTrack);

  // play local video
  videoTrack.play("local-player");

  // publish tracks
  await client.publish([audioTrack, videoTrack]);

  setJoined(true);
};

  const leaveCall = async () => {
    await client.leave();
    localVideoTrack?.close();

    setJoined(false);
  };

  return (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    <h2>Agora Video Call</h2>

    {!joined ? (
      <button onClick={joinCall}>Join Call</button>
    ) : (
      <button onClick={leaveCall}>Leave Call</button>
    )}

    <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
      {/* Local Video */}
      <div>
        <h4>My Video</h4>
        <div
          id="local-player"
          style={{ width: "300px", height: "200px", border: "1px solid black" }}
        ></div>
      </div>

      {/* Remote Video */}
      <div>
        <h4>Remote User</h4>
        <div
          id="remote-player"
          style={{ width: "300px", height: "200px", border: "1px solid black" }}
        ></div>
      </div>
    </div>
  </div>
);
}

export default App;