var socket = io();
socket.on('connect', function () {
    var params = $.deparam(window.location.search);
    socket.emit('join',params,function(err){
        if(err){
            alert(err);
            window.location.href ='/';
        }
        else{
            console.log('No Error');
        }
    })
});


function scrollToBottom() {
    var messages = $('#messages');
    var newMessage = messages.children('li:last-child');

    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');

    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight)
        messages.scrollTop(scrollHeight);
};

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('newMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('hh:mm a');
    var template = $("#message-template").html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });
    
    
    $('#messages').append(html);
    scrollToBottom();
});
socket.on('noty',function(message){
    var formattedTime = moment(message.createdAt).format('hh:mm a');
    notifyMe(message.from,message.text,formattedTime);
});


socket.on('newLocationMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('hh:mm a');
    var locationTemplate = $("#location-message-template").html();
    var html = Mustache.render(locationTemplate, {
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    });
    $('#messages').append(html);
    scrollToBottom();
});

socket.on('updateUserList',function(users,roomName){
    var ol = $('<ol></ol>');
    users.forEach(function(user){
        ol.append($('<li></li>').text(user));
    });
    $('#users').html(ol); 
    $('#roomName').html(roomName);
});



$('#message-form').on('submit', function (e) {
    e.preventDefault();
    var messageTextbox = $('[name=message]');
    socket.emit('createMessage', {
        text: messageTextbox.val()
    }, function () {
        messageTextbox.val('');
    });
});

var locationButton = $("#send-location");
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser.');
    }
    locationButton.prop('disabled', true).text('Seding location...');
    navigator.geolocation.getCurrentPosition(function (position) {
        locationButton.prop('disabled', false).text('Send location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function () {
        locationButton.prop('disabled', false);
        alert('Unable to fetch location');
    });
});

var notifyMe = (user,comment,formattedTime)=>{

    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
      }
      // Let's check if the user is okay to get some notification
      else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
      var options = {
            body: comment,
            dir : "ltr"
        };
      var notification = new Notification(user + "-"+formattedTime,options);
      }
      // Otherwise, we need to ask the user for permission
      // Note, Chrome does not implement the permission static property
      // So we have to check for NOT 'denied' instead of 'default'
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
          // Whatever the user answers, we make sure we store the information
          if (!('permission' in Notification)) {
            Notification.permission = permission;
          }
          // If the user is okay, let's create a notification
          if (permission === "granted") {
            var options = {
                    body: message,
                    dir : "ltr"
            };
            var notification = new Notification(user + " Posted a comment",options);
          }
        });
      }
      // At last, if the user already denied any notification, and you
      // want to be respectful there is no need to bother them any more.
      
}