var anyDB = require('any-db');

var fs = require('fs');
var csv = require('csv');

var conn = anyDB.createConnection('sqlite3://warshay.db');

// var checkPeople = "drop table if exists people";
// var checkPost = "drop table if exists post";
 var checkAuthorized = "drop table if exists authorized";

// var createPost = "CREATE TABLE post("
//     + "id TEXT,"
//     + "category TEXT,"
//     + "author TEXT,"
//     + "FOREIGN KEY(author) REFERENCES people(id)" 
//     + ")";
// var createPeople = "CREATE TABLE people("
//     + "id INTEGER PRIMARY KEY ,"
//     + "firstName TEXT,"
//     + "lastName TEXT,"
//     + "body TEXT,"
//     + "state TEXT,"
//     + "country TEXT,"
//     + "industry TEXT,"
//     + "headline TEXT,"
//     + "profileUrl TEXT,"
//     + "pictureUrl TEXT"
//     + ")";

var createAuthorizedPeople = "CREATE TABLE authorized("
    + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
    + "email TEXT"
    + ")";


// conn.query(checkPeople);
// conn.query(checkPost).on('end', function(row) {
//     console.log("made rooms table");
// });
//conn.query(checkAuthorized);

// conn.query(createPost);
// conn.query(createPeople).on('end', function() {
//     console.log("created People");
// });
conn.query(createAuthorizedPeople).on('end', function() {
    console.log("created AuthorizedPeople");
    main('authorized.csv', function(row){

      var query = "INSERT into authorized VALUES ($1, $2)";
        conn.query(query, [null, String(row)]).on('end', function() {
            console.log("added row" + row);
            });
        });
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



/////////////////////////////////

  // var q = conn.query('SELECT * FROM authorized');
  // q.on('row', function(row){
  //       console.log("row");
  //       alert("HELLO");
  //       response.send("ROW");
  //   });
  //   q.on('end', function(){
  //       // this code is executed after all rows have been returned
  //       console.log("DONE");
  //   });
