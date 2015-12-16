

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



app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));



app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 2008);





//This just renders the main page, all other rendering is done on the client side. 
app.get('/',function(req,res,next){
	
    res.render('data');
 
});

app.get('/crunch',function(req,res,next){

  console.log("Getting to query function on server, game on  Wayne!");
  console.log(req.query.search);
    
  //res.send(JSON.stringify(rows));
  
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
	console.log('Started on port 2008');
	
});

