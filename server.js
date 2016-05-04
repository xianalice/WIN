var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
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
	//Check if the user is in the people table, which means they're authorized and have logged into the site before
    var sql = 'SELECT clientId FROM people WHERE clientId=$1';
    var query = conn.query(sql, request.body.id, function(err, result) {
    	if(result.rows.length == 1) {
  			console.log('user is in people table');

                    //TODO: PUT THIS CODE BACK WHERE IT BELONGS (upon authorized login, not in people yet)
                    var address = String(request.body.location.name);
                    var modifiedAddress = address.replace(/,/g, "");
                    var addressComponents = modifiedAddress.split(" ");
                    var finalAddress = "";
                    for(var i = 0; i < addressComponents.length; i++){
                        if(i != (addressComponents.length - 1)) {
                            finalAddress = finalAddress + addressComponents[i] + "+";
                        }
                        else {
                            finalAddress = finalAddress + addressComponents[i];
                        }
                    }

                    var options = {
                        host: 'maps.googleapis.com',
                        path: '/maps/api/geocode/json?address=' + finalAddress + '+CA&key=AIzaSyC8XzYK1_SBNem9WaJ-H1cZKvjejtGmRpk',
                    };
                    callback = function(response){
                        console.log("in callback");
                        var str = '';
                        response.on('data', function(chunk){
                            console.log("chunk received");
                            str = str + chunk;
                        });

                        response.on('end', function(){
                            console.log("API get request data");
                            console.log(str);
                        });
                    }
                    https.request(options, callback).end();
                    //END OF MISPLACED CODE



			response.send({redirect: '/news'});
    	}
        //If not, check if they're in the authorized table, which means they're allowed to see site content but haven't logged in before
    	else {
    		var sql2 = 'SELECT email FROM authorized WHERE email=$1';
    		var query2 = conn.query(sql2, request.body.emailAddress, function(err, result) {
                //If so, add their data to the people table and take them to the site content
    			if(result.rows.length == 1) {
    				console.log('user is in authorized table, not people');
                    // var address = String(request.body.location.name);
                    // var modifiedAddress = address.replace(/,/g, "");
                    // var addressComponents = modifiedAddress.split(" ");
                    // var finalAddress = "";
                    // for(var i = 0; i < addressComponents.length; i++){
                    //     if(i != (addressComponents.length - 1)) {
                    //         finalAddress = finalAddress + addressComponents[i] + "+";
                    //     }
                    //     else {
                    //         finalAddress = finalAddress + addressComponents[i];
                    //     }
                    // }

                    // var options = {
                    //     host: 'maps.googleapis.com',
                    //     path: '/maps/api/geocode/json?address=' + address + '+CA&key=AIzaSyC8XzYK1_SBNem9WaJ-H1cZKvjejtGmRpk'
                    //     method: 'GET'
                    // };
                    // callback = function(response){
                    //     console.log(response);
                    // }
                    // https.request(options, callback).end();

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
                //If the user is not in the authoirzed table or people table - take them to the unauthorized user page
    			else {
    				console.log('user is unauthorized');
    				response.send({redirect: '/unauthorized'});
    			}
    		});
    	}
    });
});

app.get('/news', function(request, response){
	response.render('news.html');
    console.log("here in news");
});

app.get('/unauthorized', function(request, response){
	response.render('unauthorized.html');
    console.log("here in unauthorized");
});