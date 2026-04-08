import dotenv from 'dotenv';
dotenv.config();

import http from "http";
import app from "./src/app.js";
import initSockets from "./src/sockets/index.js";

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
initSockets(server);

const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log(`AI Service HTTP & WebSocket running on port ${PORT}`);
});
