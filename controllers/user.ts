import { RequestHandler } from 'express';
import {checkAllInputs} from './utils/checkInput';
import faber from '../src/Faber';
import Email from '../models/email';

const join :RequestHandler=async (req,res,next)=>{ //VC발급
    
    if(checkAllInputs(req.body)){
        const {email, name} = req.body; 
        console.log(email,name)
        try{
            const exEmail = await Email.findOne({where:{email}}); //이메일 검증 확인
            if(exEmail && exEmail.isValid && !exEmail.isRegistered){
                req.session.email=email;
                req.session.name=name;
                return res.send(true);
            }
            else{
            return res.redirect(`/?error=이메일 인증을 먼저 해주세요`);
            }
        }catch(error){
        console.error('Error:: While join:', error);
        return next(error);
        }
    }
    else{
        return res.redirect(`/?error=모든 입력을 완료해주세요`);
    }  
}

const issueVC:RequestHandler=async(req,res,next)=>{
    const email = req.session.email;
    const name = req.session.name;
    if(email && name){
        try{
            const exEmail = await Email.findOne({where:{email}}); //이메일 검증 확인
            if(exEmail){
                await exEmail.update({isValid:false, isRegistered:true}); //다른 사람이 동일한 이메일로 가입하는 것을 방지
                await faber.issueCredential({email,name});
                res.end();
            }
        }catch(error){
            res.end();
            return next(error);
        }
    }else{
        res.end();
        res.redirect("/?error=VC발급중 문제가 발생하였습니다. 다시 시도해주세요.");
    }
}

const logIn:RequestHandler=async (req,res,next)=>{
    //TODO::vp처리 내용
    console.log(req.body);

    res.end();
}

export {join,logIn, issueVC}