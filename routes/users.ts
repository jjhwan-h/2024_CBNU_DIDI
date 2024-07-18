import express from 'express';
import { join,login,logout} from '../controllers/user';
import { sendProofRequest,connection,isLoggedIn,isNotLoggedIn } from '../middlewares';

const router = express.Router();

//POST /users/join
router.post('/join',isNotLoggedIn,join);

//GET /users/vc
// router.get('/vc',connection,issueVC);

//GET /users/login
router.post('/login',isNotLoggedIn,login);

//GET /users/logout
router.get('/logout',isLoggedIn,logout);

export {router};