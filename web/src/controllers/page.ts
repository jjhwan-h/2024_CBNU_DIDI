import { RequestHandler } from "express";
import { Moment } from "moment-timezone";
import { cachedTime } from "../utils/time";
import moment from 'moment';


const getCreateRoom:RequestHandler = async (req,res,next)=>{
    try{
        const currentTime:Moment = moment(cachedTime);
        const startTime = currentTime.format("YYYY-MM-DDTHH:mm");
        const startTimeEnd = currentTime.add(2,'month').format("YYYY-MM-DDTHH:mm");
        const endTime = currentTime.add(1,'hours').format("YYYY-MM-DDTHH:mm");
        const endTimeEnd = currentTime.add(4,'month').format("YYYY-MM-DDTHH:mm");
        res.render('voteRooms/createRoom',{startTime,startTimeEnd,endTime,endTimeEnd});
    }catch(err:any){
        console.error(err);
        const redirectUrl = `/?message=${err.message}| 다시 시도해주세요.`
        res.redirect(redirectUrl);
    }
    
}

export {getCreateRoom}