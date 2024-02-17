import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors, { CorsOptions } from 'cors';

const app = express();
const httpServer = createServer(app);

const corsOptions: CorsOptions = {
    origin: [
        "http://127.0.0.1:5500",
        "https://artsy-board.netlify.app"
    ]
}

app.use(cors(corsOptions));
const io = new Server(httpServer, {
    cors: {
        origin: ["http://127.0.0.1:5500", 'https://artsy-board.netlify.app']
    }
});
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Socket')
})

io.on('connection', (socket) => {
    socket.on('drawLine', (line) => {
        socket.broadcast.emit('drawLine', line);
    })
    socket.on('drawTriangle', (triangle) => {
        socket.broadcast.emit('drawTriangle', triangle);
    })
    socket.on('drawRectangle', (rectangle) => {
        socket.broadcast.emit('drawRectangle', rectangle);
    })
    socket.on('drawCircle', (circle) => {
        socket.broadcast.emit('drawCircle', circle);
    })
    socket.on('drawFreely', (freeDraw) => {
        socket.broadcast.emit('drawFreely', freeDraw);
    })
    socket.on('erase', (erase) => {
        socket.broadcast.emit('erase', erase);
    })
    socket.on('stop-draw', (state) => {
        socket.broadcast.emit('stop-draw', state);
    })
})

app.use(express.json());

httpServer.listen(port, () => {
    console.log('app is running on port ' + port)
})