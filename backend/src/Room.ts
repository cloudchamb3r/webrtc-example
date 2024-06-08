import { User } from './User.js';

export interface Room {
    id: string;
    name: string;
    users: User[];
}
