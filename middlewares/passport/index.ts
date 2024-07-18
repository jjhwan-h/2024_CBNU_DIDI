import passport from 'passport';
import local from './localStrategy';
import User from '../../models/user';
import Room from '../../models/room';

export default () =>{
    passport.serializeUser((user:any,done)=>{
        done(null,user.id);
    });
    passport.deserializeUser((id:number,done)=>{
        User.findOne({
            where:{id},
            include:{
                model:Room,
                attributes:['id']
            }
        }).then(user=>done(null,user))
        .catch(error=>done(error));
    });
    local();
};