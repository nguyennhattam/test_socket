function preLoad() {
    $("body").addClass('load-animate');
    homeState();
}
window.addEventListener('load', preLoad);

$(".e-animate").each(function() {
    var el = $(this),
        transitionDelay = el.attr("data-transition-delay");
        animationDelay = el.attr("data-animation-delay");
    el.css('transition-delay', transitionDelay);
    el.css('animation-delay', animationDelay);
});

/* ==============================================
    click delay change url
    =============================================== */

$('.o-button').click(function (e) {
    e.preventDefault();                   // prevent default anchor behavior
    // var goTo = this.getAttribute("href"); // store anchor href
    $(this).addClass('action'); // add animation for mobile
    setTimeout(function(){
        // window.location = goTo;
        if($('.o-button').hasClass("action")) {
          $('.o-button').removeClass('action');
        };
    },500);
});

$('#modal-txt').on('show.bs.modal', function (e) {
  var isMember = getMember();
  if(isMember === true) return;
	var closeModal = function(){
		$('#modal-txt').modal('hide');
		$('.s-content-3').fadeOut();
		$('.s-video-w').fadeIn();
	};
	setTimeout(closeModal, 3000);
})

function showEnd() {
	$('.s-ending-w').fadeIn();
}

function animateEnd() {
	$(".bg-end").delay(600).fadeOut().queue(function() {
		$(".e-animate-logo").animate({
			top: "+=33%",
			left: "36%",
			width: "100px"
		}, 800, function() {
			$('.e-animate-lan').fadeIn(1000);
			$('.bl-sologun').delay(800).queue(function() {
				$(this).addClass('show');
				$(this).addClass('show');
			});
			$('.g-button').delay(1200).queue(function() {
				$(this).addClass('show');
			});
		});
	});
}
////////////////////////////////////////////////////////////////////////////////
// Sockets
////////////////////////////////////////////////////////////////////////////////
var conlan = document.getElementById('conlan');
var home = document.getElementById('home');
var host_room = document.getElementById('host_room');
var player_room = document.getElementById('player_room');

var player_ready = document.getElementById('player_ready');
var player_fire = document.getElementById('player_fire');
var end_game = document.getElementById('end_game');
var modal_txt = document.getElementById('modal-txt');
var delay_fire = document.getElementById('delay_fire');

var createBtn = document.getElementById('createBtn');
var joinBtn = document.getElementById('joinBtn');

var total_member = document.getElementById('total_member');

var readyBtn = document.getElementById('readyBtn');
var startBtn = document.getElementById('startBtn');
var copyBtn = document.getElementById('copyBtn');
var code_txt = document.getElementById('code_txt');
var code_input = document.getElementById('code_input');
var submitBtn = document.getElementById('submitBtn');

var video_container = document.getElementById('video_container');

// addEventListener
createBtn.addEventListener('click', function(e) {
  hostState();
});

joinBtn.addEventListener('click', function(e) {
  playerRoomState();
});

submitBtn.addEventListener('click', function(e) {
  r_id = code_input.value;
  if(r_id.length == 5) {
      connectSocket();
  }
  console.log('code_input: > ' + r_id);
  cheatVideo();
});

readyBtn.addEventListener('click', function(e) {
  cheatVideo();
  playerFireState();
});

startBtn.addEventListener('click', function(e) {
  if(socket.host) {
    socket.emit('host_start_game');
  }

  var isMember = getMember();
  if(!isMember) {
    updateMember();
    delay_fire.style.display = "none";
    video_container.style.display = 'block';
  }
});

// default screen
function homeState() {
  host_room.style.display = "none";
  player_room.style.display = "none";
  player_ready.style.display = "none";
  player_fire.style.display = "none";
  modal_txt.style.display = "none";
  end_game.style.display = "none";
}

function hostState() {
  removeEl(conlan);
  removeEl(home);
  // conlan.style.display = "none";
  // home.style.display = "none";
  host_room.style.display = "block";
  $('#footer').removeClass('stick');
  connectSocket();
}

function playerRoomState() {
  removeEl(conlan);
  removeEl(home);
  // conlan.style.display = "none";
  // home.style.display = "none";
  player_room.style.display = "block";
}

function playerReadyState() {
  removeEl(player_room);
  // player_room.style.display = "none";
  player_ready.style.display = "block";
}

function playerFireState() {
  $('#footer').addClass('stick');
  $('.s-wrapper').removeClass('home-page');
  $('.s-wrapper').addClass('game-page');
  removeEl(player_ready);
  removeEl(host_room);
  // player_ready.style.display = "none";
  // host_room.style.display = "none";
  player_fire.style.display = "block";

  if(socket.host) {
    var isMember = getMember();
    if(isMember === true) {
        removeEl(delay_fire);
        // delay_fire.style.display = "none";
        video_container.style.display = 'block';
        if(socket.host) {
          socket.emit('host_start_game');
        }
    } else {
      delay_fire.style.display = "block";
    }
  } else {
    removeEl(delay_fire);
    // delay_fire.style.display = "none";
    video_container.style.display = 'block';
  }
}

function endGameState() {
  removeEl(player_fire);
  // player_fire.style.display = "none";
  //conlan.style.display = "block";
  //$('.s-wrapper').removeClass('game-page');
  //$('.s-wrapper').addClass('home-page');

  end_game.style.display = "block";
  removeEl(document.getElementById('footer'));
  // document.getElementById('footer').display = 'none';

  showEnd();
  animateEnd();
}

function cheatVideo() {
  try{
    video.addEventListener('playing', onPlayingHDL);
    video.play();
  } catch(err) {
    alert("Autoplay Error!");
  }
}

