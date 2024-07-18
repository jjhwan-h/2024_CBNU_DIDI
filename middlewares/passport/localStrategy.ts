import passport from "passport";
import {Strategy as LocalStrategy} from 'passport-local';
import bcrypt from 'bcrypt';
import User from "../../models/user";

export default () =>{
    passport.use(new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:false,
    },async (email, password, done)=>{
    try{
        const exUser = await User.findOne({where:{email}});
        if (exUser) {
            const result = await bcrypt.compare(password, exUser.password as string);
            if (result) {
              done(null, exUser);
            } else {
              done(null, false, { message: '비밀번호가 일치하지 않습니다.' }); //done의 첫번째 인수를 사용하는 경우는 서버쪽에러, 세번째 인수를 사용하는 경우 사용자에러
            }
          } else {
            done(null, false, { message: '가입되지 않은 회원입니다.' });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
    }
    ))
};
