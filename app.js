var express = require("express");
var mongoose = require("mongoose"); 
var port = process.env.PORT || 8080;
var schema = mongoose.Schema({
    original: String,
    shortened: String
});

var app = express();


app.get("/", function(req, res){
    var db = mongoose.createConnection("mongodb://test:test@ds135800.mlab.com:35800/urlshortener");
db.on("error", function(err){
    
 if(err) console.log("connection error", err);
    
});
db.once("open", function(){
    var Url = mongoose.model("Url", schema);
    var test = new Url({
        original: "http://www.test.com",
        shortened: Math.floor(Math.random() * 9000) + 1000
    });
    console.log(test.original, test.shortened);
    test.save(function(err){
        if(err) throw err;
        console.log("Saved to DB");
        res.send("Successfully wrote to Database: " + test.original + " : " + test.shortened);
    });
})
/*.on("close", function(){
    console.log("Connection closed");
}); */
});

app.listen(port, function(){
    console.log("Server started on port: " + port);
})