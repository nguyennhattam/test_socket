var express = require("express");
var appDate = express();

appDate.getDateArray = function(start, end){   
    var dateArray = new Array();
    var startDate = new Date(start);
    var endDate = new Date(end);
    while (startDate <= endDate) {
        dateArray.push(new Date (startDate));
        startDate.setDate(startDate.getDate() + 1);
    }
    return dateArray;   
}
module.exports = appDate;