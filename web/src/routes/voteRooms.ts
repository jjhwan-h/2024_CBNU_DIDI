import express, { RequestHandler } from 'express';
import MulterGoogleCloudStorage from 'multer-google-storage';
import {Storage} from '@google-cloud/storage';
import multer from "multer";
import dotenv from "dotenv";
import sharp from 'sharp';

import { afterUpload,  registerRoom, saveVoteResults} from '../controllers/voteRoom';
import { isLoggedIn } from '../middlewares';

dotenv.config();
const router = express.Router();

const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    keyFilename: process.env.KEY_FILENAME,
});

const bucket = storage.bucket(process.env.BUCKET as string);

// const imgUpload= 
//     multer({
//     storage: new MulterGoogleCloudStorage({
//         bucket: process.env.BUCKET,
//         keyFilename: process.env.KEY_FILENAME,
//         projectId:process.env.PROJECT_ID,
//         filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
//             cb(null, `room/${Date.now()}_${file.originalname}`);
//           },
//      }),
//      limits:{
//         fileSize:5*1024*1024,
//      }
// });

const upload=multer({storage:multer.memoryStorage()});

const sharpImage: RequestHandler= async (req,res,next) =>{
    let width, height;
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    if(req.body.attr==="room"){
        width=400;
        height=300;
    }else{
        width=300;
        height=400;
    }
    try {
        const processedImage = await sharp(req.file.buffer)
            .resize(width, height) // 원하는 크기로 조정
            .toFormat('jpeg') // 포맷 설정 (예: jpeg)
            .toBuffer();
        
        req.body.image = processedImage;
        next();
    } catch (error) {
        console.error('Error processing image', error);
        res.status(500).send('Error processing image.');
    }
}

const imageUpload:RequestHandler = async (req,res,next)=>{
    let url="";
    try {
        if (!req.body.image) {
            return res.status(400).send('Image processing failed.');
        }
        
        const filename = `room/${Date.now()}_${req.file!.originalname}`;
        const blob = bucket.file(filename);
        const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: 'image/jpeg',
        });

        blobStream.on('finish', () => {
            url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            req.body.url = url;
            next();
        });

        blobStream.on('error', (error) => {
            console.error('Error uploading to GCS', error);
            res.status(500).send('Error uploading to GCS');
        });

        await blobStream.end(req.body.image);
    } catch (error) {
        console.error('Error uploading image', error);
        res.status(500).send('Error uploading image.');
    }
}
//POST /rooms
router.post('/',isLoggedIn,upload.single("voter"),registerRoom)

//POST /rooms/img-upload
router.post('/img-upload',isLoggedIn,upload.single("image"),sharpImage,imageUpload,afterUpload);
export {router};

//POST /rooms/:room_id/result
router.post('/:room_id/result',saveVoteResults);