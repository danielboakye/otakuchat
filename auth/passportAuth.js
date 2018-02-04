module.exports = function(passport, FacebookStrategy, config, mongoose){

	const fandom = new mongoose.Schema({
		profileID: String,
		fullname: String,
		profilePic: String
	})

	const otaku = mongoose.model('akihabara', fandom);

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	})

	passport.deserializeUser(function(id, done) {
		otaku.findById(id, function(err, user) {
			done(err, user)
		})
	})

	passport.use(new FacebookStrategy({
		clientID: config.fb.appID,
		clientSecret: config.fb.appSecret,
		callbackURL: config.fb.callbackURL,
		profileFields: ['id', 'displayName', 'photos']
	}, function(accessToken, refreshToken, profile, done){

		// check if the user exits in our mongoDB db
		otaku.findOne({'profileID': profile.id}, function(err, result) {
			if( result ){
				// if exists return profile
				done(null, result)
			}
			else {
				// else create profile and return it
				var weeaboo = new otaku({
					profileID: profile.id,
					fullname: profile.displayName,
					profilePic: profile.photos[0].value || '/images/profilepic.jpg'
				})

				weeaboo.save(function(err) {
					console.info('Upgraded weeaboo to Otaku!');
					done(null, weeaboo) 
				})
			}
		})

	} ))

}