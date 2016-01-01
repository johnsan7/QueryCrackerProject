

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
app.set('port', 2011);


var userCounter = 0; //This is just a primitive use counter for now


//This just renders the main page, all other rendering is done on the client side. 
app.get('/',function(req,res,next){
	
    res.render('data');
 
});

app.get('/crunch',function(req,res,next){

	//console.log("Getting to query function on server, game on  Wayne!");
	var queryToProcess = req.query.search;
	var openStack = [];
	var closeStack = [];
	
	var outObject = {};
	//Counts which ( numerically. 
	
	var openCount = 0;
	var closeCount = 0;
		
	var parenPresent = false; //This and the next store whether an issue was found with parens etc. these are sent back for proper display of the html
	var stopWordPresent = false;
	
	//looks through every letter in the string, if letter is an (, push a number on to a stack. If the letter is a ), pop a number off of the stack. 
	//Number is not the index of the (, but the number of the (, later we iterate through and put <div id='looseParen'> </div> tags around each one left on our stack. 
	//For each ) we pop  
	for(var i=0; i<queryToProcess.length; i++)
	{
//console.log("processing query");
		if(queryToProcess[i] == '(')
		{
			openStack.push(openCount);
			openCount++;
			//console.log("pushing open");
		}
		else if(queryToProcess[i] == ')')
		{
			if(openStack.length > 0)
			{
				//console.log("Popping open");
				openStack.pop();
				closeCount++;
			}
			else
			{
				//console.log("Pushing close");
				closeStack.push(closeCount);
				closeCount++;
			}
		}
	  
	}
	//After the above, we have two "stacks" with the numbers of open or close parens that we have to flag. 
	
	//Now we add in the tags for the extra parens. 
	
	//These will be the html to add before and after the errant paren
	var prePar = "<span class='probPar'>";
	var postPar = "</span>";


	//console.log("CloseStack is: ", closeStack);
	
	var parenString = queryToProcess;
	
	if(openStack.length >0 || closeStack.length >0) //If we have a paren problem, set our bool to indicate it
	{
		parenPresent = true;
		
	}
	
	while(openStack.length > 0)
	{
	
		var curOpPar = 0;
	
		var twoArr = [0,1,2,3];
		
			for(var j=0; j<queryToProcess.length; j++)
			{
			
				if(queryToProcess[j] == '(')
				{
					if(openStack[openStack.length-1] == curOpPar)
					{
							if(j==0)	//If the unmatched paren is the first one, we need to write differently
							{
								var newQueryString = prePar + parenString.slice(0,1) + postPar + parenString.slice(1);
								//console.log("NewQueryString: ", newQueryString);
								openStack.pop();
								parenString = newQueryString;							
								
							}
							else
							{
								//console.log("Got into peekBack == curOpPar");
								var newQueryString = parenString.slice(0,j) + prePar + parenString.slice(j, j+1) + postPar + parenString.slice(j+1);
								//console.log("NewQueryString: ", newQueryString);
								openStack.pop();
								parenString = newQueryString;
							}
					}
					curOpPar++;
				}
				
			}
			
		//console.log("CurOpPar is:", curOpPar);
	}	

	while(closeStack.length > 0)
	{
	
			var curClPar = 0;
	

			for(var k=0; k<queryToProcess.length; k++)
			{
			
				if(queryToProcess[k] == ')')
				{
					if(closeStack[closeStack.length-1] == curClPar)
					{
							if(k==0)	//If the unmatched paren is the first one, we need to write differently
							{
								var newQueryString = prePar + parenString.slice(0,1) + postPar + parenString.slice(1);
								//console.log("NewQueryString: ", newQueryString);
								closeStack.pop();
								parenString = newQueryString;							
								
							}
							else
							{
								//console.log("Got into peekBack == curOpPar");
								var newQueryString = parenString.slice(0,k) + prePar + parenString.slice(k, k+1) + postPar + parenString.slice(k+1);
								//console.log("NewQueryString: ", newQueryString);
								closeStack.pop();
								parenString = newQueryString;
							}
					}
					curClPar++;
				}
				
			}
			
	}	

	//This section checks for any fields and points them out so the user can spot
	//If they have mistakenly added a field

	var fieldParCount = 0;
	var fieldStack = []; //Holds the paren number for parens that are confirmed to have fields preceeding them. 
	
	var fieldString = queryToProcess; //Gets query copy we can edit and add tags to.
	
	var preField = "<span class='foundField'>";
	var postField = "</span>";
	
	//We go through the whole query, find ( and check for caps before it, if all
	//caps, we flag it as a field with the ( number keyed to length of the field name
	for(var L=0; L<queryToProcess.length; L++)
	{
		var Exp = /^[A-Z]+$/; //This is test if alpha and capital
		var fieldBool = true; //This indicates if a field is found, starts out true. 
		
		if(queryToProcess[L] == '(' && L==0)
		{
			fieldParCount++; //If first item is a paren, we don't want to look before it or it is undefined, just increment
		}
		else if(queryToProcess[L] == '(' && queryToProcess[L-1] == '(')
		{
			fieldParCount++; //If previous letter is ( just increment
		}
		else if(queryToProcess[L] == '(')
		{
			var tempFieldLetter = queryToProcess[L-1];
			var curTempFieldSearchIndex = L-1;
			fieldParCount++;
			

			
			while(curTempFieldSearchIndex > 0 && queryToProcess[curTempFieldSearchIndex-1] != " ")
			{
				if(!tempFieldLetter.match(Exp))
				{
					fieldBool = false; //If we get a letter before the ( that is not a capital letter, it is not a field
				}
				curTempFieldSearchIndex--;
				tempFieldLetter = queryToProcess[curTempFieldSearchIndex];
				
			} //This while exits when we have found a space, non capital letter, or the start of the query. If tempFieldLetter is a " ", then we have a field.
			
			if(fieldBool)
			{
				//console.log("Field found!");
				fieldStack.push(fieldParCount);  //Save the number of the paren with the field to the stack. 
			}

		}
	  
	}
	
	//Now to draw the tags around the fields
	var fieldParenCounter = 0;  //Tells us what ( we are on in the string
	var fieldOutBool = false;  //Indicates to client if there is a field out query to print
	if(fieldStack.length >0)
	{
		fieldOutBool = true;  //If there are any fields, set indicator to true
	}
	for(var q=0; q<fieldString.length; q++)
	{  
//console.log("The big field loop is endless if this repeats");
//console.log("Field stack is: ", fieldStack);
//console.log("Field stack at the end is: ", fieldStack[fieldStack.length-1]);
		var Exp = /^[A-Z]+$/; //This is test if alpha and capital
		var offsetCounter = 0; //This tells us how many letters to offset our html tag to get the whole field. 

		var startFieldIndex = 0;
		if(fieldString[q] == '(')
		{
			//console.log("got into field detecting found (")
			fieldParenCounter++;
			//console.log("In the if, the fieldParenCounter is: ", fieldParenCounter);
			//console.log("In the if, the item at the end of the stack is: ", fieldStack[fieldStack.length-1]);
			if(fieldParenCounter == fieldStack[fieldStack.length-1]) //fieldStack[fieldStack.length-1]);  //This triggers when we get a paren with a found field. 
			{
			//console.log("Found ( that matches our stack");
				startFieldIndex = q-1;
				//console.log("Before while loop which will not trigger, letter tested was: ", fieldString[startFieldIndex]);//, "Stack paren indicated is: ". fieldStack[fieldStack.length]);
				while(startFieldIndex>=0 && fieldString[startFieldIndex].match(Exp))
				{
					//console.log("While tripped");
					offsetCounter++;
					startFieldIndex--;
				}//When this is no longer true, we have offsetCounter which tells us how many indices to offset. 
			//console.log("Got out of while, offsetCounter is", offsetCounter);
			fieldStack.pop(); //We get rid of the paren we are marking from our stack so we do not repeat it. 

			var newFieldString = fieldString.slice(0,q-offsetCounter) + preField + fieldString.slice(q-offsetCounter, q) + postField + fieldString.slice(q);	
						console.log("Got past new string");
			fieldString = newFieldString;
			q=0;  //Start the loop over, since we added to the text of the string
			//console.log("End of loop, fieldString is: ", fieldString, " fieldStack after popping is: ", fieldStack);
			fieldParenCounter = 0; //After we have found a match for our stack, we pop the marked paren, and start the whole loop over. 
			}
			
		}
	}
	
	//console.log("Field stack is: ", fieldStack);
	//console.log("Field String is: ", fieldString);
	
	//Above is work in progress, moving on to query space fixing and then pulling it apart to test for words.
	
	//This takes the query as fed, and chops it up into an array of words using split and space delimiting.
	
	var stringForChopping = queryToProcess;
	var termArray = [];
	var numList = /^[0-9]+$/;
	var alphNumList = /^[A-Za-z0-9]+$/;
	
	var stopString = "";
	
	var stopWords = ['ABOUT', 'ABOVE', 'ALSO', 'ALTHOUGH', 'AN', 'AS', 'AT', 'BE', 'BECAUSE', 'BUT', 'BY', 'EITHER', 'FOR', 'FROM', 'FURTHER', 'HERE', 'HOWEVER', 'IF', 'IN', 'INTO', 'MR.', 'NOW', 'OF', 'ON', 'OR', 'OUT', 'OVER', 'SINCE', 'SUCH', 'THAN', 'THAT', 'THEN', 'THERE', 'THEREFORE', 'THESE', 'THIS', 'THOSE', 'THROUGH', 'THUS', 'TO', 'UNDER', 'WHAT', 'UPON', 'WHERE', 'WHETHER', 'WHICH', 'WHILE', 'WITH', 'WITHIN', '(ABOUT', '(ABOVE', '(ALSO', '(ALTHOUGH', '(AN', '(AS', '(AT', '(BE', '(BECAUSE', '(BUT', '(BY', '(EITHER', '(FOR', '(FROM', '(FURTHER', '(HERE', '(HOWEVER', '(IF', '(IN', '(INTO', '(MR.', '(NOW', '(OF', '(ON', '(OR', '(OUT', '(OVER', '(SINCE', '(SUCH', '(THAN', '(THAT', '(THEN', '(THERE', '(THEREFORE', '(THESE', '(THIS', '(THOSE', '(THROUGH', '(THUS', '(TO', '(UNDER', '(WHAT', '(UPON', '(WHERE', '(WHETHER', '(WHICH', '(WHILE', '(WITH', '(WITHIN', 'ABOUT)', 'ABOVE)', 'ALSO)', 'ALTHOUGH)', 'AN)', 'AS)', 'AT)', 'BE)', 'BECAUSE)', 'BUT)', 'BY)', 'EITHER)', 'FOR)', 'FROM)', 'FURTHER)', 'HERE)', 'HOWEVER)', 'IF)', 'IN)', 'INTO)', 'MR.)', 'NOW)', 'OF)', 'ON)', 'OR)', 'OUT)', 'OVER)', 'SINCE)', 'SUCH)', 'THAN)', 'THAT)', 'THEN)', 'THERE)', 'THEREFORE)', 'THESE)', 'THIS)', 'THOSE)', 'THROUGH)', 'THUS)', 'TO)', 'UNDER)', 'WHAT)', 'UPON)', 'WHERE)', 'WHETHER)', 'WHICH)', 'WHILE)', 'WITH)', 'WITHIN)', '(ABOUT)', '(ABOVE)', '(ALSO)', '(ALTHOUGH)', '(AN)', '(AS)', '(AT)', '(BE)', '(BECAUSE)', '(BUT)', '(BY)', '(EITHER)', '(FOR)', '(FROM)', '(FURTHER)', '(HERE)', '(HOWEVER)', '(IF)', '(IN)', '(INTO)', '(MR.)', '(NOW)', '(OF)', '(ON)', '(OR)', '(OUT)', '(OVER)', '(SINCE)', '(SUCH)', '(THAN)', '(THAT)', '(THEN)', '(THERE)', '(THEREFORE)', '(THESE)', '(THIS)', '(THOSE)', '(THROUGH)', '(THUS)', '(TO)', '(UNDER)', '(WHAT)', '(UPON)', '(WHERE)', '(WHETHER)', '(WHICH)', '(WHILE)', '(WITH)', '(WITHIN)'];	
	
	
	
	termArray = stringForChopping.trim().split(/\ +/);

//console.log("Stop words test, ", stopWords);
	
	//This will check every term for being a stop word and build a query with stop words that are being ignored. 
	//These are the tags to insert when we find a stop word.
	var preStop = "<span class='stopWord'>";
	var postStop = "</span>";
	
	for(var n=0; n<termArray.length; n++)
	{
		for(var p=0; p<stopWords.length; p++)
		{
			var tempWord = termArray[n].toUpperCase();  //Gets current word in upper case to compare
			if(tempWord == stopWords[p])
			{
				//console.log("stop word found: ", stopWords[p]);
				if(termArray[n-1] != "<span class='stopWord'>")
				{
					//console.log("Found common term");
					stopWordPresent = true;			//Sets the bool to indicate we have a problem
					termArray.splice(n+1, 0, postStop);
					termArray.splice(n, 0, preStop);
					n = 0;  						//This starts the search over
				}
				
			}
			
		}	
		
	}

	//Now we will rebuild our string to send back with the html intact flagging stop words.
	for(var stBuild=0; stBuild<termArray.length; stBuild++){
		
		stopString = stopString + termArray[stBuild] + " ";

	};
	
	//This builds an array out of the query and tests if any of the FRCP abbreviations for FRCP are used unnecessarily
/*	
	var frcpTestString = queryToProcess;
	var frcpTermList = frcpTestString.trim().split(/\ +/);
	var abbList = ['F.R.C.P.', 'F.R.CIV.P.', 'F.R.CIV.PRO.', 'FED.R.CIV.P.', 'FED.R.CIV.PRO.', 'FED.R.CIV.PROC.', 'FED.RULE', 'CIV.PROC'];
	var frcpOutList = " ";
	var preFRCP = "<span class='frcpWord'>";
	var postFRCP = "</span>";
	
	for(var r=0; r<frcpTermList.length; r++)
	{
		for(var s=0; s<abbList.length; r++)
		{
			if(frcpTermList[r] == abbList[s])
			{
			
			}
			else
			{
				frcpOutList = frcpOutList + 
			}
		}
		
	}
	//Now we have a list of indices of our Term List that are FRCP matching terms. We need to build a new query string with highlighted terms
	
*/
	
	//console.log("Here is the term string: ", stopString);
	outObject.fieldOut = fieldString;
	outObject.fieldProb = fieldOutBool;
	outObject.parenOut = parenString;
	outObject.stopOut = stopString;
	outObject.parenProb = parenPresent;
	outObject.stopProb = stopWordPresent;
	
	//console.log(parenString);
	

	//console.log("Spaced string: ", spacedString);
	//console.log("Paren count: ", parenCount);

	//console.log("Unmatched open paren count is: ", openStack.length);
	//console.log("Unmatched close paren count is: ", closeStack.length);
	
	userCounter++;
	
	console.log("Used, parenbool = ", outObject.parenProb, " stopBool = ", outObject.stopProb);
	console.log("Paren query is: ", outObject.parenOut, "Stop Word query is: ", outObject.stopOut);
	console.log("UserCounter is: ", userCounter);

	res.send(JSON.stringify(outObject));
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
	console.log('Started on port 2011');
	
});



