
var express = require("express");
var app = express();

app.use('/public', express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(function(req, res, next) {
  var allowedOrigins = ['https://fuztea.brand.zing.vn', 'https://notify.brand.zing.vn', 'https://interactive.brand.zing.vn', 'http://localhost:3021/', 'https://adtima-media-td.zadn.vn'];
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
// io.origins('*:*')
// io.origins('https://fuztea.brand.zing.vn https://notify.brand.zing.vn https://interactive.brand.zing.vn http://localhost:3021/ https://adtima-media-td.zadn.vn')

//tạm thời hardcode config vụ cho phép kết nối socket
var appList = {
  socket1: {
    domain: 'https://fuztea.brand.zing.vn',
    secretKey: 'n5f77b8hka929e1a08612d2c9c9256f67'
  },
  socket2: {
    domain: 'https://notify.brand.zing.vn',
    secretKey: 'r6f77b8hka929e108612d2e9c9256f67'
  },
  socket3: {
    domain: 'https://interactive.brand.zing.vn',
    secretKey: 'bcf77b8hka929e108612d2e9c9256f6ad'
  }
};

//root folder config
global.__base = __dirname + '/';
global.__serectKey = 'e5f77b8hka929e1a08612d2c9c9256fc5';

//load libs
global.systemLog = require('./applog');
global.appRedis = require('./libs/appRedis');
global.appDate = require('./libs/appDate');

//route
var appRoute = require('./approute');
app.use('/', appRoute);


//io socket
io.on('connection', function (socket) {
  console.log('user connected');
  systemLog.write('user connected: '+socket.id+'\r\n');
  // systemLog.write(socket.id);
  //////////////////////////////////////////game running///////////////////////////////////
  //Banner call to server
  socket.on('game_start', function (data) {

    socket.emit('id_game',socket.id);
  });
  //Control call to server
  socket.on('control_start', function (data) {

    socket.emit('control_connect');
    // socket.join(data.id);
    socket.bannerId = data.id;
    socket.to(data.id).emit('control_id',socket.id);
  });
  //control call server start game
  socket.on('control_press_play', function (data) {

    socket.to(data.id).emit('server_press_play');
  });
  //control call server press jump
  socket.on('control_press_jump', function (data) {

    socket.to(data.id).emit('server_press_jump');
  });
  //game die
  socket.on('game_die', function (data) {

    socket.to(data.id).emit('control_play_again');
  });
  //////////////////////////////////////////game running///////////////////////////////////
  //////////////////////////////////////////game shake///////////////////////////////////
  //Banner call to server
  socket.on('game_start_shake', function (data) {

    socket.emit('id_game_shake',socket.id);
  });
  //Control call to server
  socket.on('control_start_shake', function (data) {

    socket.emit('control_connect_shake');
    // socket.join(data.id);
    socket.bannerId = data.id;
    socket.to(data.id).emit('control_id_shake',socket.id);
  });
  //control call server press jump
  socket.on('control_shake', function (data) {

    socket.to(data.id).emit('server_shake');
  });
  //////////////////////////////////////////game shake///////////////////////////////////
  //////////////////////////////////////////game play video///////////////////////////////////
  //control call server play video
  socket.on('control_video_start', function (data) {
    socket.join(socket.id);
    socket.emit('control_start_id',socket.id);
  });
  socket.on('control_play_video', function (data) {
    // socket.broadcast.to(socket.id).emit('server_play_video');
    io.sockets.to(socket.id).emit('server_play_video');
  });
  socket.on('play_video_start', function (data) {
    socket.join(data);
  });
  //////////////////////////////////////////game play video///////////////////////////////////
  socket.on('roomConnect', function (data) {
    console.log(data);
    var room = data;
    socket.join(data);//tạo room
    socket.Room = data;
    io.sockets.in(socket.Room).emit('welcomeMessage', 'Xin chào ' + socket.id);
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
    systemLog.write('user disconnect: '+socket.id+'\r\n');
    // systemLog.write(socket.id);
    socket.to(socket.bannerId).emit('exit');
  });
});

//api
app.get('/send-link-text', function (req, res) {
  var domain = req.query.domain;
  var text = req.query.text;
  var url = req.query.url;
  var mac = req.query.mac;


  if (text != '' && url != '' && domain != '') {

    if (text.length < 100) {
      try {
        var secretKey = '';
        var getApp = Object.keys(appList).find(key => appList[key].domain === domain);
        secretKey = appList[getApp].secretKey;
        if (getApp != undefined) {

          var createMac = sha1(domain + text + url + secretKey);

          if (createMac == mac) {
            var item = { text: text, url: url };
            io.sockets.in(domain).emit('notifyMessageLink', JSON.stringify(item));
            return res.send({ status: 1, value: 'success' });
          }
          else {
              return res.send({ status: 0, value: createMac, mac: mac, url: url, domain: domain, text : text, sec : secretKey });
          }
        }
        else {
          return res.send({ status: 0, value: 'Domain invalid' });
        }
      }
      catch (err) {
        return res.send({ status: 0, value: err.message });
      }
    }
    else {
      return res.send({ status: 0, value: 'Text length max 100 charaters' });
    }

  }
  else {
    return res.send({ status: 0, value: 'Param invalid' });
  }
});

app.get('/send-link-have-image', function (req, res) {
  var domain = req.query.domain;
  var text = req.query.text;
  var url = req.query.url;
  var image = req.query.image;
  var mac = req.query.mac;


  if (text != '' && url != '' && domain != '' && image != '') {
    if (text.length < 100) {
      try {
        var getApp = Object.keys(appList).find(key => appList[key].domain === domain);
        var secretKey = '';
        secretKey = appList[getApp].secretKey;
        if (getApp != undefined) {
          var createMac = sha1(domain + text + url + image + secretKey);
          if (createMac == mac) {
            var item = { text: text, image: image, url: url };
            io.sockets.in(domain).emit('notifyMessageLinkHaveImage', JSON.stringify(item));
            return res.send({ status: 1, value: 'success' });
          }
          else {
            return res.send({ status: 0, value: createMac, mac: mac, url: url, domain: domain, text : text, sec: secretKey });
          }
        }
        else {
          return res.send({ status: 0, value: 'Domain invalid' });
        }
      }
      catch (err) {
        return res.send({ status: 0, value: err.message });
      }
    }
    else {
      return res.send({ status: 0, value: 'Text length max 100 charaters' });
    }
  }
  else {
    return res.send({ status: 0, value: 'Param invalid' });
  }
});
