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
        rooms.set(roomId, {
            clients: new Set(),
            settings: { anonymous: false },
            aliases: new Map()
        });
    }
    const room = rooms.get(roomId);
    room.clients.add(ws);

    // Assign an alias
    const alias = `User ${room.aliases.size + 1}`;
    room.aliases.set(ws, alias);

    console.log(`Client connected to room ${roomId} as ${alias}`);

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'chat') {
            const senderAlias = room.settings.anonymous ? 'Anonymous' : room.aliases.get(ws);
            const broadcastMessage = JSON.stringify({
                type: 'chat',
                alias: senderAlias,
                message: data.message
            });

            room.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(broadcastMessage);
                }
            });
        } else if (data.type === 'settings') {
            room.settings.anonymous = data.anonymous;
            const broadcastMessage = JSON.stringify({
                type: 'settings',
                anonymous: room.settings.anonymous
            });

            room.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(broadcastMessage);
                }
            });
        }
    });

    ws.on('close', () => {
        console.log(`Client disconnected from room ${roomId}`);
        room.clients.delete(ws);
        room.aliases.delete(ws);
        if (room.clients.size === 0) {
            rooms.delete(roomId);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
