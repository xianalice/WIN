var express = require('express');
var bodyParser = require('body-parser');

var hogan = require('hogan.js')
var path = require('path');

var anyDB = require('any-db');
var engines = require('consolidate');
var app = express(); // your app's code here app.listen(8080);

var conn = anyDB.createConnection('sqlite3://warshay.db');

app.use(bodyParser.urlencoded( {
    extended: true
}));


app.engine('html', engines.hogan); // tell Express to run .html files through Hogan
app.set('views', __dirname + '/templates'); // tell Express where to find templates
app.use(express.static(path.join(__dirname, 'javascript')));


app.listen(8080);
console.log("Listening:");

app.get('/', function(request, response){
    response.render('homepage.html');
    //TODO: make the homepage prettier
});

app.post('/login', function(request, response){
	// var email = request.body.email;
	// console.log(email);
	var authorized = true; //actually initialize to false once we have db up
	//TODO: check to see if user's email is authorized in db
	// if(authorized) {
    console.log("login");
	response.send({redirect: '/news'});
	// }
});

app.get('/news', function(request, response){
	response.render('news.html');
    console.log("here in news");
});