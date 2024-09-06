import express from 'express';
import {getVoteRooms, getVoteRoom} from '../controllers/voteRoom';
import { isLoggedIn, sendToastForVC } from '../middlewares';
const router = express.Router();

//GET /join
router.get('/join',(req,res,next)=>{
        res.render('users/join');
    }
)

//GET /vote-rooms
router.get('/vote-rooms',sendToastForVC,getVoteRooms);

//GET /vote-rooms/registration
router.get('/vote-rooms/registration',isLoggedIn,(req,res,next)=>{
    res.render('voteRooms/createRoom');
})

//GET /vote-rooms/:room_id
router.get('/vote-rooms/:room_id',getVoteRoom);

//GET /
router.get('/',sendToastForVC,(req,res,next)=>{
    res.render('pages/main',req.roomInfo);
})


// //POST /upload
// router.post('/upload',(req,res)=>{
//     res.send("success");
// })




export {router};