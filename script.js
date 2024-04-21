const menuButton = document.querySelector('.menu-button');
const closeButton = document.querySelector('.close-button');
const sidebar = document.querySelector('.sidebar');

const hideSidebar =() => {
    sidebar.style.display = 'none';
};

const showSidebar = () => {
    sidebar.style.display = 'flex';
};

menuButton.addEventListener("click", showSidebar);
closeButton.addEventListener("click", hideSidebar);

let debug = true;

const canvas = document.getElementById('canvas');
const context = canvas.getContext("2d");
const canvasCnt = document.querySelector('.canvas-cnt');

const playnameInput = document.getElementById('playname');
const formationType = document.getElementById('playformation');

const modeButtons = document.querySelectorAll('.action-option');
const modeDivs = document.querySelectorAll('.section');
const addDiv = document.querySelector('.add');
const editDiv = document.querySelector('.edit');
const deleteDiv = document.querySelector('.delete');
const addButton = document.getElementById('add-button');
const editButton = document.getElementById('edit-button');
const deleteButton = document.getElementById('delete-button');

const textInputForPlace = document.getElementById('player-text');
const colorPickerForPlace = document.getElementById('color-picker');
const playerRangeForPlace = document.getElementById('player-range');
const shapeButtons = document.querySelectorAll('.icon-shape');
const squareButton = document.getElementById('square');
const circleButton = document.getElementById('circle');
const lineButton = document.getElementById('solid-line');
const dottedLineButton = document.getElementById('dotted-line');

const textInputForSelected = document.getElementById('player-text-selected');
const colorPickerForSelected = document.getElementById('color-picker-selected');
const playerRangeForSelected = document.getElementById('player-range-selected');
const textInputForAll = document.getElementById('player-text-all');
const colorPickerForAll = document.getElementById('color-picker-all');
const playerRangeForAll = document.getElementById('player-range-all');

const undoButton = document.getElementById('undo-button');
const clearButton = document.getElementById('clear-button');
const saveButton = document.getElementById('save-button');


canvas.width = window.innerWidth / 2;
canvas.height = (window.innerHeight * 2) /3;

let canvas_width = canvas.width;
let canvas_height = canvas.height;

let offset_x;
let offset_y;
let start_background_color = "white";
let shapes = [];
let plays = [];
let formation = [];
let mode = '';

context.fillStyle = start_background_color;
context.fillRect(0, 0, canvas.width, canvas.height);

let current_shape_index = null;
let is_dragging = false;
let isDrawing = false;
let isDrawingDotted = false;
let startX = null;
let startY = null;
let endX = null;
let endY = null;
const dotSpacing = 10;
const dotLength = 5;

centerX = canvas_width / 2;
centerY = canvas_height / 2;
xStart = centerX - 200;
yStart = centerY + 50;

let get_offset = function () {
    let canvas_offsets = canvas.getBoundingClientRect();
    offset_x = canvas_offsets.left;
    offset_y = canvas_offsets.top;
}

get_offset();
window.onscroll = function() { get_offset(); }
window.onresize = function() { get_offset(); }
canvas.onresize = function() { get_offset(); }

/******************************** CANVAS WIDGETS ************************************/

class Circle {
    constructor (xpos, ypos, radius, color, text) {
        this.type = 'circle';
        this.xpos = xpos;
        this.ypos = ypos;
        this.radius = radius;
        this.color = color;
        this.text = text;
    }

    draw(context) {
        context.beginPath();

        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseAlign = "middle";
        context.font = "20px Arial";
        context.fillStyle = this.color;
        context.fillText(this.text, this.xpos, this.ypos);

        context.arc(this.xpos, this.ypos, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update() {
        this.draw(context);
    }

    delete(index) {
        shapes.splice(index, 1);
        redrawCanvas();
    }
}

class Square {
    constructor (xpos, ypos, sideLength, color, text) {
        this.type = 'square';
        this.xpos = xpos;
        this.ypos = ypos;
        this.sideLength = sideLength;
        this.color = color;
        this.text = text;
    }
    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillStyle = this.color
        context.fillText(this.text, this.xpos + this.sideLength / 2, this.ypos + this.sideLength / 2);

        context.rect(this.xpos, this.ypos, this.sideLength, this.sideLength);
        context.stroke();
        context.closePath();
    }

    update() {
        this.draw(context); 
    }

    delete(index) {
        shapes.splice(index, 1);
        redrawCanvas();
    }
}

class Line {
    constructor(startX, startY, endX, endY, color, lineWidth, dotSpacing=null) {
        this.type = 'line';
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.color = color;
        this.lineWidth = lineWidth;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.moveTo(this.startX, this.startY);
        context.lineTo(this.endX, this.endY);
        context.stroke();
        context.closePath();
    }

