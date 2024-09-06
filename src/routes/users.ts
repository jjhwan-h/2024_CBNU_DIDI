import express from 'express';
<<<<<<< HEAD
import { join,login,logout, myPage, issueVoteVC, issueDidVC} from '../controllers/user';
=======
import { join,login,logout, myPage, issueVoteVC, vpAuth} from '../controllers/user';
>>>>>>> feature/VP
import { sendProofRequest,connection,isLoggedIn,isNotLoggedIn, sendToastForVC,didAuth } from '../middlewares';

const router = express.Router();

//POST /users/join
router.post('/join',isNotLoggedIn,join);

<<<<<<< HEAD
//POST /users/vote
router.post('/vote',connection,didAuth,issueVoteVC);
=======
//POST /users/vote/:room_id
router.post('/vote/:room_id',isLoggedIn,connection,vpAuth,)

//POST /users/vote-right/:room_id
router.post('/vote-right/:room_id',isLoggedIn,connection,didAuth,issueVoteVC);
>>>>>>> feature/VP

//GET /users/login
router.post('/login',isNotLoggedIn,login);

//GET /users/logout
router.get('/logout',isLoggedIn,logout);

//GET /users
router.get('/',isLoggedIn,sendToastForVC,myPage);

export {router};