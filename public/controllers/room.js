$(function() {
	var messages = io.connect(host + '/messages'); 
	messages.on('connect', function() {
		console.info('Connection established !!');
		messages.emit('joinroom', {room:roomNum, user:userName, userPic:userPic})
	})


	$(document).on('keyup', '.newmessage', function (event) {
		if(event.which === 13 && $.trim($(this).val()) != '' ){
			messages.emit('newmessage', {
				room_number: roomNum,
				user: userName,
				userPic: userPic,
				message: $(this).val()
			})

			updateMessageFeed(userPic, $(this).val());
			$(this).val('');
		}
	})

	messages.on('messagefeed', function(data) {
		var info = JSON.parse(data);
		updateMessageFeed(info.userPic, info.message);
	})


	function updateMessageFeed(userPic, message) {
		var tmpl = '<li>';
			tmpl += '<div class="msgbox">';
			tmpl += '<div class="pic"><img src="' + userPic + '"></div>';
			tmpl += '<div class="msg"><p>' + message + '</p></div>';
			tmpl += '</div>'
			tmpl += '</li>'; 

		$(tmpl).hide().prependTo($('.messages')).slideDown(200);
	}

	setInterval(function(){
		messages.on('updatelist', {room: roomNum});
	}, 15000);


	messages.on('updateuserslist', function(data) {
		var info = JSON.parse(data);
		$(".users").html('');
		$.each(info, function(b, j) {
			var html = '<li><img src="' + j.userPic + '" alt=""><h5>"' + j.user + '"</h5></li>';
			$(html).prependTo($('.users'));
		});

	})

})