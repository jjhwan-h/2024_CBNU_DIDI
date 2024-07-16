import { RequestHandler } from 'express';
import {checkAllInputs} from './utils/index';
import faber from '../src/Faber';
import Email from '../models/email';
import { Listener } from '../src/Listener';

const join :RequestHandler=async (req,res,next)=>{ 
    
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
                return res.send(false);
            }
        }catch(error){
        console.error('Error:: While join:', error);
        next(error);
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
            if(exEmail && exEmail.isValid && !exEmail.isRegistered){
                await exEmail.update({isValid:false, isRegistered:true}); //다른 사람이 동일한 이메일로 가입하는 것을 방지
                await faber.issueCredential({email,name});
                const redirectUrl = `/?message=VC발급이 완료되었습니다.`
                res.write(`id:2\n`);
                res.write(`data:${JSON.stringify({redirectUrl})}\n\n`)
                res.end();
                delete req.session.email;
                delete req.session.name;
                return;
            }
        }catch(error){
            return next(error);
        }
    }else{
        const redirectUrl = `/?message=VC발급 중 문제가 발생하였습니다. 다시 시도해주세요.`
        res.write(`id:2\n`);
        res.write(`data:${JSON.stringify({redirectUrl})}\n\n`);
        res.end();
        return;
    }
}

const logIn:RequestHandler=async (req,res,next)=>{
    //TODO::vp처리 내용
    
    try{
        const message = await faber.listener.proofAcceptListener();
        console.log(message);
    }catch(error){
        console.error(error)
        next(error);
    }
    res.end();
}

export {join,logIn, issueVC}