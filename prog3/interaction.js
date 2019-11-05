var dist = 0.01;
var rotation = 0.01;
var rotationAngle = Math.PI / 20;

function onKeydown(e) {
    var numOfModels = inputTriangles.length;
    var key = e.key;
    switch(key) {
        // Part 3: interactively change view
        // a and d — translate view left and right along view X
        // w and s — translate view forward and backward along view Z
        // q and e — translate view up and down along view Y
        // A and D — rotate view left and right around view Y (yaw)
        // W and S — rotate view forward and backward around view X (pitch)
        case "a":
            eye[0] += dist;
            lookCenter[0] += rotation;
            console.log("translate view left along view X");
            break;
        case "d":
            eye[0] -= dist;
            lookCenter[0] -= rotation;
            console.log("translate view right along view X");
            break;
        case "w":
            eye[2] += dist;
            lookCenter[2] += rotation;
            console.log("translate view forward along view Z");
            break;
        case "s":
            eye[2] -= dist;
            lookCenter[2] -= rotation;
            console.log("translate view backward along view Z");
            break;
        case "q":
            eye[1] += dist;
            lookCenter[1] += rotation;
            console.log("translate view up along view Y");
            break;
        case "e":
            eye[1] -= dist;
            lookCenter[1] -= rotation;
            console.log("translate view down along view Y");
            break;
        case "A":
            lookCenter[0] += rotation;
            console.log("rotate view left around view Y (yaw)");
            break;
        case "D":
            lookCenter[0] -= rotation;
            console.log("rotate view right around view Y (yaw)");
            break;
        case "W":
            lookCenter[1] += rotation;
            console.log("rotate view forward around view X (pitch)");
            break;
        case "S":
            lookCenter[1] -= rotation;
            console.log("rotate view backward around view X (pitch)");
            break;

        // Part 4: Interactively select a model
        // left and right — select and highlight the next/previous triangle set (previous off)
        // space — deselect and turn off highlight
        case "ArrowLeft":
            if (selectedIndex === -1) {
                selectedIndex = 0;
            } else {
                selectedIndex++;
            }
            if (selectedIndex >= numOfModels) {
                selectedIndex = 0;
            }
            document.getElementById("modelIndex").innerHTML = selectedIndex;
            console.log("select and highlight the next triangle set");
            break;
        case "ArrowRight":
            if (selectedIndex === -1) {
                selectedIndex = numOfModels-1;
            } else {
                selectedIndex--;
            }
            if (selectedIndex < 0) {
                selectedIndex = numOfModels-1;
            }
            document.getElementById("modelIndex").innerHTML = selectedIndex;
            console.log("select and highlight the previous triangle set");
            break;
        case " ":
            e.preventDefault();
            selectedIndex = -1;
            document.getElementById("modelIndex").innerHTML = "None";
            console.log("deselect and turn off highlight");
            break;

        // Part 5: Interactively change projection of a model
        // < — use perspective projection (the default)
        // = — use parallel projection
        case ",":
            isPerspective = true;
            document.getElementById("mode").innerHTML = "Perspective";
            console.log("Perspective Projection");
            break;
        case "=":
            isPerspective = false;
            document.getElementById("mode").innerHTML = "Parallel";
            console.log("Parallel Projection");
            break;

        // Part 6: Interactively transform models
        // k and ; — translate selection left and right along view X
        // o and l — translate selection forward and backward along view Z
        // i and p — translate selection up and down along view Y
        // K and : — rotate selection left and right around view Y (yaw)
        // O and L — rotate selection forward and backward around view X (pitch)
        // I and P — rotate selection clockwise and counterclockwise around view Z (roll)
        case "k":
            if (selectedIndex !== -1) {
                mat4.translate(inputTriangles[selectedIndex].tfMatrix, 
                                inputTriangles[selectedIndex].tfMatrix, 
                                new vec3.fromValues(dist, 0, 0));
                console.log("translate selection left along view X");
            } else {
                console.log("No model selected!");
            }
            break;
        case ";":
            if (selectedIndex !== -1) {
                mat4.translate(inputTriangles[selectedIndex].tfMatrix, 
                                inputTriangles[selectedIndex].tfMatrix, 
                                new vec3.fromValues(-dist, 0, 0));
                console.log("translate selection right along view X");
            } else {
                console.log("No model selected!");
            }
            break;
        case "o":
            if (selectedIndex !== -1) {
                mat4.translate(inputTriangles[selectedIndex].tfMatrix, 
                                inputTriangles[selectedIndex].tfMatrix, 
                                new vec3.fromValues(0, 0, dist));
                console.log("translate selection forward along view Z");
            } else {
                console.log("No model selected!");
            }
            break;
        case "l":
            if (selectedIndex !== -1) {
                mat4.translate(inputTriangles[selectedIndex].tfMatrix, 
                                inputTriangles[selectedIndex].tfMatrix, 
                                new vec3.fromValues(0, 0, -dist));
                console.log("translate selection backward along view Z");
            } else {
                console.log("No model selected!");
            }
            break;
        case "i":
            if (selectedIndex !== -1) {
                mat4.translate(inputTriangles[selectedIndex].tfMatrix, 
                                inputTriangles[selectedIndex].tfMatrix, 
                                new vec3.fromValues(0, dist, 0));
                console.log("translate selection up along view Y");
            } else {
                console.log("No model selected!");
            }
            break;
        case "p":
            if (selectedIndex !== -1) {
                mat4.translate(inputTriangles[selectedIndex].tfMatrix, 
                                inputTriangles[selectedIndex].tfMatrix, 
                                new vec3.fromValues(0, -dist, 0));
                console.log("translate selection down along view Y");
            } else {
                console.log("No model selected!");
            }
            break;
        case "K":
            if (selectedIndex !== -1) {
                mat4.rotateY(inputTriangles[selectedIndex].tfMatrix, 
                            inputTriangles[selectedIndex].tfMatrix, 
                            rotationAngle);
                console.log("rotate selection left around view Y (yaw)");
            } else {
                console.log("No model selected!");
            }
            break;
        case ":":
            if (selectedIndex !== -1) {
                mat4.rotateY(inputTriangles[selectedIndex].tfMatrix, 
                            inputTriangles[selectedIndex].tfMatrix, 
                            -rotationAngle);
                console.log("rotate selection right around view Y (yaw)");
            } else {
                console.log("No model selected!");
            }
            break;
        case "O":
            if (selectedIndex !== -1) {
                mat4.rotateX(inputTriangles[selectedIndex].tfMatrix, 
                            inputTriangles[selectedIndex].tfMatrix, 
                            rotationAngle);
                console.log("rotate selection forward around view X (pitch)");
            } else {
                console.log("No model selected!");
            }
            break;
        case "L":
            if (selectedIndex !== -1) {
                mat4.rotateX(inputTriangles[selectedIndex].tfMatrix, 
                            inputTriangles[selectedIndex].tfMatrix, 
                            -rotationAngle);
                console.log("rotate selection backward around view X (pitch)");
            } else {
                console.log("No model selected!");
            }
            break;
        case "I":
            if (selectedIndex !== -1) {
                mat4.rotateZ(inputTriangles[selectedIndex].tfMatrix, 
                            inputTriangles[selectedIndex].tfMatrix, 
                            rotationAngle);
                console.log("rotate selection clockwise around view Z (roll)");
            } else {
                console.log("No model selected!");
            }
            break;
        case "P":
            if (selectedIndex !== -1) {
                mat4.rotateZ(inputTriangles[selectedIndex].tfMatrix, 
                            inputTriangles[selectedIndex].tfMatrix, 
                            -rotationAngle);
                console.log("rotate selection counterclockwise around view Z (roll)");
            } else {
                console.log("No model selected!");
            }
            break;
        default:
            break;
    }
    requestAnimationFrame(renderTriangles);
}