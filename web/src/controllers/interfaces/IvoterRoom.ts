import { RoomCategory, RoomStatus } from "../../models/room"

export interface IRoomData{
    name:string,
    category:RoomCategory,
    desc:string,
    sDate:Date,
    eDate:Date,
    img:string,
    creator:number,
    voterCount:number
    status:RoomStatus
}
export interface IRoom{
    [key : string] : string | RoomCategory | Date | number
}

export interface IVoter{
    name:string,
    email:string,
    tel:string,
}