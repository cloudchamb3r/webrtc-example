import express from 'express'; 
import {createServer} from  'node:http';
import cors from 'cors';
import { createIOConnection } from './socket-io.js';
import { User } from './User.js';
import { Room } from './Room.js';

const PORT = 3000; 

const app = express(); 
const server = createServer(app); 
const io = createIOConnection(server); 

// exports io, users, rooms
app.set('io', io);
app.use(cors()); 

// express
app.get('/', (req, res) => {

})

// listen to server
server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});


