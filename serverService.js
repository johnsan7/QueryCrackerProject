

/*Andrew Johnson, Web Development, Assignment 10

This code, var express through app.set('port',1976) is code from lectures and the class. The implementation that I have is the exact same as the lectures

Much of the basic syntax was learned in lectures, but I have my own implementation. The basic functions though were provided by the instructor on the server side (in this document). I adapted those for 
my purposes, changing what was necessary. 

*/
var express = require('express');

var app = express();

var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var session = require('express-session');

var request = require('request');

//This code connects to the database, this was given by the instructor. 
var mysql = require('mysql');

var pool = mysql.createPool({
  host  : 'localhost',
  user  : 'student',
  password: 'default',
  database: 'student'
});


app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));



app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 1976);



//This first service resets the table, not advisable in production environments. Professor wrote entire function basically

app.get('/reset-table',function(req,res,next){
  var context = {};
  pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    pool.query(createString, function(err){
      context.results = "Table reset";
      res.send("Table Reset");
    })
  });
});

//This just renders the main page, all other rendering is done on the client side. 
app.get('/',function(req,res,next){
	
    res.render('data');
 
});


//This sends the current table information to be drawn client side by drawTable. Note it sends the data, does not render the page. 
app.get('/tables',function(req,res,next){
//console.log("getting to tables function, should be sending back everything")
  var results = {};
  pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
//console.log("Got to after the mysql query");
	res.setHeader('Content-Type', 'application/json');
    
    res.send(JSON.stringify(rows));
  });
});

//This service receives requests to add things to the database and carries them out. Basic structure from professor Wolford. 

app.get('/insert',function(req,res,next){
//console.log("Getting into insert");
	  var context = {};
	  pool.query("INSERT INTO workouts (`name`,`reps`,`weight`,`date`,`lbs`) VALUES (?,?,?,?,?)", [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.lbs], function(err, result){
		if(err){
		  next(err);
		  return;
		}
//		console.log("Got past that insert stuff");
		context.results = "Inserted id " + result.insertId;
		res.send(context.results);
  });
});

//This function takes the update request. This is just the simple update and does not 
//support where they have not entered particular data. This is because the form that is presented to the user is already pre-populated with the existing data.
//For this function to get empty data, the user would have to have deleted the data, in such cases we assume they meant it to be empty. Basic structure from professor Wolford


app.get('/simple-update',function(req,res,next){
  var context = {};
  pool.query("UPDATE todo SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
    [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.lbs, req.query.subID,],
    function(err, result){
    if(err){
      next(err);
      return;
    }
//	console.log("Update successful -------------------------------------------------------------------------")
    context.results = "Updated " + result.changedRows + " rows.";
    res.send(context.results);
  });
});


//This deletes the row matching the id sent. Basic structure from professor Wolford

app.get('/delete',function(req,res,next){
//console.log("Getting to delete function");	
	var context = {};
	pool.query("DELETE FROM workouts WHERE id=?",
		[req.query.id],
		function(err, result){
		if(err){
		  next(err);
		  return;
		}
		context.results = "Updated " + 'one' + " rows."; //result.deletedRows 
		res.send(context.results);
  });
});


//This is my function, when I generate the update form, I have it fill in the existing data. This function fetches that data to make sure the form has the 
//Correct default values. 

app.get('/generate-update-form-data',function(req,res,next){
//console.log("Getting to request for form building data function");	

	pool.query("SELECT id, name, reps, weight, date, lbs FROM workouts WHERE id=? ",
		[req.query.id],
		function(err, rows, fields){
		if(err){
		  next(err);
		  return;
		}
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(rows));
		
  });
});



//These next two are right from the lectures

app.use(function(req,res)
{
	res.status(404);
	res.render('404');
	
});

app.use(function(err,req,res,next){
	res.type('plain/text');
	res.status(500);
	res.render('500');	
});




app.listen(app.get('port'), function(){
	console.log('Started on port 1976');
	
});

