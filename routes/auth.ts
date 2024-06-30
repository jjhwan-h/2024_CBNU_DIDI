import express from 'express';
import {sendEmail, verifyEmail} from '../controllers/auth';
const router = express.Router();


//POST /auth/email
router.post('/email',sendEmail);

//GET /auth/email
router.get('/email',verifyEmail);

export {router};