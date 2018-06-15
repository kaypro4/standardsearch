var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var MongoClient = require('mongodb').MongoClient, assert = require('assert');

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


var url = process.env.MONGO_URL;

var header = "<html><head><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css'><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/flatly/bootstrap.min.css'><link rel='stylesheet' href='/style.css'><script src='https://code.jquery.com/jquery-2.2.4.min.js' integrity='sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=' crossorigin='anonymous'></script><script src='https://cdnjs.cloudflare.com/ajax/libs/mark.js/7.0.2/jquery.mark.min.js' type='text/javascript'></script><script src='/script.js' type='text/javascript'></script></head><body><h1>Search Fair Trade Standards</h1><div class='container'>";
var footer = "</div></body></html>";

app.get("/", function(request, response) {
  response.send(header + searchForm('') + footer);
});

app.post("/", function(request, response) {
  var keyword = request.body.query;
  var standard = request.body.standard;
  
  MongoClient.connect(url, function(err, database) {
    
    var collection = database.collection('standards2');
    
    if (standard !== 'all') {
      collection.find({ $and: [ {criteria: new RegExp(keyword,"i")}, {standard: new RegExp(standard,"i")} ] }).sort( { compliance_no: 1 } )
      .toArray(function(err, items) {
        response.send(pagelist(items,keyword,standard));
      })
    }else{
      collection.find({ $or: [ {criteria: new RegExp(keyword,"i")}, {tags: new RegExp(keyword,"i")} ] }).sort( { compliance_no: 1 } )
      .toArray(function(err, items) {
        response.send(pagelist(items,keyword,standard));
      })
    }
    
  });
  
});
 
function searchForm(term){
  var searchForm = "<form method='post'><div class='input-group'>" +
  "<input type='text' name='query' value='" + term + "' class='form-control'>" +
  "<span class='input-group-addon' style='width:0px; padding-left:0px; padding-right:0px; border:none;'></span>" +
  "<select name='standard' id='standard' class='form-control'><option value='all'>All</option><option value='aps'>APS</option><option value='fish'>Fish</option><option value='factory'>Factory</option></select>" +
  "<span class='input-group-btn'><button class='btn btn-default submitButton' type='submit'>Search</button></span>" +
  "</div></form>";
  
  return searchForm;
}

function pagelist(items,keyword,standard) {
  var result = header + searchForm(keyword);
  
  result = result + items.length + " items found that contain <strong>" + keyword + "</strong> in <strong>" + standard + "</strong><br /><br />";
  result = result + "<div class='context'>";
  items.forEach(function(item) {
    
    var itemstring = "<strong>" + item.standard + " Standard: " + item.compliance_no + "</strong>" +
    "<br />" + item.criteria +
    "<br /><br />Topic: " + item.tags + "<br /><br />";
      
    result = result + itemstring;
  });
  result = result + "</div><script>$('.context').mark('" + keyword + "');</script>";
  result = result + footer;
  
  return result;
}