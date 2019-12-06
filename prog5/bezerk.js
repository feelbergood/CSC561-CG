// Utility functions
// Check collision between an object and a list of objects
function collide(obj1, obj2) {
    var originPoint = obj1.position.clone();
	for (var vtx of obj1.geometry.vertices)
	{		
		var localVertex = vtx.clone();
		var globalVertex = localVertex.applyMatrix4( obj1.matrix );
		var directionVector = globalVertex.sub( obj1.position );
        // Get ray from object center to current vertex
		var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
        var collisionResults;
        if (obj2.length) { // If obj2 is a list
            collisionResults = ray.intersectObjects( obj2 );
        } else { // If obj2 is an object
            collisionResults = ray.intersectObject( obj2 );
        }
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
			return true; 
        }
    }
    return false;
}

function moveBetween(robot, start, end, dir)
{
    if (dir) { // dir is true => move vertically
        if (robot.position.y >= end) {
            robot.direction = [0, -1];
        }
        if (robot.position.y <= start) {
            robot.direction = [0, 1];
        }
        if (robot.direction) {
            robot.position.y += robot.direction[1] * robotSpeed;
        }
    } else { // dir is false => move horizontally
        if (robot.position.x >= end) {
            robot.direction = [-1, 0];
        }
        if (robot.position.x <= start) {
            robot.direction = [1, 0];
        }
        if (robot.direction) {
            robot.position.x += robot.direction[0] * robotSpeed;
        }
    }
}

// Global variables
var gameOver = false;
var score = 0;
var direction = [0, 0];
var playerSpeed = 0.1;
var robotSpeed = 0.03;
var bulletSpeed = 0.1;
var robotBulletSpeed = 0.05;

// Threejs setup
var scene = new THREE.Scene();
// var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
// var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var camera = new THREE.PerspectiveCamera( 75, 4 / 3, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setSize( 800, 600 );
document.body.appendChild( renderer.domElement );

// Init player
var playerGeometry = new THREE.BoxGeometry( 0.2, 0.4, 0.2 );
var playerMaterial = new THREE.MeshBasicMaterial( { color: 0xdeb887 } );
var player = new THREE.Mesh( playerGeometry, playerMaterial );

// Init walls
var wallMaterial = new THREE.MeshBasicMaterial( { color: 0x6a5acd } );

var leftWall = new THREE.Mesh( new THREE.BoxGeometry( 0.1, 6, 0.2 ), wallMaterial );
leftWall.position.x = -4;

var rightWall = new THREE.Mesh( new THREE.BoxGeometry( 0.1, 6, 0.2 ), wallMaterial );
rightWall.position.x = 4;

var topWall = new THREE.Mesh( new THREE.BoxGeometry( 8, 0.1, 0.2 ), wallMaterial );
topWall.position.y = 3;

var bottomWallLeft = new THREE.Mesh( new THREE.BoxGeometry( 3, 0.1, 0.2 ), wallMaterial );
bottomWallLeft.position.x = -2;
bottomWallLeft.position.y = -3;

var bottomWallRight = new THREE.Mesh( new THREE.BoxGeometry( 3, 0.1, 0.2 ), wallMaterial );
bottomWallRight.position.x = 2;
bottomWallRight.position.y = -3;

var insideWall1 = new THREE.Mesh( new THREE.BoxGeometry( 0.1, 3, 0.2 ), wallMaterial );
insideWall1.position.x = -2;
insideWall1.position.y = 1.5;

var insideWall2 = new THREE.Mesh( new THREE.BoxGeometry( 0.1, 3, 0.2 ), wallMaterial );
insideWall2.position.x = 2;
insideWall2.position.y = 1.5;

var insideWall3 = new THREE.Mesh( new THREE.BoxGeometry( 6, 0.1, 0.2 ), wallMaterial );
insideWall3.position.x = 0;
insideWall3.position.y = -1.5;

var walls = [leftWall, rightWall, topWall, bottomWallLeft, bottomWallRight, insideWall1, insideWall2, insideWall3];

// Init bullets
var bulletGeometry = new THREE.SphereGeometry( 0.05, 10, 10 );
// var bulletGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
var bulletMaterial = new THREE.MeshBasicMaterial( { color: 0xdeb887 } );
var bullets = [];

// Init robots
var robotGeometry = new THREE.BoxGeometry( 0.1, 0.4, 0.2 );
var robotMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
var robots = [];

var robot1 = new THREE.Mesh( robotGeometry, robotMaterial );
robot1.position.x = -3;
robot1.position.y = 0;
robot1.bullets = [];
robots.push(robot1);

var robot2 = new THREE.Mesh( robotGeometry, robotMaterial );
robot2.position.x = 3;
robot2.position.y = 0;
robot2.bullets = [];
robots.push(robot2);

var robot3 = new THREE.Mesh( robotGeometry, robotMaterial );
robot3.position.x = -1;
robot3.position.y = 2;
robot3.bullets = [];
robots.push(robot3);

var robot4 = new THREE.Mesh( robotGeometry, robotMaterial );
robot4.position.x = -3;
robot4.position.y = -2;
robot4.bullets = [];
robots.push(robot4);

// Add meshes to scene
for (var wall of walls) {
    scene.add(wall);
}

for (var robot of robots) {
    scene.add( robot );
}

scene.add( player );

// Adjust camera
camera.position.z = 5;

// Game loop
var animate = function () {
    // Collision between player and wall
    if (collide(player, walls) || collide(player, robots)) {
        gameOver = true;
        document.getElementById("status").style.display = "block";
    }
    
    // Collision between wall and bullet
    for (var blt of bullets) {
        for (var r of robots) {
            if (collide(r, blt)) {
                scene.remove(blt);
                if (bullets.indexOf(blt) > -1) {
                    bullets.splice(bullets.indexOf(blt), 1);
                }
                scene.remove(r);
                if (robots.indexOf(r) > -1) {
                    robots.splice(robots.indexOf(r), 1);
                }
                score += 100;
                console.log(score);
            }
        }
        if (collide(blt, walls)) {
            console.log("bullet collides wall");
            setTimeout(() => {
                scene.remove(blt);
                if (bullets.indexOf(blt) > -1) {
                    bullets.splice(bullets.indexOf(blt), 1);
                }
            }, 1000);
        } else {
            blt.position.x += blt.direction[0] * bulletSpeed;
            blt.position.y += blt.direction[1] * bulletSpeed;
        }
    }

    if (!gameOver) {
        moveBetween(robot1, 0, 2, true);
        moveBetween(robot2, 0, 2, true);
        moveBetween(robot3, -1, 1, false);
        moveBetween(robot4, -3, 3, false);
        for (var rbt of robots) {
        }
    }

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
};

// Event listener
document.addEventListener("keydown", onKeydown);

// Start game
animate();
