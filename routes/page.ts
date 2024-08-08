import express from 'express';
import {getVoteRooms, getVoteRoom} from '../controllers/voteRoom';
import { isLoggedIn, sendToastForVC } from '../middlewares';
const router = express.Router();

//GET /
router.get('/',(req,res,next)=>{
        res.render('users/join');
    }
)

//GET /vote-rooms
router.get('/vote-rooms',sendToastForVC,getVoteRooms);

//GET /vote-rooms/registration
router.get('/vote-rooms/registration',isLoggedIn,(req,res,next)=>{
    res.render('voteRooms/createRoom');
})

//GET /vote-rooms/:id
router.get('/vote-rooms/:id',getVoteRoom);

//GET /info
router.get('/info',sendToastForVC,(req,res,next)=>{
    res.render('pages/info',req.roomInfo);
})


// //POST /upload
// router.post('/upload',(req,res)=>{
//     res.send("success");
// })




export {router};