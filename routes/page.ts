import express from 'express';
import {getVoteRooms} from '../controllers/voteRoom';
import { isLoggedIn } from '../middlewares';
const router = express.Router();

//GET /
router.get('/',(req,res,next)=>{
        res.render('users/join');
    }
)

//GET /vote-rooms
router.get('/vote-rooms',getVoteRooms);

//GET /info
router.get('/info',(req,res,next)=>{
    res.render('pages/info');
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