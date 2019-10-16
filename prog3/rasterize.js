/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog3/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog3/spheres.json"; // spheres file loc
const INPUT_LIGHTS_URL = "https://ncsucgclass.github.io/prog3/lights.json";

var inputTriangles;
var inputLights;

var eye = new vec3.fromValues(0.5, 0.5, -0.5); // default eye position in world space
var viewUp = new vec3.fromValues(0, 1, 0);
var lookAt = new vec3.fromValues(0, 0, 1);
var lookCenter = new vec3.fromValues(0.5, 0.5, 0);

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var shaderProgram;
var isPerspective = true;
var vertexBuffer = [];
var indexBuffer = [];
var normalBuffer = [];
var setCenters = [];
var selectedIndex = -1;
var scaling = new vec3.fromValues(1.2, 1.2, 1.2);

// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it

    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
      }
    } // end try
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL

// read triangles in, load them into webgl buffers
function loadTriangles() {
    inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles");
    if (inputTriangles != String.null) { 
        for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {
            var whichSetVert; // index of vertex in current triangle set
            var whichSetTri; // index of triangle in current triangle set
            var coordArray = []; // 1D array of vertex coords for WebGL
            var indexArray = [];
            var normalArray = [];
            var triCenter = vec3.create();
            // set up the vertex coord array
            for (whichSetVert = 0; whichSetVert<inputTriangles[whichSet].vertices.length; whichSetVert++) {
                var coord = inputTriangles[whichSet].vertices[whichSetVert];
                var norm = inputTriangles[whichSet].normals[whichSetVert];
                coordArray.push(coord[0], coord[1], coord[2]);
                normalArray.push(norm[0], norm[1], norm[2]);
                // console.log(inputTriangles[whichSet].vertices[whichSetVert]);
            }
            for (whichSetTri = 0; whichSetTri < inputTriangles[whichSet].triangles.length; whichSetTri++) {
                var tri = inputTriangles[whichSet].triangles[whichSetTri];
                indexArray.push(tri[0], tri[1], tri[2]);
                for (var i=0; i<3;i++) {
                    vec3.scaleAndAdd(triCenter, triCenter, inputTriangles[whichSet].vertices[tri[i]], 1/3);
                }
            }
            setCenters[whichSet] = vec3.create();
            vec3.scale(setCenters[whichSet], triCenter, 1/inputTriangles[whichSet].triangles.length);

            // send the vertex coords to webGL
            vertexBuffer[whichSet] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(coordArray),gl.STATIC_DRAW); // coords to that buffer

            // send triangle indices to webGL
            indexBuffer[whichSet] = gl.createBuffer(); // init empty triangle index buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer[whichSet]); // activate that buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW); // indices to that buffer
            indexBuffer[whichSet].bufferSize = inputTriangles[whichSet].triangles.length * 3;

            normalBuffer[whichSet] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer[whichSet]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalArray), gl.STATIC_DRAW);

            inputTriangles[whichSet].tfMatrix = mat4.create();
        } // end for each triangle set 
    } // end if triangles found
} // end load triangles

