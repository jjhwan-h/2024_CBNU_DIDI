"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const router = express_1.default.Router();
exports.router = router;
//POST /auth/email
router.post('/email', auth_1.sendEmail);
//GET /auth/email
router.get('/email', auth_1.verifyEmail);
