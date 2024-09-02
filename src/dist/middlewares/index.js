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
exports.sendToastForVC = exports.isLoggedIn = exports.isNotLoggedIn = exports.connection = exports.sendProofRequest = void 0;
const Faber_1 = __importDefault(require("../src/Faber"));
const qrcode_1 = __importDefault(require("qrcode"));
const room_1 = __importDefault(require("../models/room"));
const sequelize_1 = require("sequelize");
const userRoom_1 = __importDefault(require("../models/userRoom"));
const connection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.setHeader('Content-Type', 'text/plain');
    const url = yield Faber_1.default.printConnectionInvite();
    const qr = yield qrcode_1.default.toDataURL(url);
    const info = { url, qr };
    res.write(`connection:${info}`);
    console.log("waiting...");
    yield Faber_1.default.setupConnection();
    next();
});
exports.connection = connection;
const sendProofRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield Faber_1.default.sendProofRequest();
    res.write("data:{message:waiting for acceptance}\n\n");
    next();
});
exports.sendProofRequest = sendProofRequest;
const isLoggedIn = (req, res, next) => {
    var _a;
    if (req.isAuthenticated()) {
        next();
    }
    else {
        const referer = ((_a = req.headers.referer) === null || _a === void 0 ? void 0 : _a.toString().replace(/\?error.*$/i, '')) || '/';
        res.status(403).redirect(`/?error=로그인이 필요한 서비스입니다.`);
    }
};
exports.isLoggedIn = isLoggedIn;
const isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    }
    else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/vote-rooms?error=${message}`);
    }
};
exports.isNotLoggedIn = isNotLoggedIn;
const sendToastForVC = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) {
        const vc = yield userRoom_1.default.findAll({ where: { UserId: req.user.id, isIssued: 0 } });
        const room = vc.map((el) => el.RoomId);
        const roomInfo = yield room_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: room }
            },
            attributes: ['id', 'name', 'img']
        }).then((rooms) => { return rooms.map((el) => el.dataValues); });
        req.roomInfo = roomInfo;
    }
    next();
});
exports.sendToastForVC = sendToastForVC;
