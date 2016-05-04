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
app.use(express.static(path.join(__dirname, 'images')));



app.listen(8080);
console.log("Listening:");

app.get('/', function(request, response){
    response.render('homepage.html');
    //TODO: make the homepage prettier
});

app.post('/login', function(request, response){
	// var email = request.body.email;
	// console.log(email);
	//TODO: check to see if user's email is authorized in db
    console.log("login");
    console.log(request.body);
    var sql = 'SELECT clientId FROM people WHERE clientId=$1';
    var query = conn.query(sql, request.body.id, function(err, result) {
    	if(result.rows.length == 1) {
  			console.log('user is in people table');
			response.send({redirect: '/news'});
    	}
    	else {
    		var sql2 = 'SELECT email FROM authorized WHERE email=$1';
    		var query2 = conn.query(sql2, request.body.emailAddress, function(err, result) {
    			if(result.rows.length == 1) {
    				console.log('user is in authorized table, not people');
                    var addPerson = "INSERT into people VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
                    conn.query(addPerson,
                        [String(request.body.id),
                        String(request.body.firstName),
                        String(request.body.lastName),
                        null /* state */,
                        String(request.body.location.country.code),
                        String(request.body.industry),
                        String(request.body.headline),
                        String(request.body.publicProfileUrl),
                        String(request.body.pictureUrl)]).on('end', function() {
                            console.log ("successfully added person: " + request.body.firstName + " " + request.body.lastName);
                            response.send({redirect: '/news'});

                        });

    			}
    			else {
    				console.log('user is unauthorized');
    				response.send({redirect: '/unauthorized'});
    			}
    		});
    	}
    });
	// response.send({redirect: '/news'});
});

app.get('/news', function(request, response){
	response.render('news.html');
    console.log("here in news");
});

app.get('/unauthorized', function(request, response){
	response.render('unauthorized.html');
    console.log("here in unauthorized");
});