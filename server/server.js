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

io.on('connection', socket => {
    console.log(`A user connected with socket id ${socket.id}`)


    //this is not ideal, everything is being broadcasted, should use ids.
    socket.on('offer', data => {
        socket.broadcast.emit('offer', data)
    });

    socket.on('answer', data => {
        socket.broadcast.emit('answer', data);
    });

    socket.on('candidate', data => {
        socket.broadcast.emit('candidate', data);
    });
    
    socket.on('disconnect', () => {
        console.log(socket.id + ' has been disconnected')
        socket.broadcast.emit('user-disconnected', socket.id)
    })
})

server.listen(port, () => console.log(`Server is running on port ${port}`));