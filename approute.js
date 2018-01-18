var express = require("express");
var approute = express();

//modules
//gán route index
var index = require('./index');
approute.use('/', index);

//gán route unitest
var form = require('./unitest/form');
approute.use('/unitest', form);

module.exports = approute;