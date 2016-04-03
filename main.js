var socket = io();

var TYPING_TIMER_LENGTH = 400;

var $window = $(window);
var $chat_page = $('.chat_page');
var $login_page = $('.login_page');

var username;
var typing = false;
var connected = false;

var $messages = $('#messages');
var $usernameInput = $('.usernameInput');
var $inputMessage = $('#inputMessage');
var $currentInput = $usernameInput;
var $whosOnlineBtn = $('.whosOnlineBtn');

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

/**
 * Update the typing event
 */
function updateTyping() {
  if (connected){
    if (!typing){
      typing = true;
      socket.emit('typing');
    }
    lastTypingTime = (new Date()).getTime();

    setTimeout(function() {
      var typingTimer = (new Date()).getTime();
      var timeDiff = typingTimer - lastTypingTime;
      if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
        socket.emit('stop typing');
        typing = false;
      }
    }, TYPING_TIMER_LENGTH);
  }
}

/**
 * Adds the visual chat typing message
 */
function addChatTyping(data) {
  var $typingMessage = $('.typing').filter(function (i) {
      return $(this).data('username') === data.username;
  });

  if ($typingMessage.length !== 0) {
      $typingMessage.remove();
  }

  var msg = data.username + ' is typing';
  $messages.append($('<li>').data('username', data.username).addClass('typing').text(msg));
}

/**
 * Adds the visual chat typing message
 */
function removeChatTyping(data) {
  var $typingMessage = $('.typing').filter(function (i) {
      return $(this).data('username') === data.username;
  });

  $typingMessage.fadeOut(function() {
    $(this).remove();
  });
}

/**
 * Get online user's name
 */
function getOnlineUser() {
  socket.emit('get user');
}

/**
 * When user joined, we show username
 */
socket.on('user joined', function(data) {
  connected = true;
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

// Whenever the server emits 'typing', show the typing message
socket.on('typing', function(data){
  addChatTyping(data);
});

// Whenever the server emits 'stop typing', show the typing message
socket.on('stop typing', function(data){
  removeChatTyping(data);
});

socket.on('get user', function(data) {
  console.log(data);
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

$inputMessage.on('input', function() {
  updateTyping();
});

$whosOnlineBtn.click(function() {
  getOnlineUser();
});