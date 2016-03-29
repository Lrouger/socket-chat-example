var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', function(req, res) {
  res.sendFile(__dirname + '/style.css');
});

app.get('/main.js', function(req, res) {
  res.sendFile(__dirname + '/main.js');
});

io.on('connection', function(socket) {
  var addUser = false;

  // When the client emit 'add user' this listens and executes
  socket.on('add user', function(username) {
    if(addUser) return;

    addUser = true;
    // Store the username in the socket session for this client
    socket.username = username;
    socket.broadcast.emit('user joined', {
      username : socket.username
    });
  });

  // When user disconnect perform this
  socket.on('disconnect', function() {
    socket.broadcast.emit('user disconnection', {
      username : socket.username
    });
  });

  // When the client emit 'chat message' ,we boardcast to others
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
