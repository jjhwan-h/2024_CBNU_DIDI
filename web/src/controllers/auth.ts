import { RequestHandler } from 'express';
import crypto from 'crypto';
import Email from '../models/email';
import {transporter} from '../configs/email';
import {successHtml, errMail, successMail, alreadyVerifiedHtml} from '../configs/email';
import { IMailOptions } from './interfaces/IMailOptions';
import { sendMail } from './utils';
import dotenv from 'dotenv';

const generateEmailVerificationToken = ()=>{
    const token = crypto.randomUUID();
    const expires = new Date();
    expires.setHours(expires.getHours() +1);
    return {token, expires};
  }

export const sendEmail:RequestHandler=async(req,res,next)=>{
   const email:string = req.body.email;
   console.log(email)
   
   const result = generateEmailVerificationToken();
   const mailOptions :IMailOptions = {
     to : email, //사용자가 입력한 이메일 -> 목적지 주소 이메일
     html: successMail(email,result)
    };
 
   const exEmail = await Email.findOne({where:{email}});
 
    if(exEmail){
        if(exEmail.isRegistered) mailOptions.html=errMail;
        await exEmail.update({token:result.token});
    }else{
        try{
            await Email.create({
                email,
                token:result.token,
                isValid:false,
                isRegistered:false,
              })
        }catch(error){
            console.error(error);
            return next(error);
        }
    }
    try{
        const sendRes = sendMail(mailOptions);
        if(!sendRes) return res.json({ok : false , msg : ' 메일 전송에 실패하였습니다. 다시 시도해주세요 '})
        else return res.json({ok: true, msg: '해당 이메일로 인증 메일을 보냈습니다. 메일의 verify버튼을 눌러주세요'});
   }catch(error){
    console.error('Error:: Failed to send Eamil:', error);
    return next(error);
   }
}

export const verifyEmail :RequestHandler = async(req,res,next)=>{
   const email:string = req.query.email as string;
   const token: string = req.query.token as string;
   console.log(email, token);
   
   try{
     const exEmail = await Email.findOne({where:{email}});
     if(exEmail){
        if(exEmail.isValid){ // 메일의 인증버튼 여러번 누르는것을 방지
            return res.send(alreadyVerifiedHtml());
        }
       const originToken = exEmail.token;
       if(token===originToken){
        try{
            await exEmail.update({isValid:true});
        }catch(error){
            console.error(error);
            return res.send("인증실패")
        }
        setTimeout(async()=>{
            try{
                exEmail.isValid=false;
                await exEmail.save();
                console.log("verifyEmail Time out");
            }catch(error){
                console.error(error);
                return res.send("인증실패")
            }
         },300000) // 5분
         const now = new Date();
         const limit= new Date(now.getTime() + 60*10*1000).toLocaleString() as unknown as string;
         res.send(successHtml(limit));
       }
       else{
         res.send("인증실패");
       }
     }
     else{
       res.status(404).send('email 전송요청을 먼저해주세요');
     }
   }
   catch(error){
     console.error('Error:: While verifyEmail:', error);
     return next(error);
    }
}
