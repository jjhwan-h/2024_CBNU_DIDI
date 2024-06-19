import { RequestHandler } from 'express';
import Room from '../models/room';
import Voter from '../models/voter';
import Candidate from '../models/candidate';
import {IRoomData} from './interfaces/IvoterRoom';

export const getVoteRooms:RequestHandler = (req,res)=>{

    res.render("voteRooms/roomList");
}

export const afterUpload:RequestHandler = (req,res)=>{
    res.send(req.file?.path);
}

export const registerRoom:RequestHandler = async (req,res)=>{
    try{
        console.log(req.body);
        const candidateNum = req.body['dropzoneCategory3-0'].replace(/,+$/, '').split(',');
        console.log(candidateNum);
        const voterNum = parseInt(req.body['dropzoneCategory2-0'],10);
        let roomData:IRoomData={
            name:req.body.room_name,
            category:req.body.category,
            desc:req.body.desc,
            s_date:req.body.date_start,
            e_date:req.body.date_end,
            img:req.body['dropzoneCategory1-0']
        };

            
        await Room.create(roomData).then(async (el)=>{
            const roomId = el.dataValues.id;
            await Voter.update({RoomId:roomId},{where:{id:voterNum}});
            for(let v of candidateNum){
                v=parseInt(v,10);
                await Candidate.update({RoomId:roomId},{where:{id:v}});
            }
        });

        return res.redirect(`/voteRooms?success=투표방등록이 완료되었습니다.`);
    }
    catch(error){
        console.error(error);
        return res.redirect(`/registration?error=${error}`);
    }
    res.send("success");
}

export const voterUpload:RequestHandler= async (req,res)=>{
    const jsonFile = req.file;
    if(!jsonFile) return res.send('파일이 없습니다.');

    try{
        const jsonData = JSON.parse(jsonFile.buffer.toString('utf8'));
        //console.log('파일 데이터:', jsonData);
        const el = await Voter.create(jsonData);
        console.log(el.dataValues.id);
        res.send(`${el.dataValues.id}`);
    }catch(error:any){
        console.error(error);
        return res.json({ error:error.errors[0].message });
    }
}

export const candidateUpload:RequestHandler= async (req,res)=>{
    console.log(req.file);
    console.log(req.body);
    const jsonFile = req.file;
    if(!jsonFile) return res.send('파일이 없습니다.');

    let str="";
    try{
        const jsonData = JSON.parse(jsonFile.buffer.toString('utf8'));
        console.log('파일 데이터:', jsonData);
        for (const key of Object.keys(jsonData)) {
            const candidate = {
              name: jsonData[key].name,
              gender: jsonData[key].gender,
              age: jsonData[key].age,
              resume: jsonData[key].resume,
              img: "temp"
            };
          
            try {
              const el = await Candidate.create(candidate);
              str = str + el.dataValues.id + ",";
              console.log(str);
            } catch (error) {
              console.error('Candidate.create 오류:', error);
            }
          }
        res.send(`${str}`);
    }catch(error:any){
        console.error(error);
        return res.json({ error:error.errors[0].message });
    }
}


