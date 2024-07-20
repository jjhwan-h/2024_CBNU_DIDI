import express from 'express';
import MulterGoogleCloudStorage from 'multer-google-storage';
import multer from "multer";
import dotenv from "dotenv";

import { afterUpload,  registerRoom, voterUpload, candidateUpload} from '../controllers/voteRoom';
import { isLoggedIn } from '../middlewares';

dotenv.config();
const router = express.Router();

const imgUpload= 
    multer({
    storage: new MulterGoogleCloudStorage({
        bucket: process.env.BUCKET,
        keyFilename: process.env.KEY_FILENAME,
        projectId:process.env.PROJECT_ID,
        filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
            cb(null, `room/${Date.now()}_${file.originalname}`);
          },
     }),
     limits:{
        fileSize:5*1024*1024,
     }
});

const jsonUpload=multer({storage:multer.memoryStorage()});

//POST /rooms
router.post('/',isLoggedIn,registerRoom)

//POST /rooms/upload
router.post('/img-upload',isLoggedIn,imgUpload.single("file[0]"),afterUpload);

//POST /rooms/voter-upload
router.post('/voter-upload',isLoggedIn,jsonUpload.single("file[0]"),voterUpload);

//POST /rooms/candidate-upload
router.post('/candidate-upload',isLoggedIn,jsonUpload.single("file[0]"),candidateUpload);



export {router};