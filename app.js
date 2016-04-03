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

var onlineList = this.onlineList = {};
var usernameList = this.usernameList = {};

io.on('connection', function(socket) {
  var addUser = false;

  // When the client emit 'add user' this listens and executes
  socket.on('add user', function(username) {
    if(addUser) return;

    onlineList[socket.id] = socket;
    usernameList[socket.id] = {
      username: username,
      userid: socket.id
    };

    addUser = true;
    // Store the username in the socket session for this client
    socket.username = username;
    socket.broadcast.emit('user joined', {
      username : socket.username
    });
  });

  // When user disconnect perform this
  socket.on('disconnect', function() {
    var id = socket.id;
    delete onlineList[id];
    delete usernameList[id];

    socket.broadcast.emit('user disconnection', {
      username : socket.username
    });
  });

  // When the client emit 'chat message' ,we boardcast to others
  socket.on('chat message', function(msg) {

    var at = msg.indexOf('@');
    var space = msg.indexOf(' ');

    if (msg.indexOf('@') >= 0){
      var userid = msg.substring(1, space);
      var privateSocket = onlineList[userid];

      var trueMessage = msg.substring(space, msg.length);
      privateSocket.emit('chat message', socket.username + ": " + trueMessage);
      return;
    }

    msg = socket.username + ": " + msg;
    // Check message, Don't send the same message to user
    if (socket.lastmessage === msg){
      socket.emit('chat message', msg);
      return;
    }

    socket.lastmessage = msg;
    io.emit('chat message', msg);
  });

  // When the client emits 'typing', we broadcast it to others
  socket.on('typing', function(){
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // When the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function() {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // When the client emits 'get user', we return username list
  socket.on('get user', function() {
    socket.emit('get user', usernameList);
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
