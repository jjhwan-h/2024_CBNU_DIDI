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
exports.verifyEmail = exports.sendEmail = void 0;
const crypto_1 = __importDefault(require("crypto"));
const email_1 = __importDefault(require("../models/email"));
const email_2 = require("../configs/email");
const utils_1 = require("./utils");
const generateEmailVerificationToken = () => {
    const token = crypto_1.default.randomUUID();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);
    return { token, expires };
};
const sendEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    console.log(email);
    const result = generateEmailVerificationToken();
    const mailOptions = {
        to: email, //사용자가 입력한 이메일 -> 목적지 주소 이메일
        html: (0, email_2.successMail)(email, result)
    };
    const exEmail = yield email_1.default.findOne({ where: { email } });
    if (exEmail) {
        if (exEmail.isRegistered)
            mailOptions.html = email_2.errMail;
        yield exEmail.update({ token: result.token });
    }
    else {
        try {
            yield email_1.default.create({
                email,
                token: result.token,
                isValid: false,
                isRegistered: false,
            });
        }
        catch (error) {
            console.error(error);
            return next(error);
        }
    }
    try {
        const sendRes = (0, utils_1.sendMail)(mailOptions);
        if (!sendRes)
            return res.json({ ok: false, msg: ' 메일 전송에 실패하였습니다. 다시 시도해주세요 ' });
        else
            return res.json({ ok: true, msg: '해당 이메일로 인증 메일을 보냈습니다. 메일의 verify버튼을 눌러주세요' });
    }
    catch (error) {
        console.error('Error:: Failed to send Eamil:', error);
        return next(error);
    }
});
exports.sendEmail = sendEmail;
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.query.email;
    const token = req.query.token;
    console.log(email, token);
    try {
        const exEmail = yield email_1.default.findOne({ where: { email } });
        if (exEmail) {
            if (exEmail.isValid) { // 메일의 인증버튼 여러번 누르는것을 방지
                return res.send((0, email_2.alreadyVerifiedHtml)());
            }
            const originToken = exEmail.token;
            if (token === originToken) {
                try {
                    yield exEmail.update({ isValid: true });
                }
                catch (error) {
                    console.error(error);
                    return res.send("인증실패");
                }
                setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        exEmail.isValid = false;
                        yield exEmail.save();
                        console.log("verifyEmail Time out");
                    }
                    catch (error) {
                        console.error(error);
                        return res.send("인증실패");
                    }
                }), 300000); // 5분
                const now = new Date();
                const limit = new Date(now.getTime() + 60 * 10 * 1000).toLocaleString();
                res.send((0, email_2.successHtml)(limit));
            }
            else {
                res.send("인증실패");
            }
        }
        else {
            res.status(404).send('email 전송요청을 먼저해주세요');
        }
    }
    catch (error) {
        console.error('Error:: While verifyEmail:', error);
        return next(error);
    }
});
exports.verifyEmail = verifyEmail;
