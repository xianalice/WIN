//TODO: Implement post search by author (first, last)
//TODO: Possibly move calculateBounds outside of app.get calls - would require combining the 4 bounds (minlat, maxlat...) into one object to be returned

var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var hogan = require('hogan.js')
var path = require('path');
var anyDB = require('any-db');
var engines = require('consolidate');
var snowball = require('node-snowball');
var app = express(); // your app's code here app.listen(8080);

var conn = anyDB.createConnection('sqlite3://warshay.db');

app.use(bodyParser.urlencoded({
    extended: true
}));


app.engine('html', engines.hogan); // tell Express to run .html files through Hogan
app.set('views', __dirname + '/templates'); // tell Express where to find templates
app.use(express.static(path.join(__dirname, 'javascript')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'public')));

console.log(__dirname);


app.listen(8000);
console.log("Listening:");

app.get('/', function(request, response) {
    response.render('initialpage.html');
    //TODO: make the homepage prettier
});

app.post('/login', function(request, response) {
    //Check if the user is in the people table, which means they're authorized and have logged into the site before
    var sql = 'SELECT clientId FROM people WHERE clientId=$1';
    var query = conn.query(sql, request.body.id, function(err, result) {
        if (result.rows.length == 1) {
            console.log('user is in people table');
            response.send({
                redirect: '/homepage'
            });
        }
        //If not, check if they're in the authorized table, which means they're allowed to see site content but haven't logged in before
        else {
            var sql2 = 'SELECT email FROM authorized WHERE email=$1';
            var query2 = conn.query(sql2, request.body.emailAddress, function(err, result) {
                //If so, add their data to the people table and take them to the site content
                if (result.rows.length == 1) {
                    console.log('user is in authorized table, not people');

                    //First, get the latitude and longitude from their location description using Google's geocode API
                    var address = String(request.body.location.name);

                    getGeocodeFromLocation(address, addUser);

                    function addUser(geoInfo) {
                        //Now we can add the user into the people database with their lat/long info included
                        var latitude = geoInfo.results[0].geometry.location.lat;
                        var longitude = geoInfo.results[0].geometry.location.lng;
                        console.log("lat is " + latitude + " and long is " + longitude);
                        var addPerson = "INSERT into people VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
                        conn.query(addPerson, [String(request.body.id),
                            String(request.body.firstName),
                            String(request.body.lastName),
                            latitude,
                            longitude,
                            String(request.body.location.country.code),
                            String(request.body.industry),
                            String(request.body.headline),
                            String(request.body.publicProfileUrl),
                            String(request.body.pictureUrl)
                        ]).on('end', function() {
                            console.log("successfully added person: " + request.body.firstName + " " + request.body.lastName);
                            response.send({
                                redirect: '/homepage'
                            });
                        });
                    }
                }
                //If the user is not in the authoirzed table or people table - take them to the unauthorized user page
                else {
                    console.log('user is unauthorized');
                    response.send({
                        redirect: '/unauthorized'
                    });
                }
            });
        }
    });
});

app.get('/homepage', function(request, response) {
    response.render('homepage.html');
    console.log("here in homepage");
});

app.get('/unauthorized', function(request, response) {
    response.render('unauthorized.html');
    console.log("here in unauthorized");
});

app.get('/allPeople', function(request, response) {
    var query = "SELECT * from people";
    var q = conn.query(query, [], function(error, result) {
        var allPeople = [];
        for (var i = 0; i < result.rows.length; i++) {
            allPeople.push(result.rows[i]);
        }
        response.send({
            data: allPeople
        });
    });
});


//People search works with 3 different get requests: 
// 1) User has provided both Location and Name (done)
// 2) User provides just Location (done)
// 3) User provides just Name (done)

//The specific Get request is determined by the client depending on which fields in the advanced search bar they provided 

app.get('/searchPeopleByName', function(request, response) {
    var firstName = request.query.firstName;
    var lastName = request.query.lastName;

    var finalResults = [];
    var searchBoth = "SELECT * from people WHERE firstName=$1 AND lastName=$2";
    var searchEither = "SELECT * from people WHERE firstName=$1 OR lastName=$2";
    var q = conn.query(searchBoth, [
        firstName,
        lastName
    ], function(error, result_bothNames) {
        if (result_bothNames.rows.length != 0) { // print all results
            for (i = 0; i < result_bothNames.rows.length; i++) {
                var row_bothNames = result_bothNames.rows[i];
                console.log("able to find result based on Both Names");
                console.log(row_bothNames);
                finalReults.push(row_bothNames);
            }
            response.send({
                data: finalResults
            });
        } else { // search individually for first and last name 
              var q = conn.query(searchEither, [
                    firstName,
                    lastName
                ], function(error, result) {
                    for (var i = 0; i < result.rows.length; i++) {
                        finalResults.push(result.rows[i]);
                        console.log("found names");
                        console.log(result.rows[i]);
                    }
                    response.send({
                        data: finalResults
                    });
                });
            }
        });
});


