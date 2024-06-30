import express from 'express';
import {join} from '../controllers/user';
const router = express.Router();

//POST /users
router.post('/',join)

export {router};