/*	This code below was the start of looking through the whole string to correct spacing. I thought, why am I doing this? Maybe there is a reason to do this at some other time 
But I do not think so

	for(var m=0; m<spacedString.length; m++)
	{
		if(spacedString[m] == '(')
		{
			if(spacedString[m-1] == " " && spacedString[m-2] == " ")
			{
				while(spacedString[m-1] == " " && spacedString[m-2] == " ")  //While the two things before the paren are spaces, remove them
				{
					spacedString = spacedString.slice(0,m-2) + spacedString.slice(m);  //This should remove spaces until there is just one
				}
				
				m = 0; //I want it to start over after all space insertions or deletions to not miss anything
			}
			if(spacedString[m-1] != " ")
			{
				spacedString = spacedString.slice(0,m) + " " + spacedString.slice(m);  //This should remove spaces until there is just one
				
				m = 0;
			}
		}
		else if(spacedString[m] == ')')
		{
			if(spacedString[m+1] == " " && spacedString[m+2] == " ")
			{
				while(spacedString[m+1] == " " && spacedString[m+2] == " ")  //While the two things before the paren are spaces, remove them
				{
					spacedString = spacedString.slice(0,m) + spacedString.slice(m+2);  //This should remove spaces until there is just one
				}
				
				m = 0; //I want it to start over after all space insertions or deletions to not miss anything
			}
			if(spacedString[m+1] != " ")
			{
				spacedString = spacedString.slice(0,m) + " " + spacedString.slice(m);  //This should remove spaces until there is just one
				
				m = 0;
			}
			
		}
		else if(spacedString[m] == '/')
		{
			if(spacedString[m-1] == " " && spacedString[m-2] == " ")
			{
				while(spacedString[m-1] == " " && spacedString[m-2] == " ")  //While the two things before the paren are spaces, remove them
				{
					spacedString = spacedString.slice(0,m-2) + spacedString.slice(m);  //This should remove spaces until there is just one
				}
				
				m = 0; //I want it to start over after all space insertions or deletions to not miss anything
			}
			if(spacedString[m-1] != " ")
			{
				spacedString = spacedString.slice(0,m) + " " + spacedString.slice(m);  //This should remove spaces until there is just one
				
				m = 0;
			}
			//if(spacedString[m+1])
			if(spacedString[m+2] == " " && spacedString[m+3] == " ")
			{
				while(spacedString[m+2] == " " && spacedString[m+3] == " ")
				{
					spacedString = spacedString.slice(0,m+2) + spacedString(m+2); //This should remove spaces
					
				}
				m = 0;
			}
			
		}
		
	}
	
*/