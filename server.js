var express = require('express')
  , request = require('request')
  , oauth = require('./oauth');


module.exports = function (app) {
	console.log('Loading Server.js');
	var boundary = '-------314159265358979323846';
	var data;
	
	app.post('/drive',function(req, res, next){
	    data = req.body.code;
	   // console.log(data);
   });
// Route that will generate a new, blank 'RunnableFile' to user's Google Drive
app.get('/newfile', function(req, res) {
  // Check and verify user has an access_token
	if (oauth.access_token) {
    
    // Define API endoint and params needed to make the call
		var url = 'https://www.googleapis.com/upload/drive/v2/files';
		var params = {
			access_token: oauth.access_token,
			uploadType: 'multipart',
			convert: 'true'
		};

    // Define the header
		var headers = {
			'Content-Type':'multipart/mixed; boundary="'+boundary+'"'
		};
  
    // Generate the body to send as part of the API call
		var body = generateBody();

		// Send the request
		request.post({url:url, qs:params, headers:headers, body:body}, function(err, resp, body) {
			// Handle any errors that may occur
      if (err) {return console.error("Error occured: ", err);}
			var result = JSON.parse(body);
			if (result.error) {return console.error("Error returned from Google: ", result.error);}
      
      // Send output to response
      res.writeHead(200, {'Content-Type': 'text/html'});
	  res.end('<center><p><i><b><a target="_blank" href="'+result.alternateLink+'">'+result.title+'</a> has been created on your Google Drive.<br><a target="_blank" href="/main">HOME</a></b></i></p></center>');
			
    });
	} else {
		console.log("Couldn't determine if user was authed. Redirecting to /");
		res.redirect('/');
	}
});

// Generates the body to be sent along with the request. Describes the filetype,
// title, intitial contents and other data for the new document.
function generateBody() {
	var delimiter = "\r\n--" + boundary + "\r\n";
	var close_delim = "\r\n--" + boundary + "--";
	var contentType = 'text/plain';
	var base64file = new Buffer(data).toString('base64'); // add some words to the doc
	var params = {
		'title': 'MindMapDiagram',
		'mimeType': contentType
	};
	
	var multipartRequestBody = 
		delimiter + 
		'Content-Type: application/json\r\n\r\n' +
		JSON.stringify(params) + 
		delimiter + 
		'Content-Type: ' + contentType + '\r\n' + 
		'Content-Transfer-Encoding: base64\r\n' +
		'\r\n' + 
		base64file +
		close_delim;

	return multipartRequestBody;
}

// Handle OAuth routes
app.get('/login', oauth.login);
app.get('/callback', oauth.callback);
};
