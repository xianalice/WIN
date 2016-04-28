var express = require('express');
var bodyParser = require('body-parser');

var hogan = require('hogan.js')
var path = require('path');

var anyDB = require('any-db');
var engines = require('consolidate');
var app = express(); // your app's code here app.listen(8080);

var conn = anyDB.createConnection('sqlite3://warshay.db');

app.use( bodyParser.urlencoded( {
    extended: true
} ) );


app.engine('html', engines.hogan); // tell Express to run .html files through Hogan
app.set('views', __dirname + '/templates'); // tell Express where to find templates
app.use(express.static(path.join(__dirname, 'javascript')));


app.listen(8080);
console.log("Listening:")
app.get('/', function(request, response) {
    console.log("here");
    response.render('news.html');
 
   
});