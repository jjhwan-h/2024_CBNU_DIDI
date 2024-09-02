import express from 'express';
import { join,login,logout, myPage, issueVoteVC, issueDidVC} from '../controllers/user';
import { sendProofRequest,connection,isLoggedIn,isNotLoggedIn, sendToastForVC,didAuth } from '../middlewares';

const router = express.Router();

//POST /users/join
router.post('/join',isNotLoggedIn,join);

//POST /users/vote
router.post('/vote',connection,didAuth,issueVoteVC);

//GET /users/login
router.post('/login',isNotLoggedIn,login);

//GET /users/logout
router.get('/logout',isLoggedIn,logout);

//GET /users
router.get('/',isLoggedIn,sendToastForVC,myPage);

export {router};