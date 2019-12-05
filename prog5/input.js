var dist = 0.1;
var rotation = 0.01;
var rotationAngle = Math.PI / 20;

function onKeydown(e) {
    var key = e.key.toLowerCase();
    switch(key) {
        // a and d — translate view left and right along view X
        // w and s — translate view forward and backward along view Z
        // q and e — translate view up and down along view Y
        // A and D — rotate view left and right around view Y (yaw)
        // W and S — rotate view forward and backward around view X (pitch)
        case "w":
            player.position.y += dist;
            break;
        case "a":
            player.position.x -= dist;
            break;
        case "s":
            player.position.y -= dist;
            break;
        case "d":
            player.position.x += dist;
            break;
        default:
            break;
    }
}