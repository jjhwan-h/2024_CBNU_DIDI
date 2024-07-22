import express from 'express';
import {getVoteRooms} from '../controllers/voteRoom';
import { isLoggedIn, sendToastForVC } from '../middlewares';
const router = express.Router();

//GET /
router.get('/',(req,res,next)=>{
        res.render('users/join');
    }
)

//GET /vote-rooms
router.get('/vote-rooms',sendToastForVC,getVoteRooms);

//GET /info
router.get('/info',(req,res,next)=>{
    res.render('pages/info',req.roomInfo);
})

//GET /registration
router.get('/registration',isLoggedIn,(req,res,next)=>{
    res.render('voteRooms/createRoom');
})

// //POST /upload
// router.post('/upload',(req,res)=>{
//     res.send("success");
// })




export {router};