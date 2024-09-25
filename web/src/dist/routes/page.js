"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const voteRoom_1 = require("../controllers/voteRoom");
const middlewares_1 = require("../middlewares");
const router = express_1.default.Router();
exports.router = router;
//GET /
router.get('/', (req, res, next) => {
    res.render('users/join');
});
//GET /vote-rooms
router.get('/vote-rooms', middlewares_1.sendToastForVC, voteRoom_1.getVoteRooms);
//GET /vote-rooms/registration
router.get('/vote-rooms/registration', middlewares_1.isLoggedIn, (req, res, next) => {
    res.render('voteRooms/createRoom');
});
//GET /vote-rooms/:id
router.get('/vote-rooms/:id', voteRoom_1.getVoteRoom);
//GET /info
router.get('/info', middlewares_1.sendToastForVC, (req, res, next) => {
    res.render('pages/info', req.roomInfo);
});
