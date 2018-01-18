var fse = require('fs-extra');
var express = require("express");
var applog = express();

applog.write = function (data){
    var today = new Date();
    var dd = today.getDate();
    var mm = parseInt(today.getMonth()) + 1;
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var minute = today.getMinutes();
    var ss = today.getSeconds();
    var dir = __base + 'public/logs/' + yyyy + '/' + mm + '/';

    fse.ensureDir(dir)
    .then(() => {
        var logfile = 'log_' + yyyy + mm + dd + '.txt';
        var logger = fse.createWriteStream(dir + logfile , {
            flags: 'a' // 'a' means appending (old data will be preserved)
        });

        var logRefix = ' [' + hh + ':' + minute + ':' + ss + '] ';
        logger.end( logRefix + data);
    })
    .catch(err => {
        return false;
    });

    return true;
}

module.exports = applog;
