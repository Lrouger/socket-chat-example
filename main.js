var socket = io();

var $window = $(window);
var $chat_page = $('.chat_page');
var $login_page = $('.login_page');

var username;
var typing = false;

var $messages = $('#messages');
var $usernameInput = $('.usernameInput');
var $inputMessage = $('#inputMessage');
var $currentInput = $usernameInput;

/**
 * Clean input
 * @param  {[type]} input [description]
 * @return {[type]}       [description]
 */
function cleanInput(input) {
  return $('<div/>').text(input).text();
}

/**
 * Set client's username
 */
function setUserName() {
  username = cleanInput($usernameInput.val().trim());

  // If username is valid
  if (username) {
    $login_page.fadeOut();
    $chat_page.show();
    $login_page.off('click');
    $currentInput = $inputMessage.focus();

    // Tell the server your name
    socket.emit('add user', username);
  }
}

/**
 * Log a message
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
function log(msg) {
  $messages.append($('<li>').text(msg));
}

/**
 * Send message 
 * @return {[type]} [description]
 */
function sendMessage() {
  socket.emit('chat message', $inputMessage.val());
  $inputMessage.val('');
}

// // Replace form submit function
// $('form').submit(function() {
//   socket.emit('chat message', $inputMessage.val());
//   $inputMessage.val('');
//   return false;
// });

socket.on('user joined', function(data) {
  log(data.username + ' joined');
});

// Chat message event
socket.on('chat message', function(msg) {
  log(msg);
});

// User disconnection event
socket.on('user disconnection', function(data) {
  log(data.username + ' disconnect');
});

// Keyboard events
$window.keydown(function(event) {
  // Auto focus
  if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    $currentInput.focus();
  }

  if (event.which === 13) {
    // Check username
    if(username){
      sendMessage();
      socket.emit('stop typing');
      typing = false;
    } else {
      setUserName();
    }
  }
});

// Focus input where clicking anywhere on login page
$login_page.click(function() {
  $currentInput.focus();
});