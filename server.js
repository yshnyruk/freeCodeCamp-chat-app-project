import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import { error } from 'console';

const PORT = 3001;

const server = http.createServer((req, res) => {
    fs.readFile("./public/index.html", "utf-8", (err, data) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error while reading page:", err);
            return;
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
    })
})

const wss = new WebSocketServer({ server });

wss.on("connection", (socket, req) => {
    const username = new URL(req.url, "http://localhost").searchParams.get(
        "username",
    )
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: "system",
                text: `${username} joined`
            }))
        }
    })

    socket.on("message", (message) => {
        const messageObj = JSON.parse(message);
        const username = messageObj.username;
        const text = messageObj.text;

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "chat",
                    username,
                    text,
                }))
            }
        })
    })

    socket.on("close", () => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "system",
                    text: `${username} left`,
                }))
            }
        })
    })
})

server.listen(PORT, () => {
    console.log("Server running at localhost:", PORT);
})
