//requires
const express = require('express');
const app = express();

var fs = require('fs');
var privateKey  = fs.readFileSync('/etc/letsencrypt/live/webrtc.appflux.com.br/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/webrtc.appflux.com.br/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};

var https= require('https').Server(credentials,app);

var io = require('socket.io')(https);

const port = process.env.PORT || 3000;

// express routing
app.use(express.static('public'));

// signaling
io.on('connection', function (socket) {
    console.log('Usuário Conectado !');
    socket.on('create or join', function (room) {     
        var myRoom = io.sockets.adapter.rooms[room] || { length: 0 };
        var numClients = myRoom.length;
        if (numClients == 0) {
            socket.join(room);
	    //io.to(room).emit('teste de conexao',room);
	   socket.emit('created', room);
        } else if (numClients == 1) {
            socket.join(room);
            socket.emit('joined', room);
        } else {
            socket.emit('full', room);i
        }
    });

    socket.on('ready', function (room){
        socket.broadcast.to(room).emit('ready');
    });

    socket.on('candidate', function (event){
        socket.broadcast.to(event.room).emit('candidate', event);
    });

    socket.on('offer', function(event){
        socket.broadcast.to(event.room).emit('offer',event.sdp);
    });

    socket.on('answer', function(event){
        socket.broadcast.to(event.room).emit('answer',event.sdp);
    });

});

// listener
https.listen(port || 3000, function () {
    console.log('listening on', port);
});
