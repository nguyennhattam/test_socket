
var express = require("express");
var app = express();

app.use('/public', express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(function(req, res, next) {
  var allowedOrigins = ['http://localhost:3021/'];
  var origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

var sha1 = require('sha1');
var server = require('http').Server(app);
server = app.listen(3021);
var io = require('socket.io').listen(server);
io.origins('http://localhost:3021/');

//route
var appRoute = require('./approute');
app.use('/', appRoute);
console.log('Server start !');

var uid = require('uid');
var clientRoom = {};

function createRoom() {
  var room_id = uid();
  if(clientRoom[room_id]) {
    room_id = uid(8);
  }

  clientRoom[room_id] = {
    'room_id':room_id,
    'clients':[]
  };

  return room_id;
}

function removeRoom() {
  delete clientRoom[room_id];
}

function broastcastInRoom(room_id, data) {
  io.sockets.in(room_id).emit('server_emit', data);
}

function broastcastAll(room_id, data) {
  io.sockets.emit('server_emit', data);
}

//io socket
io.on('connection', function (socket) {
  console.log('user connected: >> ' + io.sockets.clients());
  socket.emit('server_emit', {
                                'action': 'user_connect',
                                'data': {
                                  'socket_id':socket.id
                                }
                              });

  // client_message
  socket.on('client_emit', function (data) {
    // console.log('client_emit: ' + JSON.stringify(data));
    if(data == null || data == "") {
      console.log('client_emit invalid: ' + socket.id);
      return;
    }

    switch(data.action) {
      case 'create_room':
        var room_id = createRoom();
        socket.join(room_id);//tạo room
        socket.room_id = room_id;
        socket.key = true;
        console.log(JSON.stringify(clientRoom[room_id]));
        clientRoom[room_id].clients.push(socket);
        socket.emit('server_emit', {
                                      'action': 'created_room',
                                      'data': {
                                        'room_id':room_id
                                      }
                                    });
      break;
      case 'join_room':
        var room_id = data.data && data.data.room_id ? data.data.room_id : "";
        if(clientRoom[room_id]) {
          socket.join(room_id);//tạo room
          socket.room_id = room_id;
          clientRoom[room_id].clients.push(socket);

          var size = clientRoom[room_id].clients.length;
          socket.node_id = size;

          // emit joined room
          socket.emit('server_emit', {
                                        'action': 'joined_room',
                                        'data': {
                                          'room_id':room_id,
                                          'node_id':size,
                                          'total': size
                                        }
                                      });
          // broascast all client in room
          broastcastInRoom(room_id, {
                                        'action': 'user_join_room',
                                        'data': {
                                          'socket_id':socket.id,
                                          'room_id':room_id,
                                          'node_id':size,
                                          'total': size
                                        }
                                    });
        } else {
          // emit joined room
          socket.emit('server_emit', {
                                        'action': 'joined_room',
                                        'data': {
                                          'error':'room_id is not exist!'
                                        }
                                      });
        }
      break;
      case 'start_game':
        if(socket.key) {
          // broascast all client in room
          broastcastInRoom(room_id, {
                                        'action': 'started_game'
                                    });
        }
      break;
      default:

      break;
    }
  });

  //////////////////////////////////////////
  socket.on('roomConnect', function (data) {
    console.log(data);
    var room = data;
    socket.join(data);//tạo room
    socket.Room = data;
    io.sockets.in(socket.Room).emit('welcomeMessage', 'Xin chào ' + socket.id);
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
    // socket.to(socket.bannerId).emit('exit');
  });
});
