var express = require("express");
var redis = require('redis');
var appRedis = express();

appRedis.set = function(key, data){   
    var redisClient = redis.createClient('6349', '10.30.46.20');
    redisClient.del(key, function(err, response){
        redisClient.set(key, data);
        redisClient.expire(key, 86400);                                    
    });    
}

appRedis.get = function(key, callback){
    var redisClient = redis.createClient('6349', '10.30.46.20');
    redisClient.on('ready', function(err, response){
        redisClient.get(key, function(err, reply) {                
            callback(reply);            
        }); 
    });   

}

module.exports = appRedis;