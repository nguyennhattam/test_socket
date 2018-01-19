var io;
var gameSocket;
var uid = require('uid');
var Room = require('./room');
/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;

    gameSocket.emit('connected', { message: "You are connected!" });
    gameSocket.emit('disconnect', { message: "You are disconnected!" });

    // Host Events
    gameSocket.on('host_create_game', hostCreateGame);
    gameSocket.on('host_start_game', hostStartGame);

    // Player Events
    gameSocket.on('player_join_game', playerJoinGame);
    gameSocket.on('player_ready', playerReady);

    // Playing Game
    gameSocket.on('fire_next', nextTurn);
}

///////////////////////////////////////////////////////////////////////////////////////
// HOST EVENT
//////////////////////////////////////////////////////////////////////////////////////
// host create room/game
function hostCreateGame() {
  // Create a unique Socket.IO Room
  var thisGameId = uid();

  // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
  this.emit('new_game_created', {'gameId': thisGameId, 'mySocketId': this.id});

  // set params
  this.gameId = thisGameId;

  // Join the Room and wait for the players
  this.join(thisGameId.toString());
  var ns = io.sockets.in(thisGameId);
  if(ns != undefined) {
    var room = new Room(thisGameId);
    ns.room = room;
    room.addPlayer(this);
  }
};

// host start game
function hostStartGame() {
  var ns = io.sockets.in(this.gameId);
  console.log('hostStartGame: >> ' + this.id + ' -- '+ this.gameId);
  if(this.role === 'front' && ns != undefined && ns.room != undefined) {
    if(ns.room.canStartGame())
    {
      ns.emit('game_start');

      var player = ns.room.fireNextPlayer();
      if(player) player.emit('fire', {'position': player.position});

      return;
    }
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

  // Look up the room ID in the Socket.IO manager object.
  var ns = io.sockets.in(data.gameId);
  // If the room exists...
  if( ns != undefined ) {
      // attach the socket id to the data object.
      data.mySocketId = sock.id;

      // Join the room
      sock.join(data.gameId);

      // set params
      sock.gameId = data.gameId;

      if(ns.room != undefined) {
        ns.room.addPlayer(this);
      }
      // Emit an event notifying the clients that the player has joined the room.
      io.sockets.in(data.gameId).emit('player_joined_room', data);

  } else {
      // Otherwise, send an error message back to the player.
      this.emit('player_error', {'message': "This room does not exist."});
  }
};

// player ready
function playerReady() {
  this.ready = true;
  io.sockets.in(this.gameId).emit('player_ready', {'message': "player ready! "});
};

// player complete fire
function nextTurn() {
  var ns = io.sockets.in(this.gameId);
  if(ns != undefined && ns.room != undefined) {
    if(ns.room.checkEndGame()) { // check end game
      ns.emit('end_game');
    } else {
      var player = ns.room.fireNextPlayer();
      if(player) player.emit('fire', {'position':player.position});
    }
 } else {
    this.emit('player_error', {'message': "This room does not exist."});
 }
}
///////////////////////////////////////////////////////////////////////////////////////
// Game logic
//////////////////////////////////////////////////////////////////////////////////////