// setup the webGL shaders
function setupShaders() {
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float;
        uniform vec3 lightPos;
        uniform vec3 lightAmbient;
        uniform vec3 lightDiffuse;
        uniform vec3 lightSpecular;
        uniform vec3 eyePos;
        
        uniform vec3 materialAmbient;
        uniform vec3 materialDiffuse;
        uniform vec3 materialSpecular;
        uniform float materialN;

        varying vec3 mVertexPos;
        varying vec3 mVertexNorm;

        void main(void) {
            vec3 lightDir = normalize(lightPos - mVertexPos);
            vec3 viewDir = normalize(eyePos - mVertexPos);
            vec3 normNorm = normalize(mVertexNorm);
            vec3 H = normalize(lightDir + viewDir);
            float diffuseFactor = max(dot(normNorm, lightDir), 0.0);
            float specularFactor = pow(max(0.0, dot(H, normNorm)), materialN);

            vec3 color = lightAmbient * materialAmbient + 
                            lightDiffuse * materialDiffuse * diffuseFactor + 
                            lightSpecular * materialSpecular * specularFactor;

            gl_FragColor = vec4(color, 1.0);
        }
    `;
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 vertexPos;
        attribute vec3 vertexNorm;
        uniform mat4 mMatrix;
        uniform mat4 pOrOMatrix;
        uniform mat4 vMatrix;
        uniform mat3 nMatrix;
        varying vec3 mVertexPos;
        varying vec3 mVertexNorm;
        void main(void) {
            gl_Position = pOrOMatrix * vMatrix * mMatrix * vec4(vertexPos, 1.0);
            mVertexPos = vec3(mMatrix * vec4(vertexPos, 1.0));
            mVertexNorm = nMatrix * vertexNorm;
        }
    `;
    
    try {
        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                // get pointer to vertex shader input
                shaderProgram.vertexPos = gl.getAttribLocation(shaderProgram, "vertexPos");
                shaderProgram.vertexNorm = gl.getAttribLocation(shaderProgram, "vertexNorm");

                shaderProgram.mMatrix = gl.getUniformLocation(shaderProgram, "mMatrix");
                shaderProgram.vMatrix = gl.getUniformLocation(shaderProgram, "vMatrix");
                shaderProgram.pOrOMatrix = gl.getUniformLocation(shaderProgram, "pOrOMatrix");
                shaderProgram.nMatrix = gl.getUniformLocation(shaderProgram, "nMatrix");

                shaderProgram.lightPos = gl.getUniformLocation(shaderProgram, "lightPos");
                shaderProgram.lightAmbient = gl.getUniformLocation(shaderProgram, "lightAmbient");
                shaderProgram.lightDiffuse = gl.getUniformLocation(shaderProgram, "lightDiffuse");
                shaderProgram.lightSpecular = gl.getUniformLocation(shaderProgram, "lightSpecular");
                shaderProgram.eyePos = gl.getUniformLocation(shaderProgram, "eyePos");

                shaderProgram.materialAmbient = gl.getUniformLocation(shaderProgram, "materialAmbient");
                shaderProgram.materialDiffuse = gl.getUniformLocation(shaderProgram, "materialDiffuse");
                shaderProgram.materialSpecular = gl.getUniformLocation(shaderProgram, "materialSpecular");
                shaderProgram.materialN = gl.getUniformLocation(shaderProgram, "materialN");
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function renderTriangles() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    loadLights();
    gl.uniform3fv(shaderProgram.eyePos, eye);
    // Viewing Matrix
    var vMatrix = mat4.create();
    mat4.lookAt(vMatrix, eye, lookCenter, viewUp);
    // Perspective Matrix
    var pOrOMatrix = mat4.create();
    if (isPerspective) {
        mat4.perspective(pOrOMatrix, Math.PI/2, gl.viewportWidth/gl.viewportHeight, 0.1, 100);
    } else {
        mat4.ortho(pOrOMatrix, -1.0, 1.0, -1.0, 1.0, 0.1, 100);
    }
    gl.uniformMatrix4fv(shaderProgram.vMatrix, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.pOrOMatrix, false, pOrOMatrix);

    for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {
        var material = inputTriangles[whichSet].material;
        gl.uniform3fv(shaderProgram.materialAmbient, material.ambient);
        gl.uniform3fv(shaderProgram.materialDiffuse, material.diffuse);
        gl.uniform3fv(shaderProgram.materialSpecular, material.specular);
        gl.uniform1f(shaderProgram.materialN, material.n);

        // Model Matrix
        var mMatrix = mat4.create();
        mat4.translate(mMatrix, mMatrix, setCenters[whichSet]);
        if (whichSet === selectedIndex) {
            mat4.scale(mMatrix, mMatrix, scaling);
        }
        mat4.multiply(mMatrix, mMatrix, inputTriangles[whichSet].tfMatrix);
        mat4.translate(mMatrix, mMatrix, vec3.negate(vec3.create(), setCenters[whichSet]));
        gl.uniformMatrix4fv(shaderProgram.mMatrix, false, mMatrix);

        // Normal Transform Matrix
        var nMatrix = mat3.create();
        mat3.normalFromMat4(nMatrix, mMatrix);
        // smooth shading with vertex normals
        mat3.invert(nMatrix, nMatrix);
        mat3.transpose(nMatrix, nMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrix, false, nMatrix);

        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer[whichSet]); // activate
        gl.vertexAttribPointer(shaderProgram.vertexPos, 3, gl.FLOAT, false, 0, 0); // feed
        gl.enableVertexAttribArray(shaderProgram.vertexPos); // input to shader from array

        // normal buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer[whichSet]); // activate
        gl.vertexAttribPointer(shaderProgram.vertexNorm, 3, gl.FLOAT, false, 0, 0); // feed
        gl.enableVertexAttribArray(shaderProgram.vertexNorm);

        // index buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer[whichSet]); // activate
        gl.drawElements(gl.TRIANGLES, indexBuffer[whichSet].bufferSize, gl.UNSIGNED_SHORT, 0); // render
    }


} // end render triangles

function loadLights() {
    inputLights = getJSONFile(INPUT_LIGHTS_URL,"lights");
    var light = inputLights[0];
    gl.uniform3f(shaderProgram.lightPos, light.x, light.y, light.z);
    gl.uniform3fv(shaderProgram.lightAmbient, light.ambient);
    gl.uniform3fv(shaderProgram.lightDiffuse, light.diffuse);
    gl.uniform3fv(shaderProgram.lightSpecular, light.specular);
}

/* MAIN -- HERE is where execution begins after window load */

function main() {
    setupWebGL(); // set up the webGL environment
    loadTriangles(); // load in the triangles from tri file
    setupShaders(); // setup the webGL shaders
    document.addEventListener("keydown", onKeydown);
    renderTriangles(); // draw the triangles using webGL
  
} // end main
