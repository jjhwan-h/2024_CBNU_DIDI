
import { request } from 'express';
import Room from '../models/room';
import User from '../models/user';
import IUser from '../models/user';

export {};

interface IRoomInfo{
    id: number,
    name: string,
    img: string
}

declare global{
    interface Error{ 
        status?: number;
    }
    namespace Express{
        interface User extends IUser {
            id:number
            email:string
        }
        interface Request {
            roomInfo : IRoomInfo[]
            status: string
        }
    }
}

declare module "express-session" {
    export interface SessionData {
        email: string,
        name: string,
        token:string,
    }
}


