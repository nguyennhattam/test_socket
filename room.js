var MAX_PLAYER = 10;
function Room (uid){
  this.id = uid;
  this.players = [];
  this.curPlayer = -1;
  this.isStart = false;
}

Room.prototype = {
  reset: function() {
    this.curPlayer = -1;
    this.players = [];
    this.isStart = false;
  },

  restart:function() {
    this.curPlayer = -1;
    this.isStart = false;
  },

  size:function() {
    return this.players.length;
  },

  leaveRoom: function(position) {
    if(position >= 0 && position < this.players.length) {
      var splicePlayer = this.players[position];

      // remove player
      this.players.splice(position, 1);
      // update role
      if(splicePlayer.role === "end" && this.players.length > 1) {
        this.players[this.players.length - 1].role = 'end';
      }

      // re-update position
      for(var i = 0; i < this.players.length; i++) {
        this.players[i].position = i;
      }

      // re-update current player
      if(this.curPlayer > -1) {
        if(this.curPlayer >= position) {
          this.curPlayer = this.curPlayer - 1;
        }

        console.log('Room udpate curPlayer: ' + this.curPlayer);
      }
    }
  },

  arePlayersReady:function() {
      var player;
      for(var i = 0; i < this.players.length; i++) {
      player = this.players[i];
      console.log('arePlayersReady>> ' + player.id + " -- " + player.role + " -- " + player.ready);
      if((player.role === "player" || player.role === "end") && !player.ready) {
        return false;
      }
    }
    return true;
  },

  canStartGame:function() {
    console.log('canStartGame>> ' + this.curPlayer + " -- " + this.players.length + " -- " + this.arePlayersReady());
    return this.curPlayer == -1 && this.players.length >= 2 && this.arePlayersReady();
  },

  checkEndGame:function() {
    console.log('checkEndGame: ' + this.curPlayer +  " -- " + this.players.length);
    return this.curPlayer == (this.players.length - 1);
  },

  updateEndGame:function() {
    this.curPlayer = -1;
    this.isStart = false;

    // update ready of player
    var player;
    for(var i = 0; i < this.players.length; i++) {
      player = this.players[i];
      player.ready = false;
    }
  },

  findNextPlayer:function() {
    this.curPlayer++;
    if(this.curPlayer <= this.players.length - 1) {
      return this.players[this.curPlayer];
    } else {
      return null;
    }
  },

  isCurrentPlayer:function(player) {
    return this.curPlayer > -1 && this.curPlayer < this.players.length && player.id === this.players[this.curPlayer].id;
  },

  joinRoom:function(player) {
    var count = this.players.length;
    if(count < MAX_PLAYER) {
      if(this.players.length == 0) { // player is host / front fire-chain
        player.role = "front";
        player.ready = true;
        this.players.push(player);
      } else if(this.players.length == 1) { // player is end fire-chain
        player.role = "end";
        player.ready = false;
        this.players.push(player);
      } else { // normal player
        player.role = "player";
        player.ready = false;
        this.players.splice(this.players.length - 1, 0, player);
      }

      player.ready = true;

      console.log('addPlayer>> ' + player.id + " : " + this.id + " -- "+ player.role + " : " + player.ready);

      // re-update position
      for(var i = 0; i < this.players.length; i++) {
        this.players[i].position = i;
      }

      return true;
    } else {
      return false;
    }
  },
}

module.exports = Room;
