const peerConnections = {};
const config = {
    iceServers: [
        {
          "urls": "stun:stun.l.google.com:19302",
        },
        // {
        //   "urls": "turn:TURN_IP?transport=tcp",
        //   "username": "TURN_USERNAME",
        //   "credential": "TURN_CREDENTIALS"
        // }
    ]
};

const secured = (window.location.protocol === 'http:' ? false : true)
const socket = new WebSocket((secured ? "wss://" : "ws://") + window.location.host + "/ice");

socket.onopen = (event) => {
    console.log("on open", event);
}

socket.onmessage = (event) => {
    console.log("on message", event);

    const data = JSON.parse(event.data);

    if (data.type === "watcher" && data.id) {
        const peerConnection = new RTCPeerConnection(config);
        peerConnections[data.id] = peerConnection;
        console.log("  new peer connection added, data.id = ", data.id);
        console.log("  peer connection = ", peerConnection);

        let stream = videoElement.srcObject;
        stream.getTracks().forEach(track => {
            console.log("addTrack", track);
            peerConnection.addTrack(track, stream);
        });

        peerConnection.onicecandidate = event => {
            console.log("onicecandidate — id, event", data.id, event);
            if (event.candidate) {
                socket.send(JSON.stringify({type: "candidate", id: data.id, description: JSON.stringify(event.candidate)}));
            }
        };

        peerConnection
            .createOffer()
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => {
                console.log("emit offer — id, peerConnection.localDescription", data.id, peerConnection.localDescription);
                socket.send(JSON.stringify({type: "offer", id: data.id, description: JSON.stringify(peerConnection.localDescription)}));
            });

    } else if (data.type === "answer") {
        console.log("answer — id, description", data.id, data.description);
        const parsedDesc = JSON.parse(data.description);
        peerConnections[data.id].setRemoteDescription(parsedDesc);
    } else if (data.type === "candidate") {
        console.log("candidate — id, candidate", data.id, data.description);
        const parsedDesc = JSON.parse(data.description);
        //peerConnections[data.id].addIceCandidate(data.description);
        peerConnections[data.id].addIceCandidate(new RTCIceCandidate(parsedDesc));
    }
}

window.onunload = window.onbeforeunload = () => {
    console.log("onunload");
    socket.close();
};

// Get camera and microphone
const videoElement = document.querySelector("video");
const videoSelect = document.querySelector("select#videoSource");

videoSelect.onchange = getStream;

getStream()
    .then(getDevices)
    .then(gotDevices);

function getDevices() {
    return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
    window.deviceInfos = deviceInfos;
    for (const deviceInfo of deviceInfos) {
        const option = document.createElement("option");
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === "videoinput") {
            option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        }
    }
}

function getStream() {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    const videoSource = videoSelect.value;
    const constraints = {
        video: { deviceId: videoSource ? { exact: videoSource } : undefined }
    };
    return navigator.mediaDevices
        .getUserMedia(constraints)
        .then(gotStream)
        .catch(handleError);
}

function gotStream(stream) {
    window.stream = stream;
    videoSelect.selectedIndex = [...videoSelect.options].findIndex(
        option => option.text === stream.getVideoTracks()[0].label
    );
    videoElement.srcObject = stream;
    console.log("emit broadcaster");
    socket.send(JSON.stringify({type: "broadcaster"}));
}

function handleError(error) {
    console.error("Error: ", error);
}