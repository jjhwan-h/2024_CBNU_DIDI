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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueVC = exports.myPage = exports.logout = exports.login = exports.join = void 0;
const index_1 = require("./utils/index");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Faber_1 = __importDefault(require("../src/Faber"));
const email_1 = __importDefault(require("../models/email"));
const user_1 = __importDefault(require("../models/user"));
const vc_1 = __importDefault(require("../models/vc"));
const models_1 = require("../models");
const passport_1 = __importDefault(require("passport"));
const room_1 = __importDefault(require("../models/room"));
const userRoom_1 = __importDefault(require("../models/userRoom"));
const join = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, index_1.checkAllInputs)(req.body)) {
        const { email, name, password } = req.body;
        const transaction = yield models_1.sequelize.transaction();
        try {
            const exEmail = yield email_1.default.findOne({ where: { email } }); //이메일 검증 확인
            if (exEmail && exEmail.isValid && !exEmail.isRegistered) {
                yield exEmail.update({ isValid: false, isRegistered: true }, { transaction }); //다른 사람이 동일한 이메일로 가입하는 것을 방지
                const hash = yield bcrypt_1.default.hash(password, 12);
                const exUser = yield user_1.default.findOne({
                    where: { email, name }
                });
                if (exUser) {
                    yield exUser.update({ password: hash, status: "user" }, { transaction });
                }
                else {
                    const user = yield user_1.default.create({
                        email,
                        name,
                        password: hash,
                        status: "user",
                    }, { transaction });
                    yield userRoom_1.default.create({ UserId: user.id, isIssued: false }, { transaction });
                }
                transaction.commit();
                return res.redirect(`/?message=회원가입이 완료되었습니다.`);
            }
            else {
                return res.redirect(`/?error=이메일 검증을 완료해주세요.`);
            }
        }
        catch (error) {
            yield transaction.rollback();
            console.error('Error:: While join:', error);
            next(error);
        }
    }
    else {
        return res.redirect(`/?error=모든 입력을 완료해주세요`);
    }
});
exports.join = join;
const issueVC = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const email = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    const name = (_b = req.user) === null || _b === void 0 ? void 0 : _b.name;
    const roomId = req.body;
    if (email && name) {
        const transaction = yield models_1.sequelize.transaction();
        try {
            const vc = yield vc_1.default.create({
                isUsed: false
            }, { transaction });
            yield userRoom_1.default.update({ isIssued: true }, {
                where: {
                    RoomId: roomId
                },
                transaction: transaction
            });
            const vcId = String(vc.id);
            if (vc && roomId) {
                yield Faber_1.default.issueCredential({ vc: vcId, room: roomId });
            }
            else {
                throw new Error("Failed to create");
            }
            transaction.commit();
            const redirectUrl = `/?message=VC발급이 완료되었습니다.`;
            res.write(`url:${redirectUrl}`);
            res.end();
            return;
        }
        catch (error) {
            yield transaction.rollback();
            return next(error);
        }
    }
    else {
        const redirectUrl = `/?message=VC발급 중 문제가 발생하였습니다. 다시 시도해주세요.`;
        res.write(`url:${redirectUrl}`);
        res.end();
        return;
    }
});
exports.issueVC = issueVC;
const myPage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const exUser = yield user_1.default.findByPk(userId, {
            include: {
                model: room_1.default,
                as: "vote"
            }
        });
        const user = exUser === null || exUser === void 0 ? void 0 : exUser.dataValues;
        const { password } = user, info = __rest(user, ["password"]);
        const roomInfo = JSON.stringify(req.roomInfo) || `[]`;
        res.render("users/myPage", { info, roomInfo });
    }
    catch (error) {
        return res.redirect(`/vote-rooms/?error=${error}`);
    }
});
exports.myPage = myPage;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    passport_1.default.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/?error=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect(`/vote-rooms`);
        });
    })(req, res, next);
});
exports.login = login;
const logout = (req, res, next) => {
    req.logout((error) => {
        if (error) {
            return next(error);
        }
        req.session.destroy((error) => {
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    });
};
exports.logout = logout;
