function Room (uid){
  this.id = uid;
  this.players = [];
  this.curPlayer = -1;
}

Room.prototype = {
  restart: function() {
    this.curPlayer = -1;
  },

  addPlayer: function(player) {
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
      this.players.splice(1, 0, player);
    }

    console.log('addPlayer>> ' + player.role + " : " + player.ready);

    // re-update position
    for(var i = 0; i < this.players.length; i++) {
      this.players[i].position = i;
    }
  },

  removePlayer: function(position) {
    if(position >= 0 && position < this.players.length) {
      var splicePlayer = this.players.splice(position, 1);
      if(splicePlayer.role === "end") {
        this.players[this.players.length - 1].role = 'end';
      }

      // re-update position
      for(var i = 0; i < this.players.length; i++) {
        this.players[i].position = i;
      }
    }
  },

  arePlayersReady:function() {
      var player;
      for(var i = 0; i < this.players.length; i++) {
      player = this.players[i];
      console.log('arePlayersReady>> ' + player.role + " -- " + player.ready);
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
    return this.curPlayer == (this.players.length - 1);
  },

  fireNextPlayer:function() {
    this.curPlayer++;
    return this.players[this.curPlayer];
  }
}

module.exports = Room;
