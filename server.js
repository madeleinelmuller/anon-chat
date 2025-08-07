const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

const rooms = new Map();

// Redirect to a new chat room
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('/:roomId', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

wss.on('connection', (ws, req) => {
    const roomId = req.url.slice(1);

    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }
    const room = rooms.get(roomId);

    // Notify existing clients about the new user
    room.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'user-joined', from: ws.id }));
        }
    });

    ws.id = uuidv4();
    room.add(ws);

    ws.send(JSON.stringify({ type: 'my-id', id: ws.id }));

    console.log(`Client ${ws.id} connected to room ${roomId}`);

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // Relay signaling messages to the appropriate client
        room.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                if (data.to && client.id === data.to) {
                    client.send(JSON.stringify({ ...data, from: ws.id }));
                }
            }
        });
    });

    ws.on('close', () => {
        console.log(`Client ${ws.id} disconnected from room ${roomId}`);
        room.delete(ws);
        // Notify other clients that this user has left
        room.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'user-left', from: ws.id }));
            }
        });

        if (room.size === 0) {
            rooms.delete(roomId);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
