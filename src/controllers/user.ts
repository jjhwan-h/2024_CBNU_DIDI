import { RequestHandler } from 'express';
import {checkAllInputs} from './utils/index';
import bcrypt from 'bcrypt';
import faber from '../agent/Faber';
import Email from '../models/email';
import User from '../models/user';
import Vc from '../models/vc';
import { sequelize } from '../models';
import passport from 'passport';
import { InferAttributes, Transaction, where } from 'sequelize';
import Room from '../models/room';
import UserRoom from '../models/userRoom';
import { sendProofRequest } from '../middlewares';
import Candidate from '../models/candidate';

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
    res.write((`${JSON.stringify({"progress":"VC발급중..."})}`));
    const email= req.user?.email;
    const name = req.user?.name;
    const roomId = parseInt(req.params.room_id,10);
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
            if( error instanceof Error){
                console.error(error);
                const redirectUrl = `/?message=${error.message}VC검증 중 문제가 발생하였습니다. 다시 시도해주세요.`
                res.write(`url:${redirectUrl}`);
            }
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

const vpAuth:RequestHandler=async(req,res,next)=>{
    const roomId = parseInt(req.params.room_id,10);
    const transaction = await sequelize.transaction();
    try{
        /*vc발급 주체는 검증.*/
        res.write(`${JSON.stringify({"progress":"VP검증중..."})}`);
        sendProofRequest(req,res,next);
        const vp =  await faber.listener.proofAcceptListener();

        /*중복 투표 검증 */
        res.write(`${JSON.stringify({"progress":"투표진행시작..."})}`);
        console.log(vp)
        const vcId = parseInt(vp.vc.raw,10);
        const roomNum = parseInt(vp.room.raw,10);
        
        if(vcId && roomNum===roomId){
            const exVc = await Vc.findOne({
                where:{
                    id:vcId
                },transaction});
    
            if(exVc && !exVc.isUsed &&exVc.RoomId === roomNum){
                /* 투표 정보 전달 */
                console.log("투표가능");
                exVc.isUsed=true; //중복투표 방지
                await exVc.save({transaction});
                
                const exCandidate = await Candidate.findAll({
                    where:{RoomId:exVc.RoomId}
                ,transaction})
                const exRoom = await Room.findOne({
                    where:{id:exVc.RoomId}
                ,transaction})

                const voteInfo = {
                    voteMessage:{
                        roomNum: exVc.RoomId,
                        roomName: exRoom?.name,
                        candidateInfo:exCandidate
                    }
                }
                res.write(`${JSON.stringify({"progress":"투표정보전달..."})}`);
                await faber.sendMessage(JSON.stringify(voteInfo));
                const vote = await faber.listener.messageListener();
                console.log(vote);

                /* TODO:: 블록체인에서 투표처리 */

                
                transaction.commit();
                const redirectUrl = `/users?message=투표가 완료되었습니다.`;
                res.write(`${JSON.stringify({"complete":redirectUrl})}`);
                res.end();
                return;
            }else{
                throw new Error("잘못된 자격증명 입니다.")
            }
        }else{
            throw new Error("잘못된 자격증명 입니다.");
        }
        // 투표선택수령
    }catch(error:unknown){
        await transaction.rollback();
        if( error instanceof Error){
            console.error(error);
            const redirectUrl = `/?message=${error.message}VP검증 중 문제가 발생하였습니다. 다시 시도해주세요.`
            res.write(`url:${redirectUrl}`);
        }
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

export {join,login, logout, myPage,issueVoteVC,vpAuth}
