import { RequestHandler } from 'express';
import Room from '../models/room';
import User from '../models/user';
import Candidate from '../models/candidate';
import {IRoomData} from './interfaces/IvoterRoom';
import { hasOwnProperty, sendMail } from './utils/index';
import { sequelize } from '../models';
import UserRoom from '../models/userRoom';
import { IMailOptions } from './interfaces/IMailOptions';
import { Op } from 'sequelize';
import { requestCredentialMail } from '../configs/email';

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
    res.send(req.file?.path);
}

export const registerRoom:RequestHandler = async (req,res,next)=>{
    try{
        let candidateNum;
        console.log(req.body);
        const request = req.body;
        if(request && hasOwnProperty(request,'dropzoneCategory1-0') && hasOwnProperty(request,'dropzoneCategory2-0')
            && hasOwnProperty(request,'dropzoneCategory3-0') ){
                candidateNum = request['dropzoneCategory3-0'].replace(/,+$/, '').split(',');
                const candidateDropzoneIds = Array.from({length:candidateNum.length},(_,idx)=>`category4-${idx}`)
                const allPropertiesExist = candidateDropzoneIds.every(prop => hasOwnProperty(request,prop));
                if(!allPropertiesExist) return res.redirect(`/registration?error=모든파일을 업로드해주세요`);
        }
        else return res.redirect(`/registration?error=모든 파일을 업로드해주세요}`);
        const voterNum = request['dropzoneCategory2-0'].replace(/,+$/, '').split(',');
        let roomData:IRoomData={
            name:request.room_name,
            category:request.category,
            desc:request.desc,
            s_date:request.date_start,
            e_date:request.date_end,
            img:request['dropzoneCategory1-0']
        };
        const transaction = await sequelize.transaction();
        try{
            await Room.create(roomData).then(async (el)=>{
                const roomId = el.dataValues.id;
                for(let v of voterNum){
                    v=parseInt(v,10);
                    await UserRoom.create({
                        isIssued:false,
                        RoomId:roomId,
                        UserId:v
                    }),{transaction};
                };
                for(let [idx,v] of candidateNum.entries()){
                    v=parseInt(v,10);
                    await Candidate.update({
                        RoomId:roomId, 
                        img:request[`category4-${idx}`],
                    },{where:{id:v},transaction});
                };
            });
            await transaction.commit();
        }catch(error:any){
            await transaction.rollback();
            console.error(error);
            return res.redirect(`/registration?error=${error.errors[0].message}`);
        }

        res.redirect(`/vote-rooms?success=투표방등록이 완료되었습니다.`);

        const user = await User.findAll(
            {where:
                {id:
                    {[Op.in]:voterNum}
                },
            attributes:['email','name']
        });
        for(let v of user){
            if(v){
                const mailOptions :IMailOptions = {
                    to : v!.email, //사용자가 입력한 이메일 -> 목적지 주소 이메일
                    html: requestCredentialMail(v,request.room_name)
               };
               try{
                   sendMail(mailOptions);
               }catch(error){
                console.error('Error:: Failed to send Eamil:', error);
                return next(error);
               }
            }
        }
        return;
    }
    catch(error){
        console.error(error);
        return res.redirect(`/registration?error=${error}`);
    }
}

export const voterUpload:RequestHandler= async (req,res)=>{ //TODO:: 동일한 사람정보가 등록되어있는지 확인(중복투표 방지)
    const jsonFile = req.file;
    if(!jsonFile) return res.send('파일이 없습니다.');

    try{
        let str="";
        const jsonData = JSON.parse(jsonFile.buffer.toString('utf8'));
        //console.log('파일 데이터:', jsonData);
        for (const key of Object.keys(jsonData)) {
            const name = jsonData[key].name as string;
            const email = jsonData[key].email as string;
            const voter = {
              name: name,
              email: email,
              status: "preUser",
            };
            try {
              const exUser = await User.findOne({where:{email}})
              if(!exUser){
                    const el = await User.create(voter);
                    str = str + el.dataValues.id + ",";
              }else{
                    str= str + exUser.id + ",";
              }
            } catch (error:any) {
              console.error('Voter.create 오류:', error);
              return res.json({error:error.errors[0].message});
            }
        }
        res.send(`${str}`);
    }catch(error:any){
        console.error(error);
        return res.json({error:error.message});
    }
}

export const candidateUpload:RequestHandler= async (req,res)=>{
    const jsonFile = req.file;
    if(!jsonFile) return res.send('파일이 없습니다.');

    let str="";
    try{
        const jsonData = JSON.parse(jsonFile.buffer.toString('utf8'));
        //console.log('파일 데이터:', jsonData);
        for (const key of Object.keys(jsonData)) {
            const candidate = {
              name: jsonData[key].name,
              gender: jsonData[key].gender,
              age: jsonData[key].age,
              resume: jsonData[key].resume,
              img: "temp",
            };
          
            try {
              const el = await Candidate.create(candidate);
              str = str + el.dataValues.id + ",";
            } catch (error:any) {
              console.error('Candidate.create 오류:', error);
              return res.json({error:error.errors[0].message});
            }
        }
        res.send(`${str}`);
    }catch(error:any){
        console.error(error);
        return res.json({ error:error.message });
    }
}


