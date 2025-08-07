const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const anonymousCheckbox = document.getElementById('anonymous-checkbox');

const roomId = window.location.pathname.slice(1);
const ws = new WebSocket(`ws://${window.location.host}/${roomId}`);

let myId;
const peers = new Map();

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

ws.onopen = () => {
    console.log('Connected to signaling server');
};

ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'user-joined') {
        if (data.from === myId) return;
        createPeerConnection(data.from, true);
    } else if (data.type === 'user-left') {
        if (peers.has(data.from)) {
            peers.get(data.from).close();
            peers.delete(data.from);
        }
    } else if (data.type === 'offer') {
        if (data.from === myId) return;
        const peerConnection = createPeerConnection(data.from, false);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'answer', to: data.from, answer }));
    } else if (data.type === 'answer') {
        if (data.from === myId) return;
        const peerConnection = peers.get(data.from);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.type === 'ice-candidate') {
        if (data.from === myId) return;
        const peerConnection = peers.get(data.from);
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else if (data.type === 'my-id') {
        myId = data.id;
    }
};

function createPeerConnection(peerId, isInitiator) {
    const peerConnection = new RTCPeerConnection(configuration);
    peers.set(peerId, peerConnection);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({ type: 'ice-candidate', to: peerId, candidate: event.candidate }));
        }
    };

    if (isInitiator) {
        const dataChannel = peerConnection.createDataChannel('chat');
        setupDataChannel(dataChannel);
        peerConnection.createOffer()
            .then(offer => peerConnection.setLocalDescription(offer))
            .then(() => {
                ws.send(JSON.stringify({ type: 'offer', to: peerId, offer: peerConnection.localDescription }));
            });
    } else {
        peerConnection.ondatachannel = (event) => {
            const dataChannel = event.channel;
            setupDataChannel(dataChannel);
        };
    }

    return peerConnection;
}

function setupDataChannel(dataChannel) {
    dataChannel.onopen = () => {
        console.log('Data channel open');
    };

    dataChannel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        displayMessage(data.alias, data.message);
    };
}

function displayMessage(alias, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<span class="alias">${alias}:</span> ${message}`;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    if (message) {
        const alias = anonymousCheckbox.checked ? 'Anonymous' : `User ${myId.substring(0, 4)}`;
        const messageData = JSON.stringify({ alias, message });
        peers.forEach(peerConnection => {
            const dataChannel = peerConnection.channels.find(channel => channel.label === 'chat');
            if (dataChannel && dataChannel.readyState === 'open') {
                dataChannel.send(messageData);
            }
        });
        displayMessage(alias, message);
        messageInput.value = '';
    }
});
