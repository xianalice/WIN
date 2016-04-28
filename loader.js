var anyDB = require('any-db');

var conn = anyDB.createConnection('sqlite3://warshay.db');

var checkPeople = "drop table if exists people";
var checkPost = "drop table if exists post";

var createPost = "CREATE TABLE post("
    + "id TEXT,"
    + "link TEXT,"
    + "publisher TEXT,"
    + "FOREIGN KEY(publisher) REFERENCES people(id)" 
    + ")";
var createPeople = "CREATE TABLE people("
    + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
    + "firstName TEXT,"
    + "lastName TEXT,"
    + "body TEXT"
    + ")";


conn.query(checkPeople);
conn.query(checkPost).on('end', function(row) {
    console.log("made rooms table");
});

conn.query(createPost);
conn.query(createPeople).on('end', function() {
    console.log("create People");
});



/////////////////////////////////

 var q = conn.query('SELECT * FROM people');
 q.on('row', function(row){
        console.log("row");
        alert("HELLO");
        response.send("ROW");
    });
    q.on('end', function(){
        // this code is executed after all rows have been returned
        console.log("DONE");
    });
