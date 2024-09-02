"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const index_1 = require("./models/index");
const page_1 = require("./routes/page");
const voteRooms_1 = require("./routes/voteRooms");
const auth_1 = require("./routes/auth");
const users_1 = require("./routes/users");
const Faber_1 = __importDefault(require("./src/Faber"));
const passport_1 = __importDefault(require("passport"));
const passport_2 = __importDefault(require("./middlewares/passport"));
const dotenv_1 = __importDefault(require("dotenv"));
const nocache_1 = __importDefault(require("nocache"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, passport_2.default)();
app.set('port', process.env.SERVER_PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
index_1.sequelize.sync({ force: false }) // force. 서버를 실행할때마다 테이블 재생성
    .then(() => {
    console.log('데이터베이스 연결 성공');
})
    .catch((err) => {
    console.log(err);
});
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET)); // req.cookies객체로 만들고, 해당 서버가 만든 쿠키인지 검증
app.use((0, express_session_1.default)({
    resave: false, //요청이 올때 세션에 수정사항이 없더라도 다시 저장?
    saveUninitialized: false, //세션에 저장할 내역이 없더라도 처음부터 세션생성?
    secret: process.env.COOKIE_SECRET, //쿠키에 서명
    cookie: {
        httpOnly: true,
        secure: false, //프로덕션에서는 true로
        maxAge: 60 * 60 * 1000 // 1시간
    },
}));
const agent = Faber_1.default;
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, nocache_1.default)());
app.use((req, res, next) => {
    var _a;
    const auth = req.isAuthenticated();
    res.locals.user = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    res.locals.isAuthenticated = auth;
    next();
});
app.use('/', page_1.router);
app.use('/rooms', voteRooms_1.router);
app.use('/auth', auth_1.router);
app.use('/users', users_1.router);
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404; //import되는 것이 아니기때문에 tsconfig.json에 "ts-node" : {"files":true} 옵션을 추가한다.
    next(error);
});
const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
};
app.use(errorHandler);
app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기중');
});
