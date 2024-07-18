import express from 'express';
import {getVoteRooms} from '../controllers/voteRoom';
const router = express.Router();

//GET /
router.get('/',(req,res,next)=>{
        res.render('users/join');
    }
)

//GET /voteRooms
router.get('/voteRooms',getVoteRooms);

//GET /info
router.get('/info',(req,res,next)=>{
    res.render('pages/info');
})

//GET /registration
router.get('/registration',(req,res,next)=>{
    res.render('voteRooms/createRoom');
})

//POST /upload
router.post('/upload',(req,res)=>{
    res.send("success");
})

//mypage

export {router};