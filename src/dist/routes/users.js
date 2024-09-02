"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const middlewares_1 = require("../middlewares");
const router = express_1.default.Router();
exports.router = router;
//POST /users/join
router.post('/join', middlewares_1.isNotLoggedIn, user_1.join);
//POST /users/vc
router.post('/vc', middlewares_1.connection, user_1.issueVC);
//GET /users/login
router.post('/login', middlewares_1.isNotLoggedIn, user_1.login);
//GET /users/logout
router.get('/logout', middlewares_1.isLoggedIn, user_1.logout);
//GET /users
router.get('/', middlewares_1.isLoggedIn, middlewares_1.sendToastForVC, user_1.myPage);
