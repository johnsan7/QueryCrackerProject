

// Andrew Johnson, Westlaw Query trouble spotter


//When content loads, assign buttons and draw the table. 

document.addEventListener('DOMContentLoaded', buttonAssign);

var sampleQueryString = "((breach! /2 contract!) (inten! /2 inflict! /2 emotional /2 distress) /p (although /2 happy) (while /2 incarcerat!) (out /2 time))) ((therefore however /2 ignor!) /s return! /5 plaintiff defendant) /p county muni! CITY(from /2 far /2 away))";

//Sets up form submit button
function buttonAssign()
{
	
	document.getElementById('loadSampleQuery').onclick = (function(event)
	{
		document.getElementById('queryVal').value = sampleQueryString;
		
	});
	
	var queryReq = new XMLHttpRequest();

	
	document.getElementById('subButton').onclick = (function(event)
	{
		//console.log("We are inside the button function now");
		var query = document.getElementById('queryVal').value;
		query = encodeURIComponent(query);
		 
		 //Correct url 'http://localhost:3000/crunch'
		 
		var url = '../crunch'  + '?search=' + query;
		//var url = 'http://ec2-52-26-46-121.us-west-2.compute.amazonaws.com:2011/crunch'  + '?search=' + query;

		queryReq.open('GET', url, true);
		queryReq.addEventListener('load', function()
		{
			if(queryReq.status >= 200 && queryReq.status < 400)
			{
				var response = JSON.parse(queryReq.responseText);
				//console.log("Here is the query returned", response.parenOut);
				if(response.parenProb)
				{
					//console.log("paren true tripped on response");
					document.getElementById('resultBox').textContent = "You have a mismatched paren. The query is presented below with the mismatched parens highlighted";
					document.getElementById('resultParenQuery').innerHTML = response.parenOut;
				}
				else
				{
					document.getElementById('resultBox').textContent = "You have no mis-matched parens";
					document.getElementById('resultParenQuery').innerHTML = " ";
				}
				if(response.stopProb)
				{
					//console.log("Stop true tripped on response");
					document.getElementById('stopWordBox').textContent = "You have at least one stop word in your query. The highlighted terms below are being ignored in your search and are doing nothing. Add a # before them to force Westlaw to search for them, or remove them";
					document.getElementById('stopWordQueryBox').innerHTML = response.stopOut;
				}
				else
				{
					document.getElementById('stopWordBox').textContent = "You have no ignored stop words in your query";
					document.getElementById('stopWordQueryBox').innerHTML = " ";
				}
				if(response.fieldProb)
				{
					document.getElementById('fieldWordBox').textContent = "The highlighted terms below are being treated as fields by Westlaw. If you have a term before a (, Westlaw will sometimes mistakenly treat the term as a field. You should move the offending term behind the ), unless you meant to use it as a field";
					document.getElementById('fieldQueryBox').innerHTML = response.fieldOut;
				}
				else
				{
					document.getElementById('fieldWordBox').textContent = "Your Query contains no fields";
					document.getElementById('fieldQueryBox').innerHTML = " ";
				}
				//document.getElementById('resultBox').innerHTML = response.parenOut;
				//document.getElementById('stopWordBox').innerHTML = response.stopOut;
			}
			else
			{
				console.log("No query received back from server");

			}
		});
						

		queryReq.send(null);
		event.preventDefault();	
		
	});		
	

}















