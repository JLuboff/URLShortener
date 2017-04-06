"use strict";
var express = require("express");
var path = require("path");
var mongo = require("mongodb").MongoClient;
var port = process.env.PORT || 8080;
var num = 0;
var app = express();



function getRandNum(callback){
  num = Math.floor(Math.random() * 9000) + 1000;

  mongo.connect("mongodb://test:test@ds135800.mlab.com:35800/urlshortener", function(err, db){
    if(err) throw err;
    db.collection("Url").findOne({short_url: num}, {_id: 0, original_url: 1, short_url: 1}, function(err, data){
      if(err) throw err;
      //Checks if any data is find with the current number, if not we send back num inside our callback which goes inside our app.get
      if(data === null){
        callback(num);
      }
      //Else, a document is found, we rerun the function to create a new random number
      else {
        getRandNum(callback);
      }
      db.close();
    });
  });
}

app.get(/\/?(http:\/\/|https:\/\/)(.*)/, function(req, res){

  mongo.connect("mongodb://test:test@ds135800.mlab.com:35800/urlshortener", function(err, db){
    if(err) throw err;
    //We make a call to our getRandNum function which will return our random number after it has been checked
    getRandNum(function(returnNum){
      let insertUrl = {
        original_url: req.params[0] + req.params[1],
        short_url: num
      };
      db.collection("Url").insert(insertUrl, function(err, data){
        if(err) throw err;
        res.send({"original_url": insertUrl.original_url, "short_url" : req.protocol + "://" + req.get("host") + "/" + insertUrl.short_url });
        db.close();
      });
    });
  });
});

app.get(/\/\b\d{4}\b/, function(req, res){
  mongo.connect("mongodb://"+ process.env.username + ":" + process.env.password + "@ds135800.mlab.com:35800/urlshortener", function(err, db){
    if(err) throw err;
    let num = Number(req.url.slice(1));
    console.log(num);
    db.collection("Url").findOne({short_url: num}, {_id: 0, original_url: 1, short_url: 1}, function(err, data){
      if(err) throw err;
      if(data === null)
      res.send("Invalid input.");
      else
      res.redirect(data.original_url);
      db.close();
    });
  });
});

app.use(express.static("public"));

app.listen(port);
