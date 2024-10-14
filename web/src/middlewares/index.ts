import faber from "../agent/Faber"
import { RequestHandler } from 'express';
import qrcode from 'qrcode';
import Room, { RoomStatus } from "../models/room";
import { Op } from "sequelize";
import UserRoom from "../models/userRoom";
import User from "../models/user";
import { randomBytes } from "crypto";
import { fromBase64, getCurrentTime } from "../controllers/utils";
import { Key as AskarKey, KeyAlgs } from "@hyperledger/aries-askar-shared";
import baseX from "base-x";
import axios from "axios";

const connection:RequestHandler = async(req,res,next)=>{
    res.setHeader('Content-Type', 'text/plain');
    const url = await faber.printConnectionInvite();
    const qr = await qrcode.toDataURL(url);
    const info= {url,qr}
    res.write((`${JSON.stringify({"connection":info})}`));

    try{
      await faber.setupConnection();
    }catch(error){
      console.error(error);
      const redirectUrl = `/users?message=연결도중 에러가 발생했습니다. 다시 시도해주세요.`;
      res.write(`${JSON.stringify({"url":redirectUrl})}`);
      res.end();
      return;
    }
    
    next();
}

const sendProofRequest:RequestHandler = async (req,res,next) =>{
    await faber.sendProofRequest();
};

const isLoggedIn:RequestHandler = (req,res,next)=>{
    if (req.isAuthenticated()) {
        next();
      } else {
        const referer = req.headers.referer?.toString().replace(/\?error.*$/i, '') || '/vote-rooms';
        const errorMessage = encodeURIComponent('로그인이 필요한 서비스입니다.');
        res.status(403).redirect(`${referer}?error=${errorMessage}`);
      }
};

const isNotLoggedIn:RequestHandler = (req,res,next)=>{
    if (!req.isAuthenticated()) {
        next();
      } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/vote-rooms?error=${message}`);
      }
}

const sendToastForVC:RequestHandler = async (req,res,next)=>{
    if(req.user?.id){
        const vc = await UserRoom.findAll({where:{UserId:req.user.id, isIssued:0}});
        const room = vc.map((el)=>el.RoomId);
        const roomInfo = await Room.findAll({
          where:
          {id:
            {[Op.in]:room}
          },
          attributes:['id','name','img']
        }).then((rooms)=> {return rooms.map((el)=>el.dataValues)});
        req.roomInfo = roomInfo
    }
    next();
}

export interface IdidAuthObject{
  did:string,
  signature:string,
}

const didAuth:RequestHandler = async(req,res,next)=>{
  const exUser = await User.findOne({
    where:{
    id:req.user?.id
    }
  });
  res.write((`${JSON.stringify({"progress":"DID Auth중..."})}`));
  try{
    const randomBuffer = randomBytes(16);
    const randomMessage = randomBuffer.toString('hex');
    const message = {
      "DIDMessage":randomMessage
    }
    //메시지 전달
    faber.sendMessage(JSON.stringify(message));
    //did resolve && key객체 생성
    const didAuthObject : IdidAuthObject =  await faber.listener.messageListener();
    if (didAuthObject.hasOwnProperty("signature") && didAuthObject.hasOwnProperty("did")) {
      const did = didAuthObject.did;
      if(did!=exUser?.dataValues.did){
        throw new Error("사용자의 did가 아닙니다.");
      }
      const didDocument = await faber.agent.dids.resolve(did);
      const signature = fromBase64(didAuthObject.signature)
  
      const encoded = didDocument.didDocument?.verificationMethod![0].publicKeyBase58 as string;
      const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      const bs58 = baseX(BASE58);
      const key = bs58.decode(encoded); //public key

      const verifyKey = AskarKey.fromPublicBytes({publicKey:key,algorithm:KeyAlgs.Ed25519});

      if(verifyKey.verifySignature({message:randomBuffer,signature:signature})){ //검증
        console.log("didAuth 성공")
        next();
      }else{
        throw new Error("did검증에 실패하였습니다.");
      }
    }else{
        throw new Error("did 또는 서명된 메시지를 받지못하였습니다.");
    }
  }catch (err){
    console.log(err)
    const redirectUrl = `/users?message=did검증에 실패하였습니다.`;
    res.write(`${JSON.stringify({"url":redirectUrl})}`);
    res.end();
    return;
  } 
}

const checkRoomStatus:RequestHandler = async (req,res,next)=>{
  const roomId = parseInt(req.params.room_id,10);
  try {
      const room = await Room.findOne({
          where: { id: roomId }
      });
      if (!room) {
          throw new Error("잘못된 요청입니다.");
      }
      console.log(room.status)
      if (room.status===RoomStatus.VOTING){ //종료아님으로 저장됨
        let response;
        try{
          const schedulerURL = process.env.SCHEDULER_URL as string;
          response = await axios.get(schedulerURL+`/rooms/${roomId}/status`);
        }catch(err){
          throw new Error("투표종료를 확인하는것에 실패하였습니다.");
        }
        try{
          console.log(response.data);
          if (response.data){ //종료
            room.status=RoomStatus.ENDED;
            await room.save();
            throw new Error("이미 종료된 투표입니다.")
          }else{ //종료아님
            req.status="VOTING"
          }
        }catch(err){
          throw err;
        }
      }else if(room.status===RoomStatus.ENDED){
        //개표가 완료되지않았으면 개표중 페이지 랜더링.
        req.status="ENDED"
      }else{
        req.status="COUNTED"
        //개표가 완료되었으면 개표완료페이지 랜더링.
        
      }
  } catch (error: any) {
      console.error(error);
      const redirectUrl = `/vote-rooms?message=${error}`;
      res.redirect(redirectUrl);
      res.end();
      return;
  }
  next();
}

export{sendProofRequest,connection, isNotLoggedIn, isLoggedIn, sendToastForVC,didAuth,checkRoomStatus};