    update() {
        this.draw(context); 
    }

    delete(index) {
        shapes.splice(index, 1);
        redrawCanvas();
    }
}

class DottedLine {
    constructor(startX, startY, endX, endY, color, lineWidth, dotSpacing, dotLength) {
        this.type = 'line-dotted';
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.color = color;
        this.lineWidth = lineWidth;
        this.dotSpacing = dotSpacing;
        this.dotLength = dotLength;
    }
    
    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.setLineDash([this.dotLength, this.dotSpacing]);
        context.moveTo(this.startX, this.startY);
        context.lineTo(this.endX, this.endY);
        context.stroke();
        context.closePath();
        context.setLineDash([]);
    }

    update() {
        this.draw(context); 
    }

    delete(index) {
        shapes.splice(index, 1);
        redrawCanvas();
    }
}

class FootballPlay {
    constructor(name, shapes) {
        this.name = name;
        this.shapes = shapes;
    }
}


/******************************** Add Functions ************************************/

function drawCircle(event) {
    const mouseX = parseInt(event.clientX - offset_x);
    const mouseY = parseInt(event.clientY - offset_y);
    const circle = new Circle(mouseX, mouseY, playerRangeForPlace.value, colorPickerForPlace.value, textInputForPlace.value);
    console.log(playerRangeForPlace.value);
    circle.draw(context);
    shapes.push(circle);
    //removeListeners();
}

function drawSquare(event) {
    const mouseX = parseInt(event.clientX - offset_x);
    const mouseY = parseInt(event.clientY - offset_y);
    const square = new Square(mouseX-playerRangeForPlace.value, mouseY-playerRangeForPlace.value, playerRangeForPlace.value * 2, colorPickerForPlace.value, textInputForPlace.value);
    square.draw(context);
    shapes.push(square);
    //removeListeners();
}

function startLine(event){
    const mouseX = parseInt(event.clientX - offset_x);
    const mouseY = parseInt(event.clientY - offset_y);
    isDrawing = true;
    startX = mouseX;
    startY = mouseY;
    let conjoined = false;
    for(const shape of shapes) {
        if (shape.type === 'line') {
            const distToEnd = Math.sqrt((startX - shape.endX) ** 2 + (startY - shape.endY) ** 2);
                if (distToEnd < 20) {
                    startX = parseInt(shape.endX);
                    startY = parseInt(shape.endY);
                    conjoined = true;
                    break;
                }
            }
        }
}
function drawLine(event) {
    event.preventDefault();
    if (isDrawing) {
        const mouseX = parseInt(event.clientX - offset_x);
        const mouseY = parseInt(event.clientY - offset_y);
        redrawCanvas();
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(mouseX, mouseY);
        context.stroke();
        context.closePath();
    }
}
function finishDrawingLine(event) {
    event.preventDefault();
    if (isDrawing) {
        isDrawing = false;
        const mouseX = event.clientX - offset_x;
        const mouseY = event.clientY - offset_y;
        const line = new Line(startX, startY, mouseX, mouseY, colorPickerForPlace.value, 2);
        line.draw(context);
        shapes.push(line);
        console.log(shapes);
    }
}

