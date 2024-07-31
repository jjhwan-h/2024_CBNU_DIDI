import { RequestHandler } from 'express';
import Room from '../models/room';
import User from '../models/user';
import Candidate from '../models/candidate';
import {IRoom, IRoomData} from './interfaces/IvoterRoom';
import { checkAllInputs, hasOwnProperty, sendMail } from './utils/index';
import { sequelize } from '../models';
import UserRoom from '../models/userRoom';
import { IMailOptions } from './interfaces/IMailOptions';
import { Op } from 'sequelize';
import { requestCredentialMail } from '../configs/email';
import { ICandidate, ICandidateAttr, ICandidates } from './interfaces/ICandidate';
import { error } from 'console';

export const getVoteRooms:RequestHandler = async (req,res)=>{
    const roomDataValues = (await Room.findAll({
        include:{
            model:Candidate,
            attributes:['name','age','img']
        }
    })).map((el)=>{return el.dataValues});

    const roomJsonString = JSON.stringify(roomDataValues);
    const roomInfo = JSON.stringify(req.roomInfo) || `[]`;
    res.render("voteRooms/roomList",{roomJsonString,roomInfo});
}

export const afterUpload:RequestHandler = (req,res)=>{
    console.log(req.body.url);
    res.send(req.body.url);
}

export const registerRoom:RequestHandler = async (req,res,next)=>{
    try{
        if (!req.file) {
            return res.status(400).json({
                error:"Bad Request",
                message:"유권자를 업로드 해주세요."
            });
        }
        const jsonData = JSON.parse(req.file.buffer.toString('utf-8'));
        const request = req.body;
        let candidate : ICandidate[]= [];
        let room : IRoom = {};
        if(request && hasOwnProperty(request,'room-img') && hasOwnProperty(request,'room-name')
            && hasOwnProperty(request,'room-sDate') && hasOwnProperty(request,'room-eDate') && hasOwnProperty(request,'room-desc')){
                const NumRegex = /\d$/;
                const RoomRegex = /^room/;
                for(const key in request){
                    if(NumRegex.test(key)){
                        const num  = parseInt(key.split('-')[2],10);
                        const attr = key.split('-')[1] as ICandidateAttr;
                        if(!candidate[num]){
                            candidate[num] = {} as ICandidate;
                        }
                        if(request[key])
                            candidate[num][attr] = request[key];
                        else
                            return res.redirect(`/registration?error=모든 후보자, 유권자 정보를 작성해주세요`);
                    }else if(RoomRegex.test(key)){
                        const attr = key.split('-')[1];
                        room[attr] = request[key];
                    }
                }
        } else {
                return res.status(400).json({
                error:"Bad Request",
                message:"모든 방정보를 작성해주세요."
            });
        }

        const transaction = await sequelize.transaction();
        try{
            await Room.create(room as unknown as IRoomData,{transaction}).then(async (el)=>{
                    const roomId = el.dataValues.id;

                    console.log(candidate);
                    if(checkAllInputs(candidate)){
                        for(const [idx,v] of candidate.entries()){
                            if (candidate[idx] !== undefined) {
                                candidate[idx].RoomId = roomId;
                                await Candidate.create(candidate[idx],{transaction});
                            } 
                        }
                    }else{
                        return res.status(400).json({
                            error:"Bad Request",
                            message:"모든 후보자의 정보를 작성해주세요."
                        });
                    }

                    for (const key of Object.keys(jsonData)) {
                        const name = jsonData[key].name as string;
                        const email = jsonData[key].email as string;
                        const voter = {
                        name: name,
                        email: email,
                        status: "preUser",
                    };
                    const exUser = await User.findOne({where:{email}});
                    if(!exUser){
                        await User.create(voter,{transaction}).then(async (el)=>{
                            const userId = el.dataValues.id;
                            await UserRoom.create({
                                RoomId:roomId,
                                UserId:userId,
                                isIssued:false
                            },{transaction})
                        });
                    }else{
                        const exUserRoom = await UserRoom.findOne({where:{UserId:exUser.id,RoomId:roomId}});
                        if(!exUserRoom){
                            await UserRoom.create({
                                RoomId:roomId,
                                UserId:exUser.id,
                                isIssued:false
                            },{transaction});
                        }
                        else{
                            transaction.rollback();
                            return res.status(400).json({
                                error:"Bad Request",
                                message:"중복된 (email,name)조합이 있습니다."
                            })
                        }
                        
                    }
                }
            });
        }catch(error){
            transaction.rollback();
            console.error(error);
            return res.status(400).json({
                error:"Bad Request",
                message:"방 생성 중 오류가 발생했습니다. 다시 시도해주세요."
            });
        }
        transaction.commit();
        return res.status(200).send("방생성이 완료되었습니다.");
    }
    catch(error){
        console.error(error);
        return res.status(400).json({
            error:"Bad Request",
            message:"방 생성 중 오류가 발생했습니다. 다시 시도해 주세요."
        });
    }
}