function onPlayingHDL() {
  video.removeEventListener('playing', onPlayingHDL);
  video.pause();
}

  // server ads
	// var front  = 'https://adtima-video-tr.zadn.vn/2018/01/239b4134-39b1-4ece-977b-8a5cd88d0fd4.mp4';
	// var mid    = 'https://adtima-video-tr.zadn.vn/2018/01/52c8b7a9-491b-4b27-b4fc-308daa24d85e.mp4';
	// var end    = 'https://adtima-video-tr.zadn.vn/2018/01/8b49a1b7-1411-4a27-be09-0e831c5f937e.mp4';

  // server adtima
  var front  = 'https://streaming.interactive.brand.zing.vn/media/videos/firecrackers_s_1.mp4';
	var mid    = 'https://streaming.interactive.brand.zing.vn/media/videos/firecrackers_s_2.mp4';
	var end    = 'https://streaming.interactive.brand.zing.vn/media/videos/firecrackers_s_3.mp4';

	var url_string = window.location.href;
	var url = new URL(url_string);
	var r_id = url.searchParams.get("r_id");
	var video = document.getElementById('video');
	enableInlineVideo(video);

  function getMember() {
    return getCookie('member') === 'true';
  }

  function updateMember() {
    setCookie('member', 'true', 3600);
  }

  function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
  }

  function getCookie(c_name) {
      var i, x, y, ARRcookies = document.cookie.split(";");
      for (i = 0; i < ARRcookies.length; i++) {
          x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
          y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
          x = x.replace(/^\s+|\s+$/g, "");
          if (x == c_name) {
              return unescape(y);
          }
      }
  }

	function onCopy() {
		copyToClipboard(code_txt);
		// code_txt.select();
  	// document.execCommand("Copy");
		code_txt.style.display = "none";
		copyBtn.style.display = "none";
	}

  var socket;
  function connectSocket() {
    // socket = io('http://localhost/', {secure: true});
    socket = io('http://pepsitet.brand.zing.vn/', {secure: true});
    // connected
  	socket.on('connect', function() {
  		console.log('connected');
  		if(r_id == null || r_id == "") {
  			socket.emit('host_create_game');
  		}
  		else {
  			socket.emit('player_join_game', {
  				'gameId': r_id
  			});
  		}
  	});

  	// server message
  	socket.on('new_game_created', function(data){
  		video.src = front;
  		socket.host = true;
  		code_txt.innerHTML = data.gameId;
  		console.log('new_game_created: ' + JSON.stringify(data));
  	});

  	// server message
  	socket.on('player_joined_room', function(data){
  		console.log('player_joined_room: ' + JSON.stringify(data));

  		if(data.socket == data.player) {
  			socket.host = false;
  			//document.getElementById('readBtn').style.display='block';
  			if(data && data.role == 'end') {
  				video.src = end;
          socket.end = true;
  			} else {
  				video.src = mid;
  			}

        playerReadyState();
  		}

      // update position
      if(socket.host) {
        total_member.innerHTML = data.total;
      }
      else {
        document.getElementById('rank').innerHTML = data.position + 1;
      }
  	});

  	// server message
  	socket.on('fire', function(data){
  		console.log('fire: ' + JSON.stringify(data));
  		video.currentTime = 0;
  		video.muted = false;
  		video.play();
  		video.addEventListener('timeupdate', function () {
  			var del = Math.round((video.currentTime / video.duration) * 100);
  			var currentTime = video.currentTime;
  			if(del >= 95 && !video.callEnd) {
  				video.callEnd = true;
  				socket.emit('next_turn');
  			}
  		});
  		video.addEventListener('ended', function () {
  			video.callEnd = false;
          endGameState();
  		});
  	});

  	// server message
  	socket.on('end_game', function(data){
  		console.log('end_game: ' + JSON.stringify(data));
  	});

  	// server message
  	socket.on('player_error', function(data){
  		console.log('player_error: ' + JSON.stringify(data));
  	});

  	// server message
  	socket.on('player_ready', function(data){
  		console.log('player_ready: ' + JSON.stringify(data));
  	});

  	// server message
  	socket.on('game_start', function(data){
  		console.log('game_start: ' + JSON.stringify(data));
      playerFireState();
  	});

  	// server message
  	socket.on('cancel_start_game', function(data){
  		console.log('cancel_start_game: ' + JSON.stringify(data));
  	});

  	// server message
  	socket.on('player_leave_room', function(data){
  		console.log('player_leave_room: ' + JSON.stringify(data));
  		if(!socket.end && data && data.role == 'end') {
        socket.end = true;
  			video.src = end;
  		}
  	});

  	// server message
  	socket.on('release_room', function(data){
  		console.log('release_room: ' + JSON.stringify(data));
  	});

    // disconnect
  	socket.on('disconnect', function(){
  		console.log('disconnect');
  	});
  }

	function copyToClipboard(el) {

    // resolve the element
    el = (typeof el === 'string') ? document.querySelector(el) : el;

    // handle iOS as a special case
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {

        // save current contentEditable/readOnly status
        var editable = el.contentEditable;
        var readOnly = el.readOnly;

        // convert to editable with readonly to stop iOS keyboard opening
        el.contentEditable = true;
        el.readOnly = true;

        // create a selectable range
        var range = document.createRange();
        range.selectNodeContents(el);

        // select the range
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        el.setSelectionRange(0, 999999);

        // restore contentEditable/readOnly to original state
        el.contentEditable = editable;
        el.readOnly = readOnly;
    }
    else {
        el.select();
    }

    // execute copy command
    document.execCommand('copy');
}

function removeEl(el) {
  // resolve the element
  el = (typeof el === 'string') ? document.querySelector(el) : el;
  if(el && el.parentNode) el.parentNode.removeChild(el);
}
