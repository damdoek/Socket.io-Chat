var express = require('express');
var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http);
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.set('port', process.env.PORT || 3000)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

connections = [];
users = []

io.sockets.on('connection', function(socket){
  connections.push(socket);
  console.log("Connected "+socket.handshake.headers['x-forwarded-for'], "nb of connected "+connections.length)
//io.sockets.emit('connected', {new: users, data:connections.length})
  

  socket.on('disconnect', function(){
    if(connections.indexOf(socket) != -1){
      var username = connections[connections.indexOf(socket)].username
      connections.splice(connections.indexOf(socket),1)
      var user_index = users.map(function(e) { return e.user; }).indexOf(username)
      if(user_index != -1)
        users.splice(user_index,1)
    }
    io.sockets.emit('gone', {disc:username, data:connections.length})
    console.log(username+" Disconnected ! number of current connections: "+ connections.length)
  });

  socket.on('add user', function(user){
    var index = connections.indexOf(socket)

    if(index != -1){
      socket.username = user.newuser
      socket.color = user.color
      connections[index] = socket
      users.push({user:socket.username, color:socket.color});
      console.log(socket.username+": "+socket.handshake.headers['x-forwarded-for'])
      io.sockets.emit('connected', {new: users, data:connections.length})
    }
  });

  socket.on('send message', function(data){
    console.log(socket.username+": "+socket.handshake.headers['x-forwarded-for'])
    io.sockets.emit('new message', {username: socket.username, msg: data, time: Date.now()})
  })

  socket.on('typing', function(data){
      io.sockets.emit('new typing', {user: data})
  })
  socket.on('ntyping', function(data){
    io.sockets.emit('stop typing', {user: data})
  })
  
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
var port = app.get('port');
http.listen(port, function(){
  console.log('Server listen on ', port)
})
module.exports = app;
