import { createContext, useEffect, useState } from "react";
import { Room } from "./Room";
import { User } from "./User";
import { Socket } from "socket.io-client";
import { useSocketIoClient } from "./hooks/useSocketIoClient";

export interface IGlobal {
    rooms: Room[];
    users: User[];
    socket?: Socket, 

    setRooms: (rooms: Room[]) => void;
    setUsers: (users: User[]) => void;
}

export const GlobalContext = createContext<IGlobal>({
    rooms: [],
    users: [],
    setRooms: () => {},
    setUsers: () => {},
    socket: undefined,
});

interface GlobalContextProviderProps {
    children: React.ReactNode;
}
export const GlobalContextProvider  = ({children} : GlobalContextProviderProps) => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const socket = useSocketIoClient(); 

    useEffect(()=> {
        if (!socket) return;
        socket.emit('refresh-rooms'); 
        socket.emit('refresh-users'); 
        
        socket.on('users', (users: User[]) => {
            setUsers(users);
        });

        socket.on('rooms', (rooms: Room[]) => {
            setRooms(rooms);
        });
    }, [socket]);

    return (
        <GlobalContext.Provider value={{rooms, users, socket, setRooms, setUsers}}>
            {children}
        </GlobalContext.Provider>
    )
}
