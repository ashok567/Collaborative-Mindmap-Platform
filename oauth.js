var request = require('request')
  , qs = require('qs');
  
// Specify the API credentails and callback URL
var CLIENT_ID = '779102809896-l2vtq7kp2eacmqunpgg9se9bjcsmqo3l.apps.googleusercontent.com'
  , CLIENT_SECRET = 'Z_k_DNDyrGzqUNkSBG5XNNsV'
  , callbackURL = 'http://localhost:5000/callback';


var state = ''
  , access_token = ''
  , token_type = ''
  , expires = '';
  

// Generate a URL that the client ('index.html') will redirect the user to
// in order to start the OAuth flow.
function login(req, res) {
 state = Math.floor(Math.random()*1e19);
  exports.state = state;
 // Setup the params needed to create the URL used to start off the OAuth flow
	var params = {
		response_type: 'code',
		client_id: CLIENT_ID,
		redirect_uri: callbackURL,
		state: state,
		display: 'popup',
		scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file' // specify the "Google Drive" scope
	};

	params = qs.stringify(params);
  res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('https://accounts.google.com/o/oauth2/auth?'+params);
}

// The endpoint that Google will call once the user as bee authenticated. This will
// call another API to retrieve the access_token.
function callback(req, res) {
  // Gather data sent from Google in the query string
	var code = req.query.code
	  , cb_state = req.query.state
	  , error = req.query.error;

  // Verify the 'state' passed from Google equals the value we generated in /login
	if (state == cb_state) {
		if (code !== undefined) {
      
      // Setup the params needed to make the API call to retrieve an access_token
			var params = {
				code: code,
				client_id: CLIENT_ID,
				client_secret: CLIENT_SECRET,
				redirect_uri: callbackURL,
				grant_type: 'authorization_code'
			};
      
      // Send the request
			request.post('https://accounts.google.com/o/oauth2/token', {form:params}, function(err, resp, body) {
        // Handle any error that may occur
				if (err) {return console.error('Error occured: ', err);}
        var results = JSON.parse(body);
	      if (results.error) {return console.error('Error returned from Google: ', results.error);}
        
        // Retrieve and store access_token to session
				exports.access_token = access_token = results.access_token;
				exports.token_type = token_type = results.token_type;
				exports.expires = expires = results.expires_in;

        console.log("Connected to Google");

				// close the popup
				var output = '<html><head></head><body onload="window.close();">Close this window</body></html>';
				res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(output);
			});
		} else {
			console.error('Code is undefined: '+code);
			console.error('Error: '+ error);
		}
	} else {
		console.log('Mismatch with variable "state". Redirecting to /');
		res.redirect('/');
	}
}

exports.login = login;
exports.callback = callback;

