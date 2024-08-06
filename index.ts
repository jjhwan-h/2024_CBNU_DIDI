import express, { ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import session from 'express-session';
import { sequelize } from './models/index';
import {router as pageRouter} from './routes/page';
import {router as voteRoomRouter} from './routes/voteRooms';
import {router as authRouter} from './routes/auth';
import {router as userRouter} from './routes/users';
import faber from './src/Faber';
import passport from 'passport';
import passportConfig from './middlewares/passport';
import dotenv from 'dotenv';
import nocache from 'nocache';

dotenv.config();
const app = express();
passportConfig();

app.set('port', process.env.SERVER_PORT || 3000);
app.set('view engine', 'ejs');
app.set('views',__dirname+'/views');

sequelize.sync({force:false}) // force. 서버를 실행할때마다 테이블 재생성
    .then(()=>{
        console.log('데이터베이스 연결 성공');
    })
    .catch((err:string)=>{
        console.log(err);
    });

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET)); // req.cookies객체로 만들고, 해당 서버가 만든 쿠키인지 검증
app.use(session({ //express-session 1.5버전이전이라면 cookieParser뒤에 위치해야한다.(내부적으로 cookieParser를 사용함.)
  resave: false,  //요청이 올때 세션에 수정사항이 없더라도 다시 저장?
  saveUninitialized: false, //세션에 저장할 내역이 없더라도 처음부터 세션생성?
  secret: process.env.COOKIE_SECRET!, //쿠키에 서명
  cookie: {
    httpOnly: true,
    secure: false, //프로덕션에서는 true로
    maxAge: 60 * 60 * 1000 // 1시간
  },
}));


const agent = faber;

app.use(passport.initialize());
app.use(passport.session());
app.use(nocache());
app.use((req,res,next)=>{
  const auth = req.isAuthenticated();
  res.locals.user=req.user?.email;
  res.locals.isAuthenticated = auth;
  next();
})
app.use('/',pageRouter);
app.use('/rooms',voteRoomRouter);
app.use('/auth',authRouter);
app.use('/users',userRouter);

app.use((req, res, next) => {
    const error : Error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`); 
    error.status = 404; //import되는 것이 아니기때문에 tsconfig.json에 "ts-node" : {"files":true} 옵션을 추가한다.
    next(error);
  });
  
  const errorHandler:ErrorRequestHandler = (err, req, res, next) => {
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