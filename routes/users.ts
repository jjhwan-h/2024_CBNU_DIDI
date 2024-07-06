import express from 'express';
import {join,logIn} from '../controllers/user';
import { sendProofRequest } from '../middlewares';
const router = express.Router();

//POST /users/join
router.post('/join',join);

//POST /users/login
router.post('/login',sendProofRequest,logIn);

export {router};