function startDottedLine(event) {
    const mouseX = parseInt(event.clientX - offset_x);
    const mouseY = parseInt(event.clientY - offset_y);
    isDrawingDotted = true;
    startX = mouseX;
    startY = mouseY;
    let conjoined = false;
    for (const shape of shapes) {
        if (shape.type === 'line-dotted') {
            const distToEnd = Math.sqrt((startX - shape.endX) ** 2 + (startY - shape.endY) ** 2);
            if (distToEnd < 20) {
                startX = parseInt(shape.endX);
                startY = parseInt(shape.endY);
                conjoined = true;
                break;
            }
        }
    }
}

function drawDottedLine(event) {
    event.preventDefault();
    if (isDrawingDotted) {
        const mouseX = parseInt(event.clientX - offset_x);
        const mouseY = parseInt(event.clientY - offset_y);
        redrawCanvas();
        context.beginPath();
        context.setLineDash([dotSpacing, dotLength]);
        context.strokeStyle = colorPickerForPlace.value;
        context.moveTo(startX, startY);
        context.lineTo(mouseX, mouseY);
        context.stroke();
        context.closePath();
        context.setLineDash([]);
    }
}
function finishDrawingDottedLine(event) {
    event.preventDefault();
    if (isDrawingDotted) {
        isDrawingDotted = false;
        const mouseX = event.clientX - offset_x;
        const mouseY = event.clientY - offset_y;
        const dottedLine = new DottedLine(startX, startY, mouseX, mouseY, colorPickerForPlace.value, 2, dotSpacing, dotLength);
        dottedLine.draw(context);
        shapes.push(dottedLine);
        console.log(shapes);
    }
}
/******************************** Edit Functions ************************************/


/******************************** Delete Functions ************************************/


/******************************** Listeners ************************************/
//set the mode
function changeMode() {
    modeDivs.forEach(div => div.classList.remove('hidden'));
    removeListeners();
    shapeButtons.forEach(btn => btn.classList.remove('active'));
    mode = '';
}

addButton.addEventListener('click', function() {
    if(addDiv.classList.contains('hidden')) {
        changeMode();
        editDiv.classList.add('hidden');
        deleteDiv.classList.add('hidden');
    }
})

editButton.addEventListener('click', function() {
    if (editDiv.classList.contains('hidden')) {
        changeMode();
        addDiv.classList.add('hidden');
        deleteDiv.classList.add('hidden');
    } 
})

deleteButton.addEventListener('click', function() {
    if (deleteDiv.classList.contains('hidden')) {
        changeMode();
        addDiv.classList.add('hidden');
        editDiv.classList.add('hidden');
        mode = 'delete';
        console.log('Mode is: ', mode);
    }
})

// Button Activation for Shapes
function removeListeners() {
    if (debug) { console.log("removeListeners") }
    canvas.removeEventListener('click', drawCircle);
    canvas.removeEventListener('click', drawSquare);
    canvas.removeEventListener('mousedown', startLine);
    canvas.removeEventListener('mousemove', drawLine);
    canvas.removeEventListener('mouseup', finishDrawingLine);
    canvas.removeEventListener('mousedown', startDottedLine);
    canvas.removeEventListener('mousemove', drawDottedLine);
    canvas.removeEventListener('mouseup', finishDrawingDottedLine);
}

circleButton.addEventListener('click', function() {
    if (debug) { console.log("circleButton click") }
    removeListeners();
    shapeButtons.forEach(btn => btn.classList.remove('active'));
    circleButton.classList.add('active');
    mode = 'addCircle'; //click
});

squareButton.addEventListener('click', function() {
    if (debug) { console.log("squareButton click") }
    removeListeners();
    shapeButtons.forEach(btn => btn.classList.remove('active'));
    squareButton.classList.add('active');
    mode = 'addSquare'; //click
});

lineButton.addEventListener('click', function() {
    if (debug) { console.log("lineButton click") }
    removeListeners();
    shapeButtons.forEach(btn => btn.classList.remove('active'));
    lineButton.classList.add('active');
    mode = 'addLine'; //mousedown
});

dottedLineButton.addEventListener('click', function() {
    if (debug) { console.log("dottedLineButton click") }
    removeListeners();
    shapeButtons.forEach(btn => btn.classList.remove('active'));
    dottedLineButton.classList.add('active');
    mode = 'addDottedLine' //mousedown
});

