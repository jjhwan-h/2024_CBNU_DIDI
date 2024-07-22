import { RequestHandler } from 'express';
import {checkAllInputs} from './utils/index';
import bcrypt from 'bcrypt';
import faber from '../src/Faber';
import Email from '../models/email';
import User from '../models/user';
import { sequelize } from '../models';
import passport from 'passport';
import { InferAttributes, Transaction, where } from 'sequelize';
import Room from '../models/room';
import UserRoom from '../models/userRoom';
import { transcode } from 'buffer';

const join :RequestHandler=async (req,res,next)=>{ 
    if(checkAllInputs(req.body)){
        const {email, name, password} = req.body; 
        const transaction:Transaction = await sequelize.transaction();
        try{
            const exEmail = await Email.findOne({where:{email}}); //이메일 검증 확인
            if(exEmail && exEmail.isValid && !exEmail.isRegistered){
                await exEmail.update({isValid:false, isRegistered:true},{transaction}); //다른 사람이 동일한 이메일로 가입하는 것을 방지
                const hash = await bcrypt.hash(password,12);
                const exUser = await User.findOne({
                    where:{email,name}
                })
                if(exUser) {
                    await exUser.update({password:hash, status:"user"},{transaction});
                }else{
                    const user = await User.create({
                        email,
                        name,
                        password:hash,
                        status:"user",
                    },{transaction});
                    await UserRoom.create({UserId:user.id,isIssued:false},{transaction});
                }
                transaction.commit();
                return res.redirect(`/?message=회원가입이 완료되었습니다.`)
            }
            else{
                return res.redirect(`/?error=이메일 검증을 완료해주세요.`)
            }
        }catch(error){
        await transaction.rollback();
        console.error('Error:: While join:', error);
        next(error);
        }
    }
    else{
        return res.redirect(`/?error=모든 입력을 완료해주세요`);
    }  
}

// const issueVC:RequestHandler=async(req,res,next)=>{
//     const email = req.session.email;
//     const name = req.session.name;
//     if(email && name){
//         const t = await sequelize.transaction();
//         try{
//             const exEmail = await Email.findOne({where:{email}}); //이메일 검증 확인
//             if(exEmail && exEmail.isValid && !exEmail.isRegistered){
//                 const hashEmail = await bcrypt.hash(email,10);
//                 const hashName = await bcrypt.hash(name,10);
//                 try{
//                     await exEmail.update({isValid:false, isRegistered:true}); //다른 사람이 동일한 이메일로 가입하는 것을 방지
//                     const exUser = await User.findOne({where:{name:hashName,email:hashEmail}});
//                     if(exUser){
//                         const redirectUrl = `/?error=exist`
//                         res.write(`data:${JSON.stringify({redirectUrl})}\n\n`)
//                         res.end();
//                     }
//                     await User.create({
//                         email:hashEmail,
//                         name:hashName
//                     });
//                 }catch(error){
//                     await t.rollback();
//                     console.error(error);
//                 }
//                 await faber.issueCredential({email,name});
//                 const redirectUrl = `/?message=VC발급이 완료되었습니다.`;
//                 res.write(`data:${JSON.stringify({redirectUrl})}\n\n`);
//                 res.end();
//                 delete req.session.email;
//                 delete req.session.name;
//                 return;
//             }
//         }catch(error){
//             return next(error);
//         }
//     }else{
//         const redirectUrl = `/?message=VC발급 중 문제가 발생하였습니다. 다시 시도해주세요.`
//         res.write(`data:${JSON.stringify({redirectUrl})}\n\n`);
//         res.end();
//         return;
//     }
// }

const myPage:RequestHandler=async(req,res,next)=>{
    try{
        const userId = req.user!.id;
        const exUser = await User.findByPk(userId,{
            include:{
                model:Room,
                as:"vote"
            }
         })
        const user = exUser?.dataValues!;
        const {password,...info} = user;
        const roomInfo = JSON.stringify(req.roomInfo) || `[]`;
        res.render("users/myPage",{info,roomInfo});
    }catch(error){
        return res.redirect(`/vote-rooms/?error=${error}`);
    }
}

const login:RequestHandler=async (req,res,next)=>{
    passport.authenticate('local',(authError:any, user:any, info:any)=>{
        if(authError){
            console.error(authError);
            return next(authError);
        }
        if(!user){
            return res.redirect(`/?error=${info.message}`);
        }
        return req.login(user,(loginError)=>{
            if(loginError){
                console.error(loginError);
                return next(loginError);
            }

            return res.redirect(`/vote-rooms`)
        })
    })(req,res,next);
}

const logout:RequestHandler =(req,res,next) => {
    req.logout((error)=>{
        if(error){
            return next(error);
        }
        req.session.destroy((error)=>{
            res.clearCookie('connect.sid');
            res.redirect('/');
        })
    })
}

export {join,login, logout, myPage}