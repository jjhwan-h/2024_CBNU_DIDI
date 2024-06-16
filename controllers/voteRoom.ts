import { RequestHandler } from 'express';

export const getVoteRooms:RequestHandler = (req,res)=>{

    res.render("voteRooms/roomList");
}
