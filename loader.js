var anyDB = require('any-db');

var fs = require('fs');
var csv = require('csv');

var conn = anyDB.createConnection('sqlite3://warshay.db');

var checkPeople = "drop table if exists people";
var checkPost = "drop table if exists posts";
var checkAuthorized = "drop table if exists authorized";
var checkKeywords = "drop table if exists keywords";

var createPosts = "CREATE TABLE posts("
    + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
    + "category TEXT,"
    + "author TEXT,"
    + "body TEXT,"
    + "firstName TEXT,"
    + "lastName TEXT, "
    + "FOREIGN KEY(firstName) REFERENCES people(firstName),"
    + "FOREIGN KEY(lastName) REFERENCES people(lastName),"
    + "FOREIGN KEY(author) REFERENCES people(id)" 
    + ")";
var createPeople = "CREATE TABLE people("
    + "clientId TEXT PRIMARY KEY,"
    + "firstName TEXT,"
    + "lastName TEXT,"
    + "latitude INTEGER,"
    + "longitude INTEGER,"
    + "country TEXT,"
    + "industry TEXT,"
    + "headline TEXT,"
    + "profileUrl TEXT,"
    + "pictureUrl TEXT"
    + ")";

var createAuthorizedPeople = "CREATE TABLE authorized("
    + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
    + "email TEXT"
    + ")";
var createKeywords = "CREATE TABLE keywords("
    + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
    + "postId INTEGER,"
    + "word TEXT,"
    + "FOREIGN KEY(postId) REFERENCES posts(id)"
    + ")";

conn.query(checkPeople);
conn.query(checkPost).on('end', function(row) {
    console.log("made rooms table");
});
conn.query(checkAuthorized);
conn.query(checkKeywords);

conn.query(createPosts);
conn.query(createPeople).on('end', function() {
    console.log("created People");
});
conn.query(createAuthorizedPeople).on('end', function() {
    console.log("created AuthorizedPeople");
    main('authorized.csv', function(row){
        var query = "INSERT into authorized VALUES ($1, $2)";
        conn.query(query, [null, String(row)]).on('end', function() {
            console.log("added row" + row);
        });
    });
});

conn.query(createKeywords).on('end', function() {
    console.log("added keywords table");
});


//For zipcodes.csv, from http://federalgovernmentzipcodes.us/

var fields = {
    0: 'email'
};


function main(file, callback){
    csv().from.stream(fs.createReadStream(file))
        .on('record', function(row, index){
            //console.log(row);
            // var row = transform(row);
            callback(row);
        });
}


module.exports = main;
