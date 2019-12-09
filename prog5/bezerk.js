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
        var collisionResults = ray.intersectObjects( obj2 );
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

function moveTo(robot, end, dir) {
    if (dir[0] === 0) {
        if (dir[1] === 1 && robot.position.y < end) {
            robot.position.y += dir[1] * robotSpeed;
        }
        if (dir[1] === -1 && robot.position.y > end) {
            robot.position.y += dir[1] * robotSpeed;
        }
    }
    
    if (dir[1] === 0) {
        if (dir[0] === 1 && robot.position.x < end) {
            robot.position.x += dir[0] * robotSpeed;
        }
        if (dir[1] === -1 && robot.position.x > end) {
            robot.position.x += dir[0] * robotSpeed;
        }
    }
}

function initNewBullet(playerOrRobot, bulletList, bulletMaterial) {
    var newBullet = new THREE.Mesh( bulletGeometry, bulletMaterial );
    newBullet.position.x = playerOrRobot.position.x;
    newBullet.position.y = playerOrRobot.position.y;
    newBullet.position.z = playerOrRobot.position.z;
    newBullet.direction = playerOrRobot.direction;
    newBullet.fireBy = playerOrRobot.name;
    bulletList.push(newBullet);
    scene.add(newBullet);
}

function removeItem(itemList, item) {
    scene.remove(item);
    if (itemList.indexOf(item) > -1) {
        itemList.splice(itemList.indexOf(item), 1);
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
var viewType = "normal";

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
player.name = "Player";

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
var robotBulletMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
var bullets = [];
var robotBullets = [];

// Init robots
var robotGeometry = new THREE.BoxGeometry( 0.1, 0.4, 0.2 );
var robotMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
var robots = [];

var robot1 = new THREE.Mesh( robotGeometry, robotMaterial );
robot1.name = "Robot1";
robot1.position.x = -3;
robot1.position.y = 0;
robots.push(robot1);

var robot2 = new THREE.Mesh( robotGeometry, robotMaterial );
robot2.name = "Robot2";
robot2.position.x = 3;
robot2.position.y = 2;
robots.push(robot2);

var robot3 = new THREE.Mesh( robotGeometry, robotMaterial );
robot3.name = "Robot3";
robot3.position.x = -1;
robot3.position.y = 2;
robots.push(robot3);

var robot4 = new THREE.Mesh( robotGeometry, robotMaterial );
robot4.name = "Robot4";
robot4.position.x = -3;
robot4.position.y = -2;
robots.push(robot4);

var robot5 = new THREE.Mesh( robotGeometry, robotMaterial );
robot5.name = "Robot5";
robot5.position.x = 0;
robot5.position.y = -2;
robots.push(robot5);

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

setInterval(() => {
    if (!gameOver) {
        for (var rb of robotBullets) {
            removeItem(robotBullets, rb);
        }
        for (var rbt of robots) {
            initNewBullet(rbt, robotBullets, robotBulletMaterial);
        }
    }
}, 2000);

// Game loop
var animate = function () {
    // Collision between player and wall/robots
    if (collide(player, walls) || collide(player, robots)) {
        gameOver = true;
        document.getElementById("status").style.display = "block";
    }
    if (!gameOver) {
        for (var blt of bullets) {
            // Collision between bullets and robots
            for (var r of robots) {
                if (collide(r, [blt])) {
                    removeItem(robotBullets, blt);
                    removeItem(robots, r);
                    document.querySelector("#explosion").play();
                    score += 100;
                    document.getElementById("score").innerHTML = `Score: ${score}`;
                }
            }
            // Collision between bullets and walls
            if (collide(blt, walls)) {
                console.log("bullet collides wall");
                setTimeout(() => {
                    removeItem(bullets, blt);
                }, 1000);
            } else {
                blt.position.x += blt.direction[0] * bulletSpeed;
                blt.position.y += blt.direction[1] * bulletSpeed;
            }
        }

        // Periodic movement of robots
        moveBetween(robot1, 0, 2, true);
        // moveBetween(robot2, 0, 2, true);
        moveTo(robot2, 0, [0, -1]);
        moveBetween(robot3, -1, 1, false);
        // moveBetween(robot4, -3, 3, false);
        moveTo(robot4, 3, [1, 0]);
        for (var rb of robotBullets) {
            if (rb.position.x !== 0 || rb.position.y !== 0 || rb.position.z !== 0) {
                if (collide(player, [rb])) {
                    gameOver = true;
                    document.getElementById("status").style.display = "block";
                    // removeItem(robotBullets, rb);
                }
                for (var rt of robots) {
                    if (collide(rb, [rt]) && rb.fireBy !== rt.name) {
                        // robot hit by robot bullet
                        for (var rb1 of robotBullets) {
                            if (rb1.fireBy === rt.name) {
                                removeItem(robotBullets, rb1);
                            }
                        }
                        removeItem(robotBullets, rb);
                        removeItem(robots, rt);
                    }
                }
            }
            switch (rb.fireBy) {
                case "Robot1":
                    if (collide(rb, [insideWall3])) {
                        removeItem(robotBullets, rb);
                    } else {
                        rb.position.y -= bulletSpeed;
                    }
                    break;
                case "Robot2":
                    if (collide(rb, [insideWall3])) {
                        removeItem(robotBullets, rb);
                    } else {
                        rb.position.y -= bulletSpeed;
                    }
                    break;
                case "Robot3":
                    if (collide(rb, [insideWall2])) {
                        removeItem(robotBullets, rb);
                    } else {
                        rb.position.x += bulletSpeed;
                    }
                    break;
                case "Robot4":
                    if (collide(rb, [leftWall])) {
                        removeItem(robotBullets, rb);
                    } else {
                        rb.position.x -= bulletSpeed;
                    }
                    break;
                case "Robot5":
                    if (collide(rb, [leftWall])) {
                        removeItem(robotBullets, rb);
                    }
                    break;
                default:
                    break;
            }
        }
        
    }
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
};

// Event listener
document.addEventListener("keydown", onKeydown);

// Start game
animate();
