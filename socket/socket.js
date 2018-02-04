module.exports = function(io, rooms, clients) {

	function isUnique(data){
		for (var i = 0; i < rooms.length; i++) {
			if(rooms[i].room_number == data.room_number){
				return false;
			}

			if(rooms[i].room_name == data.room_name){
				return 'err';
			}
		}

		return true;
	}

	

	var chatrooms = io.of('/roomlist').on('connection', function(socket) {
		console.log('Connection Established on the server !');
		socket.emit('roomupdate', JSON.stringify(rooms));

		socket.on('newroom', function(data) {
			// check if room_number is unique else generate new one
			var valid = null;
			while( (valid = isUnique(data)) === false ){
				console.warn('@warn => duplicate key: generating new room key' + new Date());
				data.room_number = parseInt(Math.random() * 10000);
			}

			if( valid === true ){
				rooms.push(data);
				// broadcast to all except active socket
				socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
				// broadcast to just active socket
				socket.emit('roomupdate', JSON.stringify(rooms));
			}else{
				// broadcast to just active socket
				socket.emit('roomupdateerr');
			}

		})
	})


	var messages = io.of('/messages').on('connection', function(socket) {
		console.log('Connected to the chat room !!');

		socket.on('joinroom', function(data) {
			socket.username = data.user;
			socket.userPic = data.userPic;
			socket.join(data.room);

			joinRoom(data);

			updateUsersList(data.room, true);
		})

		socket.on('newmessage', function(data) {
			socket.broadcast.to(data.room_number).emit('messagefeed', JSON.stringify(data));
		})

		function leaveChat(socketId){
			for(var j in rooms){
				var room = rooms[j].room_number;
				for(var i in clients[room]){
					if( clients[room][i].id == socketId ){
						// console.log(clients[room][i].id + ' left chat');
						clients[room].splice(i, 1);
						updateUsersList(room, true);
					}
				}
			}
		}

		socket.on('disconnect', function() { 
			leaveChat(socket.id);		
		})


		function joinRoom(data){
			if(clients[data.room] == undefined) {
				clients[data.room]=[];
			}
			// console.log(clients[data.room]);
			var newOtakuInChat = true;
			for(var i in clients[data.room]){
				// console.info(clients[data.room][i]);
				if( clients[data.room][i].id == socket.id ){
					newOtakuInChat = false;
				}
			}

			if(newOtakuInChat){
				clients[data.room].push({user: data.user, userPic: data.userPic, id: socket.id});
			}
		}

		function updateUsersList(room, updateAll){
			// console.log(clients[room]);
			socket.to(room).emit('updateuserslist', JSON.stringify(clients[room]));
			socket.emit('updateuserslist', JSON.stringify(clients[room]));

			if(updateAll){
				socket.broadcast.to(room).emit('updateuserslist');
			}
		}

		socket.on('updatelist', function(data) {
			updateUsersList(data.room, false);
		})

	});


}