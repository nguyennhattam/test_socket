var io;
var uid = require('uid');
var Room = require('./room');
var listRoom = {};
console.log('Start game app !');
/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function(sio, socket){
    io = sio;

    socket.timeoutId = -1;
    socket.emit('connected', { message: "You are connected!" });

    // disconnect
    socket.on('disconnect', playerDisconnect);

    // Host Events
    socket.on('host_create_game', hostCreateGame);
    socket.on('host_start_game', hostStartGame);

    // Player Events
    socket.on('player_join_game', playerJoinGame);
    socket.on('player_ready', playerReady);

    // Playing Game
    socket.on('next_turn', nextTurn);
}

///////////////////////////////////////////////////////////////////////////////////////
// HOST EVENT
//////////////////////////////////////////////////////////////////////////////////////
// host create room/game
function hostCreateGame() {
  if(this.gameId != undefined) {
    // if host can not start game
    this.emit('cancel_create_game', {'message': "Player has created game!"});
    return;
  }

  // Create a unique Socket.IO Room
  var thisGameId = uid();
  var room = createRoom(thisGameId);
  room.reset();

  // set params
  this.gameId = thisGameId;

  room.joinRoom(this);

  // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
  this.emit('new_game_created', {'gameId': thisGameId, 'mySocketId': this.id});
};

// host start game
function hostStartGame() {
  var room = getRoom(this.gameId);
  if(room && !room.isStart && room.canStartGame() && this.role === 'front') {
    broastcastRoom(this.gameId, 'game_start', {});
    var player = room.findNextPlayer();
    if(player) player.emit('fire', {'position': player.position});
    room.isStart = true;
    clearTimeout(player.timeoutId);
    player.timeoutId = setTimeout((sock) => {
      nextTurn(sock);
    }, 5000, player);
    return;
  }

  // if host can not start game
  this.emit('cancel_start_game', {'message': "Players is not ready!"});
};

///////////////////////////////////////////////////////////////////////////////////////
// PLAYER EVENT
//////////////////////////////////////////////////////////////////////////////////////
// player join game
function playerJoinGame(data) {
  // A reference to the player's Socket.IO socket object
  var sock = this;
  var gameId = data && data.gameId ? data.gameId : "";
  var room = getRoom(gameId);
  if(room && !room.isStart && room.joinRoom(sock)) {
    // set params
    sock.gameId = gameId;
    broastcastRoom(gameId, 'player_joined_room', {'socket':this.id})
  }
  else {
    // Otherwise, send an error message back to the player.
    sock.emit('player_error', {'message': "This room does not exist."});
  }
};

// player ready
function playerReady() {
  if(!this.ready) {
    this.ready = true;
    broastcastRoom(this.gameId, 'player_ready', {'message': "player ready! "});
  }
};

// player complete fire
function nextTurn(sck) {
  var sock;
  if(sck) {
    sock = sck;
    console.log('nextTurn by timeout ' + sck);

  } else {
    sock = this;
    clearTimeout(sock.timeoutId);

    console.log('nextTurn by player ' + sck);
  }

  var room = getRoom(sock.gameId);
  if(room && room.isStart && room.isCurrentPlayer(sock)) {
    if(room.checkEndGame()) {
      broastcastRoom(sock.gameId, 'end_game', {});
      room.updateEndGame();
    }
    else {
      var player = room.findNextPlayer();
      player.emit('fire', {'position':player.position});
      clearTimeout(player.timeoutId);
      player.timeoutId = setTimeout((sock) => {
        nextTurn(sock);
      }, 5000, player);
    }
  }
  else {
    sock.emit('next_turn_error', {'message': "Player is not call next_turn."});
  }
}

// player disconnect
function playerDisconnect() {
  clearTimeout(this.timeoutId);
  var room = getRoom(this.gameId);
  if(!room) return;

  if(room.isStart) { // room is starting
    if(room.isCurrentPlayer(this)) { // this player is firing
      // leave room
      room.leaveRoom(this.position);
      console.log('isCurrentPlayer>> ' + this.position);
      if(room.checkEndGame()) { // check end game
        // broastcast end game
        broastcastRoom(this.gameId, 'end_game', {});
        room.updateEndGame();
      } else { // not end game - find next player
        // find next player
        var player = room.findNextPlayer();
        player.emit('fire', {'position':player.position});
        clearTimeout(player.timeoutId);
        player.timeoutId = setTimeout((sock) => {
          nextTurn(sock);
        }, 5000, player);
        // broastcast player leave room
        broastcastRoom(this.gameId, 'player_leave_room', {'socket':this.id});
      }
    } else { // this player is not firing
      // leave room
      room.leaveRoom(this.position);
      // broastcast player leave room
      broastcastRoom(this.gameId, 'player_leave_room', {'socket':this.id});
    }

    if(room.size() == 0) {
      removeRoom(this.gameId);
    }
  } else { // room not start
    // leave room
    room.leaveRoom(this.position);

    if(this.role === "front") {
      broastcastRoom(this.gameId, 'release_room', {'message':'Host leave room!'});
      removeRoom(this.gameId);
    } else {
      // broastcast player leave room
      if(room.size() == 0) {
        removeRoom(this.gameId);
      } else {
        broastcastRoom(this.gameId, 'player_leave_room', {'socket':this.id});
      }
    }
  }
  console.log("playerDisconnect: " + Object.keys(listRoom));
}
///////////////////////////////////////////////////////////////////////////////////////
// Game logic
//////////////////////////////////////////////////////////////////////////////////////
function createRoom(roomId) {
  if(listRoom[roomId]) {
    return listRoom[roomId];
  } else {
    var room = new Room(roomId);
    listRoom[roomId] = room;
  }

  return listRoom[roomId];
}

function getRoom(roomId) {
  return listRoom[roomId];
}

function removeRoom(roomId) {
  delete listRoom[roomId];
}

function broastcastRoom(roomId, action, data) {
  var room = listRoom[roomId];
  if(room) {
    for (var i = 0; i < room.players.length; i++) {
      var player = room.players[i];
      data.position = player.position;
      data.role = player.role;
      player.emit(action, data);
    }
  }
}
