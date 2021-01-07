// server.js
// where your node app starts
const socketIO = require('socket.io');
const express = require("express");
const http = require('http');
//const basicAuth = require("basic-auth");
//const basicAuth = require('express-basic-auth')
let name = "";

const app = express();
const server = http.Server(app); 
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});;
 
/*app.use(basicAuth({
    users: { 'admin': 'admin' }
}))

var auth = express.basicAuth(function(user,pass) {
  return 'user' === 'aa' && 'pass' === 'aa';
});
*/
//Port default 443  https://iosocket-server.glitch.me/
app.use(express.static("public"));
app.use(function(req, res, next) {
  //res.header("Access-Control-Allow-Origin", "*");
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  /*let user = basicAuth(req);
  console.log(user);
  if (!user  || user.name !== 'admin' || user.pass !== 'admin')
            {
              res.set("WWW-Authenticate", 'Basic realm="example"');
              return res.status(401).send();
            }
  name = user.name;
  */
  return next();
});
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

server.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + process.env.PORT);
});

// Add the WebSocket handlers
io.on('connection', function(socket) {
});

var players = {};
var opers = {};

io.on('connection', function(socket) {
  socket.on('new player', function(data) {
    if(data){ //Recuperamos antigua posición!!
      console.log("recuperando player: ", data);
      players[socket.id] = data;
      data.time = new Date().getTime();
    }
    let result =[];
    Object.values(opers).forEach( (value) => result.push(value));
    io.to(socket.id).emit("objects", {id:null, ac:'a', objs:result}); //Update old situation
  });
  
  socket.on('movement', function(data) {
    players[socket.id] = data;
    data.time = new Date().getTime();
  });
  
  socket.on('objects', function(newObjects) {console.log(newObjects)
    if(newObjects.ac == 'a' )
      newObjects.objs.forEach((elem) => opers[elem.id] =  elem);
    io.sockets.emit('objects', newObjects);
  });

});

setInterval(function() {
  let limitNoEventTime = new Date().getTime() - 10000;
  Object.entries(players).forEach(function(elem){
	if(elem[1].time < limitNoEventTime){
		delete players[elem[0]];
	}
  });
}, 3000);

setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);