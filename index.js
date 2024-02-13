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
let bounds;

colorPicker.addEventListener('change', (e) => {
    color = e.target.value;
})


function selectShape(name) {
    shape = name
}

    canvas.width = canvasContainer.offsetWidth;
    canvas.height = canvasContainer.offsetHeight;
if (canvas.getContext) {
    canvasContext = canvas.getContext('2d');

    function drawLines(move) {
        resetCanvas()
        const x = move.x - bounds.left - scrollX;
        const y = move.y - bounds.top - scrollY;
        if (lineStart) {
            lastX = x;
            lastY = y;
            lineStart = false;
        }
        canvasContext.beginPath();
        canvasContext.moveTo(lastX, lastY);
        canvasContext.lineTo(lastX, lastY)
        canvasContext.lineTo(x, y);

        canvasContext.strokeStyle = color;

        canvasContext.stroke();

    }

    function drawTriangles(move) {
        resetCanvas()
        const x = move.x - bounds.left - scrollX;
        const y = move.y - bounds.top - scrollY;
        if (lineStart) {
            lastX = x;
            lastY = y;
            lineStart = false;
        }
        const nextX = x > lastX ? lastX - (x - lastX) : lastX + (lastX - x);
        const nextY = lastY;
        canvasContext.beginPath();
            canvasContext.moveTo(lastX, lastY);
        canvasContext.lineTo(x, y);
        canvasContext.lineTo(nextX, y);

        canvasContext.fillStyle = color
        canvasContext.fill();

    }


    function drawFreely(move) {
        resetCanvas();
            const x = move.pageX - bounds.left - scrollX;
            const y = move.pageY - bounds.top - scrollY;
            if (lineStart) {
                lastX = x;
                lastY = y;
                lineStart = false;
            }
            canvasContext.beginPath();
            canvasContext.lineTo(lastX, lastY)
            canvasContext.lineTo(x, y);
            canvasContext.strokeStyle = color
            canvasContext.stroke();
            canvasContext.closePath()
            lastX = x;
            lastY = y

    }

    function drawRectangle(move) {
        resetCanvas();
        let x = move.x - bounds.left - scrollX;
        let y = move.y - bounds.top - scrollY;

        const width = x - lastX;
        const height = y - lastY;

        // canvas.clearRect()
        console.log(lastX, lastY);
        canvasContext.strokeStyle = color
        canvasContext.strokeRect(lastX, lastY, width, height)
        


    }
    function drawCircle(move) {
        resetCanvas();
        let x = move.x - bounds.left - scrollX;
        let y = move.y - bounds.top - scrollY;

        const newX = x - lastX;
        const newY = y - lastY;

        const radius = Math.pow(newX, 2) + Math.pow(newY, 2)


        canvasContext.beginPath();
        canvasContext.arc(lastX, lastY, radius, 0, Math.PI * 2, false);
        canvasContext.strokeStyle = color;
        canvasContext.stroke();
        


    }

    function erase(move) {
        resetCanvas();
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
            canvasContext.lineTo(lastX, lastY)
            canvasContext.lineTo(x, y)
            canvasContext.stroke();
            canvasContext.closePath()
            lastX = x;
            lastY = y

    }

    function prepareToDraw(e) {
        isDrawing = true;
        bounds = canvas.getBoundingClientRect();
        lastX = e.x - bounds.left - scrollX;
        lastY = e.y - bounds.top - scrollY;
        console.log(lastX, lastY)
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
                drawLines(e);
                break;
            case 'freeDraw':
                drawFreely(e);
                break;
            case 'rectangle':
                drawRectangle(e);
                break;
            case 'circle':
                drawCircle(e);
                break;
            case 'triangle':
                drawTriangles(e);
                break;
            case 'erase':
                erase(e);
                break;
        }
    }

    canvas.addEventListener('mousedown', prepareToDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => {isDrawing = false})
}



function resetCanvas() {
    // canvas.removeEventListener('mousemove', () => { })
    canvas.removeEventListener('mousemove', mouseMoveMechanism)
    canvas.removeEventListener('mousedown', mouseDownMechanism)
    canvas.removeEventListener('mouseup', mouseUpMechanism);
    canvasContext.lineWidth = 1;
            canvasContext.strokeStyle = "#000"
    // canvasContext = undefined;
}