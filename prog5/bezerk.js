// Utility functions
// Check collision between an object and a list of objects
function collide(obj1, obj2) {
    var originPoint = player.position.clone();
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
		if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
			return true;
    }
    return false;
}

// Threejs setup
var scene = new THREE.Scene();
// var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
var camera = new THREE.PerspectiveCamera( 75, 4 / 3, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setSize( 800, 600 );
document.body.appendChild( renderer.domElement );

// Init player
var playerGeometry = new THREE.BoxGeometry( 0.2, 0.4, 0.2 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var player = new THREE.Mesh( playerGeometry, material );

// Init walls
var wallMaterial = new THREE.MeshBasicMaterial( { color: 0x663300 } );

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

// Add meshes to scene
for (var wall of walls) {
    scene.add(wall);
}
scene.add( player );

// Adjust camera
camera.position.z = 5;

// Game loop
var animate = function () {
    if (collide(player, walls)) {
        console.log("Hit wall!");
    }
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
};

// Event listener
document.addEventListener("keydown", onKeydown);

// Start game
animate();
