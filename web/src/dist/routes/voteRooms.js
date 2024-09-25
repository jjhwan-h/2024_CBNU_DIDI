"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const storage_1 = require("@google-cloud/storage");
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
const sharp_1 = __importDefault(require("sharp"));
const voteRoom_1 = require("../controllers/voteRoom");
const middlewares_1 = require("../middlewares");
dotenv_1.default.config();
const router = express_1.default.Router();
exports.router = router;
const storage = new storage_1.Storage({
    projectId: process.env.PROJECT_ID,
    keyFilename: process.env.KEY_FILENAME,
});
const bucket = storage.bucket(process.env.BUCKET);
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
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const sharpImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let width, height;
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    if (req.body.attr === "room") {
        width = 400;
        height = 300;
    }
    else {
        width = 300;
        height = 400;
    }
    try {
        const processedImage = yield (0, sharp_1.default)(req.file.buffer)
            .resize(width, height) // 원하는 크기로 조정
            .toFormat('jpeg') // 포맷 설정 (예: jpeg)
            .toBuffer();
        req.body.image = processedImage;
        next();
    }
    catch (error) {
        console.error('Error processing image', error);
        res.status(500).send('Error processing image.');
    }
});
const imageUpload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let url = "";
    try {
        if (!req.body.image) {
            return res.status(400).send('Image processing failed.');
        }
        const filename = `room/${Date.now()}_${req.file.originalname}`;
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
        yield blobStream.end(req.body.image);
    }
    catch (error) {
        console.error('Error uploading image', error);
        res.status(500).send('Error uploading image.');
    }
});
//POST /rooms
router.post('/', middlewares_1.isLoggedIn, upload.single("voter"), voteRoom_1.registerRoom);
//POST /rooms/img-upload
router.post('/img-upload', middlewares_1.isLoggedIn, upload.single("image"), sharpImage, imageUpload, voteRoom_1.afterUpload);
