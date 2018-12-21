var canvas = document.getElementById("GameCanvas");
var gameGraphics = canvas.getContext("2d");
canvas.addEventListener("mousedown", captureMouseDown);
canvas.addEventListener("mouseup", captureMouseUp);
/*

2 canvases are stacked on top of each other so that the draw canvas can get cleared while the game canvas
stays permanent and does not have to be redrawn from scratch every time.
*/
canvas.addEventListener("mousemove", captureMouseMove);


var draw = document.getElementById("DrawCanvas");
var drawGraphics = draw.getContext("2d");

//store relevant info
var playerEdges = [];
var computerEdges = [];
var playerDots = [];
var computerDots = [];

var dotPositions = [];

//states for the event listeners
var isDrawingEdge = false;
var initialDotPoint;
var finalDotPoint;
var mouseUpDrawEdge = false;

//standard width and height
const CANVAS_W = 700;
const CANVAS_H = 700;

//size of the grid cells
const GRID = 5;

const CELL_W = CANVAS_W / 5;
const CELL_H = CANVAS_H / 5;
const DOT_RADIUS = 10;

//called every time mouse is moved

//CANVAS_H - event.offsetY inverts the y axis
function captureMouseMove(event) {


    if (isDrawingEdge) {

        
        let inputX = event.offsetX;
        let inputY = CANVAS_H - event.offsetY;


        //set the ready to draw edge flag upon mouse button lifted if on a dot
        let dragPos = insideDot(inputX, inputY);
        if (dragPos !== undefined) {
            mouseUpDrawEdge = true;
            finalDotPoint = dragPos;
        }


        drawGraphics.clearRect(0, 0, CANVAS_W, CANVAS_H);

        //the second draw canvas gets erased while the game canvas stays permanent, or else
        //redraws would happen every time
        drawGraphics.strokeStyle = "#0B0B0B";
        drawGraphics.beginPath();
        drawGraphics.moveTo(initialDotPoint[0], CANVAS_H - initialDotPoint[1]);
        drawGraphics.lineTo(inputX, CANVAS_H - inputY);
        drawGraphics.stroke();



    }

}
//on mouse up check if you landed on a valid secondary dot.
function captureMouseUp(event) {
    isDrawingEdge = false;
    drawGraphics.clearRect(0, 0, CANVAS_W, CANVAS_H);

    if (mouseUpDrawEdge) {


        let distanceFromInputToPoint = vecMag(
            finalDotPoint[0] - initialDotPoint[0],
            finalDotPoint[1] - initialDotPoint[1]

        );
        //valid only if you are a cells width/height away and not a diagonal
        if (parseInt(distanceFromInputToPoint) === CELL_H || parseInt(distanceFromInputToPoint) === CELL_W) {
            gameGraphics.fillStyle = "#FF0000";
            gameGraphics.strokeStyle="#FF4136";

            //reset diagonals
            gameGraphics.beginPath();
            gameGraphics.arc(finalDotPoint[0], CANVAS_H - finalDotPoint[1], DOT_RADIUS, 0, 2 * Math.PI);
            gameGraphics.fill();
            gameGraphics.moveTo(initialDotPoint[0], CANVAS_H - initialDotPoint[1]);
            gameGraphics.lineTo(finalDotPoint[0], CANVAS_H - finalDotPoint[1]);
            gameGraphics.stroke();
            mouseUpDrawEdge = false;

            if (!isEdgeInArray(initialDotPoint, finalDotPoint,playerEdges)) {
                playerEdges.push(
                   [
                       initialDotPoint,finalDotPoint
                   ]
                );

            }
            if(!isDotInArray(initialDotPoint,playerDots))
            {
                playerDots.push(initialDotPoint);
            }
            if(!isDotInArray(finalDotPoint,playerDots))
            {
                playerDots.push(finalDotPoint);
            }
    
            squares();
            computerMoves();
            //finalDotPoint = undefined;
            //initialDotPoint = undefined;

        }


    }


}
//find out if you are in a dot, else reject. if so fill the dot circle
function captureMouseDown(event) {

    let inputX = event.offsetX;
    let inputY = CANVAS_H - event.offsetY;

    let dot = insideDot(inputX, inputY);
    if (dot !== undefined) {

        isDrawingEdge = true;
        gameGraphics.fillStyle = "#FF0000";
        gameGraphics.beginPath();
        gameGraphics.arc(dot[0], CANVAS_H - dot[1], DOT_RADIUS, 0, 2 * Math.PI);
        gameGraphics.stroke();
        gameGraphics.fill();
        isDrawingEdge = true;
        initialDotPoint = dot;
    }

}

//first draw functino call
function DRAW() {
    for (let row = 0; row <= GRID; row++) {
        for (let col = 0; col <= GRID; col++) {

            gameGraphics.lineWidth = 2;
            gameGraphics.beginPath();
            gameGraphics.arc(CELL_W * row, CELL_H * col, DOT_RADIUS, 0, 2 * Math.PI);
            gameGraphics.stroke();
            gameGraphics.lineWidth = 7;

            dotPositions.push(
                [CELL_W * row, CANVAS_H - (CELL_H * col)]
            );


        }
    }

}

