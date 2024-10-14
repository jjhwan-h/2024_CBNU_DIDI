import express from 'express';
import { join,login,logout, myPage, issueVoteVC, vpAuth} from '../controllers/user';
import {connection,isLoggedIn,isNotLoggedIn, sendToastForVC,didAuth, checkRoomStatus } from '../middlewares';

const router = express.Router();

//POST /users/join
router.post('/join',isNotLoggedIn,join);

//POST /users/vote/:room_id
router.post('/vote/:room_id',isLoggedIn,connection,checkRoomStatus,vpAuth);

//POST /users/vote-right/:room_id
router.post('/vote-right/:room_id',isLoggedIn,connection,didAuth,issueVoteVC);

//GET /users/login
router.post('/login',isNotLoggedIn,login);

//GET /users/logout
router.get('/logout',isLoggedIn,logout);

//GET /users
router.get('/',isLoggedIn,sendToastForVC,myPage);

export {router};