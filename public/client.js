

// Andrew Johnson, Westlaw Query trouble spotter


//When content loads, assign buttons and draw the table. 

document.addEventListener('DOMContentLoaded', buttonAssign);


//Sets up form submit button
function buttonAssign()
{
	
	var queryReq = new XMLHttpRequest();

	
	document.getElementById('subButton').onclick = (function()
	{
		console.log("We are inside the button function now");
		var query = document.getElementById('queryVal').value;
		query = encodeURIComponent(query);
		 
		var url = 'http://ec2-52-26-46-121.us-west-2.compute.amazonaws.com:2008/crunch' + '?search=' + query;

		queryReq.open('GET', url, true);
		queryReq.addEventListener('load', function()
		{
			if(queryReq.status >= 200 && queryReq.status < 400)
			{
				var response = JSON.parse(queryReq.responseText);
				//console.log("Here is the query returned", response.parenOut);
				document.getElementById('resultBox').innerHTML = response.parenOut;
				document.getElementById('stopWordBox').innerHTML = response.stopOut;
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