//helper func
function vecMag(x, y) {
    return Math.sqrt(
        Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2)
    );
}
//is a point inside of a dot?
function insideDot(x, y) {

    for (let i = 0; i < dotPositions.length; i++) {


        let position = dotPositions[i];
        let origin = position;

        let u = [
            origin[0] - x,
            origin[1] - y
        ];

        let mag = vecMag(u[0], u[1]);

        if (mag <= DOT_RADIUS) {

            return position;

        }

        /*

        //console.log(mag);
        

    
    */
    }

    return undefined;

}

/*
brute force checking for the existence of squares by edges in every single square possible
*/
function squares() {
    for (let row = 0; row <= GRID - 1; row++) {
        for (let col = 0; col <= GRID - 1; col++) {


            let cornerBottomLeft = [(CELL_W * row), (CELL_H * col)];
            let cornerBottomRight = [(CELL_W * row) + CELL_W, (CELL_H * col)];
            let cornerTopLeft = [(CELL_W * row), (CELL_H * col) + CELL_H];
            let cornerTopRight = [(CELL_W * row) + CELL_W, (CELL_H * col) + CELL_H];

            /*
            console.log(cornerBottomLeft);
            console.log(cornerBottomRight);
            console.log(cornerTopLeft);
            console.log(cornerTopRight);
            */


            if (
                isEdgeInArray(cornerBottomLeft,cornerBottomRight, playerEdges) &&
                isEdgeInArray(cornerBottomRight,cornerTopRight, playerEdges) &&
                isEdgeInArray(cornerTopRight,cornerTopLeft, playerEdges) &&
                isEdgeInArray(cornerTopLeft,cornerBottomLeft, playerEdges)
            ) {
                console.log("You made a square!");
                
                gameGraphics.fillStyle = "#FF4136";
                gameGraphics.beginPath();
                gameGraphics.rect(cornerBottomLeft[0],CANVAS_H - cornerBottomLeft[1] - CELL_H,CELL_W,CELL_H);
                gameGraphics.stroke();
                gameGraphics.fill();

            }

            if (
                isEdgeInArray(cornerBottomLeft,cornerBottomRight, computerEdges) &&
                isEdgeInArray(cornerBottomRight,cornerTopRight, computerEdges) &&
                isEdgeInArray(cornerTopRight,cornerTopLeft, computerEdges) &&
                isEdgeInArray(cornerTopLeft,cornerBottomLeft, computerEdges)
            ) {
                console.log("Enemy made a square!");
                
                gameGraphics.fillStyle = "#0074D9";
                gameGraphics.beginPath();
                gameGraphics.rect(cornerBottomLeft[0],CANVAS_H - cornerBottomLeft[1] - CELL_H,CELL_W,CELL_H);
                gameGraphics.stroke();
                gameGraphics.fill();

            }



        }
    }
}



function isEdgeInArray(point1, point2, arr) {
    for (let i = 0; i < arr.length; i++) {
        let subArray = arr[i];
        let edgePoint1 = subArray[0];
        let edgePoint2 = subArray[1];

        /*
            [0,100] -> [300,55] is an edge equal to
            [300,55] -> [0,100]
            performing checks for both
        */

        if (
                
                
                (point1[0] === edgePoint2[0] && point1[1] === edgePoint2[1]
                    &&
                  point2[0] === edgePoint1[0] && point2[1] === edgePoint1[1])
                

                ||

                (edgePoint1[0] === point1[0] && edgePoint1[1] === point1[1] &&
                    edgePoint2[0] === point2[0] && edgePoint2[1] === point2[1])
                
   
                
            
        )
        {
            return true;
        }
    }
    return false;
}

function isDotInArray(dot, arr) {
    for (let i = 0; i < arr.length; i++) {
        let subArray = arr[i];
        if (dot[0] === subArray[0] && dot[1] === subArray[1]) {
            return true;
        }
    }
    return false;
}


/*
brute force computer move checking. picks random points. if they are the correct distance and the edge does not
already exist in the player array and the point does not exist in the player array
its a valid move

*/
function computerMoves()
{
    let validMove = false;
    while(!validMove)
    {

        let randomDotOne = dotPositions[parseInt(Math.random() * 1000) % dotPositions.length];
        let randomdotTwo = dotPositions[parseInt(Math.random() * 1000) % dotPositions.length];
        let dotOneToDotTwo = [
            randomDotOne[0] - randomdotTwo[0],randomDotOne[1] - randomdotTwo[1]
        ];
        let magComputedEdge = parseInt(vecMag(dotOneToDotTwo[0],dotOneToDotTwo[1]));
 


        if(magComputedEdge === CELL_H || magComputedEdge === CELL_W)
        {


            
            if(!isEdgeInArray(randomDotOne,randomdotTwo,playerEdges) && 
               !isDotInArray(randomDotOne,playerDots) && 
               !isDotInArray(randomdotTwo,playerDots))
            {
                

                //computed edge is chosen.
                computerEdges.push([randomDotOne,randomdotTwo]);

                gameGraphics.strokeStyle = "#7FDBFF";
                gameGraphics.fillStyle="#0000FF";
                gameGraphics.beginPath();
                gameGraphics.moveTo(randomdotTwo[0],CANVAS_H - randomdotTwo[1]);
                gameGraphics.lineTo(randomDotOne[0],CANVAS_H - randomDotOne[1]);
                gameGraphics.stroke();
                validMove = true;


            }
        }
    
    }
  
}

DRAW();
