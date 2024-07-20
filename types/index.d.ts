
import Room from '../models/room';
import User from '../models/user';
import IUser from '../models/user';

export {};

declare global{
    interface Error{ 
        status?: number;
    }
    namespace Express{
        interface User extends IUser {
            id:number
            email:string
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


