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

io.on('connection', function(socket) {
    console.log(socket.id + ' had connected')

    socket.on('message', data => {
        data = JSON.parse(data)
        console.log(data)
    });

    socket.on('disconnect', () => {
        console.log(socket.id + ' has been disconnected')
    })
});


server.listen(port, () => console.log(`Server is running on port ${port}`));