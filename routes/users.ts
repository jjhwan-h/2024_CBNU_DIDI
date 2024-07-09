import express from 'express';
import {issueVC, join,logIn} from '../controllers/user';
import { sendProofRequest,connection } from '../middlewares';
const router = express.Router();

//POST /users/join
router.post('/join',join);

//GET /users/vc
router.get('/vc',connection,issueVC);

//GET /users/login
router.get('/login',connection,sendProofRequest,logIn);

export {router};