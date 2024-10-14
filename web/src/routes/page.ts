import express from 'express';
import {getVoteRooms, getVoteRoom} from '../controllers/voteRoom';
import { isLoggedIn, sendToastForVC,checkRoomStatus } from '../middlewares';
import { getCreateRoom } from '../controllers/page';
const router = express.Router();

//GET /join
router.get('/join',(req,res,next)=>{
        res.render('users/join');
    }
)

//GET /info
router.get('/',(req,res,next)=>{
        res.render('pages/voting');
})

//GET /vote-rooms
router.get('/vote-rooms',sendToastForVC,getVoteRooms);

//GET /vote-rooms/registration
router.get('/vote-rooms/registration',isLoggedIn,getCreateRoom);

//GET /vote-rooms/:room_id
router.get('/vote-rooms/:room_id',checkRoomStatus,getVoteRoom);



// //POST /upload
// router.post('/upload',(req,res)=>{
//     res.send("success");
// })




export {router};