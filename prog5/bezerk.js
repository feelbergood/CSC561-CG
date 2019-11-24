// set up the webGL environment
function setupWebGL() {
    // Get the image canvas, render an image in it
    var gameCanvas = document.getElementById("gameCanvas"); // create a 2d canvas
    gl = gameCanvas.getContext("webgl"); // get a webgl object from it

    try {
        if (gl == null) {
            throw "unable to create gl context -- is your browser gl ready?";
        } else {
            gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
            gl.clearDepth(1.0); // use max when we clear the depth buffer
            gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
            gl.viewportWidth = gameCanvas.width;
            gl.viewportHeight = gameCanvas.height;
        }
    } // end try
    catch (e) {
        console.log(e);
    } // end catch

} // end setupWebGL

function main() {
    setupWebGL();
}
