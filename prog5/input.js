function onKeydown(e) {
    if (!gameOver) {
        var key = e.key.toLowerCase();
        switch(key) {
            // a and d — translate view left and right along view X
            // w and s — translate view forward and backward along view Z
            // q and e — translate view up and down along view Y
            // A and D — rotate view left and right around view Y (yaw)
            // W and S — rotate view forward and backward around view X (pitch)
            case "w":
                player.position.y += playerSpeed;
                direction = [0, 1];
                break;
            case "a":
                player.position.x -= playerSpeed;
                direction = [-1, 0];
                break;
            case "s":
                player.position.y -= playerSpeed;
                direction = [0, -1];
                break;
            case "d":
                player.position.x += playerSpeed;
                direction = [1, 0];
                break;
            case " ":
                if (direction[0] !== 0 || direction[1] !== 0) {
                    console.log("fire!");
                    var newBullet = new THREE.Mesh( bulletGeometry, bulletMaterial );
                    newBullet.position.x = player.position.x;
                    newBullet.position.y = player.position.y;
                    newBullet.direction = direction;
                    bullets.push(newBullet);
                    scene.add(newBullet);
                }
            default:
                break;
        }
    }
}