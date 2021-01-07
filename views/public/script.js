var socket = io();
var center = {x: 1 + Math.random(), z: 1 + Math.random()};
var anim = false;
var interval = null;
              
var movement = {
  pos: {x:1 + Math.random(),
        y:0.5,
        z:1 +  Math.random()},
	id: socket.id,
	color:"#" + Math.floor(Math.random()*16777215).toString(16)
};

socket.on('message', function(data) {
  console.log("data:",data);
});

// you can use it make some other good stuff.

socket.on("disconnect", function() {
  console.log("Disconnected");
});

socket.on("reconnect", function() {
  // do not rejoin from here, since the socket.id token and/or rooms are still
  // not available.
  console.log("Reconnecting");
});

socket.on("connect", function() {
  // thats the key line, now register to the room you want.
  // info about the required rooms (if its not as simple as my 
  // example) could easily be reached via a DB connection. It worth it.
  movement.id = socket.id;
  socket.emit('new player', movement);
});

document.getElementById("canvas").onmousemove = mouseMove;
var mouseX = 0;
var mouseY = 0;

function mouseMove(evt) {
	if(evt.buttons == 1){
		movement.pos.x = evt.clientX  * 0.01;
		movement.pos.z = evt.clientY  * 0.01;
	}
}

document.getElementById("canvas").addEventListener('touchmove', function touchMove(evt) {
		movement.pos.x = evt.touches[0].pageX * 0.01; 
		movement.pos.z = evt.touches[0].pageY * 0.01;
}, false);

setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

var canvas = document.getElementById('canvas');
canvas.width = 600;
canvas.height = 600;
var context = canvas.getContext('2d');

socket.on('state', function(players) {
  context.fillStyle = '#efefef';
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (var id in players) {
    var player = players[id];
    context.fillStyle = player.color;
    context.beginPath();
    context.arc(player.pos.x * 100, player.pos.z  * 100, 10, 0, 2 * Math.PI);
    context.fill();
  }
});

socket.on('objects', function(objects){
  //if(objects.id == socket.id) return;
  console.log("objects:",objects);
  if(objects.ac == 'a'){
    objects.objs.forEach((obj) =>{
      if(obj.id == 'sceneParent'){
        scale = obj.val;
       document.getElementById('scale').innerHTML = scale;
      }
    });
  }
});

var objstate = false;
var scale = 1;
function sendObjects(){
  objstate = !objstate;
  socket.emit('objects', {id:socket.id, ac:'a',
                          objs:[{id:'wturbine1', animar:objstate}]});
}
          
function selectObject(){
  socket.emit('objects', {id:socket.id, ac:'s',
                          objs:[{id:'wturbine1'}]});
}

function scaleUp(){
  scale = scale >= 1 ? scale + 1: scale * 2;
  socket.emit('objects', {id:socket.id, ac:'a', objs:[{id:'sceneParent', val:scale}]});
}

function scaleDown(){
  scale = scale <= 1 ? scale/2: scale - 1;
  socket.emit('objects', {id:socket.id, ac:'a', objs:[{id:'sceneParent', val:scale}]});
}

function animatePoint(){
  anim = !anim;
  if(anim){
    interval = setInterval(() =>{
      let time = new Date().getTime()/1200;
      movement.pos.x = center.x + Math.cos(time);
      movement.pos.z = center.z + Math.sin(time);
    }, 1000/60);
  }else{
    clearInterval(interval);
  }
}

function rand(){return Math.random()>0.5;}