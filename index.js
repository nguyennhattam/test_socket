var express = require("express");
var index = express();
index.get('/', function (req, res) {
    res.render('index');
})

module.exports = index;