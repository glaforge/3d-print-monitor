let peerConnection;
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

const video = document.querySelector("video");
console.log("video element", video);

socket.onmessage = (event) => {
    console.log("on message", event);
    const data = JSON.parse(event.data);
    if (data.type === "broadcaster") {
        console.log("broadcaster received, send watcher");
        socket.send(JSON.stringify({type: "watcher"}));
    } else if (data.type === "offer") {
        console.log("offer received");
        console.log("data description", data.description);
        const parsedDataDesc = JSON.parse(data.description);
        const updatedSignal = {...parsedDataDesc, sdp: parsedDataDesc.sdp + "\n"};
        const dataDescript = updatedSignal;

        peerConnection = new RTCPeerConnection(config);
            peerConnection
            .setRemoteDescription(parsedDataDesc)
            .then(() => peerConnection.createAnswer())
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => {
                console.log("emit answer — id, peerConnection.localDescription", data.id, peerConnection.localDescription)
                socket.send(JSON.stringify({type: "answer", id: data.id, description: JSON.stringify(peerConnection.localDescription)}));
            });
        peerConnection.ontrack = event => {
            console.log("ontrack — event", event);
            video.srcObject = event.streams[0];
            video.play();
        };
        peerConnection.onicecandidate = event => {
            console.log("onicecandidate — event.candidate", event.candidate);
            if (event?.candidate?.candidate) {
                console.log("send candidate")
                socket.send(JSON.stringify({type: "candidate", id: data.id, description: JSON.stringify(event.candidate)}));
            }
        };


    } else if (data.type === "candidate") {
        console.log("candidate — id, candidate", data.id, data.description);
        const candidate = JSON.parse(data.description);//.candidate;
        //console.log("    parsed candidate = ", candidate)
        peerConnection
            .addIceCandidate(new RTCIceCandidate(candidate))
            //.addIceCandidate(new RTCIceCandidate(parsed.candidate))
            //.addIceCandidate(new RTCIceCandidate(data.description))
            .catch(e => console.error(e));

    } else {
        console.log("Unknown event data", event.data, event);
    }
};

window.onunload = window.onbeforeunload = () => {
    console.log("onunload");
    socket.close();
    peerConnection.close();
};