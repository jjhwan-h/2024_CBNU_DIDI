import { RequestHandler } from 'express';
import Room, { RoomStatus } from '../models/room';
import User from '../models/user';
import { getCurrentTime } from './utils/index';
import Candidate from '../models/candidate';
import {IRoom, IRoomData} from './interfaces/IvoterRoom';
import { checkAllInputs, hasOwnProperty, sendMail } from './utils/index';
import { sequelize } from '../models';
import UserRoom from '../models/userRoom';
import { ICandidate, ICandidateAttr, ICandidates } from './interfaces/ICandidate';
import { Op } from 'sequelize';
import { IMailOptions } from './interfaces/IMailOptions';
import { requestCredentialMail } from '../configs/email';
import axios from 'axios';

function isCandidateKey(key: string): key is keyof ICandidate {
    return ['num','name','age','gender','desc','img'].includes(key);
}

export const getVoteRooms:RequestHandler = async (req,res)=>{
    let roomState="진행중인 ";
    let roomDataValues;
    const end = req.query.end;  // end 값 받기
    try{
        if (end==="true"){ // 종료된 투표방
            roomDataValues = (await Room.findAll({
                include:{
                    model:Candidate,
                    attributes:['name','age','img','num','desc','gender']
                },
                where:{
                    status:{
                        [Op.or]:[RoomStatus.ENDED, RoomStatus.COUNTED]
                    }
                }
            })).map((el)=>{return el.dataValues});
            roomState="종료된 ";
        }else{ //종료되지않은 투표방
            roomDataValues = (await Room.findAll({
                include:{
                    model:Candidate,
                    attributes:['name','age','img','num','desc','gender']
                },
                where:{
                    status:RoomStatus.VOTING
                }
            })).map((el)=>{return el.dataValues});
        }
    }catch(error:any){
        console.error(error);
        const redirectUrl = `/?message=${error.message}| 다시 시도해주세요.`
        res.redirect(redirectUrl);
    }
    const roomJsonString = JSON.stringify(roomDataValues);
    const roomInfo = JSON.stringify(req.roomInfo) || `[]`;
    res.render("voteRooms/roomList",{roomJsonString,roomInfo,roomState});
}

