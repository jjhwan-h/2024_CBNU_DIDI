import { RequestHandler } from 'express';
import Room from '../models/room';
import User from '../models/user';
import Candidate from '../models/candidate';
import {IRoom, IRoomData} from './interfaces/IvoterRoom';
import { checkAllInputs, hasOwnProperty, sendMail } from './utils/index';
import { sequelize } from '../models';
import UserRoom from '../models/userRoom';
import { ICandidate, ICandidateAttr, ICandidates } from './interfaces/ICandidate';
import { where } from 'sequelize';
import { IMailOptions } from './interfaces/IMailOptions';
import { requestCredentialMail } from '../configs/email';

function isCandidateKey(key: string): key is keyof ICandidate {
    return ['num','name','age','gender','desc','img'].includes(key);
}

export const getVoteRooms:RequestHandler = async (req,res)=>{
    const roomDataValues = (await Room.findAll({
        include:{
            model:Candidate,
            attributes:['name','age','img','num','desc','gender']
        }
    })).map((el)=>{return el.dataValues});
    const roomJsonString = JSON.stringify(roomDataValues);
    const roomInfo = JSON.stringify(req.roomInfo) || `[]`;
    res.render("voteRooms/roomList",{roomJsonString,roomInfo});
}

export const getVoteRoom:RequestHandler=async(req,res)=>{
    const roomId = req.params.id;
    try{
        const room = await Room.findOne({
            where:{id:roomId},
            include:{
                model:Candidate,
                attributes:['num','name','age','gender','img','desc']
                }
            }).then((el)=>{
            return el?.dataValues
        });
        if(room)
            res.render("voteRooms/room",{room})
        else
            return res.status(400).json({
                error:"Bad Request",
                message:"해당 방이 없습니다."
            })
    }catch(error){
        return res.status(400).json({
            error:"다시 시도해 주세요.",
            message:""
        })
    }
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
        let candidates : ICandidate[]= [];
        let room : IRoom = {};
        if(request && hasOwnProperty(request,'room-img') && hasOwnProperty(request,'room-name')
            && hasOwnProperty(request,'room-sDate') && hasOwnProperty(request,'room-eDate') && hasOwnProperty(request,'room-desc')){
                const NumRegex = /\d$/;
                const RoomRegex = /^room/;
                for(const key in request){
                    if(NumRegex.test(key)){
                        const num  = parseInt(key.split('-')[2],10);
                        const attr = key.split('-')[1] as ICandidateAttr;
                        if(isCandidateKey(attr) && request[key] ){
                            if(!candidates[num]){
                                candidates[num] = {} as ICandidate;
                            }
                            if (attr === "num") {
                                candidates[num][attr] = parseInt(request[key], 10) as ICandidate[typeof attr];
                            } else {
                                candidates[num][attr] = request[key] as string;
                            }
                        }
                        else
                            return res.status(400).json({
                                error:"Bad Request",
                                message:"모든 후보자/유권자 정보를 작성해주세요."
                            });
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

        room["creator"]=req.user?.id as number;
        room["voterCount"] = Object.keys(jsonData).length;
        const transaction = await sequelize.transaction();
        try{
            await Room.create(room as unknown as IRoomData,{transaction}).then(async (el)=>{
                    const roomId = el.dataValues.id;

                    if(checkAllInputs(candidates)){
                        for(const [idx,v] of candidates.entries()){
                            if (candidates[idx] !== undefined) {
                                candidates[idx].RoomId = roomId;
                                await Candidate.create(candidates[idx],{transaction});
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
                        did:"",
                        };
                        const exUser = await User.findOne({where:{email}});
                        if(!exUser){ // 비회원
                            await User.create(voter,{transaction}).then(async (el)=>{
                                const userId = el.dataValues.id;
                                await UserRoom.create({
                                    RoomId:roomId,
                                    UserId:userId,
                                    isIssued:false
                                },{transaction})
                            });
                        }else{ // 회원
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
                        //TODO::유권자 등록 메일전송
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
        res.status(200).send("방생성이 완료되었습니다.");
        
        for(const key of Object.keys(jsonData)){ //유권자로 등록됨을 알리는 메일
            const name = jsonData[key].name as string;
            const email = jsonData[key].email as string;
            const mailOptions :IMailOptions = {
                to : email, //사용자가 입력한 이메일 -> 목적지 주소 이메일
                html: requestCredentialMail(name,email,room['name'] as string)
            };
            const sendRes = sendMail(mailOptions);
            if(!sendRes) console.log({ok : false , msg : ' 메일 전송에 실패하였습니다.'})
            else console.log({ok: true, msg: '해당 이메일로 인증 메일을 보냈습니다.'});
        }
        return
    }
    catch(error){
        console.error(error);
        return res.status(400).json({
            error:"Bad Request",
            message:"방 생성 중 오류가 발생했습니다. 다시 시도해 주세요."
        });
    }
}
