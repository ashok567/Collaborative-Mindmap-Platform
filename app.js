var express    = require('express');
var stylus     = require('stylus');
var nib        = require('nib');
var pug       = require('pug');
var crypto     = require('crypto');
var merge      = require('merge');
var fs         = require('fs');
var formidable = require('formidable');
var morgan	   = require('morgan');
var parser       = require('body-parser');
var cparser = require('cookie-parser');
var esession = require('express-session');
var path = require('path');
var html  =require('html');
var cons = require('consolidate');
var swig = require('swig');
var ejs = require('ejs');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var io = require('socket.io')(http);
var unescape = require('unescape');
var google = require("googleapis");
var passport = require('passport');
var id;
var id1;
var token;

// get environment variables we need:
var port                 = Number(process.env.PORT || 5000);
var hostname             = process.env.HOSTNAME || 'localhost';
var host                 = hostname;

app.use(morgan('dev'));
console.log("App listening at http://%s", host);


function compileStyl(str, path){
	  return stylus(str)
	    .set('filename', path)
	    .use(nib());
	} 
	app.use(stylus.middleware({
	      src: __dirname + '/private',
	     dest: __dirname + '/public',
	  compile: compileStyl
	}));
	// Serve static files from ./public
	app.use(express.static(__dirname + '/public'));
	
	app.use(parser.json());
	app.use(parser.urlencoded({ extended: true }));
	app.use(cparser());
	// we don't persist any info across server restarts, so just create a new
	// session secret
	app.use(esession({secret:crypto.randomBytes(32).toString('hex'),resave: true, saveUninitialized: true}));
	app.use(passport.initialize());
	app.use(passport.session());
	
	
	// pug template engine, rendering content from ./private/views
	app.use(express.static(__dirname + '/private'));
	app.set('views', __dirname + '/private/views');
	app.set('view engine', 'pug');


	// view engine setup
	app.engine('html', cons.swig);
	app.set('views', path.join(__dirname, '/private/views'));
	app.set('view engine', 'html');
	
	var OAuth2 = google.auth.OAuth2;

	var oauth2Client = new OAuth2("779102809896-l2vtq7kp2eacmqunpgg9se9bjcsmqo3l.apps.googleusercontent.com", "Z_k_DNDyrGzqUNkSBG5XNNsV", "http://localhost:5000/oauthcallback");

	// generate a url that asks permissions for Google+ and Google Calendar scopes
	var scopes = [
	  'https://www.googleapis.com/auth/drive'
	];

	var url = oauth2Client.generateAuthUrl({
	  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
	  scope: scopes // If you only need one scope you can pass it as string
	});
	
	// Routes
	app.get('/', function(req, res){
		res.render('index.html');
	});
	
	
	app.get('/main', function(req, res){
		res.render('main.html');
	});
	
	app.get("/url", function(req, res) {
		  res.send(url);
		});

	app.get("/tokens", function(req, res) {

		  var code = req.query.code;
		  
		  oauth2Client.getToken(code, function(err, tokens) {
		    if (err) {
		      console.log(err);
		      res.send(err);
		      return;
		    }

		    //console.log("allright!!!!");

		    //console.log(err);
		    console.log(tokens);
		    oauth2Client.setCredentials(tokens);
		    res.send(tokens);
		    token = tokens.access_token;
		  });
		});
	
	io.on('connection', function (socket) {
		 socket.broadcast.emit('conn');
		 console.log('a user is connected');
	  
	  socket.on('extract', function (data) {
		  socket.broadcast.emit('extract', data); 
	  });
	  
	  socket.on('disconnect', function(){
		  socket.broadcast.emit('disconn');
		  console.log(' a user is disconnected');
		  });
	});
	
	require('./server')(app);
	require('./chat')(app,io);
	
	
	/*function ensureAuthenticated (req, res, next) {
		  if (req.isAuthenticated()) { 
			  return next();
		  }	
		  req.session.redirectTo = req.path;
		  res.redirect('/');
		}
	*/
	app.get('/canvas', function(req, res){
		 id = Math.round((Math.random() * 1000000));
			res.redirect('/canvas/'+id);
		});
			
		app.get('/canvas/:id', function(req,res){
			// Render the canvas.html view
			res.render('canvas.html');
		});
		
	app.get('/chat', function(req,res){
			// Redirect to the random room
			res.redirect('/chat/'+id);
		});

		app.get('/chat/:id', function(req,res){

			// Render the chat.html view
			res.render('chat');
		});			
		
	app.get('/open', function(req, res){
		 id1 = Math.round((Math.random() * 1000000));
		res.redirect('/open/'+id1);
	});
	
	app.get('/open/:id', function(req, res){
		res.render('open.html');
	});
	
	app.get('/chat1', function(req,res){
		// Redirect to the random room
		res.redirect('/chat/'+id1);
	});

	app.get('/chat1/:id', function(req,res){

		// Render the chat.html view
		res.render('chat');
	});	
	
	app.get('/share', function(req, res){
		res.redirect('/share/'+id1);
	});
	
	app.get('/share/:id', function(req, res){
		res.render('share.html');
	});
	 
	 app.post('/fb',function(req, res, next){
		   var data = req.body.code;
		    //console.log(data);
	      fs.writeFile("public/diagrams/"+id1+".txt",data, function(err) {
	        if(err) {
	            return console.log(err);
	        }
	        console.log("The file is saved!");      
	    });
	   });
	 
	 app.post('/invite',function(req, res, next){
		   var data = req.body.code;
		    //console.log(data);
	      fs.writeFile("public/diagrams/"+id+"Backup.txt",data, function(err) {
	        if(err) {
	            return console.log(err);
	        }
	        console.log("The file is saved!");      
	    });
	   });
	 
	 app.post('/invite1',function(req, res, next){
		   var data = req.body.code;
		    /*console.log(data);
		    fs.writeFile("public/diagrams/"+id1+".txt",data, function(err) {
		        if(err) {
		            return console.log(err);
		        }
		        console.log("The file is saved!");      
		    });*/
	      fs.writeFile("public/diagrams/"+id1+"Backup.txt",data, function(err) {
	        if(err) {
	            return console.log(err);
	        }
	        console.log("The file is saved!");      
	    });
	   });
	 
	app.get('/chat', function(req, res){
	res.render('chat.html');
   });
	
	app.get('/share1', function(req, res){
		res.redirect('/share1/'+id);
	});
		
	app.get('/share1/:id', function(req,res){
		// Render the canvas.html view
		res.render('share1.html');
	});
	
	
	//Start Server
	http.listen(port, function(){
		  console.log('listening on *:',port);
		});	
	

	
	
