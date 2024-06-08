import { Server as NodeServer} from "node:http";
import { Server, Socket } from "socket.io";
import {  findRoom, rooms, users } from "./global-storage.js";
import { stringify } from "node:querystring";

let io : Server;
let __nextRoomId = 0; 

function getNextRoomId() {
    __nextRoomId++; 
    return __nextRoomId.toString();
}


interface IceCandidateInformation {
    candidate: RTCIceCandidate;
    target: string; 
}

interface SdpOfferInformation {
    offer: RTCSessionDescription; 
    target: string;
}

interface SdpAnswerInformation {
    answer: RTCSessionDescription; 
    target: string;
}

export const createIOConnection = (server: NodeServer) => {
    io = new Server(server, {
        cors: {
            origin: '*',
        }
    });

    io.on('connection', (socket) => {
        const user = {id: socket.id}
        users.push(user);
        io.emit('users', users);
 

        socket.on('create-room', (roomName: string) => {
            const roomId = getNextRoomId();
            const room = {id: roomId, name: roomName, users: []};
            rooms.push(room);
            io.emit('rooms', rooms);
        });

        socket.on('join-room', (roomId: string) => {    
            const room = findRoom(roomId);
            if (!room) {
                return;
            }
            socket.rooms.forEach((roomId) => {
                const room = findRoom(roomId);
                if (!room) return; 
                room.users = room.users.filter(user => user.id !== socket.id);
            });

            room.users.push(user);
            socket.join(roomId);
            io.emit('rooms', rooms);
            io.emit('users', users);
            socket.to(roomId).emit('user-joined', user);
        }); 
       
        socket.on('exit-all-room', () => {
            rooms.forEach(room => {
                room.users = room.users.filter(u => u.id !== socket.id);
                socket.leave(room.id);
            });            
            io.emit('rooms', rooms);
            io.emit('users', users);
        }); 
        
        socket.on('disconnect', () => {
            users.splice(users.findIndex(u => u.id === socket.id), 1);
            rooms.forEach(room => {
                room.users = room.users.filter(u => u.id !== socket.id);
                });
                socket.leave(socket.id);
                io.emit('rooms', rooms);
                io.emit('users', users);
        });

                
        socket.on('ice-candidate', ({candidate, target} : IceCandidateInformation) => {
            io.to(target).emit('ice-candidate', {candidate, target: socket.id});
        });

        socket.on('offer', ({offer, target} : SdpOfferInformation) => {
            io.to(target).emit('offer', {offer, target: socket.id});
        });

        socket.on('answer', ({answer, target} : SdpAnswerInformation) => {
            io.to(target).emit('answer', {answer, target: socket.id});
        });
    }); 
    return io; 
}
