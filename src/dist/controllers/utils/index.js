"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasEmptyValues = exports.sendMail = exports.decodeBase64 = exports.checkAllInputs = exports.hasOwnProperty = void 0;
const email_1 = require("../../configs/email");
const hasOwnProperty = (obj, prop) => {
    return Object.prototype.hasOwnProperty.call(obj, prop);
};
exports.hasOwnProperty = hasOwnProperty;
const checkAllInputs = (inputData) => {
    const keys = Object.keys(inputData);
    // 모든 속성들이 채워져 있는지 확인
    const allInputsValid = keys.every(key => inputData[key]);
    return allInputsValid;
};
exports.checkAllInputs = checkAllInputs;
const decodeBase64 = (base64String = '') => {
    return Buffer.from(base64String, 'base64').toString('utf-8');
};
exports.decodeBase64 = decodeBase64;
const sendMail = (mailOptions) => {
    email_1.transporter.sendMail(mailOptions, (err, response) => {
        console.log(response);
        if (err) {
            console.log(err);
            email_1.transporter.close(); //전송종료
            return false;
        }
        else {
            email_1.transporter.close(); //전송종료
        }
    });
    return true;
};
exports.sendMail = sendMail;
function hasEmptyValues(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const candidate = obj[key];
            for (const attr in candidate) {
                if (candidate.hasOwnProperty(attr)) {
                    const value = candidate[attr];
                    if (value === "" || value === null || value === undefined) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
exports.hasEmptyValues = hasEmptyValues;
