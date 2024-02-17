let canvas = document.querySelector('canvas');
let colorPicker = document.querySelector('#colorPicker');
let canvasContainer = document.querySelector('.canvas-container');
let canvasContext;
let currentMechanism;
let mouseDownMechanism;
let mouseUpMechanism;
let mouseMoveMechanism;
let drawRef;
let snapshot
let lastX;
let lastY;
let lineStart = true;
let isDrawing = false;
let shape = '';
const canvasColor = '#fff';
let color = '#000';
let bounds = canvas.getBoundingClientRect();
const socket = io('http://localhost:3000/')


window.addEventListener('load', () => {
    const userId = Math.random() * 1000;
    socket.on('connected', () => {
    })
    socket.on('drawLine', (newLine) => {
        prepareToRecieveDrawing();
        drawLines(newLine, newLine.color, false)
    })
    socket.on('drawTriangle', (newTriangle) => {
        prepareToRecieveDrawing();
        drawTriangles(newTriangle, newTriangle.color, false)
    })
    socket.on('drawRectangle', (newRectangle) => {
        prepareToRecieveDrawing();
        drawRectangle(newRectangle, newRectangle.color, false)
    })
    socket.on('drawCircle', (newCircle) => {
        prepareToRecieveDrawing();
        drawCircle(newCircle, newCircle.color, false)
    })
    socket.on('drawFreely', (newFreeDraw) => {
        prepareToRecieveDrawing('freeDraw');
        drawFreely(newFreeDraw, newFreeDraw.color, false)
    })
    socket.on('erase', (eraser) => {
        prepareToRecieveDrawing('erase');
        erase(eraser, false)
    })
    socket.on('stop-draw', (state) => {
        sessionStorage.removeItem('continue-draw');
    })

    function prepareToRecieveDrawing(shape = '') {
        if (!sessionStorage.getItem('continue-draw')) {
            shape !== 'freeDraw' && shape !== 'erase' ? snapshot = canvasContext.getImageData(0, 0, canvas.width, canvas.height) : null;
            sessionStorage.setItem('continue-draw', true);
        }

        shape !== 'freeDraw' && shape !== 'erase' ? canvasContext.putImageData(snapshot, 0, 0) : null;
    }


    if (canvas.getContext) {
        canvasContext = canvas.getContext('2d');

        function drawLines(move, color, emit = true) {
            const x = move.x - bounds.left - scrollX;
            const y = move.y - bounds.top - scrollY;
            if (lineStart) {
                lastX = x;
                lastY = y;
                lineStart = false;
            }

            canvasContext.beginPath();
            if (!emit) {
                canvasContext.moveTo(move.lastX, move.lastY);
                canvasContext.lineTo(move.lastX, move.lastY)
                canvasContext.lineTo(move.x, move.y);
                canvasContext.strokeStyle = move.color;
            } else {
                canvasContext.moveTo(lastX, lastY);
                canvasContext.lineTo(lastX, lastY)
                canvasContext.lineTo(x, y);
                canvasContext.strokeStyle = color;
                const line = {
                    lastX,
                    lastY,
                    x,
                    y,
                    color
                }
                socket.emit('drawLine', line);
            }
            canvasContext.stroke();
        }

        function drawTriangles(move, color, emit = true) {
            const x = move.x - bounds.left - scrollX;
            const y = move.y - bounds.top - scrollY;
            if (lineStart) {
                lastX = x;
                lastY = y;
                lineStart = false;
            }
            canvasContext.beginPath();

            if (!emit) {
                canvasContext.moveTo(move.lastX, move.lastY);
                canvasContext.lineTo(move.x, move.y);
                canvasContext.lineTo(move.nextX, move.y);
                canvasContext.fillStyle = move.color
            } else {
                const nextX = x > lastX ? lastX - (x - lastX) : lastX + (lastX - x);
                canvasContext.moveTo(lastX, lastY);
                canvasContext.lineTo(x, y);
                canvasContext.lineTo(nextX, y);
                canvasContext.fillStyle = color

                const triangle = {
                    lastX,
                    lastY,
                    x,
                    y,
                    color,
                    nextX
                }
                socket.emit('drawTriangle', triangle);
            }

            canvasContext.fill();
        }


        function drawFreely(move, color, emit = true) {
            const x = move.pageX - bounds.left - scrollX;
            const y = move.pageY - bounds.top - scrollY;
            if (lineStart) {
                lastX = x;
                lastY = y;
                lineStart = false;
            }
            canvasContext.beginPath();
            if (!emit) {
                canvasContext.lineTo(move.lastX, move.lastY)
                canvasContext.lineTo(move.x, move.y);
                canvasContext.strokeStyle = move.color;
            } else {
                canvasContext.lineTo(lastX, lastY);
                canvasContext.lineTo(x, y);
                canvasContext.strokeStyle = color;

                const freeStyle = {
                    lastX,
                    lastY,
                    x,
                    y,
                    color
                }

                socket.emit('drawFreely', freeStyle);
            }
            canvasContext.stroke();
            canvasContext.closePath();
            lastX = x;
            lastY = y;

        }

        function drawRectangle(move, color, emit = true) {
            let x = move.x - bounds.left - scrollX;
            let y = move.y - bounds.top - scrollY;

            const width = x - lastX;
            const height = y - lastY;


            if (!emit) {
                canvasContext.strokeStyle = move.color;
                canvasContext.strokeRect(move.lastX, move.lastY, move.width, move.height);
            } else {
                canvasContext.strokeStyle = color;
                canvasContext.strokeRect(lastX, lastY, width, height);

                const rectangle = {
                    lastX,
                    lastY,
                    width,
                    height,
                    color
                }

                socket.emit('drawRectangle', rectangle);
            }



        }
        function drawCircle(move, color, emit = true) {
            let x = move.x - bounds.left - scrollX;
            let y = move.y - bounds.top - scrollY;

            canvasContext.beginPath();
            if (!emit) {
                canvasContext.arc(move.lastX, move.lastY, move.radius, 0, Math.PI * 2, false);
                canvasContext.strokeStyle = move.color;
            } else {
                const newX = x - lastX;
                const newY = y - lastY;

                const radius = Math.pow(newX, 2) + Math.pow(newY, 2)


                canvasContext.arc(lastX, lastY, radius, 0, Math.PI * 2, false);
                canvasContext.strokeStyle = color;

                const circle = {
                    lastX,
                    lastY,
                    radius,
                    color
                }

                socket.emit('drawCircle', circle);
            }
            canvasContext.stroke();

        }

        function erase(move, emit = true) {
            const x = move.pageX - bounds.left - scrollX;
            const y = move.pageY - bounds.top - scrollY;
            if (lineStart) {
                lastX = x;
                lastY = y;
                lineStart = false;
            }
            canvasContext.lineWidth = 10;
            canvasContext.strokeStyle = canvasColor
            canvasContext.beginPath();
            if (!emit) {
                canvasContext.lineTo(move.lastX, move.lastY);
                canvasContext.lineTo(move.x, move.y);
            } else {
                canvasContext.lineTo(lastX, lastY);
                canvasContext.lineTo(x, y);

                const eraser = {
                    lastX,
                    lastY,
                    x,
                    y
                }

                socket.emit('erase', eraser);
            }
                lastX = x;
                lastY = y;
            canvasContext.stroke();
            canvasContext.closePath();

        }

        function prepareToDraw(e) {
            lineStart = true
            isDrawing = true;
            lastX = e.x - bounds.left - scrollX;
            lastY = e.y - bounds.top - scrollY;
            shape !== 'freeDraw' && shape !== 'erase' ? snapshot = canvasContext.getImageData(0, 0, canvas.width, canvas.height) : null;
        }

        function draw(e) {
            if (!isDrawing) {
                return
            }


            shape !== 'freeDraw' && shape !== 'erase' ? canvasContext.putImageData(snapshot, 0, 0) : null;
            isDrawing = true;

            switch (shape) {
                case 'line':
                    resetCanvas();
                    drawLines(e, color, true);
                    break;
                case 'freeDraw':
                    resetCanvas();
                    drawFreely(e, color, true);
                    break;
                case 'rectangle':
                    resetCanvas()
                    drawRectangle(e, color, true);
                    break;
                case 'circle':
                    resetCanvas();
                    drawCircle(e, color, true);
                    break;
                case 'triangle':
                    resetCanvas();
                    drawTriangles(e, color, true);
                    break;
                case 'erase':
                    resetCanvas();
                    erase(e, true);
                    break;
            }
        }

        canvas.addEventListener('mousedown', prepareToDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', () => {
            isDrawing = false;
            socket.emit('stop-draw', true)
        })
    }
})

function connectToSocket() {
}

colorPicker.addEventListener('change', (e) => {
    color = e.target.value;
})


function selectShape(name) {
    shape = name
}

canvas.width = canvasContainer.offsetWidth;
canvas.height = canvasContainer.offsetHeight;




function resetCanvas() {
    // canvas.removeEventListener('mousemove', () => { })
    canvas.removeEventListener('mousemove', mouseMoveMechanism)
    canvas.removeEventListener('mousedown', mouseDownMechanism)
    canvas.removeEventListener('mouseup', mouseUpMechanism);
    canvasContext.lineWidth = 1;
    canvasContext.strokeStyle = "#000"
    // canvasContext = undefined;
}