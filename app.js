var express = require('express'),
	app = express(),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	config = require('./config/config.js'),
	ConnectMongo = require('connect-mongo')(session),
	// mongoose = require('mongoose').connect(config.dbURL)
	mongoose = require('mongoose'),
	passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	rooms = [],
	clients = []

/*
 * @templating enginge: < HOGAN Mustache > instead of default < JADE >
*/

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect(config.dbURL, function(err) {
  if(err != undefined){
    console.log("MONGOOSE-CONNECT: " + err);
  } else {
    console.log("MONGOOSE-CONNECT: Database connection established");
  }
});


// allow use of sessions
app.use(cookieParser());
var env = process.env.NODE_ENV || 'development'; 
if( env === 'development' ){
	// dev mode setting/cofig
	app.use(session({
		secret: config.sessionSecret, 
		saveUninitialized: true, 
		resave: true
	}));

}else{
	// production or testing settings/config
	app.use(session({
		secret: config.sessionSecret,
		saveUninitialized: true, 
		resave: true,
		store: new ConnectMongo({
			// url: config.dbURL,
			mongooseConnection: mongoose.connections[0],
			stringify: true
		})
	}));
}




app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);

require('./routes/routes.js')(express, app, passport, config, rooms);

// using expres app setting to listen
// app.listen(3000, function() {
// 	console.info('OtakuCHAT running on Port 3000');
// 	console.warn('Mode: ' + env);
// });

// using socket.io setting
app.set('port', process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io, rooms, clients);
const activePort = app.get('port');
server.listen(activePort, function() {
	console.info('OtakuCHAT running on Port: ' + activePort);
	console.warn('Mode: ' + env);
})






