// useSocketIoClient.tsx
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocketIoClient = (url: string = import.meta.env['VITE_BACKEND_SERVER'] ?? 'http://localhost:3000') => {
    const [socket, setSocket] = useState<Socket | undefined>(undefined);

    useEffect(() => {
        const newSocket = io(url);
        setSocket(newSocket);
        
        return () => { 
            newSocket.close(); 
        };
    }, [url]);


    return socket;
}