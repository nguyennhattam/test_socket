var express = require("express");
var fse = require('fs-extra');
var request = require('request');
var multer = require('multer');
var gunzip = require('gunzip-file');
var dataLog = express();
var promise = require('promise');
var sha1 = require('sha1');
var form = express();

form.get('/', function (req, res) {    
    res.render('unitest/sendMessage');
})

module.exports = form;