// Undo, save, clear
clearButton.addEventListener('click', function () {
    clearCanvas();
})

/******************************** CANVAS Listeners ************************************/

canvas.addEventListener('click', function(event) {
    if (debug) {  console.log("canvas click") }
    const mouseX = parseInt(event.clientX - offset_x);
    const mouseY = parseInt(event.clientY - offset_y);
    if (mode === 'addCircle') {
        drawCircle(event);
    } else if (mode === 'addSquare') {
        drawSquare(event);
    } 
});
canvas.addEventListener('mousedown', function(event) {
    const mouseX = parseInt(event.clientX - offset_x);
    const mouseY = parseInt(event.clientY - offset_y);
    let index=0;
    if (mode === 'addLine') {
        isDrawing  = true;
        startLine(event);
    } else if (mode === 'addDottedLine') {
        isDrawingDotted  = true;
        startDottedLine(event);
    } else {
        for (let shape of shapes){
            if(is_mouse_in_shape(mouseX, mouseY, shape)) {
                console.log('Mouse is inside shape:', shape);
                current_shape_index = index;
                if (mode === 'delete') {
                    let current_shape = shapes[current_shape_index];
                    current_shape.delete(current_shape_index)
                    is_dragging = false;
                    return;
                } else {
                    console.log('dragging')
                    is_dragging = true;
                    return;
            }   }
            index++;
        }
    }
});
canvas.addEventListener('mousemove', function(event) {
    const mouseX = parseInt(event.clientX - offset_x);
    const mouseY = parseInt(event.clientY - offset_y);
    if (isDrawing) {
        drawLine(event);
    } else if (isDrawingDotted) {
        drawDottedLine(event);
    }
});
canvas.addEventListener('mouseup', function(event) {
    const mouseX = parseInt(event.clientX - offset_x);
    const mouseY = parseInt(event.clientY - offset_y);
    if (isDrawing) {
        finishDrawingLine(event);
    } else if (isDrawingDotted) {
        finishDrawingDottedLine(event);
    }
});

// COMMON FUNCTIONS
//drag / element functionality
let is_mouse_in_shape = function(x, y, shape) {
    console.log("Shape:", shape);
    switch (shape.type) {
        case 'circle':
            let dx = x - shape.xpos;
            let dy = y - shape.ypos;
            let distance = Math.sqrt(dx * dx + dy * dy);
            return distance < shape.radius;
        case 'square':
            let shape_left = shape.xpos;
            let shape_right = shape.xpos + shape.sideLength;
            let shape_top = shape.ypos;
            let shape_bottom = shape.ypos + shape.sideLength;
            return x > shape_left && x < shape_right && y > shape_top && y < shape_bottom;
        case 'line':
        case'line-dotted':
            let { startX, startY, endX, endY } = shape;
            let dxLine = endX - startX;
            let dyLine = endY - startY;
            let length = Math.sqrt(dxLine * dxLine + dyLine * dyLine);
            let u = ((x - startX) * dxLine + (y - startY) * dyLine) / (length * length);
            let closestX, closestY;
            if (u < 0) {
                closestX = startX;
                closestY = startY;
            } else if (u > 1) {
                closestX = endX;
                closestY = endY;
            } else {
                closestX = startX + u * dxLine;
                closestY = startY + u * dyLine;
            }
            let distanceLine = Math.sqrt((x - closestX) * (x - closestX) + (y - closestY) * (y - closestY));
            console.log("Distance:"+distance)
            return distanceLine < 15; // Adjust for tolerance
        default:
            return false;
    }
};

function saveFormation() {

}

//clear canvas button
function clearCanvas() {
    removeListeners();
    shapeButtons.forEach(btn => btn.classList.remove('active'));
    context.fillStyle = start_background_color;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height);
    mode = '';
    shapes = [];
    console.log(shapes);
}

function redrawCanvas() {
    context.fillStyle = start_background_color;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => {
        shape.draw(context);
    });
}

//Save Play to plays[]
function savePlay(shapes) {
    const playName = document.querySelector('.playname').value;
    const newPlay = new FootballPlay(playName, shapes);
    plays.push(newPlay);
}
