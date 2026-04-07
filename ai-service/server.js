require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const initSockets = require("./src/sockets/index");

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
initSockets(server);

const PORT = process.env.PORT || 4001;

server.listen(PORT, () => {
    console.log(`AI Service HTTP & WebSocket running on port ${PORT}`);
});
