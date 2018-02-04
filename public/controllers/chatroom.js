$(function() {
	var socket = io.connect(host + '/roomlist'); 
	socket.on('connect', function() {
		console.info('Connection established!')
	})

	socket.on('roomupdate', function(data) {
		var info = JSON.parse(data);
		$(".errormessage").hide('slow');
		$('.roomlist').html('');
		$.each(info, function(b, j) {
			var str = '<a href="room/' + j.room_number + '"><li>' + j.room_name + '</li></a>';
			$(".roomlist").prepend(str);
		});

	})

	socket.on('roomupdateerr', function(data) {
		console.error('@error => Room exists: ' + new Date());
		$(".errormessage").show('slow');
	})


	$(document).on('click', '#create', function () {
		var room_name = $('.newRoom').val();
		if(room_name!=''){
			var room_number = parseInt(Math.random() * 10000);
			socket.emit('newroom', {room_name:room_name, room_number:room_number});
			$('.newRoom').val('');
		}
	})
})