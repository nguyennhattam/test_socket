
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

// Import the Anagrammatix game file.
var game = require('./pepsi_game');
//io socket
io.on('connection', function (socket) {
  //console.log('client connected');
  game.initGame(io, socket);
});
