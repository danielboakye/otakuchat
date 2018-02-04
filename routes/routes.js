module.exports = function(express, app, passport, config, rooms){
	var router = express.Router();

	router.get('/', function(req, res, next) {
		res.render('index', {title: "Welcome to OtakuCHAT"});
	})

	function securePages(req, res, next){
		if(req.isAuthenticated()){
			next();
		}
		else{
			res.redirect('/');
		}
	}

	router.get('/auth/facebook', passport.authenticate('facebook'))

	router.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/chatrooms',
		failureRedirect: '/'
	}))

	router.get('/chatrooms', securePages, function(req, res, next) {
		res.render('chatrooms', {title: "Chatrooms", user: req.user, config: config});
	})

	router.get('/room/:id', securePages, function(req, res, next) {
		var room_name = findTitle(req.params.id);
		res.render('room', {user: req.user, config: config, room_number:req.params.id, title:room_name});
	})

	function findTitle(room_id){
		for (var i = 0; i < rooms.length; i++) {
			if(rooms[i].room_number == room_id){
				return rooms[i].room_name.toUpperCase();
			}
		}
		return 'CHAT ROOM';
	}


	router.get('/logout', function(req, res, next) {
		req.logout();
		res.redirect('/');
	})





	// router.get('/setcolor', function(req, res, next) {
	// 	req.session.favColor = "Red";
	// 	res.send('Setting favourite color !');
	// })

	// router.get('/getcolor', function(req, res, next) {
	// 	res.send('Favourite Color: ' + (req.session.favColor===undefined?"Not Found":req.session.favColor))
	// })

	app.use('/', router);

}


