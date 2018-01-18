$(function () {    
    $('body').append('<div id="adtima-notify-float-container" class="adtima-notify-float-container"><div class="data"></div></div>');
    var socket = io('https://notify.brand.zing.vn', {secure: true});
    socket.emit('roomConnect', adtimaNotifyConfig.domainName);      

    socket.on('welcomeMessage', function(data){
        $('#adtimaNotifyContent').html(data);
    });

    socket.on('notifyMessageLink', function(data){
        $('#adtima-notify-float-container').fadeIn(3000);
        var result = JSON.parse(data);
        var resultHTML = '<a href="' + result.url +'">' + result.text + '</a>';
        $('#adtima-notify-float-container .data').html(resultHTML);
        setTimeout(function () {
            $('#adtima-notify-float-container').fadeOut(3000);
            clearTimeout();
        }, 3000);
    });

    socket.on('notifyMessageLinkHaveImage', function(data){
        $('#adtima-notify-float-container').fadeIn(3000);
        $('#adtima-notify-float-container .data').addClass('has-img');
        var result = JSON.parse(data);
        var resultHTML = '<img src="' + result.image +'"/>' + '<a href="' + result.url +'">' + result.text + '</a>';
        $('#adtima-notify-float-container .data').html(resultHTML);
        setTimeout(function () {
            $('#adtima-notify-float-container').fadeOut(3000);
            clearTimeout();
        }, 3000);
    });
});
