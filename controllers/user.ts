import { RequestHandler } from 'express';
import {checkAllInputs} from './utils/index';
import bcrypt from 'bcrypt';
import faber from '../src/Faber';
import Email from '../models/email';
import User from '../models/user';
import Vc from '../models/vc';
import { sequelize } from '../models';
import passport from 'passport';
import { InferAttributes, Transaction, where } from 'sequelize';
import Room from '../models/room';
import UserRoom from '../models/userRoom';

const join :RequestHandler=async (req,res,next)=>{ 
    if(checkAllInputs(req.body)){
        const {email, name, password,did} = req.body; 
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
                    await exUser.update({password:hash, status:"user", did},{transaction});
                }else{
                    const user = await User.create({
                        email,
                        name,
                        password:hash,
                        status:"user",
                        did,
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

const issueVoteVC:RequestHandler=async(req,res,next)=>{
    res.write((`${JSON.stringify({"vc":"VC발급중..."})}`));
    const email= req.user?.email;
    const name = req.user?.name;
    const roomId = req.body.roomId
    if(email && name && req.user?.id){
        const transaction = await sequelize.transaction();
        try{
            await UserRoom.findOne(
                {
                    where:{
                        UserId:req.user.id,
                        RoomId:roomId
                    }
                }
            ).then((el)=>{
                if (el?.isIssued){
                    throw new Error("Already Issued");
                }
            });
            const vc = await Vc.create({
                isUsed:false,
                RoomId:roomId,
            },{transaction});
            await UserRoom.update(
                {isIssued:true}
                ,{
                    where:{
                        UserId:req.user.id,
                        RoomId:roomId
                    },
                    transaction:transaction
            });
            const vcId = String(vc.id);
            const room = String(roomId);
            if(vcId && roomId){
                await faber.issueVoteCredential({vc:vcId,room:room});
            }else{
               throw new Error("Failed to create");
            }
            transaction.commit();
            const redirectUrl = `/users?message=VC발급이 완료되었습니다.`;
            res.write(`${JSON.stringify({"complete":redirectUrl})}`);
            res.end();
            return;
        }
        catch(error){
            await transaction.rollback();
            console.log(error)
            res.write(`error:${error}`);
            res.end();
            return;
        }
    }else{
        const redirectUrl = `/?message=VC발급 중 문제가 발생하였습니다. 다시 시도해주세요.`
        res.write(`url:${redirectUrl}`);
        res.end();
        return;
    }
}

const issueDidVC:RequestHandler=async(req,res,next)=>{
    try{
        const did:string = await User.findOne({
            where:{
                id:req.user?.id,
            }
        }).then((el)=>{
            return el?.dataValues.did!
        })
        await faber.issueDidCredential({did});
        const redirectUrl = `/users?message=Did발급이 완료되었습니다.`;
        res.write(`${JSON.stringify({"url":redirectUrl})}`);
        res.end();
        return;
    }catch(error){
        console.error(error);
        const redirectUrl = `/users?message=DID발급중 문제가 발생했습니다. 다시 시도해주세요.`;
        res.write(`${JSON.stringify({"url":redirectUrl})}`);
        res.end();
        return;
    }
}

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
            res.redirect('/join');
        })
    })
}

export {join,login, logout, myPage,issueVoteVC, issueDidVC}