export const getVoteRoom:RequestHandler=async(req,res)=>{
    const roomId = req.params.room_id;
    try{
      if(req.status=="VOTING"){
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
      }else if(req.status=="ENDED"){
        res.render("voteRooms/countingRoom")
      }else if(req.status=="COUNTED"){
        const room = await Room.findOne({
          where:{id:roomId},
          include:{
              model:Candidate,
              attributes:['num','name','img','count']
              }
          }).then((el)=>{
          return el?.dataValues
        });
        if(room)
            res.render("voteRooms/resultRoom",{room})
        else
            return res.status(400).json({
                error:"Bad Request",
                message:"해당 방이 없습니다."
            })
      }
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

export const registerRoom: RequestHandler = async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Bad Request",
          message: "유권자를 업로드 해주세요."
        });
      }
  
      const jsonData = JSON.parse(req.file.buffer.toString('utf-8'));
      const request = req.body;
      let candidates: ICandidate[] = [];
      let room: IRoom = {};
  
      if (request && hasOwnProperty(request, 'room-img') && hasOwnProperty(request, 'room-name')
        && hasOwnProperty(request, 'room-sDate') && hasOwnProperty(request, 'room-eDate') && hasOwnProperty(request, 'room-desc')) {
        
        const NumRegex = /\d$/;
        const RoomRegex = /^room/;
  
        for (const key in request) {
          if (NumRegex.test(key)) {
            const num = parseInt(key.split('-')[2], 10);
            const attr = key.split('-')[1] as ICandidateAttr;
            if (isCandidateKey(attr) && request[key]) {
              if (!candidates[num]) {
                candidates[num] = {} as ICandidate;
              }
              if (attr === "num") {
                candidates[num][attr] = parseInt(request[key], 10) as ICandidate[typeof attr];
              } else {
                candidates[num][attr] = request[key] as string;
              }
            } else {
              return res.status(400).json({
                error: "Bad Request",
                message: "모든 후보자/유권자 정보를 작성해주세요."
              });
            }
          } else if (RoomRegex.test(key)) {
            const attr = key.split('-')[1];
            room[attr] = request[key];
          }
        }
      } else {
        return res.status(400).json({
          error: "Bad Request",
          message: "모든 방 정보를 작성해주세요."
        });
      }
  
      room["creator"] = req.user?.id as number;
      room["voterCount"] = Object.keys(jsonData).length;
  
      const transaction = await sequelize.transaction();
  
      try {
        
        // 트랜잭션 내에서 Room 생성
        const createdRoom = await Room.create(room as unknown as IRoomData, { transaction });
        const roomId = createdRoom.dataValues.id;
  
        // 후보자 추가
        if (checkAllInputs(candidates)) {
          for (const [idx, v] of candidates.entries()) {
            if (candidates[idx] !== undefined) {
              candidates[idx].RoomId = roomId;
              await Candidate.create(candidates[idx], { transaction });
            }
          }
        } else {
          throw new Error("모든 후보자의 정보를 작성해주세요.");
        }
  
        // 유권자 정보 추가
        for (const key of Object.keys(jsonData)) {
          const name = jsonData[key].name as string;
          const email = jsonData[key].email as string;
          const voter = {
            name: name,
            email: email,
            status: "preUser",
            did: "",
          };
          const exUser = await User.findOne({ where: { email } });
          if (!exUser) {
            const newUser = await User.create(voter, { transaction });
            const userId = newUser.dataValues.id;
            await UserRoom.create({
              RoomId: roomId,
              UserId: userId,
              isIssued: false
            }, { transaction });
          } else {
            const exUserRoom = await UserRoom.findOne({ where: { UserId: exUser.id, RoomId: roomId } });
            if (!exUserRoom) {
              await UserRoom.create({
                RoomId: roomId,
                UserId: exUser.id,
                isIssued: false
              }, { transaction });
            } else {
              throw new Error("중복된 (email, name) 조합이 있습니다.");
            }
          }
        }
  
        // 외부 스케줄러 호출
        const schedulerURL = process.env.SCHEDULER_URL as string;
        await axios.post(`${schedulerURL}/rooms`, { "room_id": roomId, "end_time": `${room.eDate}:00Z` });
  
        // 트랜잭션 커밋
        await transaction.commit();
  
        // 클라이언트에 응답
        res.status(200).send("방 생성이 완료되었습니다.");
  
        // 유권자에게 메일 전송
        for (const key of Object.keys(jsonData)) {
            const name = jsonData[key].name as string;
            const email = jsonData[key].email as string;
            const mailOptions: IMailOptions = {
                to: email,
                html: requestCredentialMail(name, email, room['name'] as string)
            };
            const sendRes = sendMail(mailOptions);
            if (!sendRes) console.log({ ok: false, msg: '메일 전송에 실패하였습니다.' });
            else console.log({ ok: true, msg: '해당 이메일로 인증 메일을 보냈습니다.' });
        }
  
        } catch (error) {
            await transaction.rollback();  // 오류 발생 시 롤백
            console.error(error);
            return res.status(400).json({
                error: "Bad Request",
                message: "방 생성 중 오류가 발생했습니다. 다시 시도해주세요."
            });
      }
  
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        error: "Bad Request",
        message: "방 생성 중 오류가 발생했습니다. 다시 시도해 주세요."
      });
    }
  };
  

export const saveVoteResults:RequestHandler = async (req,res,next)=>{
    const roomId = req.params.room_id;
    const data = req.body;
    console.log("received data: ",JSON.stringify(data));
    
    //room status변경(ENDED->COUNTED)
    //room의 candidate의 vote 업데이트
    try{
      const room = await Room.findOne({
        where:{
          id:roomId
        },
        include:{
          model:Candidate,
        }
      });
  
      if (!room) {
        throw new Error("잘못된 요청입니다.")
      }
      room.status=RoomStatus.COUNTED
      
      for(let i=0;i<room.Candidates!.length;i++){
        let candidate = room.Candidates![i];
        if(data.hasOwnProperty(`${i+1}`)){
          candidate.count = data[`${i+1}`];
          await candidate.save();
        }
      }
      await room.save();
    }catch(err){
      return err
    }

    return
}