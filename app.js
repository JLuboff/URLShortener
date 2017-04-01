var express = require("express");
var mongoose = require("mongoose"); 
var port = process.env.PORT || 8080;
var schema = mongoose.Schema({
    original: String,
    shortened: String
});

var app = express();

var db = mongoose.connect("mongodb://test:test@ds135800.mlab.com:35800/urlshortener");
db.on()


app.listen(port, function(){
    console.log("Server started on port: " + port);
})