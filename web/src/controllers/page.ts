import { RequestHandler } from "express";
import { getCurrentTime } from "./utils";
import { Moment } from "moment-timezone";


const getCreateRoom:RequestHandler = async (req,res,next)=>{
    const currentTime:Moment = await getCurrentTime();
    const startTime = currentTime.format("YYYY-MM-DD HH:mm:ss");
    const startTimeEnd = currentTime.add(2,'month').format("YYYY-MM-DD HH:mm:ss");
    const endTime = currentTime.add(1,'hours').format("YYYY-MM-DD HH:mm:ss");
    const endTimeEnd = currentTime.add(4,'month').format("YYYY-MM-DD HH:mm:ss");
    res.render('voteRooms/createRoom',{startTime,startTimeEnd,endTime,endTimeEnd});
}

export {getCreateRoom}