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
exports.registerRoom = exports.afterUpload = exports.getVoteRoom = exports.getVoteRooms = void 0;
const room_1 = __importDefault(require("../models/room"));
const user_1 = __importDefault(require("../models/user"));
const candidate_1 = __importDefault(require("../models/candidate"));
const index_1 = require("./utils/index");
const models_1 = require("../models");
const userRoom_1 = __importDefault(require("../models/userRoom"));
function isCandidateKey(key) {
    return ['num', 'name', 'age', 'gender', 'desc', 'img'].includes(key);
}
const getVoteRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomDataValues = (yield room_1.default.findAll({
        include: {
            model: candidate_1.default,
            attributes: ['name', 'age', 'img', 'num', 'desc', 'gender']
        }
    })).map((el) => { return el.dataValues; });
    const roomJsonString = JSON.stringify(roomDataValues);
    const roomInfo = JSON.stringify(req.roomInfo) || `[]`;
    res.render("voteRooms/roomList", { roomJsonString, roomInfo });
});
exports.getVoteRooms = getVoteRooms;
const getVoteRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.id;
    try {
        const room = yield room_1.default.findOne({
            where: { id: roomId },
            include: {
                model: candidate_1.default,
                attributes: ['num', 'name', 'age', 'gender', 'img', 'desc']
            }
        }).then((el) => {
            return el === null || el === void 0 ? void 0 : el.dataValues;
        });
        if (room)
            res.render("voteRooms/room", { room });
        else
            return res.status(400).json({
                error: "Bad Request",
                message: "해당 방이 없습니다."
            });
    }
    catch (error) {
        return res.status(400).json({
            error: "다시 시도해 주세요.",
            message: ""
        });
    }
});
exports.getVoteRoom = getVoteRoom;
const afterUpload = (req, res) => {
    console.log(req.body.url);
    res.send(req.body.url);
};
exports.afterUpload = afterUpload;
const registerRoom = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Bad Request",
                message: "유권자를 업로드 해주세요."
            });
        }
        const jsonData = JSON.parse(req.file.buffer.toString('utf-8'));
        const request = req.body;
        let candidates = [];
        let room = {};
        if (request && (0, index_1.hasOwnProperty)(request, 'room-img') && (0, index_1.hasOwnProperty)(request, 'room-name')
            && (0, index_1.hasOwnProperty)(request, 'room-sDate') && (0, index_1.hasOwnProperty)(request, 'room-eDate') && (0, index_1.hasOwnProperty)(request, 'room-desc')) {
            const NumRegex = /\d$/;
            const RoomRegex = /^room/;
            for (const key in request) {
                if (NumRegex.test(key)) {
                    const num = parseInt(key.split('-')[2], 10);
                    const attr = key.split('-')[1];
                    if (isCandidateKey(attr) && request[key]) {
                        if (!candidates[num]) {
                            candidates[num] = {};
                        }
                        if (attr === "num") {
                            candidates[num][attr] = parseInt(request[key], 10);
                        }
                        else {
                            candidates[num][attr] = request[key];
                        }
                    }
                    else
                        return res.status(400).json({
                            error: "Bad Request",
                            message: "모든 후보자/유권자 정보를 작성해주세요."
                        });
                }
                else if (RoomRegex.test(key)) {
                    const attr = key.split('-')[1];
                    room[attr] = request[key];
                }
            }
        }
        else {
            return res.status(400).json({
                error: "Bad Request",
                message: "모든 방정보를 작성해주세요."
            });
        }
        room["creator"] = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        room["voterCount"] = Object.keys(jsonData).length;
        const transaction = yield models_1.sequelize.transaction();
        try {
            yield room_1.default.create(room, { transaction }).then((el) => __awaiter(void 0, void 0, void 0, function* () {
                const roomId = el.dataValues.id;
                if ((0, index_1.checkAllInputs)(candidates)) {
                    for (const [idx, v] of candidates.entries()) {
                        if (candidates[idx] !== undefined) {
                            candidates[idx].RoomId = roomId;
                            yield candidate_1.default.create(candidates[idx], { transaction });
                        }
                    }
                }
                else {
                    return res.status(400).json({
                        error: "Bad Request",
                        message: "모든 후보자의 정보를 작성해주세요."
                    });
                }
                for (const key of Object.keys(jsonData)) {
                    const name = jsonData[key].name;
                    const email = jsonData[key].email;
                    const voter = {
                        name: name,
                        email: email,
                        status: "preUser",
                    };
                    const exUser = yield user_1.default.findOne({ where: { email } });
                    if (!exUser) {
                        yield user_1.default.create(voter, { transaction }).then((el) => __awaiter(void 0, void 0, void 0, function* () {
                            const userId = el.dataValues.id;
                            yield userRoom_1.default.create({
                                RoomId: roomId,
                                UserId: userId,
                                isIssued: false
                            }, { transaction });
                        }));
                    }
                    else {
                        const exUserRoom = yield userRoom_1.default.findOne({ where: { UserId: exUser.id, RoomId: roomId } });
                        if (!exUserRoom) {
                            yield userRoom_1.default.create({
                                RoomId: roomId,
                                UserId: exUser.id,
                                isIssued: false
                            }, { transaction });
                        }
                        else {
                            transaction.rollback();
                            return res.status(400).json({
                                error: "Bad Request",
                                message: "중복된 (email,name)조합이 있습니다."
                            });
                        }
                    }
                }
            }));
        }
        catch (error) {
            transaction.rollback();
            console.error(error);
            return res.status(400).json({
                error: "Bad Request",
                message: "방 생성 중 오류가 발생했습니다. 다시 시도해주세요."
            });
        }
        transaction.commit();
        return res.status(200).send("방생성이 완료되었습니다.");
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({
            error: "Bad Request",
            message: "방 생성 중 오류가 발생했습니다. 다시 시도해 주세요."
        });
    }
});
exports.registerRoom = registerRoom;
