import { Room } from "./Room.js";
import { User } from "./User.js";

export const users : User[] = []; 
export const rooms : Room[] = []; 


export function findRoom(id: string) {
    return rooms.find(room => room.id === id);
}

export function findUser(id: string) {
    return users.find(user => user.id === id);
}



