"use strict";
var express = require("express");
var path = require("path");
var mongo = require("mongodb").MongoClient;
var port = process.env.PORT || 8080;
var num = 0;
var app = express();



var getRandNum = () => {
  return new Promise ( (resolve, reject) =>{
  num = Math.floor(Math.random() * 9000) + 1000;

  mongo.connect("mongodb://" + process.env.user + ":" + process.env.pass + "@ds135800.mlab.com:35800/urlshortener", function(err, db){
    if(err) throw err;
    db.collection("Url").findOne({short_url: num}, {_id: 0, original_url: 1, short_url: 1}, function(err, data){
      if(err) throw err;
      //Checks if any data is find with the current number, if not we send back num inside our callback which goes inside our app.get
      if(data === null){
        resolve(num);
      }
      //Else, a document is found, we rerun the function to create a new random number
      else {
        getRandNum();
      }
      db.close();
    });
  });
});
};

//Our get request when the user provides an http or https url to shorten
app.get(/\/?(http:\/\/|https:\/\/)(.*)/, function(req, res){

  mongo.connect("mongodb://" + process.env.user + ":" + process.env.pass + "@ds135800.mlab.com:35800/urlshortener", function(err, db){
    if(err) throw err;
    //We make a call to our getRandNum function which will return our random number after it has been checked
    getRandNum().then((num) => {
      let insertUrl = {
        original_url: req.params[0] + req.params[1],
        short_url: num
      };
      //Insert the insertUrl object into your database and then send the user the original and shortened urls
      db.collection("Url").insert(insertUrl, function(err, data){
        if(err) throw err;
        res.send({"original_url": insertUrl.original_url, "short_url" : req.protocol + "://" + req.get("host") + "/" + insertUrl.short_url });
        db.close();
      });
    });
  });
});

//Our get request when the user provides their 4 digit shortened url code
app.get(/\/\b\d{4}\b/, function(req, res){
  mongo.connect("mongodb://" + process.env.user + ":" + process.env.pass + "@ds135800.mlab.com:35800/urlshortener", function(err, db){
    if(err) throw err;
    //We get the number from the url removing the / and then look in our database for the record. We then use the redirect to send them to that website, or an error if the number is invalid.
    let num = Number(req.url.slice(1));
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

//For default page, we serve the public folder containing index.html
app.use(express.static("public"));

//For all other pages, we display an error providing a link back to the homepage
app.get("/*", function(req, res){
  res.send("Invalid input. Please provide either a proper URL beginning with http/https or a valid four digit number record. Please see <a href='./index.html'> The URL Emporium </a> for more instructions.");
});

app.listen(port);
