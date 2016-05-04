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



app.listen(8000);
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
                    
                    //First, get the latitude and longitude from their location description using Google's geocode API

                    //Parse the address for URL format
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
                    //Assemble the options for the GET request
                    var options = {
                        host: 'maps.googleapis.com',
                        path: '/maps/api/geocode/json?address=' + finalAddress + '+CA&key=AIzaSyC8XzYK1_SBNem9WaJ-H1cZKvjejtGmRpk',
                    };
                    //The callback for the GET request
                    locationReceived = function(res){
                        console.log("in callback");
                        var str = '';
                        res.on('data', function(chunk){
                            console.log("chunk received");
                            str = str + chunk;
                        });

                        res.on('end', function(){
                            var jsonStr = JSON.parse(str);
                            var latitude = jsonStr.results[0].geometry.location.lat;
                            var longitude = jsonStr.results[0].geometry.location.lng;

                            //Now we can add the user into the people database
                            var addPerson = "INSERT into people VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
                            conn.query(addPerson,
                            [String(request.body.id),
                            String(request.body.firstName),
                            String(request.body.lastName),
                            latitude,
                            longitude,
                            String(request.body.location.country.code),
                            String(request.body.industry),
                            String(request.body.headline),
                            String(request.body.publicProfileUrl),
                            String(request.body.pictureUrl)]).on('end', function() {
                                console.log ("successfully added person: " + request.body.firstName + " " + request.body.lastName);
                                response.send({redirect: '/news'});
                            });
                        });
                    }
                    //Send the GET request to Google's geocode API
                    https.request(options, locationReceived).end();
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


//TODO: should be POST with First/Last name in request Body
app.get('/searchPeople', function(request, response) {
    var firstName = "Daniel"; //request.firstName
    var lastName = ""; //request.LastName

    var finalResultIds = [];
    var finalResults = [];
    var searchBoth = "SELECT * from people WHERE firstName=$1 AND lastName=$2"
    var q = conn.query(searchBoth, [
        firstName,
        lastName], function(error, result_bothNames) {
            if (result_bothNames.rows.length != 0) { // print all results
                for (i = 0; i < result_bothNames.rows.length; i++) {
                    var row_bothNames = result_bothNames.rows[i];
                    console.log("able to find result based on Both Names");
                    console.log(row_bothNames);
                }
            } else { // search individually for first and last name 
                console.log("searching last name");
                var searchLast = "SELECT * from people WHERE lastName=$1";
                var q2 = conn.query(searchLast, [lastName], function(error, result_lastName) {
                   for (i = 0; i < result_lastName.rows.length; i++) {
                        var row_lastName = result_lastName.rows[i];
                        console.log("able to find result based on Last Name");
                        console.log(row_lastName);
                        finalResults.push(row_lastName);
                        finalResultIds.push(row_lastName.clientId);
                   }
                   console.log("searching first Name");
                   var searchFirst = "SELECT * from people WHERE firstName=$1";
                   var q3 = conn.query(searchFirst, [firstName], function(error, result_firstName) {
                        for (i =0; i < result_firstName.rows.length; i++) {
                            var row_firstName = result_firstName.rows[i];
                            if (finalResultIds.indexOf(row_firstName.clientId) == -1) { // not in results
                                console.log ("able to find result based on first name");
                                console.log(row_firstName);
                                finalResultIds.push(row_firstName.clientId);
                                finalResults.push(row_firstName);
                            }
                        }
                   });
                });

            }

        });

});