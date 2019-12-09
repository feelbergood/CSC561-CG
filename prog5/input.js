function play(audio) {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
        audio.currentTime = 0;
    }
}

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
                player.direction = [0, 1];
                break;
            case "a":
                player.position.x -= playerSpeed;
                player.direction = [-1, 0];
                break;
            case "s":
                player.position.y -= playerSpeed;
                player.direction = [0, -1];
                break;
            case "d":
                player.position.x += playerSpeed;
                player.direction = [1, 0];
                break;
            case " ":
                if (player.direction[0] !== 0 || player.direction[1] !== 0) {
                    initNewBullet(player, bullets, bulletMaterial);
                    var fireAudio = document.querySelector("#fire");
                    play(fireAudio);
                }
                break;
            case "v":
                if (viewType === "normal") {
                    viewType = "OTS";
                    camera.position.z = 2;
                    camera.position.y = -7;
                    camera.rotation.x = 1.2;
                } else {
                    viewType = "normal";
                    camera.position.z = 5;
                    camera.position.y = 0;
                    camera.rotation.x = 0;
                }
                break;
            case "p":
                play(document.querySelector("#bgmusic"));
                break;
            default:
                break;
        }
    }
}