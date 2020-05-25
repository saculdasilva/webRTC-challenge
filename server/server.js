const credentials = {
    key: null,
    cert: null
};

const express = require('express');
const app = express();

let port;
let server;

if (credentials.key && credentials.cert) {
  const https = require('https');
  server = https.createServer(credentials, app);
  port = 443;
} else {
  const http = require('http');
  server = http.createServer(app);
  port = 3000;
}

const io = require('socket.io')(server);

server.listen(port, () => console.log(`Server is running on port ${port}`));