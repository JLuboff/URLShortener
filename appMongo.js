"use strict";
var express = require("express");
var mongo = require("mongodb").MongoClient;
var port = process.env.PORT || 8080;
var num = 0;
var insertUrl;
var app = express();

function getRandNum(callback){
     num = Math.floor(Math.random() * 9000) + 1000;

    mongo.connect("mongodb://test:test@ds135800.mlab.com:35800/urlshortener", function(err, db){
        if(err) throw err;
        db.collection("Url").findOne({short_url: num}, {_id: 0, original_url: 1, short_url: 1}, function(err, data){
           if(err) throw err;
           if(data === null){
           callback(num);
           }
           else {
           getRandNum(callback);
           }
           db.close();
});
});
}

//app.get(/\/(.*)/, function(req, res){
app.get(/\/?(http:\/\/|https:\/\/)(.*)/, function(req, res){
     
mongo.connect("mongodb://test:test@ds135800.mlab.com:35800/urlshortener", function(err, db){
    if(err) throw err;
    getRandNum(function(returnNum){
    console.log("Num inside .get: " + num);
     insertUrl = {
        original_url: req.params[0] + req.params[1],
        short_url: num
    };
    console.log(insertUrl);

    db.collection("Url").insert(insertUrl, function(err, data){
        if(err) throw err;
        console.log("Saved to DB");
        res.send({"original_url": insertUrl.original_url, "short_url" : insertUrl.short_url });
        db.close();
    });
});
});
});

app.get(/\/\b\d{4}\b/, function(req, res){
    mongo.connect("mongodb://test:test@ds135800.mlab.com:35800/urlshortener", function(err, db){
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

app.listen(port);