app.get('/searchPeopleByLocation', function(request, response) {
    //TODO: replace location with actual location from request body
    var location = request.query.location;

    getGeocodeFromLocation(location, calculateBounds);

    function calculateBounds(geoInfo) {
        var lat = deg2rad(geoInfo.results[0].geometry.location.lat);
        var lon = deg2rad(geoInfo.results[0].geometry.location.lng);

        //TODO: make this mutable via user input?
        var halfSide = request.query.radius; //"radius" of the size of the bounding box

        //earth radius at the specified latitude
        var radius = earthRadius(lat);
        //radius of the parallel at the specified latitude
        var pRadius = radius * Math.cos(lat);
        var latMin = rad2deg(lat - halfSide / radius);
        var latMax = rad2deg(lat + halfSide / radius);
        var lonMin = rad2deg(lon - halfSide / pRadius);
        var lonMax = rad2deg(lon + halfSide / pRadius);
        var query = "SELECT * from people WHERE latitude >= $1 AND latitude <= $2 AND longitude >= $3 AND longitude <= $4";
        var result_people = [];
        var result_peopleId = [];
        conn.query(query, [
            latMin,
            latMax,
            lonMin,
            lonMax
        ], function(error, result) {
            for (var i = 0; i < result.rows.length; i++) {
                var row = result.rows[i];
                console.log("advanced geo");
                console.log(row);
                result_people.push(row); // TODO: send to client
                console.log("client id");
                console.log(row.clientId);
                result_peopleId.push(row.clientId);
            }
            response.send({
                data: result_people
            });
        });
    }
});

app.get('/searchPeopleByNameLocation', function(request, response) {
    //TODO: replace location and name with actual location from request body
    var location = request.query.location;
    var firstName = request.query.firstName;
    var lastName = request.query.lastName;

    getGeocodeFromLocation(location, calculateBounds);

    function calculateBounds(geoInfo) {
        var lat = deg2rad(geoInfo.results[0].geometry.location.lat);
        var lon = deg2rad(geoInfo.results[0].geometry.location.lng);

        //TODO: make this mutable via user input?
        var halfSide = request.query.radius; //"radius" of the size of the bounding box

        //earth radius at the specified latitude
        var radius = earthRadius(lat);
        //radius of the parallel at the specified latitude
        var pRadius = radius * Math.cos(lat);
        var latMin = rad2deg(lat - halfSide / radius);
        var latMax = rad2deg(lat + halfSide / radius);
        var lonMin = rad2deg(lon - halfSide / pRadius);
        var lonMax = rad2deg(lon + halfSide / pRadius);

        var goodResults = [];
        
        var locationPeople = "SELECT * from people WHERE latitude >= $1 AND latitude <= $2 AND longitude >= $3 AND longitude <= $4 AND (firstName=$5 OR lastName=$6)";
        conn.query(locationPeople, [
                latMin,
                latMax,
                lonMin,
                lonMax,
                firstName,
                lastName
            ], function(error, result) {
                for(var i = 0; i < result.rows.length; i++) {
                    goodResults.push(result.rows[i]);
                }
                response.send({data: goodResults});
            });
    }
});

app.post('/newPost', function(request, response) {
    console.log("in server, new post");
    console.log(request.body);
    var author = request.body.author;
    var firstName = request.body.firstName;
    var lastName = request.body.lastName;
    var category = request.body.category;
    var text = request.body.text; 
    var title = request.body.title;
    var time = Date.now();
    console.log("date: "  + time);


    var addPost = "INSERT into posts VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
    conn.query(addPost, [null,
        category,
        author,
        text,
        firstName,
        lastName,
        time,
        title
    ]).on('end', function() {
        console.log("added post");
        var getId = "select seq from sqlite_sequence where name=$1";
        conn.query(getId, ["posts"], function(err, res) {
            var id = res.rows[0].seq;
            var strippedText = removePunctuation(text);
            var textWords = strippedText.split(" ");
            console.log(textWords);
            for (var i = 0; i < textWords.length; i++) {
                var addWord = "INSERT into keywords VALUES ($1, $2, $3)";
                var w = snowball.stemword(textWords[i]);
                conn.query(addWord, [null,
                    id,
                    w
                ]).on('end', function() {
                    response.send({data: time});
                });
            }
        });
    });
});

app.get('/getAllPosts', function(request, response) {
    var category = request.query.category;
    console.log("getting all post with category: " + category)
    var q = "SELECT * from posts where category=$1 ORDER BY time DESC";
    var posts = [];
    conn.query(q, [category], function(err, res) {
        for (var i = 0; i<res.rows.length; i++) {
            console.log(res.rows[i]);
            posts.push(res.rows[i]);
        }

        response.send({data: posts});
    });
})

app.get('/searchPostsByKeyword', function(request, response) {
    console.log("in search posts");
    var keyword = request.query.keyword; 
    var category = request.query.category;
    var toSearch = snowball.stemword(removePunctuation(keyword));
    console.log("toSearch: " + toSearch);
   
    var searchWord = "SELECT postId FROM keywords WHERE word=$1";
    var result_posts = [];
    var result_posts_id = []; //list of unique post ids
    


    conn.query(searchWord, [toSearch], function(error, result) { //get the post Ids from keywords 
        console.log("length of result: ");
        console.log(result.rows.length);
        console.log(result);
        for (var i = 0; i < result.rows.length; i++) {
            var row = result.rows[i];
            var id = row.postId;
            if (result_posts_id.indexOf(id) == -1) { //if id not in result_posts_id
                result_posts_id.push(id);
            }
        }

        for (var i = 0; i < result_posts_id.length; i++) { //search for the actual posts given the post ids
            var searchPosts = "SELECT * FROM posts WHERE id=$1 AND category=$2";
            conn.query(searchPosts, [result_posts_id[i], category], function(err, res) {
                for (var j = 0; j < res.rows.length; j++) {
                    var post = res.rows[j];
                    console.log("post is ");
                    console.log(post);
                    result_posts.push(post);
                }

                response.send({data: result_posts});
            });
        }

    });
});

app.get('/searchPostsByAuthor', function(request, response) {
    var lastName = request.query.lastName;
    var firstName = request.query.firstName;
    var category = request.query.category;

    var finalPosts = [];

    var queryBoth = "SELECT * FROM posts WHERE category=$1 AND firstName=$2 AND lastName=$3";
    var queryEither = "SELECT * FROM posts WHERE category=$1 AND (firstName=$2 OR lastName=$3)";
    var q = conn.query(queryBoth, [
            category,
            firstName,
            lastName
        ], function(error, result) {
            if(result.rows.length > 0) {
                console.log("post results for both names match");
                for(var i = 0; i < result.rows.length; i++) {
                    finalPosts.push(result.rows[i]);
                    console.log(result.rows[i]);
                }
                response.send({data: finalPosts});
            }
            else {
                conn.query(queryEither, [
                        category,
                        firstName,
                        lastName
                    ], function(err, res) {
                        console.log("post results for one name match");
                        for(var j = 0; j < res.rows.length; j++) {
                            finalPosts.push(res.rows[j]);
                            console.log(res.rows[j]);
                        }
                        response.send({data: finalPosts});
                    });
            }
        });
});

function getGeocodeFromLocation(address, callback) {
    //Parse the address for URL format
    var modifiedAddress = address.replace(/,/g, "");
    var addressComponents = modifiedAddress.split(" ");
    var finalAddress = "";
    for (var i = 0; i < addressComponents.length; i++) {
        if (addressComponents[i] != "Greater" && addressComponents[i] != "Area") {
            if (i != (addressComponents.length - 1)) {
                finalAddress = finalAddress + addressComponents[i] + '+';
            } else {
                finalAddress = finalAddress + addressComponents[i];
            }
        }
    }
    console.log("final address is " + finalAddress);
    //Assemble the options for the GET request
    console.log('/maps/api/geocode/json?address=' + finalAddress + '&key=AIzaSyC8XzYK1_SBNem9WaJ-H1cZKvjejtGmRpk');
    var options = {
        host: 'maps.googleapis.com',
        path: '/maps/api/geocode/json?address=' + finalAddress + '&key=AIzaSyC8XzYK1_SBNem9WaJ-H1cZKvjejtGmRpk',
    };
    //The callback for the GET request
    locationReceived = function(res) {
            console.log("in locationReceived");
            var str = '';
            res.on('data', function(chunk) {
                console.log("chunk received");
                str = str + chunk;
            });

            res.on('end', function() {
                var jsonStr = JSON.parse(str);
                console.log("returned loc is ");
                console.log(jsonStr.results[0].geometry);
                callback(jsonStr);
            });
        }
        //Send the GET request to Google's geocode API
    https.request(options, locationReceived).end();
}

function removePunctuation(string) {
    return string.replace(/[.,\/#!$%\^&\*;:{}=\-_'~()]/g, "");
}

function deg2rad(degrees) {
    return Math.PI * degrees / 180.0;
}

function rad2deg(radians) {
    return 180.0 * radians / Math.PI;
}

function earthRadius(lat) {
    var majorAxis = 3963.19;
    var minorAxis = 3949.9;
    var An = majorAxis * majorAxis * Math.cos(lat);
    var Bn = minorAxis * minorAxis * Math.sin(lat);
    var Ad = majorAxis * Math.cos(lat);
    var Bd = minorAxis * Math.sin(lat);
    return Math.sqrt((An * An + Bn * Bn) / (Ad * Ad + Bd * Bd));
}
